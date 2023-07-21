export const checkMode = () => {
  // Check if the database Struction exists in localStorage
  if (localStorage.getItem('Struction') === null) {
    // If it doesn't exist, create it with the 'mode' object and set the default value to false
    const struction = { mode: 'online' };
    localStorage.setItem('Struction', JSON.stringify(struction));
    return 'online';
  } else {
    //localStorage.clear()
    // Retrieve the value of 'offline' from the 'mode' object
    const struction = JSON.parse(localStorage.getItem('Struction'));
    console.log(struction)
    return struction.mode;
  }
};