import { React, useEffect, useState } from "react";
import { postProjectDetails, postDrawing, postProjectsList } from "../utils/api";
import ImageUploading from "react-images-uploading";
import Photo from "./Photo.jsx";

export default function Details (props) {

    const [updated, setUpdated] = useState(true);
    const [newMaterial, setNewMaterial] = useState('');
    const [newService, setNewService] = useState('');
    const [locationCreate, setLocationCreate] = useState(false)
    const [newLocation, setNewLocation] = useState('');
    const [newComment, setNewComment] = useState('');
    // pdf details
    const [contractAddress, setContractAddress] = useState(props.contractAddress);
    const [contractPostCode, setContractPostCode] = useState(props.contractPostCode);
    const [contractorAddress, setContractorAddress] = useState(props.contractorAddress);
    const [contractorPostCode, setContractorPostCode] = useState(props.contractorPostCode);
    const [note, setNote] = useState(props.note);
    const [description, setDescription] = useState(props.description);


    const [images, setImages] = useState([]);
    const maxNumber = 1;
    const [uploading, setUploading] = useState(false);

    const [locations, setLocations] = useState(props.locations);
    const [locationsNames, setLocationsNames] = useState(props.locationsNames);

    const [commentTemplate, setCommentTemplate] = useState(props.commentTemplate);


    const onChange = (imageList, addUpdateIndex) => {
      // data for submit
      console.log(imageList, addUpdateIndex);
      setImages(imageList);
    };

    const addLocation = () => {
      const image_id = `${props.projectName}-${newLocation}`
     
      // upload photo
      
      postDrawing(image_id, images[0].data_url, 'drawing')
      .then(() => {
        // set locations names
        const arr = [...locationsNames];
        arr.push({
          'name': newLocation,
          'url': image_id
        });
        props.setLocationsNames(arr);
        setLocationsNames(arr);
        console.log(arr)

      // set new Location locally
      const obj = {
        'name': newLocation,
        'url': images[0].data_url
      };

      setLocations([...locations, obj]);
      props.setLocations([...locations, obj]);

      // update details
      setTimeout(() => {
        const arr1 = [...locationsNames, {
          "name": newLocation,
          "url": image_id
        }]

        const body = {
          "materials": props.materials,
          "services": props.services,
          "locations": arr1,
          'commentTemplate': commentTemplate
        }
        postProjectDetails(props.projectName, body);
        setUpdated(true);
      }, 2000)

        setTimeout(() => {
           setImages([]);
           setNewLocation('');
           setUploading(false);
        }, 3000)
      })
      .catch((err) => {
        alert('error on uploading drawing. Try again')
      })
     }

    const addMaterial = () => {
        const arr = props.materials;
        arr.push(newMaterial);
        props.setMaterials(arr);
        setNewMaterial('');
    }

    const addService = () => {
        const arr = props.services;
        arr.push(newService);
        props.setServices(arr);
        setNewService('');
    }

    const addComment = () => {
      const arr = props.commentTemplate;
      arr.push(newComment);
      props.setCommentTemplate(arr);
      setNewComment('');
    }


    const delMaterial = (material) => {
        const arr = props.materials.filter( m => m !== material)
        props.setMaterials(arr);
    }

    const delService = (service) => {
        const arr = props.services.filter( s => s !== service )
        props.setServices(arr);
    }

    const delComment = (comment) => {
      const arr = commentTemplate.filter( s => s !== comment )
      setCommentTemplate(arr);
      props.setCommentTemplate(arr);
    }

    // details to pdf




    const updateDetails = () => {
      const body = {
            "materials": props.materials,
            "services": props.services,
            "locations": props.locationsNames,
            'commentTemplate': commentTemplate,
            'contractAddress': contractAddress,
            'contractPostCode': contractPostCode,
            'contractorAddress': contractorAddress,
            'contractorPostCode': contractorPostCode,
            'note': note,
            'description': description
      }

      postProjectDetails(props.projectName, body);
      setUpdated(true);
      
    }
/*
    const delProject = () => {
    let updatedList = [...props.availableContracts];
    updatedList.splice(props.availableContracts.indexOf(props.projectName), 1);
    props.setAvailableContracts(updatedList);
    postProjectsList(updatedList);
  };
    
*/

    return (
        <div style={{backgroundColor: 'whitesmoke'}}>
        <h2>{props.projectName}</h2>
        <h3>Materials</h3>
        {props.materials.map((item) => {
            return (
                <div key={item}>
                    <p style={{display: 'block'}}>{item}<button onClick={() => {setUpdated(false)
                                                     delMaterial(item)}}>x</button></p>
                </div>
            )
        })}
        <div className="text-input">
            <div className="title">
              <label htmlFor="new material">
                <b>New Material</b>
              </label>
            </div>
            <input
              id="height"
              className="input"
              value={newMaterial}
              type="text"
              onChange={(e) => {
                setNewMaterial(e.target.value);
              }}
            ></input>
            <button onClick={() => {setUpdated(false)
                                    addMaterial()}}>Submit</button>
        </div>

        <h3>Services</h3>
        {props.services.map((item) => {
            return (
                <div>
                    <p style={{display: 'block'}}>{item}<button onClick={() => {setUpdated(false)
                                                     delService(item)}}>x</button></p>
                </div>
            )
        })}
        <div className="text-input">
            <div className="title">
              <label htmlFor="new service">
                <b>New Service</b>
              </label>
            </div>
            <input
              id="height"
              className="input"
              value={newService}
              type="text"
              onChange={(e) => {
                setNewService(e.target.value);
              }}
            ></input>
            <button onClick={() => {setUpdated(false)
                                    addService()}}>Submit</button>
        </div>

        <h3>Comments</h3>
        {commentTemplate.map((item) => {
            return (
                <div key={item}>
                    <p style={{display: 'block'}}>{item}<button onClick={() => {setUpdated(false)
                                                     delComment(item)}}>x</button></p>
                </div>
            )
        })}
        <div className="text-input">
            <div className="title">
              <label htmlFor="new material">
                <b>New comment</b>
              </label>
            </div>
            <textarea
              id="height"
              className="input"
              value={newComment}
              type="text"
              onChange={(e) => {
                setNewComment(e.target.value);
              }}
            ></textarea>
            <button onClick={() => {setUpdated(false)
                                    addComment()}}>Submit</button>
        </div>

        
        { !updated ? (<button onClick={() => updateDetails()}>Update</button>) : null}

        <br></br><hr></hr><br></br>

        <h3>Locations</h3>

        { !locationCreate && !uploading ? (<button onClick={() => setLocationCreate(true)}>New Location</button>) : null}
        { uploading ? (<p>Uploading...</p>) : null}
        {locationCreate ? (
        <div>
        <ImageUploading
        multiple
        value={images}
        onChange={onChange}
        maxNumber={maxNumber}
        dataURLKey="data_url"
      >
        {({
          imageList,
          onImageUpload,
          onImageRemoveAll,
          onImageUpdate,
          onImageRemove,
          isDragging,
          dragProps,
        }) => (
          // write your building UI
          <div className="upload__image-wrapper">
            <button
              style={isDragging ? { color: 'red' } : undefined}
              onClick={onImageUpload}
              {...dragProps}
            >
              Click or Drop here
            </button>
            &nbsp;
            {imageList.map((image, index) => (
              <div key={index} className="image-item">
                <img src={image['data_url']} alt="" width="100" />
                <div className="image-item__btn-wrapper">
                  <button onClick={() => onImageRemove(index)}>Remove</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </ImageUploading>

      <div className="text-input">
                <div className="title">
                  <label htmlFor="new location">
                    <b>Location name</b>
                  </label>
                </div>
                <input
                  id="height"
                  className="input"
                  value={newLocation}
                  type="text"
                  onChange={(e) => {
                    setNewLocation(e.target.value);
              }}
            ></input>
            { images.length === 1 && newLocation !== '' ? 
            (<button onClick={() => {setLocationCreate(false)
                                    setUploading(true)
                                    addLocation()
                                         }}>Submit</button>) : null}
            
        </div>
          </div>
        ) : null}

        <br></br><hr></hr><br></br>

        {locations.map((item, index) => {
          return(
            <div className="text-input">
              <p>{item.name}</p>
              <p><img src={item.url} alt="" width="300"/></p>
              <p><button disabled>Delete location</button></p>
            </div>
          )
        })}

        <br></br><hr></hr><br></br>

        <h1>PDF details</h1>

        <div className="text-input" id="comment-container">
            <div className="title">
              <label htmlFor="comment">
                <b>Contract Address</b>
              </label>
            </div>

            <textarea
              style={{height:'70px'}}
              id="comment"
              className="input"
              value={contractAddress}
              type="text"
              onChange={(e) => {
                setContractAddress(e.target.value);
                setUpdated(false);
              }}
            ></textarea>
          </div>

          <div className="text-input" id="comment-container">
            <div className="title">
              <label htmlFor="comment">
                <b>Contract Post Code</b>
              </label>
            </div>

            <textarea
              style={{height:'70px'}}
              id="comment"
              className="input"
              value={contractPostCode}
              type="text"
              onChange={(e) => {
                setContractPostCode(e.target.value);
                setUpdated(false);
              }}
            ></textarea>
          </div>
          
          <div className="text-input" id="comment-container">
            <div className="title">
              <label htmlFor="comment">
                <b>Contractor Address</b>
              </label>
            </div>

            <textarea
              style={{height:'70px'}}
              id="comment"
              className="input"
              value={contractorAddress}
              type="text"
              onChange={(e) => {
                setContractorAddress(e.target.value);
                setUpdated(false);
              }}
            ></textarea>
          </div>

          <div className="text-input" id="comment-container">
            <div className="title">
              <label htmlFor="comment">
                <b>Contractor Post Code</b>
              </label>
            </div>

            <textarea
              style={{height:'70px'}}
              id="comment"
              className="input"
              value={contractorPostCode}
              type="text"
              onChange={(e) => {
                setContractorPostCode(e.target.value);
                setUpdated(false);
              }}
            ></textarea>
          </div>

          <div className="text-input" id="comment-container">
            <div className="title">
              <label htmlFor="comment">
                <b>Note</b>
              </label>
            </div>

            <textarea
              style={{height:'70px'}}
              id="comment"
              className="input"
              value={note}
              type="text"
              placeholder="What is this report for"
              onChange={(e) => {
                setNote(e.target.value);
                setUpdated(false);
              }}
            ></textarea>
          </div>

          <div className="text-input" id="comment-container">
            <div className="title">
              <label htmlFor="comment">
                <b>Description</b>
              </label>
            </div>

            <textarea
              style={{height:'70px'}}
              id="comment"
              className="input"
              value={description}
              type="text"
              placeholder="Description of work we are gonna do"
              onChange={(e) => {
                setDescription(e.target.value);
                setUpdated(false);
              }}
            ></textarea>
          </div>

          { !updated ? (<button onClick={() => updateDetails()}>Update</button>) : null}
          
          


        </div>
    )
}