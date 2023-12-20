import { React, useEffect, useState, useContext } from "react";
import { getUser } from "../utils/api";

export default function LoginPage(props) {
    const setUser = props.setUser;

    const [mail, setMail] = useState('');
    const [password, setPassword] = useState('');
    const [code, setCode] = ('');
    
    const [newPassword, setNewPassword] = useState('');
    const [newPassword2, setNewPassword2] = useState('');


    function logInFunction () {
        getUser(mail.toLocaleLowerCase().trim()).then((result) => {
            console.log(result)
            // catch err -> alert not user with this email
            console.log(result.props.password)
            console.log(password.trim())
            if(result.props.password === password.trim()){
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

    function sendCode () {
      getUser(mail.toLocaleLowerCase().trim()).then((result) => {
        // send code function and save result to code.
      })
      .catch((err) => {
        alert('user does not exist')
      })
    }

    function resetPassword () {
      // check id code and password is correct
      // save new password
      // log in
    }

  
    return(
        <div id="loginform">
            <FormInput description="Email" placeholder="Enter your email" type="text"  set={setMail}/>
            <FormInput description="Password" placeholder="Enter your password" type="text" set={setPassword}/>
            { mail !== '' && password !== '' ? (<FormButton title="Log in" login={logInFunction}/>) : null}
            { mail !== ''  ? (<FormButton title="Reset Password" login={sendCode}/>) :  null}
            { code !== ''  ? (
              <div>
              <FormInput description="Code" placeholder="Enter your code" type="text" set={setCode}/>
              <FormInput description="Password" placeholder="Enter new password" type="text" set={setNewPassword}/>
              <FormInput description="Password" placeholder="Repeat new password" type="text" set={setNewPassword2}/>
              <FormButton title="Reset Password" login={resetPassword}/>
              </div>) : null}
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
  