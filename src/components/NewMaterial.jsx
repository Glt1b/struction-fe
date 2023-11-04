import { React, useEffect, useState } from "react";



export default function NewMaterial (props) {

    const [create, setCreate] = useState(false);

    const [material, setMaterial] = useState(false);
    const [width, setWidth] = useState('');
    const [height, setHeigth] = useState('');
    const [diameter, setDiameter] = useState('');
    const [quantity, setQuantity] = useState('1');


    const submit = () => {

        if(!material){
            alert('You need to choose a material before submit.')
        } else if(quantity === ''){
            alert('You need to fill quantity before submit')
        } else if(diameter === '' && (height === '' || width === '')){
            alert('Fill dimensions before submit.')
        } else {
          const obj = {
              [material]: [
                  width, height, diameter, quantity
              ]
          };

          const arr = [...props.materialsUsed];
          arr.push(obj);
          props.setMaterialsUsed(arr);

          setCreate(false);
          setDiameter('');
          setHeigth('');
          setWidth('');
          setQuantity('1');
          setMaterial(false);
          };
        }

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
                                type="number"
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
                                type="number"
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
                                type="number"
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
                                type="number"
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