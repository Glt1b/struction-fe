import "leaflet/dist/leaflet.css";
import "./App.css";
import { React, useEffect, useState, useContext } from "react";
import { getProjectDetails, getImage } from "./utils/api";
import { MarkersContext } from "./contexts/Markers.js";
import { ProjectMarkersContext } from "./contexts/ProjectMarkers";
import Map from "./components/Map.jsx";
import LoginPage from "./components/LoginPage";
import Users from "./components/Users";

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
  /*  */
  const [user, setUser] = useState({
    key: '',
    props: {"name": "Marcin Palenik",
    "role": "manager",
    "password": "worker123",
    "projects": ["apartments_unit_", "medical_centre_", "Macclesfield_District_General_Hospital"]}
  });


  // const [user, setUser] = useState(false);

  // contract states
  const [projectName, setProjectName] = useState(false);
  const [locations, setLocations] = useState([]);
  const [services, setServices] = useState([]);
  const [materials, setMaterials] = useState([]);
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


  // request for contract details and assign them to states
  useEffect(() => {
    if (projectName) {
      getProjectDetails(projectName).then((result) => {
        setProjectMarkers(result.project[1]);
        setLocations(result.project[0].props.locations);
        setServices(result.project[0].props.services);
        setMaterials(result.project[0].props.materials);
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
          console.log('saving')
          savePDF();
        }, 1500)
        
  }
  }, [mapPdf])

  const downloadPDFs = (n) => {
    
    if ( n > 0 ) {
      setTimeout(() => {
        const promises = markers[n-1].photos.map(photo => getImage(photo));
        Promise.all(promises).then(images => {
        // All images have loaded
        const pdfName = `${projectName}-${markers[n-1].number}.pdf`;
        setMapPdf([pdfName, images, markers[n-1]]);
        downloadPDFs(n -1);
    });
      }, 3000)
    } else {
      setTimeout(() => {
         setMapPdf(false);
         setGeneratePDF(false);
         alert('no more markers left, PDFs completed')
      }, 5000)
      
    }
  }


  const savePDF = async () => {

    const input = document.getElementById("map-container");
    const canvas = await html2canvas(input);
    console.log(canvas)
    const imgData = canvas.toDataURL("image/jpg")
    console.log(imgData)

    const doc = (
      <PDF photos={mapPdf[1]} map={imgData} details={mapPdf[2]}/>
    );

    const pdfBlob =  await pdf(doc).toBlob();

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
            <SubMenu label="Projects">
              {!user ? null : user.props.projects.map((project) => {
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
            </SubMenu>

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

            <MenuItem onClick={() => setPage('workers')}> Workers dashboard </MenuItem>

            { markers[0] ? (
            <MenuItem onClick={() => {downloadPDFs(markers.length)
                                     setGeneratePDF(true)}}> Download PDFs</MenuItem>
           ) : null }

            {!user ? null : (<MenuItem> Logout</MenuItem>)}
            
          </SubMenu>
        </Menu>
      </Sidebar>) : null))}

      {page === 'workers' ? (<Users />) : null}


      {!isProjectLoaded && user ? (
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
          image={currDrawing}
          mapPdf={mapPdf}
        />
        </div>
      ) : null}

      { !user ? (<LoginPage
          user={user}
          setUser={setUser} />) : null}
      
    </div>
  );
}
