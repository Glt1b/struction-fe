import "leaflet/dist/leaflet.css";
import "./App.css";
import { React, useEffect, useState, useContext } from "react";
import { getProjectDetails, getImage, getProjectsList, synchDB } from "./utils/api";
import { addToIndexedDB, readFromIndexedDB, deleteIndexedDB } from "./utils/indexedDB";
import { checkMode } from "./utils/indexedDB";
import { MarkersContext } from "./contexts/Markers.js";
import { ProjectMarkersContext } from "./contexts/ProjectMarkers";
import Map from "./components/Map.jsx";
import LoginPage from "./components/LoginPage";
import Users from "./components/Users";
import Details from "./components/Details";
import NewContract from "./components/NewContract";
import {
  Sidebar,
  Menu,
  MenuItem,
  useProSidebar,
  SubMenu,
  sidebarClasses,
} from "react-pro-sidebar";
//import structionLogo from "./images/structionLogo.svg";
import ampaLogo from "./images/ampa.png";

// imports for PDFs creating
import PDF from './components/PDF'
import { saveAs } from "file-saver";
import { pdf } from '@react-pdf/renderer';
import { Icon } from "leaflet";
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
  const { projectMarkers, setProjectMarkers } = useContext(
    ProjectMarkersContext
  );
  const [currentLocation, setCurrentLocation] = useState("");
  const [currDrawing, setCurrDrawing] = useState("");
  const { markers, setMarkers } = useContext(MarkersContext);
  const [isProjectLoaded, setIsProjectLoaded] = useState(false);
  const [markersFilter, setMarkersFilter] = useState(false);

  const [mapsLoaded, setMapsLoaded] = useState(false);

  // pdf reports
  const [mapPdf, setMapPdf] = useState(false);
  const [generatePDF, setGeneratePDF] = useState(false);

  //current page
  const [page, setPage] = useState('map');

  // check mode

  useEffect(() => {
    const result = checkMode();
    setMode(result);
    console.log(result)
  }, [])

  //check log in

  useEffect(() => {
    const x = localStorage.getItem('Struction-User')
    console.log(x)
    if(x !== null){
      setUser(JSON.parse(x))
    }
  }, [])

  // get available contracts

  useEffect(() => {
    if( mode === 'online' && user){
      if(user.props.role === 'Manager'){
        getProjectsList().then((result) => {
        setAvailableContracts(result)
      })
      } else {
        console.log(user.props.projects)
        setAvailableContracts(user.props.projects)
      }
      } else if (  mode === 'offline'){

        const struction = JSON.parse(localStorage.getItem('Struction'));
        console.log(struction)
        setProjectName(struction.projectName)
        setAvailableContracts(struction.availableContracts)
        //setLocations(struction.locations) // to be replaced by IndexedDB
        setProjectMarkers(struction.projectMarkers)
        setMapsLoaded(true)
        setMaterials(struction.materials)
        setServices(struction.services)
        if(struction.commentTemplate !== undefined){
          setCommentTemplate(struction.commentTemplate)
        }
      }
  }, [mode, user]);

  // load locations from IDB

  useEffect(() => {
    if(projectName && mode === 'offline')
    readFromIndexedDB('Struction', projectName, 'locations', function(value) {
      if (value) {
        setLocations(value);
      } else {
         console.log('Value not found.');
      }
      });
  }, [projectName, mode])


  // request for contract details and assign them to states
  useEffect(() => {
    if (projectName && mode === 'online') {
      getProjectDetails(projectName).then((result) => {
        setProjectMarkers(result.project[1]);
        setLocationsNames(result.project[0].props.locations);
        setLocations(result.project[0].props.locations);
        setServices(result.project[0].props.services);
        setMaterials(result.project[0].props.materials);
        if(result.project[0].props.commentTemplate !== undefined){
          setCommentTemplate(result.project[0].props.commentTemplate)
        }
        setIsProjectLoaded(true);
      });
    }
  }, [projectName]);

  // request drawing images and store them in state when project details are loaded
  useEffect(() => {
    if (isProjectLoaded) {
      const arr = [];
      for (let location of locations) {
        getImage(location.url).then((result) => {
          const obj = {};
          obj["name"] = location.name;
          obj["url"] = result;
          console.log(obj)
          arr.push(obj);
          if (arr.length === locations.length) {
            setLocations(arr);
            setTimeout(() => {
              setMapsLoaded(true);
            },1000)
          }
        });
      }
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
      localStorage.setItem('Struction', JSON.stringify({
        mode: 'offline',
        availableContracts: [projectName],
        projectName: projectName,
        locationsNames: locationsNames,
        services: services,
        materials: materials,
        projectMarkers: projectMarkers,
        commentTemplate: commentTemplate,
        markersToUpload: [],
        arrToUpload: [],
        photosToUpload: []})); 
      console.log(projectName)
      addToIndexedDB('Struction', projectName, 'locations', locations);

    } else {
      
      // sync with DB
      
      synchDB(projectName);
      setTimeout(() => {
        setMode('online');
        delOfflineDB();
      }, 5000)

     }
 };

  const delOfflineDB = () => {
        deleteIndexedDB('Struction', function(success) {
          if (success) {
            console.log('Database deleted successfully.');
          } else {
            console.log('Failed to delete the database.');
          }
        });
        localStorage.removeItem('Struction');
        localStorage.setItem('Struction', JSON.stringify({ mode: 'online'}));
  }

  const downloadPDFs = (n) => {
    console.log('N number: ' + n)
    if ( n > 0 ) {
      console.log('Creating pdf for marker: ' + markers[n-1].number)
      setTimeout(() => {
        const pdfName = `${projectName}-${markers[n-1].number}.pdf`;
        const arr = [];

        // when no photos
        if(markers[n-1].photos.length === 0){
            console.log('No photos found')
            console.log('Settig details')
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
              setMapPdf([pdfName, arr, markers[n-1]]);
              downloadPDFs(n - 1);
            }
          })
          .catch((err) => {
            arr.push('error');
            if(arr.length === markers[n-1].photos.length){
              console.log('Settig details')
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
      <PDF photos={mapPdf[1]} map={imgData} details={mapPdf[2]}/>
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
            Welcome {user.key}, you are on{" "}
            <strong>
              {projectName}/{currentLocation}
            </strong>
          </p>
        ) : (
          <p>Welcome {user.key}, choose your project</p>
        )}

        { mapPdf ? (<p>Exporting to PDFs...</p>) : null }
        <img
          className="struction-logo--header"
          src={ampaLogo}
          alt="struction logo"
        />
      </header>

      {!user ? null : (
        ( !generatePDF ? (
      <Sidebar>
        <Menu>
          <SubMenu label="Menu">
           
           { mode === 'online' ? (
            <SubMenu label="Projects"> 
              {!user ? null : availableContracts.map((project) => {
                return (
                  <MenuItem
                    onClick={() => {
                      setMapsLoaded(false);
                      setIsProjectLoaded(false);
                      setProjectName(project);
                      setCurrentLocation("");
                    }}
                    key={project}
                  >
                    {project}
                  </MenuItem>
                );
              })}
              { mode === 'online' ? (
              <MenuItem><NewContract
              availableContracts={availableContracts}
              setAvailableContracts={setAvailableContracts}/></MenuItem>) : null }
            </SubMenu>
           ) : <MenuItem>{projectName}</MenuItem>}
            

            {mapsLoaded ? (
              <SubMenu label="Locations">
                {locations.map((location) => {
                  return (
                    <MenuItem
                      value={location.name}
                      key={location.name}
                      onClick={() => {
                        setPage('map');
                        setCurrentLocation(location.name);
                        
                      }}
                    >
                      {location.name}
                    </MenuItem>
                  );
                })}
              </SubMenu>
            ) : (projectName ? (<p className="loading">Loading project...</p>) : null)}

            {projectName && mode === 'online' && user.props.role === 'Manager' ? (
              <MenuItem onClick={() => setPage('details')}>Project details</MenuItem>
            ) : null}
            
            {mode === 'online' && user.props.role === 'Manager' ? (
               <MenuItem onClick={() => setPage('workers')}> Workers dashboard </MenuItem>
            ) : null}
           

            { markers[0] && mode === 'online' && user.props.role === 'Manager' ? (
            <MenuItem onClick={() => {downloadPDFs(markers.length)
                                     setGeneratePDF(true)}}> Download PDFs</MenuItem>
           ) : null }

           { mode && mapsLoaded ? (
            <MenuItem
               onClick={() => { switchMode()
               }}>{mode === 'online' ? (
                <>Switch to offline</>
          ) : <>Synch with database</>}</MenuItem>) : null}


            {!user ? null : (<MenuItem onClick={() => {setUser(false)
                                                      localStorage.removeItem('Struction-User')}}>Logout</MenuItem>)}
            
          </SubMenu>
        </Menu>
      </Sidebar>) : null))}

      {page === 'workers' ? (<Users />) : null}
      {page === 'details' ? (<Details
        projectName={projectName}
        services={services}
        materials={materials}
        commentTemplate={commentTemplate}
        setMaterials={setMaterials}
        setServices={setServices}
        setCommentTemplate={setCommentTemplate}
        locationsNames={locationsNames}
        setLocationsNames={setLocationsNames}
        availableContracts={availableContracts}
        setAvailableContracts={setAvailableContracts}
        locations={locations}
        setLocations={setLocations}/>) : null}


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
          projectName={projectName}
          materials={materials}
          services={services}
          commentTemplate={commentTemplate}
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
      
    </div>
  );
}
