// src/components/Navbar.js
import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = ({ userRole }) => {
    return (
        <nav>
            <ul>
                {userRole === 'admin' && (
                    <>
                        <li><Link to="/admin-home">Admin Home</Link></li>
                        <li><Link to="/manage-orders">Manage Orders</Link></li>
                        <li><Link to="/reassign-orders">Reassign Orders to Courier</Link></li>
                    </>
                )}
                {userRole === 'user' && (
                    <>
                        <li><Link to="/user-home">Client Home</Link></li>
                        <li><Link to="/my-orders">My Orders</Link></li>
                        <li><Link to="/create-order">Create Order</Link></li>
                    </>
                )}
                {userRole === 'courier' && (
                    <>
                        <li><Link to="/courier-home">Courier Home</Link></li>
                        <li><Link to="/assigned-orders">Assigned Orders</Link></li>
                        <li><Link to="/courier-orders">View Courier Orders</Link></li>
                        <li><Link to="/update-order-status">Update Order Status</Link></li>
                    </>
                )}
            </ul>
        </nav>
    );
};

export default Navbar;