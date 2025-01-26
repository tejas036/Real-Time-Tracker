import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { io } from "socket.io-client";
import { Container, Typography, Box, CircularProgress, Paper } from "@mui/material";

// Fix default icon issue with Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const socket = io("http://localhost:3000");

const Map = () => {
  const [location, setLocation] = useState(null); // User's location
  const [locations, setLocations] = useState([]); // All users' locations
  const [locationError, setLocationError] = useState(null);

  useEffect(() => {
    // Watch the user's location and update state
    if ("geolocation" in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation([latitude, longitude]);

          // Emit location to the server
          socket.emit("sendLocation", { latitude, longitude });
        },
        (err) => {
          setLocationError(err.message || "Unable to retrieve location");
        },
        {
          enableHighAccuracy: true,
          maximumAge: 10000,
          timeout: 5000,
        }
      );

      // Cleanup watchPosition on unmount
      return () => {
        navigator.geolocation.clearWatch(watchId);
      };
    } else {
      setLocationError("Geolocation is not supported by your browser.");
    }
  }, []);

  useEffect(() => {
    // Listen for updated locations from the server
    socket.on("receiveLocation", (updatedLocations) => {
      console.log("Updated Locations:", updatedLocations);
      setLocations(
        updatedLocations.filter((loc) => loc.latitude && loc.longitude)
      ); // Ensure valid locations
    });

    // Cleanup on component unmount
    return () => {
      socket.off("receiveLocation");
    };
  }, [locations]);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance.toFixed(2); // Distance in kilometers
  };

  return (
    <Container maxWidth="lg"  
    sx={{
        marginTop: "70px",
        backgroundColor: "rgba(136, 129, 129, 0.8)", // Light semi-transparent white
        backdropFilter: "blur(10px)", // Frosted glass effect
        boxShadow: "0 4px 15px rgba(130, 79, 79, 0.1)", // Subtle shadow
        borderRadius: "15px", // Rounded corners
        padding: "20px", // Internal spacing
      }}
    >
     <Typography
  variant="h4"
  align="center"
  gutterBottom
  sx={{
    background: "linear-gradient(90deg,rgb(211, 28, 22),rgb(130, 102, 80))", // Gradient colors
    WebkitBackgroundClip: "text", // Clipping background to text
    WebkitTextFillColor: "transparent", // Makes the text itself transparent to show gradient
    textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)", // Shadow effect
    fontWeight: "bold",
  }}
>
  Real-Time Location Tracker
</Typography>

      <Box
        sx={{
          height: "500px",
          width: "100%",
          borderRadius: "10px",
          overflow: "hidden",
          boxShadow: 3,
          position: "relative",
          marginTop:10,
          marginBottom:10
        }}
        component={Paper}
      >
        {location ? (
          <MapContainer
            center={location}
            zoom={16}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="Map contributors"
            />
            {/* Render all users' locations */}
            {locations.map((loc) => (
              <Marker key={loc.id} position={[loc.latitude, loc.longitude]}>
                <Popup>
                  <Typography variant="body1">
                    {/* <strong>User ID:</strong> {loc.id} */}
                  </Typography>
                  <Typography variant="body2">
                    Latitude: {loc.latitude}, Longitude: {loc.longitude}
                  </Typography>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        ) : (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              width: "100%",
            }}
          >
            {locationError ? (
              <Typography color="error">{locationError}</Typography>
            ) : (
              <CircularProgress />
            )}
          </Box>
        )}
        {locations.length > 1 && (
          <Box
            sx={{
              position: "absolute",
              bottom: 10,
              left: 10,
              background: "rgba(255, 255, 255, 0.9)",
              padding: "10px",
              borderRadius: "5px",
              boxShadow: 1,
            }}
          >
            <Typography variant="subtitle1">
              <strong>Distances:</strong>
            </Typography>
            {locations.map((loc1, index1) =>
              locations.map((loc2, index2) => {
                if (index1 < index2) {
                  const distance = calculateDistance(
                    loc1.latitude,
                    loc1.longitude,
                    loc2.latitude,
                    loc2.longitude
                  );
                  return (
                    <Typography key={`${loc1.id}-${loc2.id}`} variant="body2">
                      Distance between {loc1.id} and {loc2.id}: {distance} km
                    </Typography>
                  );
                }
                return null;
              })
            )}
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default Map;
