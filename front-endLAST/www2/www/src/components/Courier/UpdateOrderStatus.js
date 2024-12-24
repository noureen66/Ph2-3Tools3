import React, { useState } from 'react';
import '../../styles/styling.css';

const UpdateOrderStatus = () => {
    const [orderId, setOrderId] = useState('');
    const [status, setStatus] = useState('');
    const [message, setMessage] = useState('');

    const handleOrderIdChange = (e) => {
        setOrderId(e.target.value);
    };

    const handleStatusChange = (e) => {
        setStatus(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`http://backendgo:8080/orders/${orderId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization':  `Bearer ${localStorage.getItem('authToken')}`,
                },
                body: JSON.stringify({ status })
            });
    
            if (response.ok) {
                setMessage('Order status updated successfully!');
                setStatus('');
                setOrderId('');
            } else {
                setMessage('Failed to update order status.');
            }
        } catch (error) {
            console.error('Error updating order status:', error);
            setMessage('An error occurred. Please try again later.');
        }
    };

    return (
        <div className='glass' style={{ textAlign: 'center', margin: '20px', position: 'relative' }}>
            <h3>Update Order Status</h3>
            <form onSubmit={handleSubmit}>
                <div className="form-group" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label htmlFor="orderId" style={{ marginRight: '10px' }}>Order ID:</label>
                    <input
                        type="text"
                        id="orderId"
                        value={orderId}
                        onChange={handleOrderIdChange}
                        required
                        style={{ width: '200px', padding: '7px' }}
                    />
                </div>
                <div className="form-group" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                    <label htmlFor="status" style={{ marginRight: '10px', marginTop: '-40px' }}>Select Status:</label>
                    <select
                        id="status"
                        value={status}
                        onChange={handleStatusChange}
                        required
                        style={{ width: '200px', padding: '7px' }}
                    >
                        <option value="">Select status</option>
                        <option value="picked_up">Picked Up</option>
                        <option value="in_transit">In Transit</option>
                        <option value="delivered">Delivered</option>
                    </select>
                </div>
                <button type="submit" style={{ marginTop: '-10px', marginLeft: '40px' }}>Update Status</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
};

export default UpdateOrderStatus;
