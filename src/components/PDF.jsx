import { React, useEffect, useState } from "react";
import { Document, Page, Text, Image } from '@react-pdf/renderer';

export default function PDF(props) {
  console.log(props.details)

  return (
      <Document>
        <Page key={0}>
          <Text>This is some text</Text>
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