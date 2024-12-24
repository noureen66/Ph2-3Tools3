import React, { useEffect, useState } from 'react';
import '../../styles/styling.css';

const CourierOrders = () => {
    const [assignedOrders, setAssignedOrders] = useState([]);
    const courierID = localStorage.getItem("courierID");
    const accessToken = localStorage.getItem("accessToken");

    useEffect(() => {
        fetchAssignedOrders();
    }, []);

    const fetchAssignedOrders = async () => {
        try {
            const response = await fetch(`http://backendgo:8080/courier/${courierID}/orders`, {
                headers: {
                    Authorization:  `Bearer ${localStorage.getItem('authToken')}`,
                    'Content-Type': 'application/json'
                }
            });
            if (response.ok) {
                const data = await response.json();
                setAssignedOrders(data.assigned_orders || []);
            } else {
                console.error('Failed to fetch assigned orders');
            }
        } catch (error) {
            console.error('Error fetching assigned orders:', error);
        }
    };

    const updateOrderStatus = async (orderId, status) => {
        try {
            const response = await fetch(`http://backendgo:8080/orders/${orderId}/status`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status })
            });
            if (response.ok) {
                fetchAssignedOrders(); // Refresh orders after update
                console.log('Order status updated successfully');
            } else {
                console.error('Failed to update order status');
            }
        } catch (error) {
            console.error('Error updating order status:', error);
        }
    };

    return (
        <div className='glass'>
            <h2>Courier Orders</h2>
            <ul style={{ listStyleType: 'none' }}>
                {assignedOrders.map((order) => (
                    <li key={order.id}>
                        Order ID: {order.id}, Details: {order.details}, Assigned to: {order.courierId}
                        <select onChange={(e) => updateOrderStatus(order.id, e.target.value)} defaultValue={order.status}>
                            <option value="Pending">Pending</option>
                            <option value="In Transit">In Transit</option>
                            <option value="Delivered">Delivered</option>
                        </select>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default CourierOrders;
