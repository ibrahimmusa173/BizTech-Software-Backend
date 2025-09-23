// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import Local from './Pages/Local'; // This will become our "Tenders List" or similar
import DataPostPage from './Pages/DataPostPage'; // Might be refactored or removed in favor of CreateTenderPage
import ItemUpdatePage from './Pages/ItemUpdatePage'; // Might be refactored or removed

import RegisterPage from './Pages/Auth/RegisterPage';
import LoginPage from './Pages/Auth/LoginPage';
import ForgotPasswordPage from './Pages/Auth/ForgotPasswordPage';
import ResetPasswordPage from './Pages/Auth/ResetPasswordPage';

// NEW IMPORTS FOR TENDERS & PROPOSALS
import TendersListPage from './Pages/Tenders/TendersListPage'; // For all users to browse tenders
import CreateTenderPage from './Pages/Tenders/CreateTenderPage'; // For Clients to create
import ManageTendersPage from './Pages/Tenders/ManageTendersPage'; // For Clients to manage their tenders
import TenderDetailsPage from './Pages/Tenders/TenderDetailsPage'; // View tender and proposals for client/admin, or submit proposal for bidder
import SubmitProposalPage from './Pages/Proposals/SubmitProposalPage'; // For Bidders to submit proposals
import MyProposalsPage from './Pages/Proposals/MyProposalsPage'; // For Bidders to view their submitted proposals
import AdminDashboardPage from './Pages/Admin/AdminDashboardPage'; // For Admin management
import UserProfilePage from './Pages/Auth/UserProfilePage'; // For user profile management

// NEW: A simple PrivateRoute component (optional, but good practice)
import PrivateRoute from './components/PrivateRoute';

function App() {
    return (
        <Router>
            <div className="min-h-screen bg-gray-100">
                <Routes>
                    {/* Public/Auth Routes */}
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

                    {/* General Tenders List (visible to all logged-in users) */}
                    <Route path="/" element={<PrivateRoute><TendersListPage /></PrivateRoute>} />
                    <Route path="/tenders" element={<PrivateRoute><TendersListPage /></PrivateRoute>} />
                    <Route path="/tenders/:id" element={<PrivateRoute><TenderDetailsPage /></PrivateRoute>} />

                    {/* Client Routes */}
                    <Route path="/client/create-tender" element={<PrivateRoute allowedRoles={['client', 'admin']}><CreateTenderPage /></PrivateRoute>} />
                    <Route path="/client/my-tenders" element={<PrivateRoute allowedRoles={['client', 'admin']}><ManageTendersPage /></PrivateRoute>} />
                    <Route path="/client/edit-tender/:id" element={<PrivateRoute allowedRoles={['client', 'admin']}><CreateTenderPage /></PrivateRoute>} /> {/* Reuse for edit */}

                    {/* Bidder Routes */}
                    <Route path="/tenders/:tenderId/submit-proposal" element={<PrivateRoute allowedRoles={['bidder']}><SubmitProposalPage /></PrivateRoute>} />
                    <Route path="/bidder/my-proposals" element={<PrivateRoute allowedRoles={['bidder']}><MyProposalsPage /></PrivateRoute>} />

                    {/* Admin Routes */}
                    <Route path="/admin/dashboard" element={<PrivateRoute allowedRoles={['admin']}><AdminDashboardPage /></PrivateRoute>} />
                    {/* Add more admin routes for user/tender/proposal management within AdminDashboard or separate pages */}

                    {/* User Profile (can be accessed by all logged-in users) */}
                    <Route path="/profile" element={<PrivateRoute><UserProfilePage /></PrivateRoute>} />

                    {/* Existing item routes (review if still needed or if 'tenders' replaces them) */}
                    <Route path="/add-item" element={<PrivateRoute><DataPostPage /></PrivateRoute>} />
                    <Route path="/edit-item/:id" element={<PrivateRoute><ItemUpdatePage /></PrivateRoute>} />


                    {/* 404 Page */}
                    <Route path="*" element={<h1 className="text-center text-3xl mt-20">404: Page Not Found</h1>} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;