import React from "react";
import ampaLogo from '../images/ampa.png';
import { Document, Page, Text, Image, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  container: {
    margin: 20,
    padding: 10,
    //fontFamily: 'Helvetica',
  },
  heading: {
    fontSize: 12,
    marginBottom: 5,
    fontWeight: 'bold',
  },
  content: {
    fontSize: 10,
    marginBottom: 5,
  },
  image: {
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
});

export default function PDF(props) {
  const photos = props.photos.filter(item => item !== 'error');
  let materialsStrings = '';

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
  } 

  return (
    <Document>
      <Page size="A4">
        <View style={styles.container}>
          <Image src={ampaLogo} style={styles.logo} />
          <Text style={styles.heading}>ID: {props.details.id}</Text>
          <Text style={styles.heading}>Number: {props.details.number}</Text>
          <Text style={styles.heading}>Status: {props.details.status}</Text>
          <Text style={styles.heading}>Type: {props.details.type}</Text>
          <Text style={styles.heading}>Fire rating: {props.details.fR}</Text>
          <Text style={styles.heading}>Location: {props.details.location}</Text>

          {props.details.type === 'seal' && (
            <View>
              <Text style={styles.heading}>Materials:</Text>
              <Text style={styles.content}>{materialsStrings}</Text>
              <Text style={styles.heading}>Services: {props.details.service.join(', ')}</Text>
            </View>
          )}

          {props.details.type === 'door' && (
            <View>
              <Text style={styles.heading}>Door configuration: {props.details.doorConfiguration}</Text>
              <Text style={styles.heading}>Door condition: {props.details.doorCondition}</Text>
              <Text style={styles.heading}>Frame condition: {props.details.frameCondition}</Text>
              <Text style={styles.heading}>Vision panel: {props.details.visionPanel}</Text>
              <Text style={styles.heading}>Handle: {props.details.handle}</Text>
              <Text style={styles.heading}>Lock: {props.details.lock}</Text>
              <Text style={styles.heading}>Door gap hinge: {props.details.doorGapHinge}</Text>
              <Text style={styles.heading}>Door gap lock side: {props.details.doorGapLockSide}</Text>
              <Text style={styles.heading}>Door gap head: {props.details.doorGapHead}</Text>
              <Text style={styles.heading}>Door gap bottom: {props.details.doorGapBottom}</Text>
              <Text style={styles.heading}>Opening height: {props.details.openingHeight}</Text>
              <Text style={styles.heading}>Ironmongery: {props.details.ironmongery}</Text>
              <Text style={styles.heading}>Finish: {props.details.doorFinish}</Text>
            </View>
          )}

          <Text style={styles.heading}>Comment: {props.details.comment}</Text>
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
