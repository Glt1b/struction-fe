import { React, useEffect, useState } from "react";
import { postProjectDetails, postProjectsList, getProjectsList} from "../utils/api";


export default function NewContract(props){

    const [active, setActive] = useState(false);
    const [newContract, setNewContract] = useState('');
    const availableContracts = props.availableContracts;

    const createContract = () => {

        if(!props.availableContracts.includes(newContract) && newContract !== ''){
        // create details
        const data = {
            "materials": [],
            "services": [],
            "locations": []
        }
        postProjectDetails(newContract, data);

        // create markers

        //setupMarkers(newContract);

        // update contracts list

        const newList = availableContracts;
        newList.push(newContract.trim());
        postProjectsList(newList);
        props.setAvailableContracts([...newList]);
        setNewContract('')
        } else {
            setNewContract('');
            alert('contract name alrady exists or you forgot to name new contract!')
        }
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
                  placeholder="contract name"
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