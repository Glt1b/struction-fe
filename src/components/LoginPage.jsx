import { React, useEffect, useState, useContext } from "react";
import { getUser } from "../utils/api";

export default function LoginPage(props) {
    const setUser = props.setUser;

    const [mail, setMail] = useState('');
    const [password, setPassword] = useState('');


    function logInFunction () {
        getUser(mail).then((result) => {
            console.log(result)
            // catch err -> alert not user with this email
            if(result.props.password === password){
                setUser(result)
                localStorage.setItem('Struction-User', JSON.stringify(result)); 
            } else {
                alert('wrong password');
            }
        })
            .catch((err) => {
              alert('user does not exist')
            })
    }

  
    return(
        <div id="loginform">
            <FormInput description="Email" placeholder="Enter your email" type="text"  set={setMail}/>
            <FormInput description="Password" placeholder="Enter your password" type="text" set={setPassword}/>
            <FormButton title="Log in" login={logInFunction}/>
        </div>
      )
    }
  
  const FormButton = props => (
    <div id="button" className="row">
      <button onClick={props.login}>{props.title}</button>
    </div>
  );
  
  const FormInput = props => (
    <div className="row">
      <label>{props.description}</label>
      <input type={props.type} placeholder={props.placeholder}
      onChange={(e) => {
        props.set(e.target.value);
      }}/>
    </div>  
  );
  