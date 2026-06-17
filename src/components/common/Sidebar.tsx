'use client';
import { useIncidentStore } from '@/store/useIncidentStore'; // 1. Importamos el store global
import { LayoutDashboard, Map, Layers } from 'lucide-react';
import styles from '../../styles/_layout.module.scss';
import { LogOut } from 'lucide-react';

export default function Sidebar() {
  // 2. Traemos el estado actual y la acción para cambiar de pestaña
  const activeTab = useIncidentStore((state) => state.activeTab);
  const setActiveTab = useIncidentStore((state) => state.setActiveTab);
  const logout = useIncidentStore((state) => state.logout);

  return (
    <aside className={styles.sidebar}>
      <div>
        <div className={styles.logoSection}>
          <Layers size={24} color="#f2b724" />
          <div>Build<span>Pulse</span></div>
        </div>

        <nav className={styles.navLinks}>
          {/* BOTÓN 1: Cambia el estado a 'map' */}
          <button 
            onClick={() => setActiveTab('map')} 
            className={`${styles.navItem} ${activeTab === 'map' ? styles.active : ''}`}
            style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left' }}
          >
            <Map size={20} />
            Visor de Mapa
          </button>

          {/* BOTÓN 2: Cambia el estado a 'dashboard' */}
          <button 
            onClick={() => setActiveTab('dashboard')} 
            className={`${styles.navItem} ${activeTab === 'dashboard' ? styles.active : ''}`}
            style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left' }}
          >
            <LayoutDashboard size={20} />
            Panel Analítico
          </button>
        </nav>
      </div>

      <div className={styles.footerSection}>
        <div className={styles.avatar}>JG</div>
        <div className={styles.userInfo}>
          <span className={styles.name}>Jonatan Gaona</span>
          <span className={styles.role}>Superadmin</span>
        </div>
        <button 
          onClick={logout} 
          className={styles.btnLogout}
          title="Cerrar Sesión"
        >
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
}