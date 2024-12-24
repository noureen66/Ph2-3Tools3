import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../../styles/styling.css';

const AdminHome = () => {
    const [orders, setOrders] = useState(null); // Start with null to represent "not loaded"

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error("No token found.");
            return;
        }
    
        fetch('http://backendgo:8080/admin/orders', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            }
        })
        .then(response => {
            console.log(response); // Log response to see status and body
            if (!response.ok) {
                throw new Error('Unauthorized');
            }
            return response.json();
        })
        .then(data => {
            if (Array.isArray(data)) {
                setOrders(data);
            } else if (data.orders && Array.isArray(data.orders)) {
                setOrders(data.orders);
            } else {
                console.error('Unexpected response format:', data);
                setOrders([]); // Default to an empty array
            }
        })
        .catch(error => {
            console.error('Error fetching orders:', error);
            setOrders([]); // Fallback to an empty array
        });
    }, []);
    
    return (
        <div className='glass' style={{ textAlign: 'center', margin: '20px' }}>
            <h1>Admin Home</h1>
            <h2>Welcome to the Admin Dashboard</h2>
            <div>
                <Link to="/manage-orders" style={{ margin: '10px', textDecoration: 'none' }}>
                    <button>Manage Orders Page</button>
                </Link>
                <Link to="/reassign-orders" style={{ margin: '10px', textDecoration: 'none' }}>
                    <button>Assigned Orders to Courier</button>
                </Link>
            </div>
            <div style={{ marginTop: '20px' }}>
                <h3>Orders List</h3>
                {orders === null ? ( // Check if orders is null
                    <p>Loading orders... Please wait or ensure the system is running.</p>
                ) : orders.length === 0 ? ( // Check if the array is empty
                    <p>No orders available at the moment.</p>
                ) : (
                    <ul>
                        {orders.map(order => (
                            <li key={order._id}>
                                <Link to={`/order-details/${order._id}`}>
                                    Order ID: {order._id} - Status: {order.status}
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default AdminHome;
