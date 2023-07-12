import { React, useEffect, useState } from "react";
import { postUsersList, updateUserDetails, deleteUser } from "../utils/api";

export default function UsersForm(props) {

    const mailID = props.email
    const [email, setEmail] = useState(props.email);
    const [name, setName] = useState(props.name);
    const [role, setRole] = useState(props.role);
    const [projects, setProjects] = useState(props.projects);

    const [edit, setEdit] = useState(false);

    const availableRoles = ['Manager', 'Supervisor', 'Operative', 'Visitor'];
  

    const users = props.users;
    const setUsers = props.setUsers;
    const list = props.list;
    const setList = props.setList;
    

    const updateUser = (mail, name, role, projects) => {
      console.log('starting update')
      console.log('list:' + list)

      let updatedList = [];
      
      for (let i = 0; i < list.length; i++){
          if(list[i] !== mailID){
              updatedList.push(list[i]);
          };}

      updatedList.push(mail);


      const update = {
          "name": name,
          "role": role,
          "projects": projects
      }
      //updatedUsers.push(update);

      //props.setUsers(updatedUsers);

      console.log(updatedList);

      updateUserDetails(mail, update).then((res) => {
          console.log(res)
      })

      postUsersList(updatedList)
      
      
  }

  const deleteUser = () => {
    const updatedList = list.filter((item) => {
      return item !== email
    })
    console.log("updated list" + updatedList)
    setList(updatedList);
    postUsersList(updatedList);

  }

  const handleProjects = (item) => {
    let updatedList = [...projects];
    if (!projects.includes(item)) {
      updatedList = [...projects, item];
    } else {
      updatedList.splice(projects.indexOf(item), 1);
    }
    setProjects(updatedList);
  };


    return(
        <div style={{background: 'white'}}>
        {!edit ? (
           <div style={{
            backgroundColor: 'white'
          }}>
           <p>Name: {name}</p>
           <p>e-mail: {email}</p>
           </div>) : (
             <div>

            <div>
                <div className="text-input" id="comment-container">
            <div className="title">
              <label htmlFor="comment">
                <b>Name</b>
              </label>
            </div>

            <input
              id="comment"
              className="input"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
              }}
            ></input>
            </div>
            </div>

            <div>
            <div className="text-input" id="comment-container">
            <div className="title">
            <label htmlFor="comment">
            <b>email</b>
            </label>
            </div>

            <input
            id="comment"
            className="input"
            value={email}
            onChange={(e) => {
            setEmail(e.target.value);
            }}
            ></input>
            </div>
            </div>


            <div >
            <div className="title" id="status">
              <b>Role</b>
            </div>
            <div className="list-container" id="status-container">
              {availableRoles.map((item, index) => (
                <div className="checkbox" key={index}>
                  <input
                    id={item}
                    value={item}
                    type="checkbox"
                    checked={role === item ? true : false}
                    onChange={() => setRole(item)}
                  />

                  <label htmlFor={item}>{item}</label>
                </div>
              ))}
            </div>
          </div>


          <div >
            <div className="title" id="status">
              <b>Projects</b>
            </div>
            <div className="list-container" id="status-container">
              {props.projectsList.map((item, index) => (
                <div className="checkbox" key={index}>
                  <input
                    id={item}
                    value={item}
                    type="checkbox"
                    checked={projects.includes(item) ? true : false}
                    onChange={() => handleProjects(item)}
                  />

                  <label htmlFor={item}>{item}</label>
                </div>
              ))}
            </div>
          </div>

            

           </div>)}
           
           {!edit ? (<button onClick={() => {setEdit(true)}}>Edit</button>) :
           (<button onClick={() => {setEdit(false)
                                    updateUser(email, name, role, projects)}}>Save</button>)}
           
           <button style={{color: 'red'}} onClick={() => {deleteUser()}}>Delete</button>


        </div>
    )
    
}