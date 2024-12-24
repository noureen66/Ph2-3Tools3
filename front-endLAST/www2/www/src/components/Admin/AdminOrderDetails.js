import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import '../../styles/styling.css';

const AdminOrderDetails = () => {
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);

    useEffect(() => {
        fetch(`http://backendgo:8080/orders/${orderId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            }
        })
        .then(response => response.json())
        .then(data => {
            setOrder(data);
        })
        .catch(error => {
            console.error('Error fetching order details:', error);
        });
    }, [orderId]);

    if (!order) {
        return <div>Loading...</div>;
    }

    return (
        <div className='glass' style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
            <div style={{ width: '50%' }}>
                <h2>Order Details</h2>
                <p><strong>Order ID:</strong> {order._id}</p>
                <p><strong>Courier:</strong> {order.courier_id ? order.courier_id : 'Not assigned'}</p>
                <p><strong>Status:</strong> {order.status}</p>
                {/* Add any other details you need */}
            </div>
        </div>
    );
};

export default AdminOrderDetails;
