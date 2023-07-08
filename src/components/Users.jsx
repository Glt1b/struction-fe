import { React, useEffect, useState } from "react";
import { getUsersList, postUsersList, getUser, updateUserDetails } from "../utils/api";
import UsersForm from "./UsersForm";


export default function Users() {

    const [list, setList] = useState(false);
    const [users, setUsers] = useState(false);

    const [newUser, setNewUser] = useState(false);
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [role, setRole] = useState('');

    const availableRoles = ['Manager', 'Supervisor', 'Operative'];

    const addUser = (email, name, role) => {

      const update = {
        "name": name,
        "role": role,
        "projects": []}

      updateUserDetails(email, update)

      const updatedList = [...list, email]
      console.log('updated list:' + updatedList)
      postUsersList(updatedList);
      setTimeout(() => {
        setList(updatedList);
      }, 2000)
      
      
    }

    useEffect(() => {
        if(!list){
            getUsersList().then((result) => {
                setList(result);
            })
        }
    }, [list])

    useEffect(() => {
        if(list){
            let usersData = [];
            console.log(list)
            list.forEach((user) => {
                getUser(user).then((result) => {
                    usersData.push(result)
                    console.log(result)
                    if(list.length === usersData.length){
                       console.log(usersData)
                       setUsers(usersData);
                }
                })
                
            })
        }
    }, [list])

    return(
      <div style={{
        overflow: 'scroll', height: '80vh'
      }}>
            <h1>Users</h1>
            {(users ? users.map((element, index) => {
                return (<UsersForm 
                key={index}
                email={element.key}
                name={element.props.name}
                role={element.props.role}
                projects={element.props.projects}

                list={list}
                setList={setList}
                users={users}
                setUsers={setUsers}
                
                />)
            }) : null)}

            {!newUser ? (<button onClick={() => {setNewUser(true)}}>Create new user</button>) : null}

            {newUser ? (
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
          <button onClick={() => {setNewUser(false)
                                 addUser(email, name, role)}}>Submit</button>
                </div>
            ) : null}
        </div>
    )
    
}