import { React, useEffect, useState } from "react";
import { Document, Page, Text, Image } from '@react-pdf/renderer';

export default function PDF(props) {
  console.log(props.details)
  

  return (
      <Document>
        <Page key={0}>

          <Text>ID: {props.details.id}</Text>
          <Text>Number: {props.details.number}</Text>
          <Text>Status: {props.details.status}</Text>
          <Text>Type: {props.details.type}</Text>
          <Text>Fire rating: {props.details.fR}</Text>
          <Text>Status: {props.details.status}</Text>
          <Text>Location: {props.details.location}</Text>
          <Text>Width: {props.details.measurements[1]}</Text>
          <Text>Heigth: {props.details.measurements[0]}</Text>
          

          { props.details.type === 'seal' ? (
            <div>
            <Text>Materials used: {props.details.materialsUsed}</Text>
            <Text>Services: {props.details.service}</Text>
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
        {props.photos.map((photo, index) => (
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