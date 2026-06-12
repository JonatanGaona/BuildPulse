'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Map, Layers } from 'lucide-react';
import styles from '../../styles/_layout.module.scss';

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar}>
      <div>
        <div className={styles.logoSection}>
          <Layers size={24} color="#f2b724" />
          <div>Build<span>Pulse</span></div>
        </div>

        <nav className={styles.navLinks}>
          <Link 
            href="/" 
            className={`${styles.navItem} ${pathname === '/' ? styles.active : ''}`}
          >
            <Map size={20} />
            Visor de Mapa
          </Link>
          <Link 
            href="/dashboard" 
            className={`${styles.navItem} ${pathname === '/dashboard' ? styles.active : ''}`}
          >
            <LayoutDashboard size={20} />
            Panel Analítico
          </Link>
        </nav>
      </div>

      <div className={styles.footerSection}>
        <div className={styles.avatar}>JG</div>
        <div className={styles.userInfo}>
          <span className={styles.name}>Jonatan Gaona</span>
          <span className={styles.role}>Superadmin</span>
        </div>
      </div>
    </aside>
  );
}