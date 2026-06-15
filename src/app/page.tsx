'use client';
import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useIncidentStore } from '@/store/useIncidentStore';
import IncidentDrawer from '@/components/map/IncidentDrawer';
import FilterPanel from '@/components/map/FilterPanel';
import CreateIncidentForm from '@/components/map/CreateIncidentForm';
import AnalyticsDashboard from '@/components/dashboard/AnalyticsDashboard'; // <-- NUEVO
import mockData from '@/mock/incidents_mock.json';

const MapViewerWithNoSSR = dynamic(
  () => import('@/components/map/MapViewer'),
  { ssr: false, loading: () => <div style={{ padding: '2rem', color: '#666' }}>Cargando visor de obra...</div> }
);

export default function MapPage() {
  const setIncidents = useIncidentStore((state) => state.setIncidents);
  const activeTab = useIncidentStore((state) => state.activeTab); // <-- NUEVO: Escuchamos la pestaña activa

  useEffect(() => {
    setIncidents(mockData as any);
  }, [setIncidents]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', display: 'flex', overflow: 'hidden' }}>
      
      {/* Renderizado condicional según el Menú Lateral */}
      {activeTab === 'map' ? (
        <>
          <FilterPanel /> 
          <MapViewerWithNoSSR />
          <IncidentDrawer />
          <CreateIncidentForm />
        </>
      ) : (
        <AnalyticsDashboard /> // <-- Si la pestaña cambia, se renderiza el Dashboard limpio
      )}
      
    </div>
  );
}