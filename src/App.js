import "leaflet/dist/leaflet.css";
import "./App.css";
import { React, useEffect, useState, useContext, useRef } from "react";
import { getProjectDetails, getImage } from "./utils/api";
import { MarkersContext } from "./contexts/Markers.js";
import { ProjectMarkersContext } from "./contexts/ProjectMarkers";
import Map from "./components/Map.jsx";
import LoginPage from "./components/LoginPage";
import ReactDOM from "react-dom/client";

import {
  Sidebar,
  Menu,
  MenuItem,
  useProSidebar,
  SubMenu,
  sidebarClasses,
} from "react-pro-sidebar";
import structionLogo from "./images/structionLogo.svg";
import structionHeaderLogo from "./images/struction-logo-header.svg";

// imports for PDFs creating
import PDF from './components/PDF'
import { saveAs } from "file-saver";
import { pdf } from '@react-pdf/renderer';
import { MapContainer, ImageOverlay, Marker } from "react-leaflet";
const L = window["L"];
 

export default function App() {
  /*  */
  const [user, setUser] = useState({
    key: 'marcin@gmail.com',
    props: {"name": "Marcin Palenik",
    "role": "manager",
    "password": "worker123",
    "projects": ["apartments_unit_", "medical_centre_"]}
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

  //PDF state
  const [pdfMap, setPdfMap] = useState(false);
  const mapRef = useRef();

  // proSidebar
  const { collapseSidebar, toggleSidebar, collapsed, toggled, broken, rtl } =
    useProSidebar();

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

  const downloadPDFs = async () => {
    for (let i = 0; i < markers.length; i++) {
   
      const promises = markers[i].photos.map(photo => getImage(photo));

      Promise.all(promises).then(images => {
      // All images have loaded
      const pdfName = `${projectName}-${markers[i].number}.pdf`;
      savePDF(pdfName, images);
    });
/*
    const getPinOnMap = async (position, pdfName, images) => {

      console.log('generating map')
      const bounds = [
        [-3000, -3000],
        [3000, 3000],
      ];
      
      const map = (
        <div id="map-container" style={{display: 'none'}}>
          <MapContainer
            crs={L.CRS.Simple}
            bounds={bounds}
            center={position} 
            zoom={13} 
            scrollWheelZoom={false}
            ref={mapRef}
          >
            <ImageOverlay
              url={currDrawing}
              bounds={bounds}
            >
              <Marker position={position} />
            </ImageOverlay>
          </MapContainer>
        </div>
      );
    
      // Create a new div element to render the map component
      const container = document.createElement("div");
      document.body.appendChild(container);

      // Render the map component to the new div element using createRoot
       const root = ReactDOM.createRoot(container);
       root.render(map);
       

       // Wait for the canvas element to be available
       const canvasPromise = new Promise((resolve) => {
         const observer = new MutationObserver(() => {
           const canvas = mapRef.current?._container?.querySelector("canvas");
           if (canvas) {
             observer.disconnect();
             resolve(canvas);
           }
         });
         observer.observe(mapRef.current?._container, { childList: true });
       });
     
       // Get the canvas element
       const canvas = await canvasPromise;
       console.log("Canvas found:", canvas);
     
       // Get the base64 representation of the canvas image
       const base64 = canvas.toDataURL();
       console.log("Base64:", base64);
     
       // Remove the temporary div element
       ReactDOM.unmountComponentAtNode(container);
       document.body.removeChild(container);

    
      savePDF(pdfName, images, base64);
     
     
    }

    */

  const savePDF = async (pdfName, images) => {

    const doc = (
      <PDF photos={images} />
    );

    const pdfBlob =  await pdf(doc).toBlob();

    // Save the PDF blob as file
    saveAs(pdfBlob, pdfName);

  }

  };
  }

  return (
    
    <div className="App">
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
        <img
          className="struction-logo--header"
          src={structionHeaderLogo}
          alt="struction logo"
        />
      </header>

      {!user ? null : (
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
                        setCurrentLocation(location.name);
                      }}
                    >
                      {location.name}
                    </MenuItem>
                  );
                })}
              </SubMenu>
            ) : (projectName ? (<p className="loading">Loading project...</p>) : null)}

            <MenuItem> Manager Dashboard </MenuItem>

            { markers[0] ? (
            <MenuItem onClick={() => {downloadPDFs()}}> Download PDFs</MenuItem>
           ) : null }

            {!user ? null : (<MenuItem> Logout</MenuItem>)}
            
          </SubMenu>
        </Menu>
      </Sidebar>)}
      {!isProjectLoaded && user ? (
        <img
          className="struction-logo"
          src={structionLogo}
          alt="struction logo"
        />
      ) : null}

      {currentLocation !== "" && markersFilter && mapsLoaded ? (
        <Map
          currentLocation={currentLocation}
          user={user.key}
          projectName={projectName}
          materials={materials}
          services={services}
          image={currDrawing}
        />
      ) : null}

      { !user ? (<LoginPage
          user={user}
          setUser={setUser} />) : null}

    </div>
  );
}
