import React, { useState, useEffect } from 'react';

const GeolocationCheck = () => {
    const [isGeolocationAvailable, setIsGeolocationAvailable] = useState(false);
    const [location, setLocation] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Check if Geolocation API is available in the browser
        if ("geolocation" in navigator) {
            setIsGeolocationAvailable(true);

            // Try to get the current position
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setLocation({ latitude, longitude });
                },
                (err) => {
                    setError(err.message);
                }
            );
        } else {
            setIsGeolocationAvailable(false);
        }
    }, []);

    return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
            <h2>Geolocation Check</h2>
            {isGeolocationAvailable ? (
                location ? (
                    <div>
                        <p>Geolocation is available and working!</p>
                        <p>Latitude: {location.latitude}</p>
                        <p>Longitude: {location.longitude}</p>
                    </div>
                ) : (
                    <p>Geolocation is available, but no position data yet.</p>
                )
            ) : (
                <p>Geolocation is not supported by your browser.</p>
            )}

            {error && <p style={{ color: 'red' }}>Error: {error}</p>}
        </div>
    );
};

export default GeolocationCheck;
