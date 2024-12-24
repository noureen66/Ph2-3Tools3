import React, { useState, useEffect } from 'react';
import '../../styles/styling.css';

const CourierOrderDetails = ({ orderId, isAccepted = false }) => {
    const [order, setOrder] = useState(null);  // Initially set to null until the data is fetched
    const [notification, setNotification] = useState('');
    const [notificationType, setNotificationType] = useState('');
    const [loading, setLoading] = useState(true);  // To track loading state

    // Fetch order details when the component mounts
    useEffect(() => {
        const fetchOrderDetails = async () => {
            try {
                const response = await fetch(`http://backendgo:8080/orders/${orderId}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
                    },
                });
                if (response.ok) {
                    const data = await response.json();
                    setOrder(data);  // Update the state with fetched data
                    setLoading(false);  // Set loading to false after data is fetched
                } else {
                    showNotification('Failed to fetch order details', 'error');
                    setLoading(false);  // Set loading to false if there's an error
                }
            } catch (error) {
                console.error('Error fetching order details:', error);
                showNotification('Failed to fetch order details', 'error');
                setLoading(false);  // Set loading to false in case of error
            }
        };

        fetchOrderDetails();
    }, [orderId]);  // Only refetch if orderId changes

    const updateOrderStatus = async (status) => {
        try {
            const response = await fetch(`http://backendgo:8080/orders/${order.id}/status`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('authToken')}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status }),
            });
            if (response.ok) {
                setOrder({ ...order, status });  // Update status in state
                showNotification(`Order ${status.toLowerCase()}`, 'success');
            } else {
                showNotification('Failed to update order status', 'error');
            }
        } catch (error) {
            console.error('Error updating order status:', error);
            showNotification('Failed to update order status', 'error');
        }
    };

    const handleAcceptOrder = () => updateOrderStatus('Accepted');
    const handleDeclineOrder = () => updateOrderStatus('Declined');

    const showNotification = (message, type) => {
        setNotification(message);
        setNotificationType(type);
        setTimeout(() => {
            setNotification('');
        }, 3000);
    };

    // Render loading state or actual order details
    if (loading) {
        return (
            <div className="glass" style={{ textAlign: 'center', margin: '20px', position: 'relative' }}>
                <h2>Loading Order Details...</h2>
            </div>
        );
    }

    // If order is not found or the data is missing
    if (!order) {
        return (
            <div className="glass" style={{ textAlign: 'center', margin: '20px', position: 'relative' }}>
                <h2>Order Not Found</h2>
            </div>
        );
    }

    return (
        <div className='glass' style={{ textAlign: 'center', margin: '20px', position: 'relative' }}>
            <h2>Order Details</h2>
            <p><strong>Pickup Location:</strong> {order.pickup_location}</p>
            <p><strong>Drop-off Location:</strong> {order.drop_off_location}</p>
            <p><strong>Package Details:</strong> {order.package_details}</p>
            <p><strong>Status:</strong> {order.status}</p>

            {order.status === 'Pending' && (
                <>
                    <button onClick={handleAcceptOrder}>Accept</button>
                    <button onClick={handleDeclineOrder}>Decline</button>
                </>
            )}

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
                }}>
                    {notification}
                </div>
            )}
        </div>
    );
};

export default CourierOrderDetails;
