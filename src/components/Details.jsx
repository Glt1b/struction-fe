import { React, useEffect, useState } from "react";
import { postProjectDetails, postImage, postProjectsList } from "../utils/api";
import ImageUploading from "react-images-uploading";
import Photo from "./Photo.jsx";

export default function Details (props) {

    const [updated, setUpdated] = useState(true);
    const [newMaterial, setNewMaterial] = useState('');
    const [newService, setNewService] = useState('');
    const [locationCreate, setLocationCreate] = useState(false)
    const [newLocation, setNewLocation] = useState('');

    const [images, setImages] = useState([]);
    const maxNumber = 1;
    const [uploading, setUploading] = useState(false);

    const [locations, setLocations] = useState(props.locations);
    const [locationsNames, setLocationsNames] = useState(props.locationsNames);

    const onChange = (imageList, addUpdateIndex) => {
      // data for submit
      console.log(imageList, addUpdateIndex);
      setImages(imageList);
    };

    const addLocation = () => {
      const image_id = `${props.projectName}-${newLocation}`
     
      // upload photo
      
      postImage(image_id, images[0].data_url)
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
          "locations": arr1
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

    const delMaterial = (material) => {
        const arr = props.materials.filter( m => m !== material)
        props.setMaterials(arr);
    }

    const delService = (service) => {
        const arr = props.services.filter( s => s !== service )
        props.setServices(arr);
    }


    const updateDetails = () => {
      const body = {
            "materials": props.materials,
            "services": props.services,
            "locations": props.locationsNames
      }

      postProjectDetails(props.projectName, body);
      setUpdated(true);
      
    }

    const delProject = () => {
    let updatedList = [...props.availableContracts];
    updatedList.splice(props.availableContracts.indexOf(props.projectName), 1);
    props.setAvailableContracts(updatedList);
    postProjectsList(updatedList);
  };
    


    return (
        <div style={{backgroundColor: 'whitesmoke'}}>
        <h2>{props.projectName}</h2>
        <h3>Materials</h3>
        {props.materials.map((item) => {
            return (
                <div key={item}>
                    <>{item}<button onClick={() => {setUpdated(false)
                                                     delMaterial(item)}}>x</button></>
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
                    <p>{item}<button onClick={() => {setUpdated(false)
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


        <button disabled style={{color: 'red'}} onClick={() => delProject()}>Delete project</button>
        </div>
    )
}