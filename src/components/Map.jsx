import { React, useState, useContext, useEffect } from "react";
import { MapContainer, ImageOverlay, ZoomControl, Marker, useMap } from "react-leaflet";
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

export default function Map(props) {
  const { markers, setMarkers } = useContext(MarkersContext);
  const { projectMarkers, setProjectMarkers } = useContext(
    ProjectMarkersContext
  );
  const bounds = [
    [-3000, -3000],
    [3000, 3000],
  ];
  const [creationMode, setCreationMode] = useState(false);
  const [latlng, setLatlng] = useState(null);

  //update map after marker creation
  useEffect(() => {
    //console.log(projectMarkers)
    const m = projectMarkers.filter(
      (item) => item.location === props.currentLocation
    );
    setMarkers(m);
  }, [projectMarkers]);

  // create marker function

  useEffect(() => {
    if (creationMode) {
      createMarker();
      setCreationMode(false);
    }
  }, [latlng]);

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
        [id]: {
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
          frameConditionComment: '',
          hingeAdjustment: '',
          ironmongery: '',
          type: '',
          handle: '',
          lock: '',
          doorCondition: '' // ID number 2
        },
      };

      if(props.mode === 'online'){
        console.log('creating marker online')
      postMarker(props.projectName, obj).then((response) => {
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

      markers.push(obj[Object.keys(obj)[0]]);
      storage.projectMarkers = markers;

      toUpload.push(obj[Object.keys(obj)[0]]);
      storage.markersToUpload = toUpload;

      localStorage.setItem(`${struction.projectName}-markers`, JSON.stringify(storage));
      props.setProjectMarkers(storage.projectMarkers);
      setCreationMode(false);
      }
    } 
  };

  return (
    <div className="App">
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
          { !props.mapPdf ? markers.map((item) => {
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
                doorConfiguration={item.doorConfiguration}
                doorFinish={item.doorFinish} //completed on
                doorGapHinge={item.doorGapHinge} 
                doorGapLockSide={item.doorGapLockSide}
                doorGapHead={item.doorGapHead}
                doorGapBottom={item.doorGapBottom}
                openingHeight={item.openingHeight}
                visionPanel={item.visionPanel}//issue cat
                frameCondition={item.frameCondition}
                frameConditionComment={item.frameConditionComment}
                hingeAdjustment={item.hingeAdjustment}
                ironmongery={item.ironmongery}
                handle={item.handle}
                lock={item.lock}
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
      </MapContainer>
    </div>
  );
}
