import React, { useState, useEffect } from 'react';
import '../../styles/styling.css';

const ClientOrderDetails = ({ orderId }) => {
    const [order, setOrder] = useState(null);
    const [notification, setNotification] = useState('');
    const [notificationType, setNotificationType] = useState('');

    useEffect(() => {
        // Fetch order details when the component mounts
        const fetchOrderDetails = async () => {
            try {
                console.log("Fetching details for order ID:", orderId);  // Log orderId
                const response = await fetch(`http://backendgo:8080/orders/${orderId}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                    },
                });
    
                if (response.ok) {
                    const data = await response.json();
                    console.log("Fetched order data:", data);  // Log the fetched data
    
                    if (data) {
                        setOrder(data);  // Update order state with response data
                    } else {
                        showNotification('No order found', 'error');
                    }
                } else {
                    throw new Error('Failed to fetch order details');
                }
            } catch (error) {
                console.error('Error fetching order:', error);
                showNotification('Failed to fetch order details', 'error');
            }
        };
    
        // Only fetch if orderId exists
        if (orderId) {
            fetchOrderDetails();
        }
    }, [orderId]);

    const handleCancelOrder = async () => {
        if (order && order.status === 'Pending') {
            try {
                const response = await fetch(`http://backendgo:8080/orders/${order.id}/status`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ status: 'Canceled' }),
                });

                if (response.ok) {
                    const updatedOrder = await response.json();
                    setOrder(updatedOrder);  // Update the order status to 'Canceled'
                    showNotification('The order has been canceled.', 'success');
                } else {
                    throw new Error('Failed to cancel order');
                }
            } catch (error) {
                console.error('Error canceling order:', error);
                showNotification('Failed to cancel order', 'error');
            }
        }
    };

    const showNotification = (message, type) => {
        setNotification(message);
        setNotificationType(type);
        setTimeout(() => {
            setNotification('');
        }, 3000);  // Hide notification after 3 seconds
    };

    if (!order) {
        return <div>Loading order details...</div>;  // Show loading text while fetching data
    }

    return (
        <div className="glass" style={{ textAlign: 'center', margin: '20px', position: 'relative' }}>
            <h2>Order Details</h2>
            {order ? (
                <>
                    <p><strong>Pickup Location:</strong> {order.pickupLocation || 'N/A'}</p>
                    <p><strong>Drop-off Location:</strong> {order.dropoffLocation || 'N/A'}</p>
                    <p><strong>Package Details:</strong> {order.packageDetails || 'N/A'}</p>
                    <p><strong>Status:</strong> {order.status}</p>
                
                    {order.status === 'Pending' && (
                        <button onClick={handleCancelOrder}>Cancel Order</button>
                    )}
    
                    {order.status === 'Canceled' && (
                        <p style={{ color: 'red', fontWeight: 'bold' }}>Canceled</p>
                    )}
                </>
            ) : (
                <p>No order details available.</p>
            )}
    
            {/* Notification Display */}
            {notification && (
                <div style={{
                    position: 'absolute',
                    top: '20px',
                    right: '20px',
                    padding: '10px',
                    backgroundColor: notificationType === 'success' ? 'lightgreen' : 'lightcoral',
                    color: 'white',
                    borderRadius: '5px',
                    boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
                    opacity: 1,
                    transition: 'opacity 0.5s',
                }}>
                    {notification}
                </div>
            )}
        </div>
    );
    
};

export default ClientOrderDetails;
