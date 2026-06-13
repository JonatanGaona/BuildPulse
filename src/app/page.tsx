'use client';
import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useIncidentStore } from '@/store/useIncidentStore';
import IncidentDrawer from '@/components/map/IncidentDrawer';
import mockData from '@/mock/incidents_mock.json';

// Importación dinámica del mapa desactivando Server-Side Rendering (SSR)
const MapViewerWithNoSSR = dynamic(
  () => import('@/components/map/MapViewer'),
  { ssr: false, loading: () => <div style={{ padding: '2rem', color: '#666' }}>Cargando visor de obra...</div> }
);

export default function MapPage() {
  const setIncidents = useIncidentStore((state) => state.setIncidents);
  const filteredIncidents = useIncidentStore((state) => state.filteredIncidents);

  useEffect(() => {
    // Hidrata el estado global con la información del JSON
    setIncidents(mockData as any);
  }, [setIncidents]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* El mapa ocupará todo el espacio del contenedor blanco */}
      <MapViewerWithNoSSR />
      <IncidentDrawer />
    </div>
  );
}