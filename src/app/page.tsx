'use client';
import { useEffect } from 'react';
import { useIncidentStore } from '@/store/useIncidentStore';
import mockData from '@/mock/incidents_mock.json';

export default function MapPage() {
  const setIncidents = useIncidentStore((state) => state.setIncidents);
  const filteredIncidents = useIncidentStore((state) => state.filteredIncidents);

  useEffect(() => {
    // Hidrata el estado global con la información del JSON
    setIncidents(mockData as any);
  }, [setIncidents]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', padding: '2rem' }}>
      <div style={{ background: '#ffffff', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
        <h2 style={{ marginBottom: '0.5rem', fontWeight: 700 }}>Visor Geoespacial de Obra</h2>
        <p style={{ color: '#666' }}>
          Instancias analíticas cargadas exitosamente en Zustand: 
          <strong style={{ color: '#f2b724', marginLeft: '0.5rem', fontSize: '1.2rem' }}>{filteredIncidents.length}</strong>
        </p>
      </div>
    </div>
  );
}