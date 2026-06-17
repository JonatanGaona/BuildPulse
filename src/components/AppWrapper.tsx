'use client';
import { useEffect, useState } from 'react';
import { useIncidentStore } from '@/store/useIncidentStore';
import LoginModal from '@/components/LoginModal';
import styles from '@/styles/_layout.module.scss';

export default function AppWrapper({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);
  const isAuthenticated = useIncidentStore((state) => state.isAuthenticated);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div style={{ background: '#121212', height: '100vh' }} />;
  }

  if (isAuthenticated !== true) {
    return <LoginModal />;
  }

  return (
    <main className={styles.pageContainer}>
        {children}
    </main>
  );
}