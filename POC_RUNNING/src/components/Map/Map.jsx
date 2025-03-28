import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import axios from "axios";
import "leaflet/dist/leaflet.css";
import archepov from "../../assets/archepov.png";
import iimpov from "../../assets/iimpov.png";
import L from "leaflet";

const Map = () => {
  const [location, setLocation] = useState(null);
  const [backendLocations, setBackendLocations] = useState([]);
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [lastUpdateDate, setLastUpdateDate] = useState(null); // Date seule
  const [lastUpdateTime, setLastUpdateTime] = useState(null); // Heure seule
  const [animate, setAnimate] = useState(false); // État pour l'animation

  useEffect(() => {
    const fetchAllLocations = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/location");
        setBackendLocations(response.data);
        const now = new Date();
        const newDate = now.toLocaleDateString(); // Ex: "28/03/2025"
        const newTime = now.toLocaleTimeString(); // Ex: "14:35:12"

        setLastUpdateDate(newDate);
        setLastUpdateTime((prevTime) => {
          if (prevTime !== newTime) {
            setAnimate(true); // Déclenche l'animation quand l'heure change
            setTimeout(() => setAnimate(false), 500); // Retire après 0.5s
          }
          return newTime;
        });
      } catch (err) {
        console.error(
          "❌ Erreur lors du rafraîchissement des marqueurs :",
          err
        );
      }
    };

    fetchAllLocations();
    const interval = setInterval(fetchAllLocations, 1000);
    return () => clearInterval(interval);
  }, []);

  const getLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setLocation([latitude, longitude]);
          const token = localStorage.getItem("token");
          if (!token) {
            setError("Vous devez être connecté pour ajouter une localisation.");
            setLoading(false);
            return;
          }
          try {
            await axios.post(
              "http://localhost:5000/api/location",
              { latitude, longitude, user },
              { headers: { Authorization: `Bearer ${token}` } }
            );
            setLoading(false);
          } catch (err) {
            setError("Erreur lors de l'envoi des données au back-end", err);
            setLoading(false);
          }
        },
        (err) => {
          setError(err.message);
          setLoading(false);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setError("La géolocalisation n'est pas supportée par ce navigateur.");
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) setIsAuthenticated(true);
  }, []);

  const openModal = () => setShowLoginModal(true);
  const closeModal = () => setShowLoginModal(false);

  const handleLogin = (e) => {
    e.preventDefault();
    if (user && password) {
      axios
        .post("http://localhost:5000/api/login", { username: user, password })
        .then((response) => {
          localStorage.setItem("token", response.data.token);
          setIsAuthenticated(true);
          closeModal();
        })
        .catch((error) => {
          setError(error.response?.data?.error || "Erreur de connexion");
        });
    } else {
      setError("Veuillez entrer un nom d'utilisateur et un mot de passe.");
    }
  };

  const onLogoutSubmit = async (data) => {
    localStorage.removeItem("token");
    window.location.reload();
  };

  // Affichage de l'erreur ou du chargement
  if (error) return <p>Error: {error}</p>;
  if (loading) return <p>Chargement...</p>;

  const defaultCenter =
    backendLocations.length > 0
      ? [backendLocations[0].latitude, backendLocations[0].longitude]
      : [48.8566, 2.3522];

  const customIcon = new L.Icon({
    iconUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    iconSize: [25, 41], // Taille de l'icône
    iconAnchor: [12, 41], // Position de l'ancre
    popupAnchor: [1, -34], // Position du popup par rapport à l'icône
    shadowSize: [41, 41], // Taille de l'ombre
  });

  return (
    <div>
      {!isAuthenticated && (
        <button
          onClick={openModal}
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            zIndex: 1000,
            padding: "10px 20px",
            backgroundColor: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Se connecter
        </button>
      )}

      {showLoginModal && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h2>Connexion</h2>
            <form onSubmit={handleLogin}>
              <input
                type="text"
                placeholder="Nom d'utilisateur"
                value={user}
                onChange={(e) => setUser(e.target.value)}
                style={styles.input}
              />
              <input
                type="password"
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input}
              />
              <button type="submit" style={styles.button}>
                Se connecter
              </button>
              <button onClick={closeModal} style={styles.button}>
                Annuler
              </button>
            </form>
          </div>
        </div>
      )}

      {isAuthenticated && (
        <div>
          <button
            onClick={getLocation}
            style={{
              position: "absolute",
              top: "50px",
              right: "10px",
              zIndex: 1000,
              padding: "10px 20px",
              fontSize: "16px",
              backgroundColor: "#28a745",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Ajouter ma localisation
          </button>
          <button
            onClick={onLogoutSubmit}
            style={{
              position: "absolute",
              top: "100px",
              right: "10px",
              zIndex: 1000,
              padding: "10px 20px",
              fontSize: "16px",
              backgroundColor: "red",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Déconnexion
          </button>
        </div>
      )}

      <MapContainer
        center={location || defaultCenter}
        zoom={13}
        style={{ height: "500px", width: "100%" }}
      >
        {lastUpdateDate && lastUpdateTime && (
          <div
            style={{
              position: "absolute",
              top: "0",
              left: "0",
              width: "100%",
              backgroundColor: "rgba(0, 0, 0, 0.7)",
              color: "white",
              padding: "10px",
              textAlign: "center",
              zIndex: 1000,
            }}
          >
            Dernière mise à jour des marqueurs : {lastUpdateDate}{" "}
            <span className={animate ? "animate-scale" : ""}>
              {lastUpdateTime}
            </span>
          </div>
        )}

        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {location && (
          <Marker position={location}>
            <Popup>
              Ta position actuelle: <br />
              <img
                src={iimpov}
                style={{ width: "300px", height: "150px" }}
              ></img>
              Latitude: {location[0]} <br />
              Longitude: {location[1]}
            </Popup>
          </Marker>
        )}

        {backendLocations.map((loc, index) => (
          <Marker
            key={index}
            position={[loc.latitude, loc.longitude]}
            icon={customIcon}
          >
            <Popup>
              Utilisateur: {loc.user} <br />
              <img
                src={loc.user == "aurel" ? iimpov : archepov}
                style={{ width: "300px", height: "150px" }}
              ></img>
              <br />
              Latitude: {loc.latitude} <br />
              Longitude: {loc.longitude} <br />
              Timestamp: {new Date(loc.timestamp).toLocaleString()}
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Style CSS pour l'animation */}
      <style jsx global>{`
        .animate-scale {
          display: inline-block; /* Nécessaire pour transform */
          animation: scaleAnimation 0.5s ease-in-out;
        }

        @keyframes scaleAnimation {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
};

const styles = {
  modal: {
    position: "fixed",
    top: "0",
    left: "0",
    right: "0",
    bottom: "0",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "8px",
    width: "300px",
    textAlign: "center",
  },
  input: {
    width: "100%",
    padding: "10px",
    margin: "10px 0",
    border: "1px solid #ccc",
    borderRadius: "4px",
  },
  button: {
    width: "100%",
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    backgroundColor: "#4CAF50",
    color: "white",
    cursor: "pointer",
    marginTop: "10px",
  },
};

export default Map;
