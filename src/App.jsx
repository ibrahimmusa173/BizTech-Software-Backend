// // src/App.jsx

// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import { AuthProvider } from './Pages/Authentication/AuthContext'; 
// import PrivateRoute from './Pages/Authentication/PrivateRoute';

// // --- Your Page Imports ---
// import UtilityStore from './Pages/UtilityStore/UtilityStore';
// import Team from './Pages/Team/Team';
// import DataView from './Pages/DataView/DataView';
// import LoginPage from './Pages/Authentication/LoginPage';
// import RegisterPage from './Pages/Authentication/RegisterPage';
// import DataFetch from './Pages/Authentication/DataFetch';
// import DataPost from './Pages/Authentication/DataPost';
// import UserUpdate from './Pages/Authentication/UserUpdate';
// import ForgotPasswordPage from './Pages/Authentication/ForgotPasswordPage';
// import ResetPasswordPage from './Pages/Authentication/ResetPasswordPage';
// import ProductUpdate from './Pages/Authentication/ProductUpdate'; // <-- 1. IMPORT THE NEW COMPONENT

// // --- Layout Component Imports ---
// import Header from './Components/Header/Header';
// import Footer from './Components/Footer/Footer';

// function App() {
//   return (
//     <Router>
//       <AuthProvider>
//         <Header />
//         <div className="main-content" style={{ minHeight: '80vh' }}>
//           <Routes>
//             {/* ... (Your public routes remain the same) ... */}
//             <Route path="/" element={<UtilityStore />} />
//             <Route path="/UtilityStore" element={<UtilityStore />} />
//             <Route path="/Team" element={<Team />} />
//             <Route path="/Products" element={<DataView />} />
//             <Route path="/login" element={<LoginPage />} />
//             <Route path="/register" element={<RegisterPage />} />
//             <Route path="/forgot-password" element={<ForgotPasswordPage />} />
//             <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

//             {/* ================================================= */}
//             {/*               PROTECTED ROUTES                    */}
//             {/* ================================================= */}
//             <Route path="/DataFetch" element={<PrivateRoute><DataFetch /></PrivateRoute>} />
//             <Route path="/DataPost" element={<PrivateRoute><DataPost /></PrivateRoute>} />
//             <Route path="/userUpdate/:id" element={<PrivateRoute><UserUpdate /></PrivateRoute>} />
            
//             {/* --- 2. ADD THIS NEW ROUTE FOR EDITING PRODUCTS --- */}
//             <Route path="/edit-product/:id" element={<PrivateRoute><ProductUpdate /></PrivateRoute>} />
            
//             <Route path="*" element={<h1>404: Page Not Found</h1>} />
//           </Routes>
//         </div>
//         <Footer />
//       </AuthProvider>
//     </Router>
//   );
// }

// export default App;




// src/App.jsx

import  { useState, useEffect } from 'react';
import axios from 'axios';

// The base URL for our backend API
const API_URL = 'http://localhost:5000/api/tasks/';

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  // 1. GET: Fetch tasks on component mount
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axios.get(API_URL);
        setTasks(response.data);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };
    fetchTasks();
  }, []);

  // 2. POST: Add a new task
  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    try {
      const response = await axios.post(API_URL, { title: newTaskTitle });
      setTasks([...tasks, response.data]);
      setNewTaskTitle('');
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  // 3. DELETE: Delete a task
  const handleDeleteTask = async (id) => {
    try {
      await axios.delete(`${API_URL}${id}`);
      setTasks(tasks.filter((task) => task.id !== id)); // Use task.id
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  // 4. PUT: Toggle the completed status
  const handleToggleComplete = async (id) => {
    const taskToUpdate = tasks.find((task) => task.id === id);
    try {
      const response = await axios.put(`${API_URL}${id}`, {
        completed: !taskToUpdate.completed,
      });
      setTasks(
        tasks.map((task) => (task.id === id ? response.data : task))
      );
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  return (
    <div className="bg-gray-900 min-h-screen flex items-center justify-center font-sans">
      <div className="w-full max-w-lg bg-gray-800 shadow-lg rounded-lg p-6">
        <h1 className="text-3xl font-bold text-center text-white mb-6">Task Manager</h1>

        {/* Form to add new task */}
        <form onSubmit={handleAddTask} className="flex gap-2 mb-6">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="Add a new task..."
            className="flex-grow bg-gray-700 text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200"
          >
            Add
          </button>
        </form>

        {/* Task List */}
        <div className="space-y-3">
          {tasks.map((task) => (
            <div
              key={task.id} // Use task.id as the key
              className="flex items-center justify-between bg-gray-700 p-3 rounded-md"
            >
              <div
                onClick={() => handleToggleComplete(task.id)}
                className={`cursor-pointer ${
                  task.completed ? 'line-through text-gray-400' : 'text-white'
                }`}
              >
                {task.title}
              </div>
              <button
                onClick={() => handleDeleteTask(task.id)}
                className="text-red-400 hover:text-red-600 font-bold transition duration-200"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;