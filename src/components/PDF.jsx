import React from "react";
import priority from '../images/priority.png';
import { Document, Page, Text, Image, View, StyleSheet } from '@react-pdf/renderer';



const styles = StyleSheet.create({
  container: {
    margin: 20,
    padding: 10,
  },
  column: {
    width: '48%', // Adjust the width of each column
  },
  heading: {
    fontSize: 10,
    marginLeft: 20,
    marginBottom: 7,
    fontWeight: 'bold', // Make all headings bold
  },
  content: {
    fontSize: 5,
    marginBottom: 2,
  },
  image: {
    width: '25%',
    height: 'auto',
    marginBottom: 3,
  },
  logo: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 250,
    height: 375,
  },
  priority: {
    width: 20,
    height: 20,
  },
  image: {
    width: '100%',
    height: 'auto',
    marginBottom: 10,
  },
  image2: {
    position: 'absolute',
    left: 0,
    width: 600,
    height: 'auto',
  },
  image3: {
    position: 'absolute',
    right: 0,
    width: 600,
    height: 'auto',
  },
  bold: {
    fontWeight: 'bold',
    marginLeft: 20,
    fontSize: 14,
    marginBottom: 7
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
        <View>
          <Text style={styles.heading}>ID: {props.details.status === 'inProgress' ? (<Image src={priority} style={styles.priority} />) : null}</Text>
          <Text style={styles.bold}>{props.details.doorCondition}</Text>
          <Text style={styles.heading}>---------------</Text>
          <Text style={styles.heading}>Number: </Text>
          <Text style={styles.bold}>{props.details.number}</Text>
          <Text style={styles.heading}>---------------</Text>
          <Text style={styles.heading}>Location: </Text>
          <Text style={styles.bold}>{props.details.location}</Text>
          <Text style={styles.heading}>---------------</Text>
          <Text style={styles.heading}>Status: </Text>
          <Text style={styles.bold}>{props.details.status}</Text>
          <Text style={styles.heading}>---------------</Text>
          <Text style={styles.heading}>Type: </Text>
          <Text style={styles.bold}>{props.details.type}</Text>
          <Text style={styles.heading}>----------------</Text>
          <Text style={styles.heading}>Fire rating: </Text>
          <Text style={styles.bold}>{props.details.fR}</Text>
          <Text style={styles.heading}>----------------</Text>
          <Text style={styles.heading}>Risk Category: </Text>
          <Text style={styles.bold}>{props.details.visionPanel} </Text>
          <Text style={styles.heading}>---------------</Text>
          <Text style={styles.heading}>Materials:</Text>
          <Text style={styles.bold}>{materialsStrings}</Text>
          <Text style={styles.heading}>---------------</Text>
          <Text style={styles.heading}>Services: </Text>
          <Text style={styles.bold}>{servicesString}</Text>
          <Text style={styles.heading}>---------------</Text>
     
          <Text style={styles.heading}>Comment: </Text>
          <Text style={styles.bold}>{props.details.comment}</Text>

        </View>
        </Page>

      
        {photos.map((photo, index) => (
        <Page size="A4" key={index + 1}>
          <Image src={photo} style={styles.image} />
        </Page>
      ))}
      
      <Page size="A4">
        <Image src={props.map} style={styles.image} />
      </Page>
    </Document>
  );

}
