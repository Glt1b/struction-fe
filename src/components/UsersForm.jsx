import { React, useEffect, useState } from "react";
import { getUsersList, postUsersList } from "../utils/api";

export default function UsersForm(props) {

    const [email, setEmail] = useState(props.email);
    const [name, setName] = useState(props.name);
    const [role, setRole] = useState(props.role);
    const [projects, setProjects] = useState(props.projects);

    const [edit, setEdit] = useState(false);

    const availableRoles = ['Manager', 'Supervisor', 'Operative'];


    return(
        <div>
        {!edit ? (
           <div style={{
            backgroundColor: 'white'
          }}>
           <p>Name: {name}</p>
           <p>e-mail: {email}</p>
           <p>role: {role}</p>
           <p>projects: {projects}</p> 
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
              value={email}
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
            <b>Role</b>
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

            <div >
            <div className="title" id="status">
              <b>Status</b>
            </div>
            <div className="list-container" id="status-container">
              {availableRoles.map((item, index) => (
                <div className="checkbox" key={index}>
                  <input
                    id={item}
                    value={item}
                    type="checkbox"
                    checked={role.includes(item) ? true : false}
                    onChange={() => setRole(item)}
                  />

                  <label htmlFor={item}>{item}</label>
                </div>
              ))}
            </div>
          </div>

            

           </div>)}
           
           {!edit ? (<button onClick={() => {setEdit(true)}}>Edit</button>) :
           (<button onClick={() => {setEdit(false)}}>Save</button>)}
           


        </div>
    )
    
}