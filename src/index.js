import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { register as registerServiceWorker } from './serviceWorkerRegistration';
import reportWebVitals from "./reportWebVitals";
import { ProSidebarProvider } from "react-pro-sidebar";
import { MarkersProvider } from "./contexts/Markers";
import { ProjectMarkersProvider } from "./contexts/ProjectMarkers";
import { UserProvider } from "./contexts/User";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <ProjectMarkersProvider>
    <MarkersProvider>
      <ProSidebarProvider>
        <UserProvider>
           <App />
        </UserProvider>
      </ProSidebarProvider>
    </MarkersProvider>
  </ProjectMarkersProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
registerServiceWorker();
