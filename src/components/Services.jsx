import { React, useEffect, useState } from "react";

export default function Services (props) {

    const [services, setServices] = useState(props.serviceUsed);
    const [addMode, setAddMode] = useState(false);

    const [keys, setKeys] = useState([]);
    const [counter, setCounter] = useState({});

    useEffect(() => {
        console.log('counting')

        let tempCounter = {};

        services.forEach(ele => {
            if (tempCounter[ele]) {
                tempCounter[ele] += 1;
            } else {
                tempCounter[ele] = 1;
            }
        });

        const keys = Object.keys(tempCounter)
   
        setKeys(keys)
        setCounter(tempCounter);

    }, [services])

    const addService = (item) => {
        
        setServices([...services, item]); //??
        props.setServiceUsed([...services, item]);
        props.setUpdateNeeded(true);
    }

    const delService = (item) => {
        if(props.status !== 'completed'){
            const arr = services;
            const x = arr.splice(services.indexOf(item), 1);
           
            setServices([...arr]); // ??
            props.setServiceUsed([...arr]);
            props.setUpdateNeeded(true);
        }
        
    }

    return (
    <div className="title" id="title-checkbox">
        <b>Services</b>
        { addMode && props.status !== 'completed' ? (<div>
            {props.servicesAvailable.map((item, index) => (
                <button key={index}
                        style={{margin:'2px'}}
                        onClick={() => addService(item)}>{item}</button>
            ))}
        </div>) : null }

        { addMode ? (<button
                        style={{color: 'red'}}
                        onClick={() => setAddMode(false)}>Dismiss</button>) : ( props.status !== 'completed' ? 
                        (<button onClick={() => setAddMode(true)}>Add Services</button>) : null)}

          <br />
          <hr />
          <br />
        
        <div className="list-container" id="services-container">
            {keys.map((item, index) => (
                <button key={index}
                        
                        onClick={() => delService(item)}>{`${item}: ${counter[item]}`}</button>
            ))}
        </div>
    </div>
    )
};