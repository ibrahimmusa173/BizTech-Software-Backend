// import React from 'react'
// import ReactDOM from 'react-dom/client'
// import App from './App.jsx'
// import './index.css'
// import { BrowserRouter } from 'react-router-dom';

// ReactDOM.createRoot(document.getElementById('root')).render(
//   <React.StrictMode>
//     <BrowserRouter>
//     <App />
//     </BrowserRouter>
//   </React.StrictMode>,
// )


import React from 'react';
import ReactDOM from 'react-dom/client';
// DO NOT import BrowserRouter here
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
   {/* <BrowserRouter> */}
    {/* <Provider store={store}> */}
    <App />
    {/* </Provider> */}
    {/* </BrowserRouter>    */} 
    
  </React.StrictMode>,
);
