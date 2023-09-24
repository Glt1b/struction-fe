import { React, useEffect, useState, useRef, useMemo, useContext } from "react";
import { Icon } from "leaflet";
import { Marker, Popup } from "react-leaflet";
import { MarkersContext } from "../contexts/Markers.js";
import { ProjectMarkersContext } from "../contexts/ProjectMarkers.js";
import "leaflet/dist/leaflet.css";
import { deleteMarker, getImage, patchMarker } from "../utils/api";
import { addToIndexedDB, readFromIndexedDB, deleteFromIndexedDB } from "../utils/indexedDB.js";
import ImageUploading from "react-images-uploading";
import marker from "../images/map-marker.svg";
import marker1 from "../images/map-marker-issue.svg";
import marker2 from "../images/map-marker-complete.svg";
import { postImage, delImageS3 } from "../utils/api";
import Photo from "./Photo.jsx";
import MaterialTile from "./MaterialTile.jsx";
import NewMaterial from "./NewMaterial.jsx";

const myMarker = new Icon({ iconUrl: marker, iconSize: [45, 45], iconAnchor: [22, 45] });
const myIssueMarker = new Icon({ iconUrl: marker1, iconSize: [45, 45], iconAnchor: [22, 45] });
const myCompletedMarker = new Icon({ iconUrl: marker2, iconSize: [45, 45], iconAnchor: [22, 45] });

