import axios from "axios";

const beStructionApi = axios.create({
  baseURL: "https://struction-backend.cyclic.app/api"
});

export const getUser = (user) => {
  return beStructionApi.get("/users/" + user).then((res) => {
    return res.data.user;
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

      let TYPED_ARRAY = new Uint8Array(data); //

      const STRING_CHAR = TYPED_ARRAY.reduce((data, byte)=> {
        return data + String.fromCharCode(byte);
        }, '');

      let base64String = window.btoa(STRING_CHAR); //

      return(base64String)
    })
    
}

export const postImage = (image_id, image) => {

  const axiosConfig = {
    responseType: "arraybuffer",
    headers: {'Content-Type': 'application/json'}
}
  console.log(image)
  
  // const binary_string = window.atob(image);
  //const len = image.length;
  //const bytes = new Uint8Array(len);
  //for (let i = 0; i < len; i++) {
  //    bytes[i] = image.charCodeAt(i);
  //}
  // const buffer = bytes.buffer;


  const body = {img: image}
  console.log('uploading...')

  return beStructionApi.post(`/image/${image_id}`, body, axiosConfig).then((result) => {
    console.log('uploaded')
    return result
  })
}

export const delImageS3 = (image_id) => {
  return beStructionApi.delete(`/image/${image_id}`).then((result) => {
    console.log(result)
  })
}