import { React, useEffect, useState } from "react";
import { getUsersList, postUsersList, getUser } from "../utils/api";
import UsersForm from "./UsersForm";

export default function Users() {

    const [list, setList] = useState(false);
    const [users, setUsers] = useState(false);

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
            list.forEach((user) => {
                getUser(user).then((result) => {
                    usersData.push(result)
                    console.log(result)
                    if(list.length === usersData.length){
                       setUsers(usersData);
                }
                })
                
            })
        }
    }, [list])

    
    return(
        <div>
            <h1>Users</h1>
            {(users ? users.map((element, index) => {
                return (<UsersForm 
                key={index}
                email={element.key}
                name={element.props.name}
                role={element.props.role}
                projects={element.props.projects}/>)
            }) : null)}
        </div>
    )
    
}