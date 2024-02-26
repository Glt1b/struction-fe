import { React, useEffect, useState, useContext } from "react";
import { getUser, generateCode, updateUserDetails } from "../utils/api";

export default function LoginPage(props) {
    const setUser = props.setUser;

    const [reset, setReset] = useState(false);

    const [mail, setMail] = useState('');
    const [password, setPassword] = useState('');
    const [code, setCode] = useState('');
    const [code2, setCode2] = useState('')
    
    const [newPassword, setNewPassword] = useState('');
    const [newPassword2, setNewPassword2] = useState('');

    const [newData, setNewData] = useState(false);


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
        setReset('code sent');
        alert('Reset code has been sent to your email address');
      })
      .catch((err) => {
        alert('user does not exist')
      })
    }

    function resetPassword () {
      // get user details and create new object
      if(newPassword === ''){
        alert('Create new password')
      } else if(newPassword !== newPassword2){
        alert('password repeated incorrectly')
      } else {
        console.log('fetch' + mail)
        getUser(mail.toLocaleLowerCase().trim())
        .then((result) => {
        const obj = {
          name: result.props.name,
          role: result.props.role,
          projects: result.props.projects,
          password: newPassword
        }

        setNewData(obj);
        })
        .catch((err) => {
          alert('Error occured. Try again')
        })
      }
      
    }
      // check id code and password is correct
      // update details
      // set reset false -> go back to login page
    

    useEffect(() => {
      if(reset === 'code sent'){
        generateCode(mail).then((result) => {
          console.log(result);
          setCode(result);
        })
      }
    }, [reset])

    useEffect(() => {
      if(newData){
        if(code !== code2){
          alert('invalid code')
        } else {
          updateUserDetails(mail.toLocaleLowerCase().trim(), newData)
          setReset(false);
        }
      }
    }, [newData])


  

    return (
      <div id="loginform">
        {!reset ? (
          <>
            <FormInput description="Email" placeholder="Enter your email" type="text" set={setMail} />
            <FormInput description="Password" placeholder="Enter your password" type="text" set={setPassword} />
            {mail !== '' && password !== '' ? <FormButton title="Log in" login={logInFunction} /> : null}
            {mail !== '' && password === '' ? <FormButton title="Reset Password" login={sendCode} /> : null}
          </>
        ) : (
          <>
            <FormInput description="Email" placeholder="Enter your email" type="text" set={setMail} />
            <FormInput description="Code" placeholder="Enter your code" type="text" set={setCode2} />
            <FormInput description="Password" placeholder="Enter new password" type="text" set={setNewPassword} />
            <FormInput description="Password" placeholder="Repeat new password" type="text" set={setNewPassword2} />
            <FormButton title="Reset Password" login={resetPassword} />
            {mail !== '' && password === '' ? <FormButton title="<- Go back" login={() => setReset(false)} /> : null}
          </>
        )}
      </div>
    );
  }
  
  const FormButton = (props) => (
    <div id="button" className="row">
      <button onClick={props.login}>{props.title}</button>
    </div>
  );
  
  const FormInput = (props) => (
    <div className="row">
      <label>{props.description}</label>
      <input
        type={props.type}
        placeholder={props.placeholder}
        onChange={(e) => {
          props.set(e.target.value);
        }}
      />
    </div>
  );