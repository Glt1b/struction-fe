import { React, useState, useEffect } from "react";
import { getValuesInArray } from "../utils/indexedDB";
import { patchMarker } from "../utils/api";

export default function Synch() {

    const [markerCounter, setMarkerCounter] = useState();

    const struction = JSON.parse(localStorage.getItem('Struction'));
    const storage = JSON.parse(localStorage.getItem(`${struction.projectName}-markers`));
    const markersToUpload = storage.markersToUpload;
    
    // upload markers

    for ( let i = 0; i < markersToUpload.length; i++){
        const id = markersToUpload[i].id
        const obj = {[id]: markersToUpload[i]};
        console.log(obj)
        patchMarker(struction.projectName, id, obj)
          .then((result) => {
            console.log(result)
          })
          .catch((err) => {
            console.log(err)
            alert(`marker number: ${markersToUpload[i].number} has not been uploaded`)
          })

    }
  
    // get photos to upload


            getValuesInArray(`${struction.projectName}`, 'photos', function(values){
                console.log(values);
            });
 

    // clear databases



return (
    <div>
        <h2>Uploading to database...</h2>


    </div>
)
};