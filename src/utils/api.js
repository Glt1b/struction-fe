import axios from "axios";
import { readFromIndexedDB } from "./indexedDB";

// setup Node mailer

const beStructionApi = axios.create({
  baseURL: "https://struction-backend.cyclic.app/api"
});

// setup projects


export const getProjectsList = () => {
  return beStructionApi.get("/projects")
  .then((result) => {
    return result.data.list.props.list;
  })
}

export const postProjectsList = (body) => {
  return beStructionApi.post("/projects", body)
  .then((result) => {
    console.log('updating list result' + result)
  })
}

export const postProjectDetails = (name, body) => {
  return beStructionApi.post(`/projects/${name}`, body)
  .then((result) => {
    console.log(result)
  })
}

// users

export const generateCode = (user) => {
  return beStructionApi.get("/code/" + user)
  .then((res) => {
    return res.data.code;
  })
}

export const updateUserDetails = (user, body) => {
  return beStructionApi.post("/users/" + user, body)
  .then((res) => {
    console.log('new users' + res)
    return res;
  })
}

export const getUsersList = () => {
  return beStructionApi.get("/users")
  .then((res) => {
    console.log(res.data.list.props.users)
    return (res.data.list.props.users)
  })
}

export const postUsersList = (obj) => {
  const list = {
    "users": obj
}
  return beStructionApi.post("/users", list)
  .then((res) => {
    console.log("list:" + res)
  })
}

export const deleteUser = (username) => {
  return beStructionApi.delete(`/users/${username}`)
  .then((res) => {
    console.log(res)
  })
}

export const getUser = (user) => {
  console.log('getting'+ user)
  return beStructionApi.get("/users/" + user)
  .then((res) => {
    console.log(res)
    return res.data.users;
  });
};
export const getProjectDetails = (projectName) => {
  return beStructionApi.get("/projects/" + projectName).then((res) => {
    return res.data.result;
  });
};

export const postMarker = (projectName, markerBody) => {
  ///api/markers/:project_name'
  
  return beStructionApi.post("/markers/" + projectName, markerBody).then((response) => {
    return response
  });
};

export const deleteMarker = (projectName, markerId) => {
  //: '/api/:project_name/:marker_id'
  return beStructionApi.delete(`/markers/${projectName}/${markerId}`).then((result) => {
    return result
  })
};

export const patchMarker = (projectName, markerId, obj) => {
  const patchBody = obj;
  return beStructionApi.patch(`/markers/${projectName}/${markerId}`, patchBody).then((result) => {
    return result
  })
  .catch((err) => {
    alert('error uploading pins')
  })
};

// images

export const getImage = (image_id) => {
  console.log(image_id, 'getting')
    return beStructionApi.get(`/image/${image_id}`).then((result) => {
      console.log(result.data.image.data)
      const data = result.data.image.data;

      // let TYPED_ARRAY = new Uint8Array(data); //

      const STRING_CHAR = data.reduce((data, byte)=> {
        return data + String.fromCharCode(byte);
        }, '');

      // let base64String = window.btoa(STRING_CHAR); //
      console.log(STRING_CHAR)
      return(STRING_CHAR)
    })
}

export const postDrawing = async (image_id, image, type) => {
  const axiosConfig = {
    headers: {
      'content-type': 'application/x-www-form-urlencoded'
    },
    // responseType: 'arraybuffer'
  };

  // Create a new Image object
  const img = new Image();

  // Set the source of the Image object to the base64 string
  img.src = image;

  // Wait for the image to load
  img.onload = () => {
    // Calculate the original size of the image in bytes
    const originalSizeInBytes = Math.ceil(image.length);
     
    
    const targetFileSize = 1 * 1024 * 1024;
 

    // Calculate the quality factor for canvas.toDataURL()
    let quality = 1;
    if (originalSizeInBytes > targetFileSize) {
      quality = targetFileSize / originalSizeInBytes;
    }

    // Create a new HTML5 Canvas object
    const canvas = document.createElement('canvas');

    // Set the dimensions of the canvas to the original image dimensions
    canvas.width = img.width;
    canvas.height = img.height;

    // Draw the image onto the canvas
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    // Convert the canvas to a new base64 string with JPEG format and adjustable quality
    const resizedBase64 = canvas.toDataURL('image/jpeg', quality);

    // Use the resized base64 string as needed
    console.log(image);
    console.log(resizedBase64);

    // Send the resized image to the server using the Axios request
    console.log('sending image')
    console.log(image_id);
    return beStructionApi.post(`/image/${image_id}`, { data: resizedBase64 }, axiosConfig)
      .then((result) => {
        console.log(result.data);
        if(!result.data){
          alert('error occured uploading photo, reload app and check photos')
        }
        return result.data;
      })
    .catch((err) => {
      alert('error occured uploading photo, reload app and check photos')
    })  };
};



