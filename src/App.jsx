// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Local from './Pages/Local'; // This will become our "Tenders List" or similar
import DataPostPage from './Pages/DataPostPage';
import ItemUpdatePage from './Pages/ItemUpdatePage';
import RegisterPage from './Pages/Auth/RegisterPage'; // New component
import LoginPage from './Pages/Auth/LoginPage';     // New component
import ForgotPasswordPage from './Pages/Auth/ForgotPasswordPage'; // NEW IMPORT
import ResetPasswordPage from './Pages/Auth/ResetPasswordPage';   // NEW IMPORT

function App() {
   return (
            <Router>
              <div className="min-h-screen bg-gray-100">
           <Routes>
            <Route path="/" element={<Local />} />
            <Route path="/add-item" element={<DataPostPage />} />
            <Route path="/edit-item/:id" element={<ItemUpdatePage />} />
            <Route path="/register" element={<RegisterPage />} /> {/* New route */}
            <Route path="/login" element={<LoginPage />} />       {/* New route */}
            <Route path="/forgot-password" element={<ForgotPasswordPage />} /> {/* NEW ROUTE */}
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} /> {/* NEW ROUTE */}
            <Route path="*" element={<h1 className="text-center text-3xl mt-20">404: Page Not Found</h1>} />
          </Routes>
         </div>
    </Router>
   );
 }

 export default App;