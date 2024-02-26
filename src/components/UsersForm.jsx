import { React, useEffect, useState } from "react";
import { postUsersList, updateUserDetails, deleteUser, getUser, getProjectsList } from "../utils/api";

export default function UsersForm(props) {

    const [initialLoad, setInitialLoad] = useState(true);

    const [email, setEmail] = useState(props.user);
    const [name, setName] = useState('');
    const [role, setRole] = useState('');
    const [projects, setProjects] = useState('');


    const availableRoles = ['Manager', 'Supervisor', 'Operative', 'Visitor'];
    const availableProjects = props.projectsList;
  

    useEffect (() => {
      if(initialLoad){
        setInitialLoad(false);
        getUser(email).then((response) => {
          console.log(response)
          setName(response.props.name);
          setRole(response.props.role);
          setProjects(response.props.projects);
        })
      }

    }, [initialLoad])
    

    const updateUser = (mail, name, role, projects) => {
      console.log('starting update')
      


      const update = {
          "name": name,
          "role": role,
          "projects": projects
      }

      updateUserDetails(mail, update).then((res) => {
          console.log(res)
      })
      
  }

  const deleteUser = () => {
   

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
        <div style={{
            backgroundColor: 'white'
          }}>
          
           </div>
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
              {availableProjects.sort().map((item, index) => (
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

            
           </div>
           
           
           <button onClick={() => {updateUser(email, name, role, projects)
                                  props.setEdit(false)}}>Save</button>
           
           <button style={{color: 'red'}} onClick={() => {deleteUser()}}>Delete</button>


        </div>
    )
    
}