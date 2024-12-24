import React, { useEffect, useState } from 'react';
import '../../styles/styling.css';
import { Link } from 'react-router-dom';

const CourierHome = () => {
    const [assignedOrders, setAssignedOrders] = useState([]);
    const courierID = localStorage.getItem("courierID"); // Example, store courier ID after login
    const accessToken = localStorage.getItem("accessToken"); // Example, store token after login

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

    return (
        <div className='glass' style={{ textAlign: 'center', margin: '20px' }}>
            <h1>Courier Home</h1>
            <h2>Welcome to the Courier Dashboard</h2>
            <div>
                <Link to="/assigned-orders" style={{ margin: '10px', textDecoration: 'none' }}>
                    <button>View Assigned Orders ({assignedOrders.length})</button>
                </Link>
            </div>
        </div>
    );
};

export default CourierHome;
