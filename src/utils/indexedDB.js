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

export const addToIndexedDB = (databaseName, objectStoreName, key, value) => {
  // Check if the browser supports IndexedDB
  if (!('indexedDB' in window)) {
    console.error('IndexedDB is not supported in this browser.');
    return;
  }

  // Open the database or create one if it doesn't exist
  const request = window.indexedDB.open(databaseName, 1);

  // Handle database opening or creation errors
  request.onerror = function(event) {
    console.error('Error opening/creating database:', event.target.errorCode);
  };

  // Create or upgrade the database object store
  request.onupgradeneeded = function(event) {
    const db = event.target.result;
    if (!db.objectStoreNames.contains(objectStoreName)) {
      db.createObjectStore(objectStoreName, { keyPath: 'id' });
    }
  };

  // Database opened successfully
  request.onsuccess = function(event) {
    const db = event.target.result;

    // Start a transaction to perform database operations
    const transaction = db.transaction([objectStoreName], 'readwrite');

    // Get the object store
    const objectStore = transaction.objectStore(objectStoreName);

    // Create an object representing the key-value pair to be added
    const data = { id: key, value: value };

    // Add the data to the object store
    const addRequest = objectStore.add(data);

    // Handle the add request success and error events
    addRequest.onsuccess = function() {
      console.log('Data added successfully.');
    };

    addRequest.onerror = function(event) {
      console.error('Error adding data:', event.target.error);
    };

    // Close the transaction once it's done
    transaction.oncomplete = function() {
      db.close();
    };
  };
}


export const readFromIndexedDB = (databaseName, objectStoreName, key, callback) => {
  // Check if the browser supports IndexedDB
  if (!('indexedDB' in window)) {
    console.error('IndexedDB is not supported in this browser.');
    return;
  }

  // Open the database
  const request = window.indexedDB.open(databaseName, 1);

  // Handle database opening errors
  request.onerror = function(event) {
    console.error('Error opening database:', event.target.errorCode);
  };

  // Database opened successfully
  request.onsuccess = function(event) {
    const db = event.target.result;

    // Start a transaction to perform database operations
    const transaction = db.transaction([objectStoreName], 'readonly');

    // Get the object store
    const objectStore = transaction.objectStore(objectStoreName);

    // Retrieve the object using the key
    console.log(key)
    const getRequest = objectStore.get(key);

    // Handle the get request success and error events
    getRequest.onsuccess = function(event) {
      const result = event.target.result;
      if (result) {
        // The object was found, pass it to the callback
        callback(result.value);
      } else {
        // The object was not found
        callback(null);
      }
    };

    getRequest.onerror = function(event) {
      console.error('Error reading data:', event.target.error);
      callback(null);
    };

    // Close the transaction once it's done
    transaction.oncomplete = function() {
      db.close();
    };
  };
}

export const deleteIndexedDB = (databaseName, callback) => {
  // Check if the browser supports IndexedDB
  if (!('indexedDB' in window)) {
    console.error('IndexedDB is not supported in this browser.');
    return;
  }

  // Open the database
  const request = window.indexedDB.deleteDatabase(databaseName);

  // Handle database deletion errors
  request.onerror = function(event) {
    console.error('Error deleting database:', event.target.errorCode);
    if (callback) callback(false);
  };

  // Database deleted successfully
  request.onsuccess = function() {
    console.log('Database deleted successfully.');
    if (callback) callback(true);
  };
}

export const  deleteFromIndexedDB = (databaseName, objectStoreName, key, callback) => {
  // Check if the browser supports IndexedDB
  if (!('indexedDB' in window)) {
    console.error('IndexedDB is not supported in this browser.');
    return;
  }

  // Open the database
  const request = window.indexedDB.open(databaseName, 1);

  // Handle database opening errors
  request.onerror = function(event) {
    console.error('Error opening database:', event.target.errorCode);
    if (callback) callback(false);
  };

  // Database opened successfully
  request.onsuccess = function(event) {
    const db = event.target.result;

    // Start a transaction to perform database operations
    const transaction = db.transaction([objectStoreName], 'readwrite');

    // Get the object store
    const objectStore = transaction.objectStore(objectStoreName);

    // Delete the object using the key
    const deleteRequest = objectStore.delete(key);

    // Handle the delete request success and error events
    deleteRequest.onsuccess = function(event) {
      console.log('Data deleted successfully.');
      if (callback) callback(true);
    };

    deleteRequest.onerror = function(event) {
      console.error('Error deleting data:', event.target.error);
      if (callback) callback(false);
    };

    // Close the transaction once it's done
    transaction.oncomplete = function() {
      db.close();
    };
  };
}

