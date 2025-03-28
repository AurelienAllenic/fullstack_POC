import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Link } from "react-router-dom";
import axios from "axios";
import "leaflet/dist/leaflet.css";
import archepov from "../../assets/archepov.png";
import iimpov from "../../assets/iimpov.png";
import L from "leaflet";
import styles from "./Map.module.scss";

const Map = () => {
  const [location, setLocation] = useState(null);
  const [backendLocations, setBackendLocations] = useState([]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [time, setTime] = useState("00:00:00");
  const [raceStarted, setRaceStarted] = useState(false);
  const [startTime, setStartTime] = useState(null);

  // Fonctions pour le menu déroulant
  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  // Chronomètre
  useEffect(() => {
    let interval;
    if (raceStarted) {
      interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        setTime(new Date(elapsed).toISOString().substr(11, 8));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [raceStarted, startTime]);

  const startRace = () => {
    setRaceStarted(true);
    setStartTime(Date.now());
  };

  // Authentification et géolocalisation
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
              "http://localhost:5001/api/location",
              { latitude, longitude, user: username },
              { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchBackendLocations();
          } catch (err) {
            setError("Erreur lors de l'envoi des données au back-end");
          } finally {
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
    }
  };

  const fetchBackendLocations = async () => {
    try {
      const response = await axios.get("http://localhost:5001/api/location");
      setBackendLocations(response.data);
    } catch (err) {
      console.error("Erreur lors de la récupération des données", err);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) setIsAuthenticated(true);
    fetchBackendLocations();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5001/api/login", {
        username,
        password,
      });
      localStorage.setItem("token", response.data.token);
      setIsAuthenticated(true);
      setShowLoginModal(false);
      setError(null);
    } catch (error) {
      setError(error.response?.data?.error || "Erreur de connexion");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
  };

  if (error) return <div className={styles.error}>{error}</div>;
  if (loading) return <div className={styles.loading}>Chargement...</div>;

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <Link to="/" className={styles.backButton}>
          <img src="/assets/icons/arrow_left_alt.svg" alt="Retour" />
        </Link>

        {isAuthenticated ? (
          <button onClick={handleLogout} className={styles.authButton}>
            Déconnexion
          </button>
        ) : (
          <button
            onClick={() => setShowLoginModal(true)}
            className={styles.authButton}
          >
            Connexion
          </button>
        )}

        <button onClick={toggleMenu} className={styles.menuButton}>
          <img src="/assets/icons/runner.svg" alt="Menu" />
        </button>
      </header>

      {/* Menu déroulant */}
      <div className={`${styles.sideMenu} ${menuOpen ? styles.open : ""}`}>
        <div className={styles.menuHeader}>
          <h3>Participants ({backendLocations.length})</h3>
          <button onClick={closeMenu} className={styles.closeButton}>
            ×
          </button>
        </div>
        <ul className={styles.participantsList}>
          {backendLocations.map((loc, index) => (
            <li key={index} className={styles.participant}>
              <span className={styles.participantName}>{loc.user}</span>
              <span className={styles.participantTime}>
                {new Date(loc.timestamp).toLocaleTimeString()}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Overlay */}
      {menuOpen && <div className={styles.overlay} onClick={closeMenu} />}

      {/* Modale de connexion */}
      {showLoginModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2>Connexion</h2>
            <form onSubmit={handleLogin} className={styles.loginForm}>
              <input
                type="text"
                placeholder="Nom d'utilisateur"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={styles.input}
              />
              <input
                type="password"
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.input}
              />
              {error && <p className={styles.errorText}>{error}</p>}
              <div className={styles.buttonGroup}>
                <button type="submit" className={styles.primaryButton}>
                  Se connecter
                </button>
                <button
                  type="button"
                  onClick={() => setShowLoginModal(false)}
                  className={styles.secondaryButton}
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Carte */}
      <div className={styles.mapContainer}>
        <MapContainer
          center={location || [48.8566, 2.3522]}
          zoom={13}
          className={styles.leafletContainer}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          {location && (
            <Marker position={location}>
              <Popup>
                Votre position: <br />
                Lat: {location[0].toFixed(4)} <br />
                Lng: {location[1].toFixed(4)}
              </Popup>
            </Marker>
          )}

          {backendLocations.map((loc, index) => (
            <Marker key={index} position={[loc.latitude, loc.longitude]}>
              <Popup>
                <strong>{loc.user}</strong>
                <br />
                {new Date(loc.timestamp).toLocaleString()}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Chronomètre */}
      <div className={styles.timerContainer}>
        <div className={styles.timer}>{time}</div>
        {!raceStarted && (
          <button onClick={startRace} className={styles.startButton}>
            Démarrer la course
          </button>
        )}
      </div>
      {/* Bouton de localisation */}
     <div className={styles.locationButtonContainer}>
     {isAuthenticated && (
        <button onClick={getLocation} className={styles.locationButton}>
          <img src="/assets/icons/run.svg" alt="Localisation" />
          Mettre à jour ma position
        </button>
      )}
     </div>
    </div>
  );
};

export default Map;