export const postImage = async (image_id, image, type) => {
  try {
    const targetFileSize = type === 'drawing' ? 1 * 1024 * 1024 : 0.15 * 1024 * 1024; // 1MB or 0.3MB in bytes

    // Calculate the original size of the image in bytes
    const originalSizeInBytes = Math.ceil(image.length);

    // Calculate the scaling factor for the image dimensions
    let scaleFactor = 1;
    if (!type && originalSizeInBytes > targetFileSize) {
      scaleFactor = Math.sqrt(targetFileSize / originalSizeInBytes);
    }

    // Create a new Image object
    const img = new Image();

    // Convert the base64 string to an image source
    img.src = image;

    // Wait for the image to load
    await new Promise(resolve => {
      img.onload = resolve;
    });

    let newWidth, newHeight;

    if (!type) {
      // Calculate the new dimensions
      newWidth = Math.floor(img.width * scaleFactor);
      newHeight = Math.floor(img.height * scaleFactor);
    } else if (type === 'drawing') {
      newWidth = img.width;
      newHeight = img.height;
    }

    // Create a new HTML5 Canvas object
    const canvas = document.createElement('canvas');
    canvas.width = newWidth;
    canvas.height = newHeight;

    // Draw the image onto the canvas with the new dimensions
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, newWidth, newHeight);

    // Convert the canvas to a new base64 string with JPEG format and adjustable quality
    const resizedBase64 = canvas.toDataURL('image/jpeg');

    // Send the resized image to the server using the Axios request
    const response = await beStructionApi.post(`/image/${image_id}`, { data: resizedBase64 }, {
      headers: {
        'content-type': 'application/x-www-form-urlencoded'
      }
    });

    console.log(response.data);

    if (!response.data) {
      alert('An error occurred while uploading the photo. Please reload the app and check your photos.');
    }
    console.log(response.data)
    return response.data;
  } catch (error) {
    console.error(error);
    alert('An error occurred while uploading the photo. Please reload the app and check your photos.');
  }
};



export const delImageS3 = (image_id) => {
  return beStructionApi.delete(`/image/${image_id}`).then((result) => {
    console.log(result)
    return result
  })
}

const postMultimarkers = (projectName, markers, count) => {
  
  if(count > 0){
    patchMarker(projectName, Object.keys(markers)[count - 1][0], markers[count-1])
    .then((result) => {
      postMultimarkers(projectName, markers, count - 1)
    })
    .catch((err) => {

    })
  } else {
    return 
  }
}


export const synchDB = async (projectName) => {
  const struction = await JSON.parse(localStorage.getItem('Struction'));
  const photosList = struction.photosToUpload;
  const markersToUpload = struction.arrToUpload;

  console.log(photosList)

  // post multiple markers
  postMultimarkers(projectName, markersToUpload, markersToUpload.length);
  
  // post photos
  let count = photosList.length
  for (let photo of photosList){
    readFromIndexedDB('Struction', projectName, photo, function(value) {
      if (value) {
        postImage(photo, value.data_url).then((result) => {
          console.log('result uploading photo' + result);
          // count if 'uploaded'
          if(result){
            count = count - 1;
            if(count === 0){
              return true
            }
          } else {
            return false;
          }
        })
      } else {
        return false;
      }
    });
  }
  // return 'xxx'
}