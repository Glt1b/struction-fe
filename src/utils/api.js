import axios from "axios";

const beStructionApi = axios.create({
  baseURL: "https://struction-backend.cyclic.app/api"
});

// setup projects

export const setupMarkers = (project_name) => {
  return beStructionApi.post(`/markersSetup/${project_name}`)
  .then((result) => {
    console.log(result)
  })
}

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
  });
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

export const postImage = async (image_id, image) => {

  const axiosConfig = {
    headers: {
      'content-type': 'application/x-www-form-urlencoded'
    },
    responseType: 'arraybuffer'
  }


  // Create a new Image object
  const img = new Image();

  // Set the source of the Image object to the base64 string
  img.src = image;

  // Wait for the image to load
  img.onload = () => {
  // Create a new HTML5 Canvas object
  const canvas = document.createElement('canvas');

  // Calculate the new dimensions of the image
  let newWidth = img.width;
  let newHeight = img.height;
  const maxFileSize = 1 * 1024 * 1024; // 1mb in bytes
  const scaleFactor = Math.min(1, Math.sqrt(maxFileSize / (img.width * img.height * 4)));
  newWidth = Math.floor(scaleFactor * img.width);
  newHeight = Math.floor(scaleFactor * img.height);

  // Set the dimensions of the canvas
  canvas.width = newWidth;
  canvas.height = newHeight;

  // Draw the image onto the canvas at the new dimensions
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, newWidth, newHeight);

  // Convert the canvas to a new base64 string
  const resizedBase64 = canvas.toDataURL("image/jpg");
  
  // Use the resized base64 string as needed
  console.log(image)
  console.log(resizedBase64);

  return beStructionApi.post(`/image/${image_id}`, { data: resizedBase64 }, axiosConfig).then((result) => {
    console.log(result)
    return result 
  })
};
}

export const delImageS3 = (image_id) => {
  return beStructionApi.delete(`/image/${image_id}`).then((result) => {
    console.log(result)
    return result
  })
}

