import { Outlet, Link } from "react-router-dom";
import styles from "./Layout.module.scss";

const Layout = () => {
  return (
    <div className={styles.appContainer}>
      <main className={styles.pageContent}>
        <Outlet />
      </main>
      
      <nav className={styles.bottomNav}>
        <Link to="/" className={styles.navLink}>Accueil</Link>
        <Link to="/map" className={styles.navLink__center}>Carte</Link>
        <Link to="/runner/1" className={styles.navLink}>Profil</Link>
      </nav>
    </div>
  );
};

export default Layout;