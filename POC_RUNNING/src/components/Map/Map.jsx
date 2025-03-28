import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import axios from "axios";

const Map = () => {
  const [location, setLocation] = useState(null);
  const [backendLocations, setBackendLocations] = useState([]);
  const [user, setUser] = useState(""); // State pour le nom d'utilisateur
  const [password, setPassword] = useState(""); // State pour le mot de passe
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Si l'utilisateur est connecté
  const [showLoginModal, setShowLoginModal] = useState(false); // Pour gérer l'affichage de la modale de connexion

  // Fonction pour récupérer la position et l'envoyer au back-end
  const getLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setLocation([latitude, longitude]);

          const token = localStorage.getItem("token"); // Récupère le token depuis le localStorage
          if (!token) {
            setError("Vous devez être connecté pour ajouter une localisation.");
            setLoading(false);
            return;
          }

          try {
            // Envoyer la localisation et le nom de l'utilisateur avec le token dans les en-têtes
            await axios.post(
              "http://localhost:5000/api/location",
              {
                latitude,
                longitude,
                user, // Ajouter l'utilisateur
              },
              {
                headers: {
                  Authorization: `Bearer ${token}`, // Passer le token dans les en-têtes
                },
              }
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

  // Fonction pour récupérer toutes les localisations depuis le backend
  const fetchBackendLocations = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/location");
      setBackendLocations(response.data);
    } catch (err) {
      console.log(
        "Erreur lors de la récupération des données depuis le backend",
        err
      );
    }
  };

  // Vérification de l'état de connexion (par exemple, avec un token dans localStorage)
  useEffect(() => {
    const token = localStorage.getItem("token"); // Vérifier si un token existe
    if (token) {
      setIsAuthenticated(true);
    }
    fetchBackendLocations();
  }, []);

  // Fonction pour ouvrir la modale
  const openModal = () => {
    setShowLoginModal(true);
  };

  // Fonction pour fermer la modale
  const closeModal = () => {
    setShowLoginModal(false);
  };

  // Fonction pour gérer la soumission du formulaire de connexion
  const handleLogin = (e) => {
    e.preventDefault();

    if (user && password) {
      // Envoyer la requête de connexion à l'API
      axios
        .post("http://localhost:5000/api/login", { username: user, password })
        .then((response) => {
          // Si la connexion réussit, on récupère le token
          const { token } = response.data;

          // Sauvegarder le token dans le localStorage
          localStorage.setItem("token", token);
          setIsAuthenticated(true); // Marquer l'utilisateur comme connecté
          closeModal(); // Fermer la modale après connexion
        })
        .catch((error) => {
          setError(error.response?.data?.error || "Erreur de connexion");
        });
    } else {
      setError("Veuillez entrer un nom d'utilisateur et un mot de passe.");
    }
  };

  // Affichage de l'erreur ou du chargement
  if (error) return <p>Error: {error}</p>;
  if (loading) return <p>Chargement...</p>;

  const [latitude, longitude] = location || [];

  return (
    <div>
      {/* Bouton de connexion en haut à droite */}
      {!isAuthenticated && (
        <button
          onClick={openModal}
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            zIndex: 1000,
            padding: "10px 20px",
            fontSize: "16px",
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

      {/* Modale de connexion */}
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
            </form>
            <button onClick={closeModal} style={styles.button}>
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Afficher le bouton pour ajouter la localisation si l'utilisateur est connecté */}
      {isAuthenticated && (
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
      )}

      {/* Carte */}
      <MapContainer
        center={location || [51.505, -0.09]} // Coordonnées par défaut si la localisation n'est pas disponible
        zoom={13}
        style={{ height: "500px", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker position={location || [51.505, -0.09]}>
          <Popup>
            Ta position actuelle: <br />
            Latitude: {latitude} <br />
            Longitude: {longitude}
          </Popup>
        </Marker>

        {/* Marqueurs pour toutes les localisations récupérées du backend */}
        {backendLocations.map((loc, index) => (
          <Marker key={index} position={[loc.latitude, loc.longitude]}>
            <Popup>
              Utilisateur: {loc.user} <br />
              Latitude: {loc.latitude} <br />
              Longitude: {loc.longitude} <br />
              Timestamp: {new Date(loc.timestamp).toLocaleString()}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
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
