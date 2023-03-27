import { React, useEffect, useState, useRef, useMemo, useContext } from "react";
import { Icon } from "leaflet";
import { Marker, Popup } from "react-leaflet";
import { MarkersContext } from "../contexts/Markers.js";
import { ProjectMarkersContext } from "../contexts/ProjectMarkers.js";
import "leaflet/dist/leaflet.css";
import { deleteMarker, getImage, patchMarker } from "../utils/api";
import ImageUploading from "react-images-uploading";
import marker from "../images/map-marker.svg";
import marker1 from "../images/map-marker-issue.svg";
import marker2 from "../images/map-marker-complete.svg";
import { postImage, delImageS3 } from "../utils/api";
import Photo from "./Photo.jsx";




const myMarker = new Icon({ iconUrl: marker, iconSize: [45, 45] });
const myIssueMarker = new Icon({ iconUrl: marker1, iconSize: [45, 45] });
const myCompletedMarker = new Icon({ iconUrl: marker2, iconSize: [45, 45] });

export default function DraggableMarker(props) {
  const [draggable, setDraggable] = useState(false);
  const { markers, setMarkers } = useContext(MarkersContext);
  const { projectMarkers, setProjectMarkers } = useContext(
    ProjectMarkersContext
  );
  const markerRef = useRef(null);

  // markers details states
  const [position, setPosition] = useState(props.position);
  const [number, setNumber] = useState(props.number);
  const [status, setStatus] = useState(props.status);
  const [materialsUsed, setMaterialUsed] = useState(props.materialsUsed);
  const [measurements, setMeasurements] = useState(props.measurements);
  const [serviceUsed, setServiceUsed] = useState(props.service);
  const [comment, setComment] = useState(props.comment);
  const [fR, setFr] = useState(props.fR);

  const [type, setType] = useState(props.type);

  const [doorConfiguration, setDoorConfiguration] = useState(props.doorConfiguration);
  const [doorFinish, setDoorFinish] = useState(props.doorFinish);
  const [doorGapHinge, setDoorGapHinge] = useState(props.doorGapHinge);
  const [doorGapLockSide, setDoorGapLockSide] = useState(props.doorGapLockSide);
  const [doorGapHead, setDoorGapHead] = useState(props.doorGapHead);
  const [doorGapBottom, setDoorGapBottom] = useState(props.doorGapHead);
  const [openingHeight, setOpeningHeight] = useState(props.openingHeight);
  const [visionPanel, setVisionPanel] = useState(props.visionPanel);
  const [frameCondition, setFrameCondition] = useState(props.frameCondition);
  const [frameConditionComment, setFrameConditionComment] = useState(props.frameConditionComment);
  const [hingeAdjustment, setHingeAdjustment] = useState(props.hingeAdjustment);
  const [ironmongery, setIronmongery] = useState(props.ironmongery);
  const [handle, setHandle] = useState(props.handle);
  const [lock, setLock] = useState(props.lock);
  const [doorCondition, setDoorCondition] = useState(props.doorCondition);

  const availableStatus = ["completed", "inProgress", "issue"];
  const availableFR = ["Acoustic", "30", "60", "120"];

  const handleOptions = ['Poor Handle Condition', 'Good Handle Condition', 'N/A'];
  const lockConditionOptions = ['Fair Lock Condition', 'Good Lock COndition', 'Poor Lock Condition'];
  const intumescentStripsOptions = ['Good', 'Not Installed', 'Requires Placement'];
  const frameConditionOptions = ['Poor Frame Condition', 'Fair Frame Condition'];
  const doorConditionOptions = ['Poor Door Condition', 'Fair Door Condition'];
  const hingeAdjustmentOptions = ['Adjust', 'N/A'];
  const visionPanelOptions = ['Yes', 'No'];
  const doorConfigurationOptions = ['Single', 'Double', 'Single With Fan Light', 'Double With Fan Light', 'Single (Fan Light and Side Panel'];



  // photo states
  const [photosOpen, setPhotosOpen] = useState(false);
  const [images, setImages] = useState([]);
  const [photos, setPhotos] = useState(props.photos);
  const [photosNumber, setPhotosNumber] = useState(props.photos.length);
  const [uploading, setUploading] = useState(false);

  const onChange = (imageList, addUpdateIndex) => {
    // data for submit
    console.log(imageList, addUpdateIndex);
    // upload photos
    if (photosNumber < imageList.length){
      setUploading(true);
      const photosArr = photos;
      for (let index of addUpdateIndex){
        const image_id = `${props.id}-${Date.now()}`;
        postImage(image_id, imageList[index].data_url).then((result) => {
          
            photosArr.push(image_id)
            console.log(photosArr)
            if(imageList.length === photosArr.length){
              setPhotos(photosArr);
              setTimeout(() => {
                setUploading(false);
                console.log('updating marker details...')
                updateMarker();
              }, 2000)
            }
        });
     }
     setUploading(false);
    }
    setImages(imageList);
  };

  // get photos

  useEffect(() => {
    if(photosOpen){
      const imagesArr = [];
      for(let photo of photos){
        getImage(photo).then((result) => {
          const obj = { data_url: result };
          imagesArr.push(obj);
          if(imagesArr.length === photos.length){
            setImages(imagesArr);
          }
        })
      }
    }
  }, [photosOpen])


  // delete image

  const delImage = (index) => {
    console.log(index, 'index of deleting photo')
    delImageS3(photos[index]).then((result) => {
      if(result.status === 204){
        const updatedPhotos = photos;
        console.log(updatedPhotos)
        updatedPhotos.splice(index, 1);
        console.log(updatedPhotos)
        setPhotos(updatedPhotos);
        setTimeout(() => {
          console.log('updating marker details...')
          updateMarker();
        }, 2000)
      }
    })
  }


  // drag marker handlers
  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          setPosition(marker.getLatLng());
        }
      },
    }),
    []
  );

  const toggleDraggable = () => {
    if (draggable) {
      setDraggable(false);
    } else {
      setDraggable(true);
    }
  };

  // delete Marker
  const delMarker = () => {
    deleteMarker(props.projectName, props.id).then((result) => {
      const m = markers.filter((item) => item.id !== props.id);
      setMarkers(m);
      const pm = projectMarkers.filter((item) => item.id !== props.id);
      setProjectMarkers(pm);
    });
  };

  // save markers details
  const updateMarker = () => {
    const id = props.id;

    const obj = {
      [id]: {
        id: id,
        number: number,
        status: status,
        location: props.currentLocation,
        locationOnDrawing: position,
        materialsUsed: materialsUsed,
        measurements: measurements,
        service: serviceUsed,
        completedBy: "",
        comment: comment,
        photos: photos,
        fR: fR,
        doorConfiguration: doorConfiguration,
        doorFinish: doorFinish,
        doorGapHinge: doorGapHinge,
        doorGapLockSide: doorGapLockSide,
        doorGapHead: doorGapHead,
        doorGapBottom: doorGapBottom,
        openingHeight: openingHeight,
        visionPanel: visionPanel,
        frameCondition: frameCondition,
        frameConditionComment: frameConditionComment,
        hingeAdjustment: hingeAdjustment,
        ironmongery: ironmongery,
        type: type,
        handle: handle,
        lock: lock,
        doorCondition: doorCondition
      },
    };

    patchMarker(props.projectName, props.id, obj).then((response) => {
      setProjectMarkers(response.data.markers);
    });
  };

  // form handlers

  const handleMaterials = (item) => {
    let updatedList = [...materialsUsed];
    if (!materialsUsed.includes(item)) {
      updatedList = [...materialsUsed, item];
    } else {
      updatedList.splice(materialsUsed.indexOf(item), 1);
    }
    setMaterialUsed(updatedList);
  };

  const handleService = (item) => {
    let updatedList = [...serviceUsed];
    if (!serviceUsed.includes(item)) {
      updatedList = [...serviceUsed, item];
    } else {
      updatedList.splice(serviceUsed.indexOf(item), 1);
    }
    setServiceUsed(updatedList);
  };

  const handleStatus = (item) => {
    setStatus(item);
  };

  const handleFR = (item) => {
    setFr(item);
  };

  return (
    <Marker
      draggable={draggable}
      eventHandlers={eventHandlers}
      position={position}
      ref={markerRef}
      icon={status === 'completed' ? myCompletedMarker : (status === 'issue' ? myIssueMarker : myMarker) }
    >
      <Popup minWidth={350}>

        <div className="marker-form">
          <div>

          { type !== '' ? (
          <button onClick={() => toggleDraggable()}>
            {draggable ? "Save Position" : "Move Marker"}
          </button>
          ) : null}

          { type === '' ? (
            <div>
            <button onClick={() => setType('seal')}>Seal</button>
            <button onClick={() => setType('door')}>Fire Doors</button>
            </div>
          ) : null }

          { type !== '' ? (
          <div className="checkList">
            <div className="title" id="status">
              <b>Status</b>
            </div>
            <div className="list-container" id="status-container">
              {availableStatus.map((item, index) => (
                <div className="checkbox" key={index}>
                  <input
                    id={item}
                    value={item}
                    type="checkbox"
                    checked={status.includes(item) ? true : false}
                    onChange={() => handleStatus(item)}
                  />

                  <label htmlFor={item}>{item}</label>
                </div>
              ))}
            </div>
          </div>
          ) : null }

          { type !== '' ? (
          <div className="checkList">
            <div className="title" id="fr">
              <b>FR</b>
            </div>
            <div className="list-container" id="status-container">
              {availableFR.map((item, index) => (
                <div className="checkbox" key={index}>
                  <input
                    id={item}
                    value={item}
                    type="checkbox"
                    checked={fR.includes(item) ? true : false}
                    onChange={() => handleFR(item)}
                  />

                  <label htmlFor={item}>{item}</label>
                </div>
              ))}
            </div>
          </div>
          ) : null}

          { type !== '' ? (
          <div className="text-input">
            <div className="title">
              <b>Number</b>
            </div>

            <input
              className="input"
              value={number}
              type="text"
              onChange={(e) => {
                setNumber(e.target.value);
              }}
            ></input>
          </div>
          ) : null}


          {type === 'seal' ? (
          <div className="checkList">
            <div className="title" id="title-checkbox">
              <b>Materials</b>
            </div>
            <div className="list-container">
              {props.materials.map((item, index) => (
                <div key={index} className="checkbox">
                  <input
                    id={item}
                    value={item}
                    type="checkbox"
                    checked={materialsUsed.includes(item) ? true : false}
                    onChange={() => handleMaterials(item)}
                  />
                  <label htmlFor={item}>{item}</label>
                </div>
              ))}
            </div>
          </div>
          ) : null}

          { type === 'seal' ? (
          <div className="checkList">
            <div className="title" id="title-checkbox">
              <b>Services</b>
            </div>
            <div className="list-container" id="services-container">
              {props.services.map((item, index) => (
                <div key={index} className="checkbox">
                  <input
                    id={item}
                    value={item}
                    type="checkbox"
                    checked={serviceUsed.includes(item) ? true : false}
                    onChange={() => handleService(item)}
                  />
                  <label htmlFor={item}>{item}</label>
                </div>
              ))}
            </div>
          </div>
          ) : null}

          {type === 'seal' ? (
          <div className="text-input">
            <div className="title">
              <label htmlFor="height">
                <b>Height</b>
              </label>
            </div>
            <input
              id="height"
              className="input"
              value={measurements[1]}
              type="text"
              onChange={(e) => {
                setMeasurements([measurements[0], e.target.value]);
              }}
            ></input>
            <div className="title">
              <label htmlFor="width">
                <b>Width</b>
              </label>
            </div>
            <input
              id="width"
              className="input"
              value={measurements[0]}
              type="text"
              onChange={(e) => {
                setMeasurements([e.target.value, measurements[1]]);
              }}
            ></input>
          </div>
          ) : null}

          { type !== '' ? (
          <div className="text-input" id="comment-container">
            <div className="title">
              <label htmlFor="comment">
                <b>Comment</b>
              </label>
            </div>

            <input
              id="comment"
              className="input"
              value={comment}
              type="text"
              onChange={(e) => {
                setComment(e.target.value);
              }}
            ></input>
          </div>
          ) : null }

          { type === 'door' ? (
          <div className="checkList">
            <div className="title" id="status">
              <b>Door Configuration</b>
            </div>
            <div className="list-container" id="status-container">
              {doorConfigurationOptions.map((item, index) => (
                <div className="checkbox" key={index}>
                  <input
                    id={item}
                    value={item}
                    type="checkbox"
                    checked={doorConfiguration === item ? true : false}
                    onChange={() => setDoorConfiguration(item)}
                  />

                  <label htmlFor={item}>{item}</label>
                </div>
              ))}
            </div>
          </div>
          ) : null }

          { type === 'door' ? (
          <div className="checkList">
            <div className="title" id="status">
              <b>Vision Panel</b>
            </div>
            <div className="list-container" id="status-container">
              {visionPanelOptions.map((item, index) => (
                <div className="checkbox" key={index}>
                  <input
                    id={item}
                    value={item}
                    type="checkbox"
                    checked={visionPanel.includes(item) ? true : false}
                    onChange={() => setVisionPanel(item)}
                  />

                  <label htmlFor={item}>{item}</label>
                </div>
              ))}
            </div>
          </div>
          ) : null }

          { type === 'door' ? (
          <div className="checkList">
            <div className="title" id="status">
              <b>Frame Condition</b>
            </div>
            <div className="list-container" id="status-container">
              {frameConditionOptions.map((item, index) => (
                <div className="checkbox" key={index}>
                  <input
                    id={item}
                    value={item}
                    type="checkbox"
                    checked={frameCondition.includes(item) ? true : false}
                    onChange={() => setFrameCondition(item)}
                  />

                  <label htmlFor={item}>{item}</label>
                </div>
              ))}
            </div>
          </div>
          ) : null }

         { type === 'door' ? (
          <div className="checkList">
            <div className="title" id="status">
              <b>Door Condition</b>
            </div>
            <div className="list-container" id="status-container">
              {doorConditionOptions.map((item, index) => (
                <div className="checkbox" key={index}>
                  <input
                    id={item}
                    value={item}
                    type="checkbox"
                    checked={doorCondition.includes(item) ? true : false}
                    onChange={() => setDoorCondition(item)}
                  />

                  <label htmlFor={item}>{item}</label>
                </div>
              ))}
            </div>
          </div>
          ) : null }

          { type === 'door' ? (
          <div className="checkList">
            <div className="title" id="status">
              <b>Handle</b>
            </div>
            <div className="list-container" id="status-container">
              {handleOptions.map((item, index) => (
                <div className="checkbox" key={index}>
                  <input
                    id={item}
                    value={item}
                    type="checkbox"
                    checked={handle.includes(item) ? true : false}
                    onChange={() => setHandle(item)}
                  />

                  <label htmlFor={item}>{item}</label>
                </div>
              ))}
            </div>
          </div>
          ) : null }

          { type === 'door' ? (
          <div className="checkList">
            <div className="title" id="status">
              <b>Lock</b>
            </div>
            <div className="list-container" id="status-container">
              {lockConditionOptions.map((item, index) => (
                <div className="checkbox" key={index}>
                  <input
                    id={item}
                    value={item}
                    type="checkbox"
                    checked={lock.includes(item) ? true : false}
                    onChange={() => setLock(item)}
                  />

                  <label htmlFor={item}>{item}</label>
                </div>
              ))}
            </div>
          </div>
          ) : null }

          { type === 'door' ? (
          <div className="text-input" id="comment-container">
            <div className="title">
              <label htmlFor="comment">
                <b>Door Gap Hinge</b>
              </label>
            </div>

            <input
              id="comment"
              className="input"
              value={doorGapHinge}
              type="number"
              onChange={(e) => {
                setDoorGapHinge(e.target.value);
              }}
            ></input>
          </div>
          ) : null }

          { type === 'door' ? (
          <div className="text-input" id="comment-container">
            <div className="title">
              <label htmlFor="comment">
                <b>Door Gap Lock Side</b>
              </label>
            </div>

            <input
              id="comment"
              className="input"
              value={doorGapLockSide}
              type="number"
              onChange={(e) => {
                setDoorGapLockSide(e.target.value);
              }}
            ></input>
          </div>
          ) : null }

          { type === 'door' ? (
          <div className="text-input" id="comment-container">
            <div className="title">
              <label htmlFor="comment">
                <b>Door Gap Head</b>
              </label>
            </div>

            <input
              id="comment"
              className="input"
              value={doorGapHead}
              type="number"
              onChange={(e) => {
                setDoorGapHead(e.target.value);
              }}
            ></input>
          </div>
          ) : null }

         { type === 'door' ? (
          <div className="text-input" id="comment-container">
            <div className="title">
              <label htmlFor="comment">
                <b>Door Gap Bottom</b>
              </label>
            </div>

            <input
              id="comment"
              className="input"
              value={doorGapBottom}
              type="number"
              onChange={(e) => {
                setDoorGapBottom(e.target.value);
              }}
            ></input>
          </div>
          ) : null }

          { type === 'door' ? (
          <div className="text-input" id="comment-container">
            <div className="title">
              <label htmlFor="comment">
                <b>Opening Height</b>
              </label>
            </div>

            <input
              id="comment"
              className="input"
              value={openingHeight}
              type="number"
              onChange={(e) => {
                setOpeningHeight(e.target.value);
              }}
            ></input>
          </div>
          ) : null }

          {type !== '' ? (
          <button
            onClick={() => {
              updateMarker();
              alert("marker has been updated");
            }}
          >
            Update
          </button>
          ) : null }

          <button
            id="delete-btn"
            onClick={() => {
              delMarker();
              alert("marker has been deleted");
            }}
          >
            Delete Marker
          </button>

          {/* PHOTO GALLERY COMPONENTS */}

          <br />
          <hr />
          <br />

          { uploading ? (<p>Uploading...</p>) : null }

          {!photosOpen ? (
            <button onClick={() => {setPhotosOpen(true)}}>Load gallery</button>
          ) : (type !== '' ? (
            <ImageUploading
              multiple
              value={images}
              onChange={onChange}
              dataURLKey="data_url"
            >
              {({
                imageList,
                onImageUpload,
                onImageUpdate,
                onImageRemove,
                isDragging,
                dragProps,
              }) => (
                // UI
                <div className="upload__image-wrapper">
                  <button
                    style={isDragging ? { color: "red" } : undefined}
                    onClick={onImageUpload}
                    {...dragProps}
                  >
                    Upload photo
                  </button>
                  &nbsp;
                  {imageList.map((image, index) => (
                    <div key={index}>

                      <Photo url={image["data_url"]}/>
                   
                      
                      <div className="image-item__btn-wrapper">
                        <button onClick={() => {onImageRemove(index)
                                                delImage(index)}}>
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ImageUploading>
          ) : null ) }
        </div></div>
      </Popup>
    </Marker>
  );
}
