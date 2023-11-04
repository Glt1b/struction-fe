import { React } from "react";

export default function MaterialTile (props) {

    const m = props.material;
    
    const material = Object.keys(props.material)[0];
    const width = m[material][0];
    const height = m[material][1];
    const diameter = m[material][2];
    const quantity = m[material][3];

    let str = `${material}: `;

    if(width !== ""){
        str = str + `width: ${width}, `
    };
    if(height !== ""){
        str = str + `height: ${height}, `
    };
    if(diameter !== ""){
        str = str + `diameter: ${diameter}, `
    };
    if(quantity !== "0"){
        str = str + `quantity: ${quantity}, `
    };
    if( width !== "" && height !== "" && quantity !== ""){
        str = str + `(${height*width*quantity/1000000} m2)`
    } 

    return (
        <div className="title" id="title-checkbox">
            <p>{str}</p>
        </div>
    )
}