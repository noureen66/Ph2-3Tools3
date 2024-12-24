import React, { useState } from 'react';
import '../../styles/styling.css';

const CreateOrder = () => {
    const [formData, setFormData] = useState({
        pickup_location: '',
        drop_off_location: '',
        package_details: '',
        delivery_time: ''
    });
    
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.pickup_location || !formData.drop_off_location || !formData.package_details || !formData.delivery_time) {
            setError('Please fill all the fields');
            return;
        }

        setError(''); // Reset error
        setLoading(true); // Set loading state

        try {
            const token = localStorage.getItem('token'); // Assuming token is stored in localStorage
            const response = await fetch('http://backendgo:8080/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                  Authorization: `Bearer ${localStorage.getItem('authToken')}`,
                },
                body: JSON.stringify(formData),
            });

            const result = await response.json();

            if (response.ok) {
                setSuccessMessage('Order Created Successfully!');
            } else {
                setError(result.message || 'Failed to create order.');
            }
        } catch (err) {
            setError('Error: Failed to create order.');
        } finally {
            setLoading(false); // Reset loading state
        }
    };

    const handleClear = () => {
        setFormData({
            pickup_location: '',
            drop_off_location: '',
            package_details: '',
            delivery_time: ''
        });
        setError('');
        setSuccessMessage('');
    };

    return (
        <div className='glass' style={{ textAlign: 'center', margin: '20px', position: 'relative' }}>
            <form onSubmit={handleSubmit}>
                <h2>Create Order</h2>

                {/* Display error message */}
                {error && <p style={{ color: 'red' }}>{error}</p>}

                {/* Display success message */}
                {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}

                <label>
                    Pickup Location:
                    <input
                        style={{ marginLeft: '10px' }}
                        type="text"
                        name="pickup_location"
                        value={formData.pickup_location}
                        onChange={handleChange}
                        required
                    />
                </label>
                <label>
                    Drop-off Location:
                    <input
                        style={{ marginLeft: '10px' }}
                        type="text"
                        name="drop_off_location"
                        value={formData.drop_off_location}
                        onChange={handleChange}
                        required
                    />
                </label>
                <label>
                    Package Details:
                    <textarea
                        style={{ marginLeft: '10px' }}
                        name="package_details"
                        value={formData.package_details}
                        onChange={handleChange}
                        required
                    />
                </label>
                <label>
                    Delivery Time:
                    <input
                        style={{ marginLeft: '10px' }}
                        type="datetime-local"
                        name="delivery_time"
                        value={formData.delivery_time}
                        onChange={handleChange}
                        required
                    />
                </label>

                <button style={{ marginLeft: '90px' }} type="submit" disabled={loading}>
                    {loading ? 'Creating...' : 'Create Order'}
                </button>
                <button
                    style={{ marginLeft: '90px', marginTop: '-10px' }}
                    type="button"
                    onClick={handleClear}
                >
                    Clear
                </button> {/* Clear button */}
            </form>
        </div>
    );
};

export default CreateOrder;
