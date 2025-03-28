import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Link } from "react-router-dom";
import axios from "axios";
import styles from "./Map.module.scss";

const Map = () => {
  const [locations, setLocations] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [time, setTime] = useState("00:00:00");
  const [raceStarted, setRaceStarted] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [userLocation, setUserLocation] = useState(null);

  // Vérifier l'authentification au chargement
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true);
    }
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const response = await axios.get("http://localhost:5001/api/location");
      setLocations(response.data);
    } catch (error) {
      console.error("Error fetching locations:", error);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5001/api/login", {
        username,
        password
      });
      localStorage.setItem("token", response.data.token);
      setIsAuthenticated(true);
      setShowLoginModal(false);
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
          
          try {
            const token = localStorage.getItem("token");
            await axios.post(
              "http://localhost:5001/api/location",
              { latitude, longitude, user: username },
              { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchLocations();
          } catch (error) {
            console.error("Error sending location:", error);
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
        }
      );
    }
  };

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

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <Link to="/" className={styles.backButton}>
          <img src="/assets/icons/arrow_left_alt.svg" alt="Retour" />
        </Link>
        {/* <h1 className={styles.title}>Live Running</h1> */}
        
        {/* Bouton de connexion/déconnexion */}
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
      <div className={`${styles.sideMenu} ${menuOpen ? styles.open : ''}`}>
        <div className={styles.menuHeader}>
          <h3>Participants ({locations.length})</h3>
          <button onClick={closeMenu} className={styles.closeButton}>×</button>
        </div>
        <ul className={styles.participantsList}>
          {locations.map((loc, index) => (
            <li key={index} className={styles.participant}>
              <span className={styles.participantName}>{loc.user}</span>
              <span className={styles.participantTime}>
                {new Date(loc.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Overlay lorsque menu ouvert */}
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
          center={[48.8566, 2.3522]}
          zoom={13}
          className={styles.leafletContainer}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {locations.map((loc, index) => (
            <Marker key={index} position={[loc.latitude, loc.longitude]}>
              <Popup className={styles.popup}>
                <strong>{loc.user}</strong><br />
                {new Date(loc.timestamp).toLocaleString()}
              </Popup>
            </Marker>
          ))}
          {userLocation && (
            <Marker position={userLocation}>
              <Popup>Votre position actuelle</Popup>
            </Marker>
          )}
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
         {/* Bouton d'ajout de position si connecté */}
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