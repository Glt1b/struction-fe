import React from "react";
import ampaLogo from '../images/ampa.png';
import { Document, Page, Text, Image, View, StyleSheet } from '@react-pdf/renderer';
import { Font } from '@react-pdf/renderer';

Font.register({
  family: 'Roboto',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/roboto/v20/KFOmCnqEu92Fr1Mu4mxP.ttf' }, // Normal font
    { src: 'https://fonts.gstatic.com/s/roboto/v20/KFOlCnqEu92Fr1MmWUlfBBc9.ttf', fontWeight: 'bold' } // Bold font
  ]
})

const styles = StyleSheet.create({
  container: {
    margin: 20,
    padding: 10,
    //fontFamily: 'Helvetica',
  },
  heading: {
    fontSize: 12,
    marginBottom: 5,
    fontFamily: 'Roboto',
    fontWeight: 'bold',
  },
  content: {
    fontSize: 10,
    marginBottom: 5,
    fontFamily: 'Roboto',
  },
  drawing: {
    width: '100%',
    height: 'auto',
    marginBottom: 10,
  },
  logo: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 150, // Adjust the width as needed
    height: 100, // Adjust the height as needed
  },
  imageGallery: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    margin: 5,
  },
  image: {
    width: '35%', // Adjust as needed
    height: 'auto',
    marginBottom: 10,
  },
});

export default function PDF(props) {
  const photos = props.photos.filter(item => item !== 'error');


  let materialsStrings = '';
  let servicesString = '';

  if (props.details.type === 'seal') {

    props.details.materialsUsed.forEach(o => {
      const key = Object.keys(o)[0];
      const [width, height, diameter, quantity] = o[key];
      const str = `${key}: ` +
        (width !== "" ? `width: ${width}, ` : '') +
        (height !== "" ? `height: ${height}, ` : '') +
        (diameter !== "" ? `diameter: ${diameter}, ` : '') +
        (quantity !== "" ? `quantity: ${quantity}, ` : '') +
        ((width !== "" && height !== "" && quantity !== "0") ? `(${height * width * quantity / 1000000} m2)` : '');

      materialsStrings += str + '\n';
    });

    let tempCounter = {};

    props.details.service.forEach(ele => {
          if (tempCounter[ele]) {
              tempCounter[ele] += 1;
          } else {
              tempCounter[ele] = 1;
          }
      });

    const keys = Object.keys(tempCounter);
    console.log(keys)

    keys.forEach(ele => {
      servicesString += ele + ': ' + tempCounter[ele].toString() + ', ';
    })
  }

  return (
    <Document>
      <Page size="A4">
        <View style={styles.container}>
          <Image src={ampaLogo} style={styles.logo} />
          <Text style={styles.heading}>Number: </Text>
          <Text style={styles.content}>{props.details.number}</Text>  
          <Text style={styles.heading}>---------------</Text>
          <Text style={styles.heading}>ID:</Text>
          <Text style={styles.content}>{props.details.doorCondition}</Text>
          <Text style={styles.heading}>---------------</Text>
          <Text style={styles.heading}>Location: </Text>
          <Text style={styles.content}>{props.details.location}</Text>
          <Text style={styles.heading}>---------------</Text>
          <Text style={styles.heading}>Status: </Text>
          <Text style={styles.content}>{props.details.status}</Text>
          <Text style={styles.heading}>----------------</Text>
          <Text style={styles.heading}>Fire rating: </Text>
          <Text style={styles.content}>{props.details.fR}</Text>
          <Text style={styles.heading}>----------------</Text>
          <Text style={styles.heading}>Scope of Work: </Text>
          <Text style={styles.content}>{props.details.frameCondition}</Text>
          <Text style={styles.heading}>----------------</Text>
          <Text style={styles.heading}>Risk Category: </Text>
          <Text style={styles.content}>{props.details.visionPanel} </Text>
          <Text style={styles.heading}>---------------</Text>
          <Text style={styles.heading}>Materials:</Text>
          <Text style={styles.content}>{materialsStrings}</Text>
          <Text style={styles.heading}>---------------</Text>
          <Text style={styles.heading}>Services: </Text>
          <Text style={styles.content}>{servicesString}</Text>
          <Text style={styles.heading}>---------------</Text>
     
          <Text style={styles.heading}>Comment: </Text>
          <Text style={styles.content}>{props.details.comment}</Text>
          

        </View>
      </Page>

      
        <Page size="A4">
          <View style={styles.imageGallery}>
            {photos.map((photo, index) => (
              <Image key={index} src={photo} style={styles.image} />
            ))}
          </View>
        </Page>
 
      
      <Page size="A4">
        <Image src={props.map} style={styles.drawing} />
      </Page>
    </Document>
  );
}