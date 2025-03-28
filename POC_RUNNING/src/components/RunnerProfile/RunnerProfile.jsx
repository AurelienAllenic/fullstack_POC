import React from 'react';
import { Link } from 'react-router-dom';
import styles from './RunnerProfile.module.scss';

const RunnerProfile = () => {
  // Données fictives
  const runnerData = {
    name: "Jean Dupont",
    avatar: "/assets/runner.png",
    bio: "Coureur passionné depuis 5 ans. Mon objectif : finir le marathon en moins de 4 heures !",
    team: "Team Runner"
  };

  const stats = {
    distance: "36.5",
    speed: "12.3",
    calories: "2450"
  };

  const raceHistory = [
    {
      date: "2023-10-15",
      name: "Marathon de Paris",
      distance: "42.2",
      time: "4:12:35"
    },
    {
      date: "2023-06-10",
      name: "Semi-marathon de Lyon",
      distance: "21.1",
      time: "1:48:22"
    },
    {
      date: "2023-03-05",
      name: "10km de Marseille",
      distance: "10.0",
      time: "0:45:15"
    }
  ];

  return (
    <div className={styles.profileContainer}>
      <header className={styles.profileHeader}>
        <Link to="/map" className={styles.backButton}>
          <img src="/assets/icons/arrow_left_alt.svg" alt="Retour" />
        </Link>
        <h1>Profil du Coureur</h1>
      </header>

      <div className={styles.profileContent}>
        <div className={styles.profileCard}>
          <div className={styles.avatarContainer}>
            <img 
              src={runnerData.avatar} 
              alt={runnerData.name} 
              className={styles.avatar}
            />
          </div>
          
          <div className={styles.profileInfo}>
            <h2 className={styles.runnerName}>{runnerData.name}</h2>
            <p className={styles.runnerBio}>{runnerData.bio}</p>
            
            <div className={styles.detailsGrid}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>N° Dossard</span>
                <span className={styles.detailValue}>#042</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Équipe</span>
                <span className={styles.detailValue}>{runnerData.team}</span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.statsSection}>
          <h3 className={styles.sectionTitle}>Statistiques</h3>
          
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <img src="/assets/icons/run_dark.svg" alt="Distance" />
              </div>
              <div className={styles.statValue}>{stats.distance} km</div>
              <div className={styles.statLabel}>Distance</div>
            </div>
            
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <img src="/assets/icons/speed.svg" alt="Vitesse" />
              </div>
              <div className={styles.statValue}>{stats.speed} km/h</div>
              <div className={styles.statLabel}>Vitesse moy.</div>
            </div>
            
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <img src="/assets/icons/food.svg" alt="Calories" />
              </div>
              <div className={styles.statValue}>{stats.calories}</div>
              <div className={styles.statLabel}>Calories</div>
            </div>
          </div>
        </div>

        <div className={styles.historySection}>
          <h3 className={styles.sectionTitle}>Historique des courses</h3>
          <div className={styles.historyList}>
            {raceHistory.map((race, index) => (
              <div key={index} className={styles.raceItem}>
                <div className={styles.raceDate}>
                  {new Date(race.date).toLocaleDateString('fr-FR')}
                </div>
                <div className={styles.raceInfo}>
                  <div className={styles.raceName}>{race.name}</div>
                  <div className={styles.raceStats}>
                    <span>{race.distance} km</span>
                    <span>{race.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RunnerProfile;