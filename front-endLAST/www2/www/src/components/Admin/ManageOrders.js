import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const ManageOrders = () => {
    const [orders, setOrders] = useState(null); // Start as null to represent "loading"

    useEffect(() => {
        fetch('http://backendgo:8080/admin/orders', {
            method: 'GET',
            headers: {
                'Authorization':  `Bearer ${localStorage.getItem('authToken')}`,
            }
        })
        .then(response => response.json())
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

    const handleUpdateStatus = (orderId, newStatus) => {
        fetch(`http://backendgo:8080/orders/${orderId}/status`, {
            method: 'PUT',
            headers: {
                'Authorization':  `Bearer ${localStorage.getItem('authToken')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: newStatus })
        })
        .then(response => response.json())
        .then(data => {
            alert('Order status updated!');
            setOrders(prevOrders => prevOrders.map(order => 
                order._id === orderId ? { ...order, status: newStatus } : order
            ));
        })
        .catch(error => {
            console.error('Error updating order status:', error);
        });
    };

    const handleDeleteOrder = (orderId) => {
        if (window.confirm('Are you sure you want to delete this order?')) {
            fetch(`http://backendgo:8080/orders/${orderId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                }
            })
            .then(response => response.json())
            .then(data => {
                alert('Order deleted!');
                setOrders(prevOrders => prevOrders.filter(order => order._id !== orderId));
            })
            .catch(error => {
                console.error('Error deleting order:', error);
            });
        }
    };

    const getStatusOptions = (currentStatus) => {
        const allStatuses = ['Picked up', 'In Transit', 'Delivered'];
        return allStatuses.filter(status => status !== currentStatus);
    };

    return (
        <div className='glass'>
            <h2>Manage Orders</h2>
            {orders === null ? ( // Check if orders is still loading
                <p>Loading orders... Please wait.</p>
            ) : orders.length === 0 ? ( // Handle empty orders
                <p>No orders available at the moment.</p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Details</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(order => (
                            <tr key={order._id}>
                                <td>{order._id}</td>
                                <td>
                                    <Link to={`/order-details/${order._id}`}>{order.details || 'View Details'}</Link>
                                </td>
                                <td>{order.status}</td>
                                <td>
                                    <select
                                        onChange={(e) => handleUpdateStatus(order._id, e.target.value)}
                                        defaultValue={order.status}
                                    >
                                        <option value="" disabled>Select status</option>
                                        {getStatusOptions(order.status).map((status) => (
                                            <option key={status} value={status}>{status}</option>
                                        ))}
                                    </select>
                                    <button onClick={() => handleDeleteOrder(order._id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default ManageOrders;
