//App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import AdminHome from './components/Admin/AdminHome';
import AdminOrderDetails from './components/Admin/AdminOrderDetails';
import ManageOrders from './components/Admin/ManageOrders';
import ReassignOrdersToCourier from './components/Admin/ReassignOrdersToCourier';
import ClientHome from './components/Client/ClientHome';
import ClientOrderDetails from './components/Client/ClientOrderDetails';
import MyOrders from './components/Client/MyOrders';
import CreateOrder from './components/Client/CreateOrder';
import AssignedOrders from './components/Courier/AssignedOrders';
import CourierHome from './components/Courier/CourierHome';
import CourierOrderDetails from './components/Courier/CourierOrderDetails';
import CourierOrders from './components/Courier/CourierOrders';
import UpdateOrderStatus from './components/Courier/UpdateOrderStatus';
import AuthPage from './components/entry/AuthPage';
import LoginForm from './components/entry/LoginForm';

const App = () => {
  const [userRole, setUserRole] = useState(null);
  const location = useLocation(); // Get the current location/path

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (token && role) {
      setUserRole(role);  // Set user role after login
    }
  }, []);

  const PrivateRoute = ({ children, allowedRoles }) => {
    return allowedRoles.includes(userRole) ? children : <Navigate to="/" />;
  };

  return (
    <div className="container">
      <h2>Package Tracking System</h2>

      {/* Render Navbar only if userRole is set (i.e., user is logged in) and not on the login page */}
      {userRole && location.pathname !== '/' && <Navbar userRole={userRole} />}

      <Routes>
        <Route path="/" element={<AuthPage />} />

        {/* Admin Routes */}
        <Route
          path="/admin-home"
          element={<PrivateRoute allowedRoles={['admin']}><AdminHome /></PrivateRoute>}
        />
        <Route
          path="/manage-orders"
          element={<PrivateRoute allowedRoles={['admin']}><ManageOrders /></PrivateRoute>}
        />
        <Route
          path="/reassign-orders"
          element={<PrivateRoute allowedRoles={['admin']}><ReassignOrdersToCourier /></PrivateRoute>}
        />
        <Route
          path="/order-details/:orderId"
          element={<PrivateRoute allowedRoles={['admin']}><AdminOrderDetails /></PrivateRoute>}
        />

        {/* Client Routes */}
        <Route
          path="/user-home"
          element={<PrivateRoute allowedRoles={['user']}><ClientHome /></PrivateRoute>}
        />
        <Route
          path="/user-order-details/:orderId"
          element={<PrivateRoute allowedRoles={['user']}><ClientOrderDetails /></PrivateRoute>}
        />
        <Route
          path="/my-orders"
          element={<PrivateRoute allowedRoles={['user']}><MyOrders /></PrivateRoute>}
        />
        <Route
          path="/create-order"
          element={<PrivateRoute allowedRoles={['user']}><CreateOrder /></PrivateRoute>}
        />

        {/* Courier Routes */}
        <Route
          path="/assigned-orders"
          element={<PrivateRoute allowedRoles={['courier']}><AssignedOrders /></PrivateRoute>}
        />
        <Route
          path="/courier-home"
          element={<PrivateRoute allowedRoles={['courier']}><CourierHome /></PrivateRoute>}
        />
        <Route
          path="/courier-order-details/:orderId"
          element={<PrivateRoute allowedRoles={['courier']}><CourierOrderDetails /></PrivateRoute>}
        />
        <Route
          path="/courier-orders"
          element={<PrivateRoute allowedRoles={['courier']}><CourierOrders /></PrivateRoute>}
        />
        <Route
          path="/update-order-status"
          element={<PrivateRoute allowedRoles={['courier']}><UpdateOrderStatus /></PrivateRoute>}
        />

        {/* Redirect to the respective home based on role */}
        <Route path="*" element={<Navigate to={userRole ? `/${userRole}-home` : '/'} />} />
      </Routes>
    </div>
  );
};

const AppWrapper = () => (
  <Router>
    <App />
  </Router>
);

export default AppWrapper;
