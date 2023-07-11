import { React, useEffect, useState } from "react";
import { getUsersList, postUsersList, getUser, updateUserDetails } from "../utils/api";


export default function Details (props) {

    const [updated, setUpdated] = useState(true);
    const [newMaterial, setNewMaterial] = useState('');
    const [newService, setNewService] = useState('');

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


    return (
        <div>
        <h1>{props.projectName}</h1>
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

        { !updated ? (<button>Update</button>) : null}

        </div>
    )
}