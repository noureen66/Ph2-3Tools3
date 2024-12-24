// ClientHome.js
import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/styling.css';

const ClientHome = () => {
    return (
        <div className='glass' style={{ textAlign: 'center', margin: '20px' }}>
            <h1>Client Home</h1>
            <h2>Welcome to the Client Dashboard</h2>
            <div>
                <Link to="/my-orders" style={{ margin: '10px', textDecoration: 'none' }}>
                    <button>My Orders</button>
                </Link>
                <Link to="/create-order" style={{ margin: '10px', textDecoration: 'none' }}>
                    <button>Create Order</button>
                </Link>
            </div>
        </div>
    );
};

export default ClientHome;
