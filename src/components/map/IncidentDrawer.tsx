'use client';
import { useIncidentStore } from '@/store/useIncidentStore';
import { X, Calendar, MapPin, Film } from 'lucide-react';
import styles from '../../styles/_drawer.module.scss';

export default function IncidentDrawer() {
  const { selectedIncident, setSelectedIncident } = useIncidentStore();

  return (
    <div className={`${styles.drawerOverlay} ${selectedIncident ? styles.active : ''}`}>
      <div className={styles.drawerHeader}>
        <h3>Detalle de Incidencia</h3>
        <button className={styles.btnClose} onClick={() => setSelectedIncident(null)}>
          <X size={20} />
        </button>
      </div>

      {selectedIncident && (
        <div className={styles.drawerContent}>
          <div>
            <div className={styles.badgeGroup} style={{ marginBottom: '0.75rem' }}>
              <span className={`${styles.badge} ${styles[selectedIncident.priority]}`}>
                {selectedIncident.priority}
              </span>
              <span className={`${styles.badge} ${styles[selectedIncident.status]}`}>
                {selectedIncident.status}
              </span>
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, lineHeight: 1.3 }}>
              {selectedIncident.title}
            </h2>
            <p style={{ fontSize: '0.9rem', color: '#4a5568', marginTop: '0.5rem' }}>
              {selectedIncident.description}
            </p>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0' }} />

          <div>
            <div className={styles.sectionTitle}>Localización e Historial</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MapPin size={16} color="#718096" />
                <span>{selectedIncident.locationDescription} ({selectedIncident.project.name})</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar size={16} color="#718096" />
                <span>Creado el: {new Date(selectedIncident.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div>
            <div className={styles.sectionTitle}>Reportado por</div>
            <div className={styles.userCard}>
              <img src={selectedIncident.owner.avatarUrl} alt={selectedIncident.owner.name} />
              <div className={styles.userInfo}>
                <span>{selectedIncident.owner.name}</span>
                <small>{selectedIncident.owner.email}</small>
              </div>
            </div>
          </div>

          {selectedIncident.assignees.length > 0 && (
            <div>
              <div className={styles.sectionTitle}>Responsables Asignados</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {selectedIncident.assignees.map((user) => (
                  <div key={user.id} className={styles.userCard}>
                    <img src={user.avatarUrl} alt={user.name} />
                    <div className={styles.userInfo}>
                      <span>{user.name}</span>
                      <small>{user.email}</small>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedIncident.media.length > 0 && (
            <div>
              <div className={styles.sectionTitle}>Evidencias Adjuntas ({selectedIncident.media.length})</div>
              <div className={styles.mediaGrid}>
                {selectedIncident.media.map((item) => (
                  <div key={item.id} className={styles.mediaThumb}>
                    <img src={item.url} alt={item.name} />
                    {item.type === 'video' && (
                      <span className={styles.videoBadge}>
                        <Film size={10} style={{ display: 'inline', marginRight: '2px' }} />
                        {item.format}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}