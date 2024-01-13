import { React, useState, useContext, useEffect, useCallback, useMemo } from "react";
import { MapContainer, ImageOverlay, ZoomControl, Marker, useMap, TileLayer } from "react-leaflet";
import { MarkersContext } from "../contexts/Markers.js";
import { ProjectMarkersContext } from "../contexts/ProjectMarkers.js";
import { postMarker } from "../utils/api.js";
import { useMapEvents } from "react-leaflet/hooks";
import DraggableMarker from "./DraggableMarker";

import marker from "../images/map-marker.svg";
import marker1 from "../images/map-marker-issue.svg";
import marker2 from "../images/map-marker-complete.svg";
import { Icon } from "leaflet";

const myMarker = new Icon({ iconUrl: marker, iconSize: [45, 45], iconAnchor: [22, 45] });
const myIssueMarker = new Icon({ iconUrl: marker1, iconSize: [45, 45], iconAnchor: [22, 45] });
const myCompletedMarker = new Icon({ iconUrl: marker2, iconSize: [45, 45], iconAnchor: [22, 45] });

const L = window["L"];

// Map Control


function MinimapControl({ position, zoom, image, icon }) {

  const positionClass = 'leaflet-top leaflet-right'
  const updatedPosition = [position[0]/20, position[1]/20]

  return (
    <div className={positionClass}>
      <div className="leaflet-control leaflet-bar">
      <MapContainer
        style={{ height: 500, width: 500 }}
        center={[0, 0]}
        zoom={1}
        dragging={false}
        doubleClickZoom={false}
        scrollWheelZoom={false}
        attributionControl={false}
        zoomControl={false}>
        <ImageOverlay url={`${image}`} className="map-image" bounds={[
       [-150, -150],
         [150, 150],
                     ]}/>
        <Marker position={updatedPosition}
         icon={icon}></Marker>
      </MapContainer>
      </div>
    </div>
  )
}

