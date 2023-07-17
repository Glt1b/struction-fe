import { React, useEffect, useState } from "react";
import { postProjectDetails, postImage, delImageS3, postProjectsList } from "../utils/api";
import ImageUploading from "react-images-uploading";
import Photo from "./Photo.jsx";

export default function Details (props) {

    const [updated, setUpdated] = useState(true);
    const [newMaterial, setNewMaterial] = useState('');
    const [newService, setNewService] = useState('');
    const [newLocation, setNewLocation] = useState('');

    const [images, setImages] = useState([]);

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
        <div>
        <h2>{props.projectName}</h2>
        <h3>Materials</h3>
        {props.materials.map((item) => {
            return (
                <div key={item}>
                    <p>{item}<button onClick={() => {setUpdated(false)
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


        <button style={{color: 'red'}} onClick={() => delProject()}>Delete project</button>
        </div>
    )
}