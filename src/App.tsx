// import React from 'react';
// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import Login from './components/Login';
// import Register from './components/Register';
// import ForgotPassword from './components/ForgotPassword';
// import ResetPassword from './components/ResetPassword';
// import Home from './pages/user/Home';
// import './App.css';
// import Profile from 'pages/user/SettingLayout/pages/Profile';
// import SettingLayout from 'pages/user/SettingLayout/SettingLayout';

// const App: React.FC = () => {
//   return (
//     <Router>
//       <Routes>
//         <Route path="/login" element={<Login />} />
//         <Route path="/register" element={<Register />} />
//         <Route path="/forgot-password" element={<ForgotPassword />} />
//         <Route path="/reset-password" element={<ResetPassword />} />
//         <Route path="/user/home" element={<Home />} />



//         {/* <Route path="/profile" element={<Profile />} /> */}
//         <Route path="/" element={<Navigate to="/login" replace />} />
        
//       </Routes>
        
//     </Router>
//   );
// };

// export default App;
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes/routes'; 
import './App.css';

const App: React.FC = () => {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
};

export default App;
