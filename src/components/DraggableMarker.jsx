import { React, useEffect, useState, useRef, useMemo, useContext } from "react";
import { Icon } from "leaflet";
import { Marker, Popup } from "react-leaflet";
import { MarkersContext } from "../contexts/Markers.js";
import { ProjectMarkersContext } from "../contexts/ProjectMarkers.js";
import "leaflet/dist/leaflet.css";
import { deleteMarker, getImage, patchMarker } from "../utils/api";
import { addToIndexedDB, readFromIndexedDB, deleteFromIndexedDB, deleteIndexedDB } from "../utils/indexedDB.js";
import ImageUploading from "react-images-uploading";
import marker from "../images/map-marker.svg";
import marker1 from "../images/map-marker-issue.svg";
import marker2 from "../images/map-marker-complete.svg";
import { postImage, delImageS3 } from "../utils/api";
import Photo from "./Photo.jsx";
import MaterialTile from "./MaterialTile.jsx";
import NewMaterial from "./NewMaterial.jsx";
import Services from "./Services.jsx";

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

  const [updateNeeded, setUpdateNeeded] = useState(false);

  // markers details states
  const [position, setPosition] = useState(props.position);
  const [number, setNumber] = useState(props.number);
  const [status, setStatus] = useState(props.status);
  const [materialsUsed, setMaterialsUsed] = useState(props.materialsUsed);
  const [measurements, setMeasurements] = useState(props.measurements);
  const [serviceUsed, setServiceUsed] = useState(props.service);
  const [comment, setComment] = useState(props.comment);
  const [ workScope, setWorkScope ] = useState(props.frameCondition);
  const [fR, setFr] = useState(props.fR);
  const [completedBy, setCompletedBy] = useState(props.completedBy)
  const [cat, setCat] = useState(props.visionPanel)
  const [completedTime, setCompletedTime] = useState(props.doorFinish)
  const [estTime, setEstTime] = useState(props.lock);

  const commentTemplate = props.commentTemplate;
  const [newComment, setNewComment] = useState(false);

  const workScopeTemplates = props.workScopeTemplates;
  const [newScope, setNewScope] = useState(false);


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
  const availableCats = ['cat 1', 'cat 2', 'cat 3', 'cat 4', 'cat 5'];
  const availableFR = ["0", "30", "60", "120"];

  const handleOptions = ['Poor Handle Condition', 'Good Handle Condition', 'N/A'];
  const lockConditionOptions = ['Fair Lock Condition', 'Good Lock Condition', 'Poor Lock Condition'];
  const intumescentStripsOptions = ['Good', 'Not Installed', 'Requires Placement'];
  const frameConditionOptions = ['Poor Frame Condition', 'Fair Frame Condition'];
  const doorConditionOptions = ['Poor Door Condition', 'Fair Door Condition'];
  const hingeAdjustmentOptions = ['Adjust', 'N/A '];
  const visionPanelOptions = ['Yes', 'No'];
  const doorConfigurationOptions = ['Single', 'Double', 'Single With Fan Light', 'Double With Fan Light', 'Single (Fan Light and Side Panel'];


 
  // photo states
  const [photosOpen, setPhotosOpen] = useState(false);
  const [images, setImages] = useState([]);
  const [photos, setPhotos] = useState(props.photos);
  const [photosNumber, setPhotosNumber] = useState(props.photos.length);
  const [uploading, setUploading] = useState(false);

  const [downloading, setDownloading] = useState(false);


  const marker = markerRef.current

  const onChange = async (imageList, addUpdateIndex) => {
    // data for submit
    console.log(imageList, addUpdateIndex);
    console.log(photosNumber)
    console.log(imageList.length)
    // upload photos
    setUpdateNeeded(true);
    if(props.mode === 'online'){
      if (photosNumber < imageList.length && addUpdateIndex !== undefined){
      setUploading(true);
      const photosArr = photos;
      let count = 0;
      for (let index of addUpdateIndex){
        const image_id = `${props.id}-${Date.now()}-${count}`;
        count++;

        postImage(image_id, imageList[index].data_url).then((result) => {
            
            //setTestImage(result)
            console.log(result)
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
            alert('error occured uploading photo, reload app and check photos')
            setUploading(false);
          })
     }
    }
     

    } else {
        console.log('updating photos offline')
        setUploading(true);
        const photosArr = photos;
        let count = 0;

        for (let index of addUpdateIndex){
          count++;
          console.log(addUpdateIndex)
          const image_id = `${props.id}-${Date.now()}-${count}`;
          addToIndexedDB(props.projectName, 'photos', image_id, imageList[index]);
          
          photosArr.push(image_id);
          console.log(photosArr)
          if(imageList.length === photosArr.length - photosNumber){
            setPhotos(photosArr);
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
      if(photos.length > 0){
        setDownloading(true);
      }
      
      const imagesArr = [];
      for(let photo of photos){
        getImage(photo).then((result) => {
          let index = photos.indexOf(photo);
          const obj = { data_url: result };
          imagesArr.splice(index, 0, obj);
          if(imagesArr.length === photos.length){
            setImages(imagesArr);
            setDownloading(false);
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
      // check for image offline
      const imagesArr = [];
      let x = 0;
      for (let photo of photos){
        readFromIndexedDB(props.projectName, 'photos', photo, function(value) {
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
      deleteFromIndexedDB(props.projectName, 'photos', index, function(success) {
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
          console.log('Failed to delete data.');
        }
      });

    }
  }
  
  // open and close popup

  const closePopup = () => {
    if (marker) {
      setPopupOpen(false);
      if(updateNeeded){
        updateMarker();
        setUpdateNeeded(false);
      }
      
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
          setPosition([marker.getLatLng().lat, marker.getLatLng().lng]);
          setUpdateNeeded(true);
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

      const storage = JSON.parse(localStorage.getItem(`${struction.projectName}-markers`));
      const markers = storage.projectMarkers;
      const toUpload = storage.markersToUpload;
      // check if pin is on device only
      const checkArr = toUpload.filter(pin => pin.id === props.id);
      if(checkArr.length === 0){
        alert('You can not delete marker from server when in offline mode.')
      } else {
        // delete photots

        const updatedPins = markers.filter(pin => pin.id !== props.id);
        storage.projectMarkers = updatedPins;

        const uploadArr = toUpload.filter(pin => pin.id !== props.id);
        storage.markersToUpload = uploadArr;

        localStorage.setItem(`${struction.projectName}-markers`, JSON.stringify(storage));
        props.setProjectMarkers(storage.projectMarkers)
      }
    }
  };

  // save markers details
  const updateMarker = () => {
    console.log('updating marker')
    const id = props.id;

    const obj = {
     
        id: id,
        number: number,
        status: status,
        location: props.currentLocation,
        locationOnDrawing: position,
        materialsUsed: materialsUsed,
        measurements: measurements,
        service: serviceUsed,
        completedBy: completedBy,
        comment: comment,
        photos: photos,
        fR: fR,
        doorConfiguration: doorConfiguration,
        doorFinish: completedTime, //completed on
        doorGapHinge: doorGapHinge, 
        doorGapLockSide: doorGapLockSide,
        doorGapHead: doorGapHead,
        doorGapBottom: doorGapBottom,
        openingHeight: openingHeight,
        visionPanel: cat,//issue cat
        frameCondition: workScope,
        frameConditionComment: frameConditionComment,
        hingeAdjustment: hingeAdjustment,
        ironmongery: ironmongery,
        type: type,
        handle: handle,
        lock: estTime, // estimated time
        doorCondition: doorCondition // ID number 2
      
    };
    if(props.mode === 'online'){
    patchMarker(props.projectName, props.id, obj)
      .then((response) => {
        setProjectMarkers(response.data.markers);
    })
      .catch((err) => {
        alert('Error occured updating marker, open it and try again. Changes has not beed uploaded to server!!!')
    })
       
    } else {
      const struction = JSON.parse(localStorage.getItem('Struction'));

      const storage = JSON.parse(localStorage.getItem(`${struction.projectName}-markers`));
      const markers = storage.projectMarkers;
      const toUpload = storage.markersToUpload;
      console.log(markers)

      const updatedPins = markers.filter(pin => pin.id !== props.id);
      updatedPins.push(obj);
      storage.projectMarkers = updatedPins;

      const uploadArr = toUpload.filter(pin => pin.id !== props.id);
      uploadArr.push(obj);
      storage.markersToUpload = uploadArr;

      localStorage.setItem(`${struction.projectName}-markers`, JSON.stringify(storage));
      props.setProjectMarkers(storage.projectMarkers)
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
    setUpdateNeeded(true);
    setMaterialsUsed(updatedList);
  };
/*
  const handleService = (item) => {
    if(props.role !== 'Visitor' && status !== 'completed'){
      let updatedList = [...serviceUsed];
    if (!serviceUsed.includes(item)) {
      updatedList = [...serviceUsed, item];
    } else {
      updatedList.splice(serviceUsed.indexOf(item), 1);
    }
    setServiceUsed(updatedList);
      }
     }
*/
  const handleCat = (item) => {
    if(props.role !== 'Visitor'){
      setUpdateNeeded(true);
      setCat(item);
    }
  }
    

  const handleStatus = (item) => {
    if(props.role !== 'Visitor' && status !== 'completed' ){
    if(item === 'completed'){
      if(materialsUsed.length > 0 && serviceUsed.length > 0 && fR !== '' && number !== '0' && photos.length > 1){
        setUpdateNeeded(true);
        setStatus(item);
        let currentDate = '';
        currentDate = currentDate + new Date().getDate() + '/';
        const month = parseInt(new Date().getMonth())+1
        console.log(month)
        currentDate = currentDate + month.toString() + '/';
        currentDate = currentDate + new Date().getFullYear();
        setCompletedTime(currentDate)
        let str = completedBy + '\ ' + props.user 
        setCompletedBy(str);
      } else if(type === 'seal'){
        alert('Before you mark pin as Completed, make sure you have submited at least 1 material and service type, 2 photos, fire rating and pin number.')
      }
    } else {
      setUpdateNeeded(true);
      setStatus(item);
    }} else if (status === 'completed' && props.role === 'Manager'){
      setUpdateNeeded(true);
      setStatus(item);
    }
  };

  const handleFR = (item) => {
    if(props.role !== 'Visitor' && status !== 'completed'){
      setUpdateNeeded(true);
      setFr(item);
    }
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

          {props.role !== 'Visitor' && status !== 'completed' ? (
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
            Close
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
          <div className="text-input">
            <div className="title">
              <b>Number</b>
            </div>
            { props.role === 'Visitor' || status === 'completed' ? (<p>{number}</p>) : (
            <p><input
              className="input"
              value={number}
              type="text"
              onChange={(e) => {
                setUpdateNeeded(true);
                setNumber(e.target.value.toUpperCase());
              }}
            ></input></p>)}
          </div>
          ) : null}

         { type !== '' ? (
          <div className="text-input">
            <div className="title">
              <b>Client ID</b>
            </div>
            { props.role === 'Visitor' || status === 'completed' ? (<p>{doorCondition}</p>) : (
            <p><input
              className="input"
              value={doorCondition}
              type="text"
              onChange={(e) => {
                setUpdateNeeded(true);
                setDoorCondition(e.target.value);
              }}
            ></input></p>)}
          </div>
          ) : null}

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

         { type !== '' && status === 'issue' ? (
          <div className="checkList">
            <div className="title" id="status">
              <b>Issue Category</b>
            </div>
            <div className="list-container" id="status-container">
              {availableCats.map((item, index) => (
                <div className="checkbox" key={index}>
                  <input
                    id={item}
                    value={item}
                    type="checkbox"
                    checked={cat === item ? true : false}
                    onChange={() => handleCat(item)}
                  />

                  <label htmlFor={item}>{item}</label>
                </div>
              ))}
            </div>
          </div>
          ) : null }

          { status === 'completed' ? (
            <div>
            <p style={{color:'green'}}>Completed by:</p>
            <p>{completedBy}</p>
            <p>{completedTime}</p>

            </div>
          ) : null}

{ type === 'seal' && props.role === 'Manager' ? (
          <div className="text-input" id="comment-container">
            <div className="title">
              <label htmlFor="comment">
                <b>Scope of Work</b>
              </label>
            </div>

            <textarea
              style={{height:'70px'}}
              id="comment"
              className="input"
              value={workScope}
              type="text"
              onChange={(e) => {
                setUpdateNeeded(true);
                setWorkScope(e.target.value);
              }}
            ></textarea>
          </div>
          ) : (<p>{workScope}</p>) }

          { newScope && props.role === 'Manager'? (
            <button onClick={() => setNewScope(false)}>Dismiss</button>
          ) : null}

          { newScope && props.role === 'Manager'? 
            workScopeTemplates.map((item, index) => (
              <div key={index}>
              <button 
                style={{width: '250px'}}
                onClick={() => {setWorkScope(workScope + item + '\n')
                               setNewScope(false)
                               setUpdateNeeded(true);}}>
                  <p style={{display: 'block'}}>{item}</p></button></div>
            ))
           : null }

          { !newScope && props.role === 'Manager' ? (<button onClick={()=> setNewScope(true)}>+ Add new scope of Work</button>) : null}


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
                   {props.role !== 'Visitor' && status !== 'completed' ? (
                  <button onClick={() => {deleteMaterial(item)}}>Delete</button>): null}
                </>
              ))}
            </div>
              {props.role !== 'Visitor' && status !== 'completed' ? (
              <NewMaterial
              materials={props.materials}
              materialsUsed={materialsUsed}
              setMaterialsUsed={setMaterialsUsed}
              setUpdateNeeded={setUpdateNeeded}/>) : null}

          </div>
          ) : null}

          { type === 'seal' ? (
            <Services 
              serviceUsed={serviceUsed}
              setServiceUsed={setServiceUsed}
              servicesAvailable={props.services}
              status={props.status}
              setUpdateNeeded={setUpdateNeeded}/>
        
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
                setUpdateNeeded(true);
                setComment(e.target.value);
              }}
            ></textarea>
          </div>
          ) : null }

          { newComment ? (
            <button onClick={() => setNewComment(false)}>Dismiss</button>
          ) : null}

          { newComment ? 
            commentTemplate.map((item, index) => (
              <div key={index}>
              <button 
                style={{width: '250px'}}
                onClick={() => {setComment(comment + item + '\n')
                               setNewComment(false)
                               setUpdateNeeded(true);}}>
                  <p style={{display: 'block'}}>{item}</p></button></div>
            ))
           : null }

          { !newComment ? (<button onClick={()=> setNewComment(true)}>+ Add new comment</button>) : null}



          {/* PHOTO GALLERY COMPONENTS */}

          <br />
          <hr />
          <br />

          { uploading ? (<p style={{color: 'red'}}>Uploading...</p>) : null }
          { downloading ? (<p style={{color: 'green'}}>Downloading...</p>) : null }

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
                  {props.role !== 'Visitor' && status !== 'completed' ? (
                  <button
                    style={isDragging ? { color: "red" } : undefined}
                    onClick={onImageUpload}
                    {...dragProps}
                  >
                    Upload photo
                  </button>) : null}
                  &nbsp;
                  {imageList.filter(item => item !== 'err').map((image, index) => (
                    
                    <div key={index}>
                  
                      <Photo url={image["data_url"]}/>
                   
                      { props.mode === 'online'  &&  props.role !== 'Visitor' && props.role !== 'Operative' && status !== 'completed' ? (
                        <div className="image-item__btn-wrapper">
                        <button onClick={() => {onImageRemove(index)
                                                delImage(index)
                                                setUpdateNeeded(true);}}>
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


         { type !== '' ? (
          <div className="text-input">
            <div className="title">
              <b>Estimated Time:</b>
            </div>
            { props.role !== 'Manager' ? null : (
            <p><input
              className="input"
              value={estTime}
              placeholder="minutes"
              type="number"
              onChange={(e) => {
                setUpdateNeeded(true);
                setEstTime(e.target.value);
              }}
            ></input></p>)}
          </div>
          ) : null}

          <br />
          <hr />
          <br />


          {props.role !== 'Visitor' && props.role !== 'Operative' && status !== 'completed' ? (
          <button
            id="delete-btn"
            onClick={() => {
              delMarker();
            }}
          >
            Delete Marker
          </button>) : null}
        </div></div></div>
      </Popup>
    </Marker>
  );
}
