// src/app/dashboard/page.tsx
'use client';
import { useIncidentStore } from '@/store/useIncidentStore';

export default function DashboardPage() {
  const filteredIncidents = useIncidentStore((state) => state.filteredIncidents);

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ background: '#ffffff', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
        <h2 style={{ marginBottom: '0.5rem', fontWeight: 700 }}>Panel Analítico de Control</h2>
        <p style={{ color: '#666' }}>
          Métricas calculadas basándose en el filtro temporal activo. 
          Incidencias a procesar: <strong style={{ color: '#3b82f6' }}>{filteredIncidents.length}</strong>
        </p>
      </div>
    </div>
  );
}