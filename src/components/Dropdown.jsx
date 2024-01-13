import React, { useState, useRef, useEffect } from 'react';
import NewContract from './NewContract';

const DropdownMenu = (props) => {

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [projectsOpen, setProjectsOpen] = useState(false);
  const [locationsOpen, setLocationsOpen] = useState(false);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className='dropdown' ref={dropdownRef}>
      <button className="dropdown-btn" onClick={toggleDropdown}>Menu</button>
      {isOpen && (
        <div className="dropdown">
            
            <button className='dr-btn' onClick={() => setProjectsOpen(!projectsOpen)}><h3>* Projects</h3></button>
            {props.user && projectsOpen ? ( props.availableContracts.sort().map((project) => {
                return (
                   <p><button className='dr-btn'
                    onClick={() => {
                      props.setMapsLoaded(false);
                      props.setIsProjectLoaded(false);
                      props.setProjectName(project);
                      props.setCurrentLocation("");
                      props.setPage('map');
                      setProjectsOpen(false);
                    }}
                    key={project}
                  >
                    {project}
                   </button></p>
                   
                );
              })) : null}

            {props.mode === 'online' && props.user.props.role === 'Manager' ? (
              <NewContract
              availableContracts={props.availableContracts}
              setAvailableContracts={props.setAvailableContracts} />
            ) : null}

            {props.mapsLoaded ? (
              <button className='dr-btn' onClick={() => setLocationsOpen(!locationsOpen)}><h3>* Locations</h3></button>
            ) : null}

            {props.projectName && !props.mapsLoaded  ?  (<p className="loading">Loading project...</p>) : null}

            {locationsOpen ? (props.locations.map((location) => {
              return(
                <p><button className='dr-btn'
                    onClick={() => {
                      props.setCurrentLocation(location.name);
                      props.setPage('map');
                    }}
                    key={location.name}
                  >
                    {location.name}
                   </button></p>
              )
            })) : null}

           {props.projectName && props.mode === 'online' && props.user.props.role === 'Manager' ? (
              <button className='dr-btn' onClick={() => props.setPage('details')}><h3>* Project details</h3></button>
            ) : null}

          {props.projectName && props.user.props.role === 'Manager' ? (
            <button className='dr-btn' onClick={() => props.setPage('spreadsheet')}><h3>* Table view</h3></button>
           ) : null }

          { props.markers[0] && props.mode === 'online' && props.user.props.role === 'Manager' ? (
            <button className='dr-btn' onClick={() => {props.downloadPDFs(props.markers.length)
              props.setGeneratePDF(true) 
              setIsOpen(false)}}><h3>* Download PDFs</h3></button>
           ) : null }


          {props.mode === 'online' && props.user.props.role === 'Manager' ? (
               <button className='dr-btn' onClick={() => props.setPage('workers')}><h3>* Workers</h3></button>
            ) : null}

          {props.mode && props.mapsLoaded ? (
            <button className='dr-btn'
               onClick={() => { props.switchMode()
               }}>{props.mode === 'online' ? (
                <>Save to work offline</>
          ) : null}</button>) : null}

          {props.mode && props.mapsLoaded ? (
            <button className='dr-btn'
               onClick={() => { props.setPage('synch')
               }}>{props.mode === 'offline' ? (
                <>Synch with database</>
          ) : null}</button>) : null}

          {props.page === 'synch' ? (
               <p> Connecting with database...</p>
          ) : null }

          {!props.user ? null : (<button className='dr-btn' 
                                         onClick={() => {props.setUser(false)
                                                         localStorage.removeItem('Struction-User')}}><h3>* Logout</h3></button>)}




        </div>
      )}
    </div>
  );
};

export default DropdownMenu;
