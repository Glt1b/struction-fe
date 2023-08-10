import { React, useEffect, useState } from "react";
import { Document, Page, Text, Image } from '@react-pdf/renderer';

export default function PDF(props) {
  console.log(props.details.materialsUsed)

  const photos = props.photos.filter(item => item !== 'error');

  // handling multimaterials
  let materials = [];
  let materialsStrings = '';

  if(props.details.type === 'seal'){
    const arr = [];
    for( let o of props.details.materialsUsed){
      const key = Object.keys(o)[0];
      const width = o[key][0];
      const height = o[key][1];
      const diameter = o[key][2];
      const quantity = o[key][3];

      const obj = {
        key: key,
        width: width,
        height: height,
        diameter: diameter,
        quantity: quantity
      }

      arr.push(obj);
      if(arr.length === props.details.materialsUsed.length){
        materials = arr
      }
    }

    for (let obj of materials){

      let str = `${obj.key}: `;

      if(obj.width !== "0"){
        str = str + `width: ${obj.width}, `
      };
      if(obj.height !== "0"){
        str = str + `height: ${obj.height}, `
      };
      if(obj.diameter !== "0"){
        str = str + `diameter: ${obj.diameter}, `
      };
      if(obj.quantity !== "0"){
        str = str + `quantity: ${obj.quantity}, `
      };
      if(obj.width !== "0" && obj.height !== "0" && obj.quantity !== "0"){
        str = str + `(${obj.height*obj.width*obj.quantity/1000000} m2)`
      }
      
      materialsStrings = materialsStrings + str + '\n'
  };
};
  // handling services

  let servicesStr = '';

  for (let s of props.details.service){
    servicesStr = servicesStr + `${s}, `
  }

  console.log(materialsStrings)

  return (
      <Document>
        <Page key={0}>

          <Text>ID: {props.details.id}</Text>
          <Text>Number: {props.details.number}</Text>
          <Text>Status: {props.details.status}</Text>
          <Text>Type: {props.details.type}</Text>
          <Text>Fire rating: {props.details.fR}</Text>
          <Text>Location: {props.details.location}</Text>
          

          { props.details.type === 'seal' ? (
            <div>
            <Text>Materials:</Text>
            <Text>{materialsStrings}</Text>
             
            <Text>Services: {servicesStr}</Text>
            </div>
          ) : null}

          { props.details.type === 'door' ? (
            <div>
            <Text>Door condition: {props.details.doorCondition}</Text>
            <Text>Frame condition: {props.details.frameCondition}</Text>
            </div>
          ) : null}

          <Text>Comment: {props.details.comment}</Text>
        </Page>
        {photos.map((photo, index) => (
          <Page key={index+1}>
            <Image src={photo} />
          </Page>
          
        ))}
       <Page>
             <Image src={props.map} />
        </Page>
      </Document>
  );
}