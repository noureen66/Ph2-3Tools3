// AssignedOrders.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../../styles/styling.css';

const AssignedOrders = () => {
    const [orders, setOrders] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchAssignedOrders = async () => {
            const courierID = localStorage.getItem('courierID');
            const authToken = localStorage.getItem('authToken');
    
            if (!courierID) {
                setError('Courier ID is not available. Please log in again.');
                return;
            }
    
            try {
                const response = await fetch(`${process.env.REACT_APP_API_URL}/courier/${courierID}/orders`, {
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                    },
                });
    
                if (response.ok) {
                    const data = await response.json();
                    setOrders(data.assigned_orders || []);
                } else {
                    const result = await response.json();
                    setError(result.error || 'Failed to load orders');
                }
            } catch (err) {
                console.error('Error fetching orders:', err);
                setError('Error fetching orders');
            }
        };
    
        fetchAssignedOrders();
    }, []);
    

    const handleAcceptOrder = async (orderId) => {
        await updateOrderStatus(orderId, 'Accepted');
    };

    const handleDeclineOrder = async (orderId) => {
        await updateOrderStatus(orderId, 'Declined');
    };

    const updateOrderStatus = async (orderId, status) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/orders/${orderId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization':  `Bearer ${localStorage.getItem('authToken')}`,
                },
                body: JSON.stringify({ status }),
            });

            if (response.ok) {
                setOrders(orders.map(order =>
                    order.id === orderId ? { ...order, status } : order
                ));
            } else {
                const result = await response.json();
                setError(result.error || 'Failed to update order status');
            }
        } catch (err) {
            console.error('Error updating order status:', err);
            setError('Failed to update order status');
        }
    };

    return (
        <div style={{ textAlign: 'center', margin: '20px' }}>
            <h2>Assigned Orders</h2>
            {error && <p className="error">{error}</p>}
            <table style={{ margin: '0 auto', width: '50%' }}>
                <thead>
                    <tr>
                        <th>Package Name</th>
                        <th>Status</th>
                        <th>Details</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map((order) => (
                        <tr key={order.id}>
                            <td>{order.name}</td>
                            <td style={{
                                fontWeight: 'bold',
                                color: order.status === 'Accepted' ? 'green' : order.status === 'Declined' ? 'red' : 'black'
                            }}>
                                {order.status}
                            </td>
                            <td>
                                <Link to={`/courier-order-details/${order.id}`}>Details</Link>
                            </td>
                            <td>
                                {order.status === 'Assigned' && (
                                    <>
                                        <button onClick={() => handleAcceptOrder(order.id)}>Accept</button>
                                        <button onClick={() => handleDeclineOrder(order.id)}>Decline</button>
                                    </>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AssignedOrders;
