// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Local from './Pages/Local';
import DataPostPage from './Pages/DataPostPage'; // Import the new DataPostPage
import ItemUpdatePage from './Pages/ItemUpdatePage'; // Import the new ItemUpdatePage

function App() {
   return (
            <Router>
              <div className="min-h-screen bg-gray-100"> {/* Added a basic background */}
           <Routes>
            <Route path="/" element={<Local />} />
            <Route path="/add-item" element={<DataPostPage />} /> {/* Route for adding items */}
            <Route path="/edit-item/:id" element={<ItemUpdatePage />} /> {/* Route for updating items */}
            {/* Add a catch-all for 404 pages if desired */}
            <Route path="*" element={<h1 className="text-center text-3xl mt-20">404: Page Not Found</h1>} />
          </Routes>
         </div>
    </Router>
   );
 }

 export default App;