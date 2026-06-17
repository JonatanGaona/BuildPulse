'use client';
import { useState } from 'react';
import { useIncidentStore } from '@/store/useIncidentStore';
import { Lock, Mail, AlertCircle } from 'lucide-react';
import styles from '@/styles/_login.module.scss';

export default function LoginModal() {
  const login = useIncidentStore((state) => state.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(email, password);
    if (!success) {
      setError('Credenciales incorrectas. Usa: admin@buildpulse.com / admin123');
    }
  };

  return (
    <div className={styles.loginOverlay}>
      <div className={styles.loginCard}>
        <div className={styles.logoTitle}>
          <h2>Build<span>Pulse</span></h2>
          <p>Gestión de Incidencias Operacionales de Obra</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.loginForm}>
          <div className={styles.inputGroup}>
            <label>Correo Electrónico</label>
            <div className={styles.inputWrapper}>
              <Mail size={16} className={styles.inputIcon} />
              <input 
                type="email" 
                placeholder="ejemplo@buildpulse.com" 
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                required 
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label>Contraseña</label>
            <div className={styles.inputWrapper}>
              <Lock size={16} className={styles.inputIcon} />
              <input 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                required 
              />
            </div>
          </div>

          {error && (
            <div className={styles.errorBanner}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <button type="submit" className={styles.btnSubmit}>
            Iniciar Sesión
          </button>
        </form>

        <div className={styles.loginFooter}>
          <p>Acceso BuildPuse •  2026</p>
        </div>
      </div>
    </div>
  );
}