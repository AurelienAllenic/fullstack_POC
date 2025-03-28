import { Link } from "react-router-dom";
import styles from "./Home.module.scss";

const Home = () => {
  return (
    <div className={styles.homeContainer}>
      <div className={styles.logoContainer}>
        <img src="/assets/icons/Logo-2.svg" alt="Marathon Tracker" className={styles.logo} />
      </div>
      
      <div className={styles.buttonContainer}>
        <Link to="/map" className={styles.accessButton}>
          Accéder à la carte
        </Link>
      </div>
    </div>
  );
};

export default Home;