export default function DraggableMarker(props) {

  const [ popupOpen, setPopupOpen ] = useState(false);

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
  const [materialsUsed, setMaterialsUsed] = useState(props.materialsUsed);
  const [measurements, setMeasurements] = useState(props.measurements);
  const [serviceUsed, setServiceUsed] = useState(props.service);
  const [comment, setComment] = useState(props.comment);
  const [fR, setFr] = useState(props.fR);

  const commentTemplate = props.commentTemplate;
  const [newComment, setNewComment] = useState(false);

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
  const availableFR = ["0", "30", "60", "120"];

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

  const [testImage, setTestImage] = useState(false)


  const marker = markerRef.current

  const onChange = async (imageList, addUpdateIndex) => {
    // data for submit
    console.log(imageList, addUpdateIndex);
    // upload photos
    if(props.mode === 'online'){
      if (photosNumber < imageList.length && addUpdateIndex !== undefined){
      setUploading(true);
      const photosArr = photos;
      for (let index of addUpdateIndex){
        const image_id = `${props.id}-${Date.now()}`;

        postImage(image_id, imageList[index].data_url).then((result) => {
            
            //setTestImage(result)
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
        })
          .catch((err) => {
            alert('error occured when uploading, reload job and check photos')
            setUploading(false);
          })
     }
    }
     

    } else {
        console.log('updating photos offline')
        setUploading(true);
        const photosArr = photos;
        const  struction = await JSON.parse(localStorage.getItem('Struction'));

        for (let index of addUpdateIndex){
          console.log(addUpdateIndex)
          const image_id = `${props.id}-${Date.now()}`;
          addToIndexedDB('Struction', props.projectName, image_id, imageList[index]);
          photosArr.push(image_id);
          struction.photosToUpload.push(image_id);
          console.log(photosArr)
          if(imageList.length === photosArr.length - photosNumber){
            setPhotos(photosArr);
            localStorage.setItem('Struction', JSON.stringify(struction));
            setTimeout(() => {
              setUploading(false);
              console.log('updating marker details...')
              updateMarker();
            }, 2000)
          
        }}
      setUploading(false)
    }
    setImages(imageList);
  };

  // get photos

  useEffect(() => {
    if(popupOpen && props.mode === 'online'){
      const imagesArr = [];
      for(let photo of photos){
        getImage(photo).then((result) => {
          const obj = { data_url: result };
          imagesArr.push(obj);
          if(imagesArr.length === photos.length){
            setImages(imagesArr);
          }
        })
        .catch((err) => {
          imagesArr.push('err');
          if(imagesArr.length === photos.length){
            setImages(imagesArr);
          }
        })
      }
    } else if(popupOpen){
      alert('You can not download images in offline mode but still can upload new to local storage, they will be uploaded as soon as you are online')
      // check for image offline
      const imagesArr = [];
      let x = 0;
      for (let photo of photos){
        readFromIndexedDB('Struction', props.projectName, photo, function(value) {
          if (value) {
            //console.log(value)
            //const obj = { data_url: value};
            imagesArr.push(value);
            if(imagesArr.length + x === photos.length){
              setImages(imagesArr);
            }
          } else {
            x = x + 1;
            if(imagesArr.length + x === photos.length){
              setImages(imagesArr);
            }
          }
        });
      }
    }
  }, [popupOpen])


  // delete image

  const delImage = (index) => {
    if(props.mode === 'online'){
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
    } else {
      // delete offline
      console.log('deleting photo online' + index)
      deleteFromIndexedDB('Struction', props.projectName, index, function(success) {
        if (success) {
          console.log('Data deleted successfully.');
          const updatedPhotos = photos;
          console.log(updatedPhotos)
          updatedPhotos.splice(index, 1);
          console.log(updatedPhotos)
          setPhotos(updatedPhotos);
          setTimeout(() => {
            console.log('updating marker details...')
            updateMarker();
          }, 2000)

        } else {
          console.log('Failed to delete the data.');
        }
      });

    }
  }
  
  // open and close popup

  const closePopup = () => {
    if (marker) {
      setPopupOpen(false);
      updateMarker();
      marker.closePopup();
    }
  }

  
	if (marker && popupOpen) {
		marker.openPopup();
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
      click () {
        setPopupOpen(true);
      }
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

    if(props.mode === 'online'){
    console.log(photos)
    photos.forEach( element => delImageS3(element));
    deleteMarker(props.projectName, props.id).then((result) => {
      const m = markers.filter((item) => item.id !== props.id);
      setMarkers(m);
      const pm = projectMarkers.filter((item) => item.id !== props.id);
      setProjectMarkers(pm);
    });
    } else {
      
      const struction = JSON.parse(localStorage.getItem('Struction'));
      photos.forEach(element => struction.photosToDelete.push(element));
      const pins = struction.projectMarkers;
      const updatedPins = pins.filter(pin => pin.id !== props.id);
      struction.projectMarkers = updatedPins;
      localStorage.setItem('Struction', JSON.stringify(struction));
      props.setProjectMarkers(struction.projectMarkers)
    }

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
    if(props.mode === 'online'){
    patchMarker(props.projectName, props.id, obj)
      .then((response) => {
        setProjectMarkers(response.data.markers);
    })
      .catch((err) => {
        alert('Error occured trying to update marker, open it and try again.')
    })
       
    } else {
      const struction = JSON.parse(localStorage.getItem('Struction'));
      const pins = struction.projectMarkers;
      console.log(pins)
      const updatedPins = pins.filter(pin => pin.id !== id);
      updatedPins.push(obj[Object.keys(obj)[0]])
      struction.projectMarkers = updatedPins;
      if(!struction.markersToUpload.includes(id)){
        struction.markersToUpload.push(id);
        struction.arrToUpload.push(obj);
      }
      localStorage.setItem('Struction', JSON.stringify(struction));
      props.setProjectMarkers(struction.projectMarkers)
    }
  };

  // form handlers

  const isEqual = (obj1, obj2) => {
    const key1 = Object.keys(obj1)[0];
    const key2 = Object.keys(obj2)[0];

    console.log('keys:' + key1 + key2)

    if(key1 !== key2){
      return false;
    } else if (obj1[key1] !== obj2[key2]){
      return false;
    } else {
      return true;
    }
  }

  const deleteMaterial = (item) => {

    let updatedList = [];

    for (let m of materialsUsed){
      const result = isEqual(m, item);
      if(!result){
        updatedList.push(m)
      }
    }

    setMaterialsUsed(updatedList);
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
      <Popup 
      minWidth={400}
      keepInView={true}
      autoClose={false}
      closeOnClick={false}
      closeButton={false}
      >

        <div>

          { type !== '' ? (
          <button
           className="top-button" 
           onClick={() => toggleDraggable()}>
            {draggable ? "Save Position" : "Move Marker"}
          </button>
          ) : null}

          {type !== '' ? (
          <button
            className="top-button"
            onClick={() => {
              closePopup();
            }}
          >
            Update
          </button>
          ) : null }
        

        <div className="marker-form">
          <div>



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
                    checked={fR === item ? true : false}
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
            <div className="list-container" id="services-container">
              {materialsUsed.map((item, index) => (
                <>
                  <MaterialTile
                   key={index}
                   material={item}/>
                  <button onClick={() => {deleteMaterial(item)}}>Delete</button>
                </>
              ))}
            </div>
              <NewMaterial
              materials={props.materials}
              materialsUsed={materialsUsed}
              setMaterialsUsed={setMaterialsUsed}/>

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



          { type !== '' ? (
          <div className="text-input" id="comment-container">
            <div className="title">
              <label htmlFor="comment">
                <b>Comment</b>
              </label>
            </div>

            <textarea
              style={{height:'70px'}}
              id="comment"
              className="input"
              value={comment}
              type="text"
              onChange={(e) => {
                setComment(e.target.value);
              }}
            ></textarea>
          </div>
          ) : null }

          { newComment ? 
            commentTemplate.map((item, index) => (
              <div key={index}>
              <button 
                style={{width: '250px'}}
                onClick={() => {setComment(comment + item + '\n')
                               setNewComment(false)}}>
                  <p style={{display: 'block'}}>{item}</p></button></div>
            ))
           : null }

          { !newComment ? (<button onClick={()=> setNewComment(true)}>+ Add new comment</button>) : null}

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
         

          {/* PHOTO GALLERY COMPONENTS */}

          <br />
          <hr />
          <br />

          { uploading ? (<p style={{color: 'red'}}>Uploading...</p>) : null }

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
                  {imageList.filter(item => item !== 'err').map((image, index) => (
                    
                    <div key={index}>
                  
                      <Photo url={image["data_url"]}/>
                   
                      { props.mode === 'online' ? (
                        <div className="image-item__btn-wrapper">
                        <button onClick={() => {onImageRemove(index)
                                                delImage(index)}}>
                          Remove
                        </button>
                      </div>
                      ) : null }
                      
                    </div>
                  ))}
                </div>
              )}
            </ImageUploading>

          <br />
          <hr />
          <br />
          <button
            id="delete-btn"
            onClick={() => {
              delMarker();
              alert("marker has been deleted");
            }}
          >
            Delete Marker
          </button>
        </div></div></div>
      </Popup>
    </Marker>
  );
}
