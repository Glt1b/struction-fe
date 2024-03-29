import "leaflet/dist/leaflet.css";
import "./App.css";
import { React, useEffect, useState, useContext } from "react";
import { getProjectDetails, getImage, getProjectsList, synchDB, getUser } from "./utils/api";
import { addToIndexedDB, readFromIndexedDB , checkIndexedDB} from "./utils/indexedDB";
import { checkMode } from "./utils/indexedDB";
import { MarkersContext } from "./contexts/Markers.js";
import { ProjectMarkersContext } from "./contexts/ProjectMarkers";
import Map from "./components/Map.jsx";
import LoginPage from "./components/LoginPage";
import Users from "./components/Users";
import Details from "./components/Details";
import Synch from "./components/Synch";
import Spreadsheet from "./components/Spreadsheet.jsx";
import DropdownMenu from "./components/Dropdown.jsx";
import ampaLogo from "./images/ampa-logo.svg";
import background from "./images/background.jpeg"

// imports for PDFs creating
import PDF from './components/PDF';
import PDF2 from './components/PDF2';
import { saveAs } from "file-saver";
import { pdf } from '@react-pdf/renderer';
import html2canvas from "html2canvas";
 

export default function App() {
  /* 
  const [user, setUser] = useState({
    key: '',
    props: {"name": "Marcin Palenik",
    "role": "manager",
    "password": "worker123",
    "projects": ["apartments_unit_", "medical_centre_", "Macclesfield_District_General_Hospital"]}
  });
 */

  const [user, setUser] = useState(false);

  const [mode, setMode] = useState(false);


  // available contracts

  const [availableContracts, setAvailableContracts] = useState(['']);

  // contract states
  const [locationsNames, setLocationsNames] = useState([]);
  const [projectName, setProjectName] = useState(false);
  const [locations, setLocations] = useState([]);
  const [services, setServices] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [commentTemplate, setCommentTemplate] = useState([]);
  const [ workScopeTemplate, setWorkScopeTemplate ] = useState([]);
  const [commission, setCommission] = useState('');
  const [prices, setPrices] = useState({});

  const { projectMarkers, setProjectMarkers } = useContext(
    ProjectMarkersContext
  );
  const [currentLocation, setCurrentLocation] = useState("");
  const [currDrawing, setCurrDrawing] = useState("");
  const { markers, setMarkers } = useContext(MarkersContext);
  const [isProjectLoaded, setIsProjectLoaded] = useState(false);
  const [markersFilter, setMarkersFilter] = useState(false);

  const [mapsLoaded, setMapsLoaded] = useState(false);

  //current page
  const [page, setPage] = useState('map');

  // pdf reports
  const [mapPdf, setMapPdf] = useState(false);
  const [generatePDF, setGeneratePDF] = useState(false);


  // check mode

  useEffect(() => {
    const result = checkMode();
    setMode(result);
    console.log(result)
  }, [])

  //check log in

  useEffect(() => {
    const x = localStorage.getItem('Struction-User')
    //console.log(x)
    if(x !== null){
      setUser(JSON.parse(x))
    }
  }, [])

  // get available contracts

  useEffect(() => {
    if( mode === 'online' && user){
      if(user.props.role === 'Manager'){
        getProjectsList().then((result) => {
         // console.log('list'+result)
        setAvailableContracts(result)
      })
      } else {
        console.log(user.props.projects)
        if(user.key !== 'maxim_borys@hottmail.com'){
          getUser(user.key).then((result) => {
            setUser(result)
            setAvailableContracts(user.props.projects)
          })
        }
        
      }
      } else if (  mode === 'offline'){
        const struction = JSON.parse(localStorage.getItem('Struction'));
        console.log(struction)
        setProjectName(struction.projectName)

        const project = JSON.parse(localStorage.getItem(struction.projectName));
        setAvailableContracts(project.availableContracts)
        setLocations(project.locations)
        setMapsLoaded(true)
        setMaterials(project.materials)
        setServices(project.services)
        if(project.commentTemplate !== undefined){
          setCommentTemplate(project.commentTemplate)
        }

        if(project.workScopeTemplate !== undefined){
          setWorkScopeTemplate(project.workScopeTemplate)
        }

        const markersData = JSON.parse(localStorage.getItem(`${struction.projectName}-markers`));
        setProjectMarkers(markersData.projectMarkers)

      }
  }, [mode, user]); // add user !!!

  // load locations from IDB

  useEffect(() => {
    if(projectName && mode === 'offline'){
      const arr = [];
      for ( let location of locationsNames){
      readFromIndexedDB(projectName, 'drawings', location.name, function(value){
        if(value){
          let index = locations.indexOf(location);
          const obj = {};
          obj["name"] = location.name;
          obj["url"] = value;
          console.log(obj)
          arr.splice(index, 0, obj)
          if (arr.length === locations.length) {
              setLocations(arr);
              setTimeout(() => {
                  setMapsLoaded(true);
              },1000)
          }
    }})}
  }}, [projectName])


  // request for contract details and assign them to states
  useEffect(() => {
    if (projectName && mode === 'online') {
      getProjectDetails(projectName).then((result) => {
        console.log(result.project[1])
        console.log(result.project[0])
        setProjectMarkers(result.project[1]);    //??
        setLocationsNames(result.project[0].props.locations);
        setLocations(result.project[0].props.locations);
        setServices(result.project[0].props.services);
        setMaterials(result.project[0].props.materials);
        if(result.project[0].props.commentTemplate !== undefined){
          setCommentTemplate(result.project[0].props.commentTemplate)
        }
        if(result.project[0].props.workScopeTemplate !== undefined){
          setWorkScopeTemplate(result.project[0].props.workScopeTemplate)
        }
        if(result.project[0].props.commission !== undefined){
          setCommission(result.project[0].props.commission)
        }
        if(result.project[0].props.prices !== undefined){
          setPrices(result.project[0].props.prices)
        }

        setIsProjectLoaded(true);
      });
    }
  }, [projectName]);

  // request drawing images and store them in state when project details are loaded
  useEffect(() => {
    const arr = [];

    if (isProjectLoaded) {
      checkIndexedDB( projectName, 'drawings', function(databaseExists, objectStoreExists) {
        if (databaseExists) {
            if (objectStoreExists) {
                console.log("Database and object store exist.");
                // load form DB
                for ( let location of locations){
                  readFromIndexedDB(projectName, 'drawings', location.name, function(value){
                    if(value){
                      let index = locations.indexOf(location);
                      const obj = {};
                      obj["name"] = location.name;
                      obj["url"] = value;
                      console.log(obj)
                      arr.splice(index, 0, obj)
                      if (arr.length === locations.length) {
                          setLocations(arr);
                          setTimeout(() => {
                              setMapsLoaded(true);
                          },1000)
                      }
                    } else {
                      getImage(location.url).then((result) => {
                        let index = locations.indexOf(location);
                        const obj = {};
                        obj["name"] = location.name;
                        obj["url"] = result;
                        console.log(obj)
                        arr.splice(index, 0, obj)
                        if (arr.length === locations.length) {
                            setLocations(arr);
                            setTimeout(() => {
                                setMapsLoaded(true);
                            },1000)
                        }
                        addToIndexedDB( projectName, 'drawings', location.name, result);
                      })
                    }
                    
                  })
                }
            } else {
                console.log("Database exists, but object store does not.");
                for ( let location of locations){
                  getImage(location.url).then((result) => {
                    let index = locations.indexOf(location);
                    const obj = {};
                    obj["name"] = location.name;
                    obj["url"] = result;
                    console.log(obj)
                    arr.splice(index, 0, obj)
                    if (arr.length === locations.length) {
                        setLocations(arr);
                        setTimeout(() => {
                            setMapsLoaded(true);
                        },1000)
                    }
                    addToIndexedDB( projectName, 'drawings', location.name, result);
                  })
                }
                
              }
        } else {
            console.log("Database does not exist.");
            for ( let location of locations){
              getImage(location.url).then((result) => {
                let index = locations.indexOf(location);
                const obj = {};
                obj["name"] = location.name;
                obj["url"] = result;
                console.log(obj)
                arr.splice(index, 0, obj)
                if (arr.length === locations.length) {
                    setLocations(arr);
                    setTimeout(() => {
                        setMapsLoaded(true);
                    },1000)
                }
                addToIndexedDB(projectName, 'drawings', location.name, result);
              })
            }
        }
    });
    }
  }, [isProjectLoaded]);

  //extract current drawing
  useEffect(() => {
    if (currentLocation !== "") {
      setMarkersFilter(false);
      const l = locations.filter((item) => item.name === currentLocation);
      const d = l[0].url;
      setCurrDrawing(d);
      setMarkersFilter(true);
    }
  }, [currentLocation]);

  // extract current markers
  useEffect(() => {
    if (currentLocation !== "") {
      console.log(projectMarkers)
      const m = projectMarkers.filter(
        (item) => item.location === currentLocation
      );
      setMarkers(m);
    }
  }, [currentLocation]);

  // download PDFs

  useEffect(() => {
    if(mapPdf){
      setTimeout(() => {
          savePDF();
      }, 1000)
  }
  }, [mapPdf])

  const switchMode = () => {
    if(mode === 'online'){
      setMode('offline');

      const struction = { mode: 'offline',
                          projectName: projectName };
      localStorage.setItem('Struction', JSON.stringify(struction));

      localStorage.setItem(projectName, JSON.stringify({
        availableContracts: [projectName],
        projectName: projectName,
        locations: locations,
        services: services,
        materials: materials,
        projectMarkers: projectMarkers,
        commentTemplate: commentTemplate})); 

      localStorage.setItem(`${projectName}-markers`, JSON.stringify({
        projectMarkers: projectMarkers,
        markersToUpload: [],
        photosToUpload: []})); 

    }
 };

  
  const downloadPDFs = (n) => {
    console.log('N number: ' + n)
    if ( n > 0 ) {
      console.log('Creating pdf for marker: ' + markers[n-1].number)
      setTimeout(() => {
        const pdfName = `${markers[n-1].status}-${markers[n-1].location}-${projectName}-${markers[n-1].number}.pdf`;
        const arr = [];

        // when no photos
        if(markers[n-1].photos.length === 0){
            console.log('No photos found')
            console.log('Settig details')
            console.log(pdfName)
            console.log(arr)
            setMapPdf([pdfName, arr, markers[n-1]]);
            downloadPDFs(n - 1);
        }
        // download photos
        for(let p of markers[n-1].photos){
          getImage(p)
          .then((result) => {
            arr.push(result);
            if(arr.length === markers[n-1].photos.length){
              console.log('Settig details')
              console.log(pdfName)
              console.log(arr)
              console.log(markers[n-1])
              setMapPdf([pdfName, arr, markers[n-1]]);
              downloadPDFs(n - 1);
            }
          })
          .catch((err) => {
            arr.push('error');
            if(arr.length === markers[n-1].photos.length){
              console.log('Settig details')
              console.log(pdfName)
              console.log(arr)
              console.log(markers[n-1])
              setMapPdf([pdfName, arr, markers[n-1]]);
              downloadPDFs(n - 1);
            }
          })
        }
      }, 6000)
    } else {
      console.log('It was last marker')
      setTimeout(() => {
         setMapPdf(false);
         setGeneratePDF(false);
         alert('no more markers left, PDFs completed')
      }, 5000)
    }
  }


  const savePDF = async () => {
 
    console.log('Creating map...')
    const input = document.getElementById("map-container");
    const canvas = await html2canvas(input);
    console.log(canvas)
    const imgData = canvas.toDataURL("image/svg")
    console.log(imgData)

    const doc = (
      <PDF2 photos={mapPdf[1]} map={imgData} details={mapPdf[2]}/>
    );
    const pdfBlob =  await pdf(doc).toBlob();
    console.log('Saving PDF')
    // Save the PDF blob as file
    saveAs(pdfBlob, mapPdf[0]);


  }

  return (
    
    <div className="App" >
      <header className="App-header">
        {isProjectLoaded ? (
          <p>
          {user.key}/
              {projectName}/{currentLocation}
            </p>
          
        ) : (
          <p>Welcome {user.key}, choose your project</p>
        )}

        { mapPdf ? (<p>Exporting to PDFs...</p>) : null }
        
      </header>

      <DropdownMenu
        user={user}
        availableContracts={availableContracts}
        setAvailableContracts={setAvailableContracts}
        setMapsLoaded={setMapsLoaded}
        setIsProjectLoaded={setIsProjectLoaded}
        projectName={projectName}
        setProjectName={setProjectName}
        setCurrentLocation={setCurrentLocation}
        setPage={setPage}
        locations={locations}
        mapsLoaded={mapsLoaded}
        mode={mode}
        markers={markers}
        downloadPDFs={downloadPDFs}
        setGeneratePDF={setGeneratePDF}
        switchMode={switchMode}
        page={page}
        setUser={setUser} />

      {page === 'workers' ? (<Users />) : null}

      {page === 'details' ? (<Details
        projectName={projectName}
        services={services}
        materials={materials}
        commentTemplate={commentTemplate}
        workScopeTemplate={workScopeTemplate}
        setMaterials={setMaterials}
        setServices={setServices}
        setCommentTemplate={setCommentTemplate}
        setWorkScopeTemplate={setWorkScopeTemplate}
        locationsNames={locationsNames}
        setLocationsNames={setLocationsNames}
        availableContracts={availableContracts}
        setAvailableContracts={setAvailableContracts}
        locations={locations}
        setLocations={setLocations}
        commission={commission}
        setCommission={setCommission}
        prices={prices}
        setPrices={setPrices}/>) : null}
      
      { page === 'synch' ? (<Synch
        setPage = {setPage}
        setMode={setMode}
        projectName={projectName}
        setProjectName={setProjectName}
        page={setPage} />) : null }


      {!isProjectLoaded && user && page === 'map' ? (
        <img
          className="struction-logo"
          src={ampaLogo}
          alt="struction logo"
        />
      ) : null}

      {currentLocation !== "" && markersFilter && mapsLoaded && page === 'map' ? (
        <div >
        <Map
          currentLocation={currentLocation}
          user={user.key}
          role={user.props.role}
          projectName={projectName}
          materials={materials}
          services={services}
          commentTemplate={commentTemplate}
          workScopeTemplates={workScopeTemplate}
          image={currDrawing}
          mapPdf={mapPdf}
          mode={mode}
          setProjectMarkers={setProjectMarkers}
        />
        </div>
      ) : null}

      { !user ? (<LoginPage
          user={user}
          setUser={setUser} />) : null}

      { page === 'spreadsheet' ? (
        <Spreadsheet
          prices={prices}
          commission={commission} />
      ) : null}

          
      
    </div>
  );
}
