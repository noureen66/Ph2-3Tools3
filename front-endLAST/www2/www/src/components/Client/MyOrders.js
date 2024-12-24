// MyOrders.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../../styles/styling.css';

const MyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch orders on component mount
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const token = localStorage.getItem('authToken');
                if (!token) {
                    setError('No authentication token found');
                    setLoading(false);
                    return;
                }
    
                const response = await fetch('http://backendgo:8080/orders', {
                    method: 'GET',
                    headers: {
                        'Authorization':`Bearer ${localStorage.getItem('authToken')}`,
                        'Content-Type': 'application/json',
                    },
                });
    
                if (response.ok) {
                    const data = await response.json();
                    console.log('API Response:', data); // Log the data to check its structure
    
                    // Since the orders are inside an object, access data.orders
                    if (data.orders && Array.isArray(data.orders)) {
                        setOrders(data.orders); // Set orders array
                    } else {
                        setError('No orders found in the response');
                    }
                } else {
                    const errMessage = await response.text();
                    setError(errMessage);
                }
            } catch (error) {
                setError('Error fetching orders');
            } finally {
                setLoading(false);
            }
        };
    
        fetchOrders();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div style={{ textAlign: 'center', margin: '20px' }}>
            <h2>My Orders</h2>
            <table style={{ margin: '0 auto', width: '50%' }}>
                <thead>
                    <tr>
                        <th>Package Name</th>
                        <th>Status</th>
                        <th>Details</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map((order) => (
                        <tr key={order._id}>
                            <td>{order.name}</td>
                            <td>{order.status}</td>
                            <td>
                                <Link to={`/user-order-details/${order._id}`}>Details</Link>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default MyOrders;
