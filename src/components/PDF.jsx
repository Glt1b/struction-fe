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
    fontSize: 7,
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
  image1: {
    position: 'absolute',
    left: 0,
    width: 200,
    height: 'auto',
  },
  image2: {
    position: 'absolute',
    width: 200,
    height: 'auto',
  },
  bold: {
    fontWeight: 'bold',
    fontSize: 10,
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
        <View style={styles.column}>
          <Text style={styles.bold}>ID: {props.details.status === 'inProgress' ? (<Image src={priority} style={styles.priority} />) : null}</Text>
          <Text style={styles.heading}>{props.details.id}</Text>
          <Text style={styles.bold}>Location: </Text>
          <Text style={styles.heading}>{props.details.location}</Text>
          <Text style={styles.bold}>Number: </Text>
          <Text style={styles.heading}>{props.details.number}</Text>
          <Text style={styles.bold}>Status: </Text>
          <Text style={styles.heading}>{props.details.status}</Text>
          <Text style={styles.bold}>Type: </Text>
          <Text style={styles.heading}>{props.details.type}</Text>
          <Text style={styles.bold}>Fire rating: </Text>
          <Text style={styles.heading}>{props.details.fR}</Text>
          <Text style={styles.bold}>Risk Category: </Text>
          <Text style={styles.heading}>{props.details.visionPanel} </Text>
          <Text style={styles.bold}>Materials:</Text>
          <Text style={styles.heading}>{materialsStrings}</Text>
          <Text style={styles.bold}>Services: </Text>
          <Text style={styles.heading}>{servicesString}</Text>
        </View>
        
        <View style={styles.column}>
          <Text style={styles.bold}>Comment: </Text>
          <Text style={styles.heading}>{props.details.comment}</Text>
        </View>

        <View style={styles.container}>
            <Image src={photos[0]} style={styles.image1} />
            { photos.length > 1 ? (<Image src={photos[1]} style={styles.image2} />) : null}
            
            
        </View>
      </Page>

    </Document>
  );
}
