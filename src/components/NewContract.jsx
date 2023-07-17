import { React, useEffect, useState } from "react";
import { postProjectDetails, setupMarkers, postProjectsList, getProjectsList} from "../utils/api";


export default function NewContract(props){

    const [active, setActive] = useState(false);
    const [newContract, setNewContract] = useState('Contract name');

    const createContract = () => {
        // create details
        const data = {
            "materials": [],
            "services": [],
            "locations": []
        }
        postProjectDetails(newContract, data);

        // create markers

        setupMarkers(newContract);

        // update contracts list

        const newList = props.availableContracts;
        newList.push(newContract);
        postProjectsList(newList);
        props.setAvailableContracts(newList)

    }

    return(
        <div>
            {!active ? (
                <button onClick={() => setActive(true)}>+</button>
            ) : (
                <div className="text-input">
                <div className="title">
                </div>
                <input
                  id="height"
                  className="input"
                  value={newContract}
                  type="text"
                  onChange={(e) => {
                    setNewContract(e.target.value);
                  }}
                ></input>
                <p>
                <button onClick={() => {setActive(false)
                                        createContract()}}>Submit</button>
                </p>                  
            </div>
            )}

        </div>
    )
}