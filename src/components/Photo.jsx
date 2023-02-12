import { React, useState } from "react";
import NewWindow from "react-new-window";

export default function Photo(props) {
    const [fullScreen, setFullScreen] = useState(false);


    return (
        <div>
          <span onClick={() => {fullScreen ? setFullScreen(false) : setFullScreen(true)}}>
            <img src={props.url} />
          </span>
         {fullScreen ? (
            
               <NewWindow> 
                <span onClick={() => {fullScreen ? setFullScreen(false) : setFullScreen(true)}}>
                <img src={props.url} />
                </span>
                </NewWindow>
           
         ) : null}
        </div>)
}