import { React, useState, useEffect } from "react";
import { getKeyValuePairsInArray, deleteIndexedDB } from "../utils/indexedDB";
import { patchMarker, postImage } from "../utils/api";

export default function Synch(props) {
  
  const struction = JSON.parse(localStorage.getItem('Struction'));
  const storage = JSON.parse(localStorage.getItem(`${struction.projectName}-markers`));
  const markersToUpload = storage.markersToUpload;
  const [markerCounter, setMarkerCounter] = useState(markersToUpload.length);

  useEffect(() => {
    console.log('Uploading markers...')

    // Upload markers
    if(markersToUpload.length > 0){
      for (let i = 0; i < markersToUpload.length; i++) {
      const id = markersToUpload[i].id;
      const obj = markersToUpload[i];

      patchMarker(struction.projectName, id, obj)
        .then((result) => {
          console.log(result);
          setMarkerCounter(markerCounter-1);

          // If all markers are uploaded, proceed to upload photos
          setTimeout(() => {
            if (markerCounter === 0) {
              uploadPhotos();
          }
          }, 500)

        })
        .catch((err) => {
          console.log(err);
          alert('Error uploading markers. Please check your internet connection.');
          props.setPage('map');
          // Stop further processing
          return;
        });
    }
    } else {
      uploadPhotos();
    }
 
  }, [markersToUpload, struction.projectName]);

  const uploadPhotos = () => {
    console.log('Uploading photos...')
    // Get photos to upload
    getKeyValuePairsInArray(struction.projectName, 'photos', function (values) {
      console.log(values);

      // Counter to keep track of successful photo uploads
      let successfulPhotoUploads = 0;

      // Upload photos
      if(values.length > 0){
        values.forEach((photo) => {
        postImage(photo.key, photo.value.data_url)
          .then((result) => {
            if(result){
              successfulPhotoUploads++;
            }

            // If all photos are uploaded, clear databases
            if (successfulPhotoUploads === values.length) {
              clearDatabases();
            }
          })
          .catch((err) => {
            console.log(err);
            alert('Error uploading photos. Please try again.');
            props.setPage('map');
            // Stop further processing
            return;
          });
      });
      } else {
        clearDatabases();
      }

    });
  };

  const delOfflineDB = () => {
    deleteIndexedDB(props.projectName, function(success) {
      if (success) {
        console.log('Database deleted successfully.');
      } else {
        console.log('Failed to delete the database.');
      }
    });
    localStorage.removeItem('Struction');
    localStorage.setItem('Struction', JSON.stringify({ mode: 'online'}));
}


  const clearDatabases = () => {
    // Your logic for clearing databases goes here
    console.log('Clearing databases...');
    // Call the clear function or perform necessary actions
    delOfflineDB();
    props.setMode('online');
    props.setProjectName(false);
    props.setPage('map');
  };

  return (
    <div>
      <h2>Uploading to database...</h2>
      {markerCounter > 0 ? (<p>Markers left: {markerCounter}</p>) : (
        <p>Uploading photos...</p>
      )}
    </div>
  );
}
