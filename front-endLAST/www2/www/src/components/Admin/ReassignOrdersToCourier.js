import '../../styles/styling.css';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const ReassignOrdersToCourier = () => {
    const [orders, setOrders] = useState(null);  // Start with null to indicate loading state
    const [couriers, setCouriers] = useState(['Courier A', 'Courier B', 'Courier C', 'Courier D']); // Example couriers

    // Fetch assigned orders from the backend
    useEffect(() => {
        fetch('http://backendgo:8080/admin/courier/orders', {
            method: 'GET',
            headers: {
                'Authorization':  `Bearer ${localStorage.getItem('authToken')}`, // Assuming token is stored in localStorage
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
                setOrders([]); // Default to empty array if the format is unexpected
            }
        })
        .catch(error => {
            console.error('Error fetching orders:', error);
            setOrders([]);  // Fallback to empty array in case of error
        });
    }, []);

    const handleReassignCourier = (orderId, newCourierId) => {
        if (window.confirm(`Are you sure you want to reassign this order to ${newCourierId}?`)) {
            fetch(`http://backendgo:8080/admin/orders/${orderId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization':  `Bearer ${localStorage.getItem('authToken')}`,
                },
                body: JSON.stringify({ courier_id: newCourierId })
            })
            .then(response => response.json())
            .then(data => {
                if (data.message) {
                    alert(data.message);
                    setOrders(prevOrders =>
                        prevOrders.map(order =>
                            order._id === orderId ? { ...order, courier_id: newCourierId } : order
                        )
                    );
                }
            })
            .catch(error => {
                console.error('Error reassigning order:', error);
            });
        }
    };

    return (
        <div className='glass'>
            <div>
                <h2>Reassign Orders to Courier</h2>
                {orders === null ? (  // Show loading state if orders is null
                    <p>Loading orders... Please wait.</p>
                ) : orders.length === 0 ? (  // Show message if no orders
                    <p>No orders available for reassignment.</p>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Details</th>
                                <th>Assigned Courier</th>
                                <th>Reassign Courier</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order) => (
                                <tr key={order._id}>
                                    <td>{order._id}</td>
                                    <td>
                                        <Link to={`/order-details/${order._id}`}>
                                            {order.details}
                                        </Link>
                                    </td>
                                    <td>{order.courier_id ? order.courier_id : 'Not assigned'}</td>
                                    <td>
                                        <select
                                            onChange={(e) => handleReassignCourier(order._id, e.target.value)}
                                            defaultValue=""
                                        >
                                            <option value="" disabled>Select courier</option>
                                            {couriers
                                                .filter(courier => courier !== order.courier_id)
                                                .map((courier) => (
                                                    <option key={courier} value={courier}>{courier}</option>
                                                ))}
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default ReassignOrdersToCourier;
