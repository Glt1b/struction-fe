import { React, useState, useContext, useEffect } from "react";
import { MapContainer, ImageOverlay, ZoomControl } from "react-leaflet";
import { MarkersContext } from "../contexts/Markers.js";
import { ProjectMarkersContext } from "../contexts/ProjectMarkers.js";
import { postMarker } from "../utils/api.js";
import { useMapEvents } from "react-leaflet/hooks";
import DraggableMarker from "./DraggableMarker";

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
          doorGapHinge: '',
          doorGapLockSide: '',
          doorGapHead: '',
          doorGapBottom: '',
          openingHeight: '',
          visionPanel: '',
          frameCondition: '',
          frameConditionComment: '',
          hingeAdjustment: '',
          ironmongery: '',
          type: '',
          handle: '',
          lock: '',
          doorCondition: ''
        },
      };

      postMarker(props.projectName, obj).then((response) => {
        setProjectMarkers(response.data.markers);
        setCreationMode(false);
      });
    } else {
    }
  };

  return (
    <div className="App">
      <MapContainer
        className="map"
        crs={L.CRS.Simple}
        bounds={bounds}
        zoom={0}
        minZoom={-4}
        maxZoom={1}
        scrollWheelZoom={true}
        zoomControl={false}
      >
        <ImageOverlay
          className="map-image"
          url={`${props.image}`}
          bounds={bounds}
        >
          {markers.map((item) => {
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
                doorConfiguration={item.doorConfiguration}
                doorFinish={item.doorFinish}
                doorGapHinge={item.doorGapHinge}
                doorGapLockSide={item.doorGapLockSide}
                doorGapHead={item.doorGapHead}
                doorGapBottom={item.doorGapBottom}
                openingHeight={item.openingHeight}
                visionPanel={item.visionPanel}
                frameCondition={item.frameCondition}
                frameConditionComment={item.frameConditionComment}
                hingeAdjustment={item.hingeAdjustment}
                ironmongery={item.ironmongery}
                handle={item.handle}
                lock={item.lock}
                doorCondition={item.doorCondition}
              />
            );
          })}
        </ImageOverlay>

        <MarkerLocator />
        <ZoomControl position="bottomleft" />

        <button className="create-btn" onClick={() => setCreationMode(true)}>
          {creationMode ? "Click on Map" : "Create new marker"}
        </button>
      </MapContainer>
    </div>
  );
}
