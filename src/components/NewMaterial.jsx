import { React, useEffect, useState } from "react";



export default function NewMaterial (props) {

    const [create, setCreate] = useState(false);

    const [material, setMaterial] = useState(false);
    const [width, setWidth] = useState('0');
    const [height, setHeigth] = useState('0');
    const [diameter, setDiameter] = useState('0');
    const [quantity, setQuantity] = useState('0');

    console.log('Materialy do wyboru:' + props.materials)

    const submit = () => {
        const obj = {
            [material]: [
                width, height, diameter, quantity
            ]
        };

        const arr = [...props.materialsUsed];
        arr.push(obj);
        props.setMaterialsUsed(arr);

        setCreate(false);
    };

    return (
        <div className="list-container" id="services-container">
            {!create ? (
                <button onClick={() => {setCreate(true)}}>Add new material</button>
            ) : null}
            
            { create ? (

            <><div>
            <div className="checkList">
            <div className="title" id="fr">
            </div>
            <div className="list-container" id="status-container">
              {props.materials.map((item, index) => (
                <div className="checkbox" key={index}>
                  <input
                    id={item}
                    value={item}
                    type="checkbox"
                    checked={material === item ? true : false}
                    onChange={() => setMaterial(item)}
                  />

                  <label htmlFor={item}>{item}</label>
                </div>
              ))}
            </div>
          </div>
                </div><>
                        <div className="text-input">
                            <div className="title">
                                <b>Height</b>
                            </div>
                            <input
                                className="input"
                                value={height}
                                type="text"
                                onChange={(e) => {
                                    setHeigth(e.target.value);
                                } }
                            ></input>
                        </div>

                        <div className="text-input">
                            <div className="title">
                                <b>Width</b>
                            </div>
                            <input
                                className="input"
                                value={width}
                                type="text"
                                onChange={(e) => {
                                    setWidth(e.target.value);
                                } }
                            ></input>
                        </div>

                        <div className="text-input">
                            <div className="title">
                                <b>Diameter</b>
                            </div>
                            <input
                                className="input"
                                value={diameter}
                                type="text"
                                onChange={(e) => {
                                    setDiameter(e.target.value);
                                } }
                            ></input>
                        </div>

                        <div className="text-input">
                            <div className="title">
                                <b>Quantity</b>
                            </div>
                            <input
                                className="input"
                                value={quantity}
                                type="text"
                                onChange={(e) => {
                                    setQuantity(e.target.value);
                                } }
                            ></input>
                        </div>

                        <button onClick={() => { submit(); } }>Submit</button>

                    </></>
            ) : null}
        </div>
    )
}