export default function Map(props) {
  const { markers, setMarkers } = useContext(MarkersContext);
  const { projectMarkers, setProjectMarkers } = useContext(
    ProjectMarkersContext
  );

  const [initialLoad, setInitialLoad] = useState(true);
  const [filter, setFilter] = useState('');
  const [filterID, setFilterID] = useState('');
  const [filteredMarkers, setFilteredMarkers] = useState(markers);

  const bounds = [
    [-3000, -3000],
    [3000, 3000],
  ];

  const [creationMode, setCreationMode] = useState('');
  const [latlng, setLatlng] = useState(null);

  //update map after marker creation
  useEffect(() => {
    setInitialLoad(true);
    const m = projectMarkers.filter(
      (item) => item.location === props.currentLocation
    );
    setFilteredMarkers(m);
  }, [markers, projectMarkers]);

  // create marker function

  useEffect(() => {
    if (creationMode) {
      createMarker();
      setCreationMode(false);
    }
  }, [latlng]);

  useEffect(() => {
    if(!initialLoad){
      filterMarkers(filter, filterID);
    } else {
      setInitialLoad(false);
    }
  }, [filter, filterID])

  const filterMarkers = (ref, id) => {
      const m = markers.filter((item) => item.number.toUpperCase().includes(ref.toUpperCase()));
      if(filterID !== ''){
        const m2 = m.filter((item) => item.doorCondition.toUpperCase() === id.toUpperCase());
        setFilteredMarkers(m2);
      } else {
        setFilteredMarkers(m);
      }
      
      
    }

  const MapFly = () => {
    const map = useMap();
    if(props.mapPdf){
      map.flyTo(props.mapPdf[2].locationOnDrawing, map.getZoom())
    }
  }

  const MarkerLocator = () => {
    const map = useMapEvents({
      click(e) {
        setLatlng([e.latlng.lat, e.latlng.lng]);
      },
    });
  };

  const createMarker = () => {
    if (creationMode) {
      const id = `${props.user}-${Date.now()}`;

      const obj = {
        
          id: id,
          number: "0",
          status: "in progress",
          location: props.currentLocation,
          locationOnDrawing: [latlng[0], latlng[1]],
          materialsUsed: [],
          measurements: [0, 0],
          service: [],
          completedBy: "",
          comment: "",
          photos: [],
          fR: "",
          doorConfiguration: '',
          doorFinish: '', // completed on
          doorGapHinge: '', 
          doorGapLockSide: '',
          doorGapHead: '',
          doorGapBottom: '',
          openingHeight: '',
          visionPanel: '', //issue cat
          frameCondition: '',
          frameConditionComment: '', // survey note
          hingeAdjustment: '',
          ironmongery: '',
          type: 'seal',
          handle: '',
          lock: '', // estimated time
          doorCondition: '' // ID number 2
        
      };

      if(props.mode === 'online'){
        console.log('creating marker online')
      postMarker(props.projectName, obj).then((response) => {
        console.log(response)
        setProjectMarkers(response.data.markers);
        setCreationMode(false);
      });
        } else {
      // save to local storage
      const struction = JSON.parse(localStorage.getItem('Struction'));

      const storage = JSON.parse(localStorage.getItem(`${struction.projectName}-markers`));
      const markers = storage.projectMarkers;
      const toUpload = storage.markersToUpload;
      console.log(markers)
      console.log(toUpload)

      markers.push(obj);
      storage.projectMarkers = markers;

      toUpload.push(obj);
      storage.markersToUpload = toUpload;

      localStorage.setItem(`${struction.projectName}-markers`, JSON.stringify(storage));
      props.setProjectMarkers(storage.projectMarkers);
      setCreationMode(false);
      }
    } 
  };

  return (
    <div>
      <MapContainer
        id={"map-container"}
        className="map"
        crs={L.CRS.Simple}
        bounds={bounds}
        maxZoom={props.mapPdf ? 0 : 4}
        minZoom={props.mapPdf ? 0 : -4}

        scrollWheelZoom={true}
        zoomControl={false}
      >
        <ImageOverlay
          className="map-image"
          url={`${props.image}`}
          bounds={bounds}
        >
          { !props.mapPdf ? filteredMarkers.map((item) => {
            return (
              <DraggableMarker
                key={item.id}
                id={item.id}
                position={item.locationOnDrawing}
                number={item.number}
                status={item.status}
                location={item.location}
                type={item.type}
                materialsUsed={item.materialsUsed}
                measurements={item.measurements}
                service={item.service}
                completedBy={item.completedBy}
                photos={item.photos}
                fR={item.fR}
                currentLocation={props.currentLocation}
                comment={item.comment}
                projectName={props.projectName}
                user={props.user}
                materials={props.materials}
                services={props.services}
                commentTemplate={props.commentTemplate}
                workScopeTemplates={props.workScopeTemplates}


                doorConfiguration={item.doorConfiguration}
                doorFinish={item.doorFinish} //completed on
                doorGapHinge={item.doorGapHinge} 
                doorGapLockSide={item.doorGapLockSide}
                doorGapHead={item.doorGapHead}
                doorGapBottom={item.doorGapBottom}
                openingHeight={item.openingHeight}
                visionPanel={item.visionPanel}//issue cat
                frameCondition={item.frameCondition} // survey note
                frameConditionComment={item.frameConditionComment}
                hingeAdjustment={item.hingeAdjustment}
                ironmongery={item.ironmongery}
                handle={item.handle}
                lock={item.lock} // estimated time
                doorCondition={item.doorCondition} // ID number 2
                doorCloser={item.doorCloser}
              

                setProjectMarkers={props.setProjectMarkers}
                mode={props.mode}
                role={props.role}
              />
            );
          }) : <Marker
                position={props.mapPdf[2].locationOnDrawing}
                icon={props.mapPdf[2].status === 'completed' ? myCompletedMarker : (props.mapPdf[2].status === 'issue' ? myIssueMarker : myMarker) }></Marker>}

        </ImageOverlay>

        <MarkerLocator />
        <MapFly />

        { !props.mapPdf ? 
        <ZoomControl position="bottomleft" /> : null } 

         { !props.mapPdf && props.role !== 'Visitor' ? (
        <button className="create-btn" onClick={() => setCreationMode(true)}>
          {creationMode ? "Click on Map" : "Create new marker"}
        </button> ) : null}

        { !props.mapPdf ? (
        <p><input
        className="filter"
        placeholder="Reference number"
        value={filter}
        type="text"
        onChange={(e) => {
          setFilter(e.target.value);
        }}
        ></input></p>) : null}

       { !props.mapPdf ? (
        <p><input
        className="filter2"
        placeholder="ID"
        value={filterID}
        type="text"
        onChange={(e) => {
          setFilterID(e.target.value);
        }}
        ></input></p>) : null}

        { props.mapPdf ? 
        <MinimapControl 
        position={props.mapPdf[2].locationOnDrawing}
        icon={props.mapPdf[2].status === 'completed' ? myCompletedMarker : (props.mapPdf[2].status === 'issue' ? myIssueMarker : myMarker) }
        image={props.image}/> : null}

      </MapContainer>
    </div>
  );
}
