'use client';
import { useState } from 'react';
import Map, { Marker, NavigationControl } from 'react-map-gl';
import { useIncidentStore } from '@/store/useIncidentStore';
import { AlertTriangle } from 'lucide-react';
import styles from '../../styles/_map.module.scss';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

export default function MapViewer() {
  const filteredIncidents = useIncidentStore((state) => state.filteredIncidents);
  
  // Coordenadas iniciales fijadas en la zona de las incidencias del JSON (Bogotá)
  const [viewport, setViewport] = useState({
    longitude: -74.05772,
    latitude: 4.652022,
    zoom: 15
  });

  if (!MAPBOX_TOKEN) {
    return (
      <div style={{ padding: '2rem', color: '#ef4444', fontWeight: 600 }}>
        ⚠️ Error: No se detectó el token de Mapbox. Asegúrate de configurarlo en tu archivo .env.local
      </div>
    );
  }

  // Función para determinar el color del icono según la prioridad del JSON
  const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
    if (priority === 'high') return '#ef4444'; // Rojo
    if (priority === 'medium') return '#f59e0b'; // Naranja
    return '#22c55e'; // Verde
  };

  const setSelectedIncident = useIncidentStore((state) => state.setSelectedIncident);

  return (
    <div className={styles.mapWrapper}>
      <Map
        initialViewState={{
          longitude: viewport.longitude,
          latitude: viewport.latitude,
          zoom: viewport.zoom
        }}
        onMove={evt => setViewport(evt.viewState)}
        mapStyle="mapbox://styles/mapbox/light-v11"
        mapboxAccessToken={MAPBOX_TOKEN}
        // SOLUCIÓN: Usamos la propiedad style oficial en lugar de className
        style={{ width: '100%', height: '100%' }} 
      >
        {/* Controles de Zoom nativos de Mapbox arriba a la derecha */}
        <NavigationControl position="top-right" showCompass={false} />

        {/* Mapeo reactivo de las incidencias filtradas en Zustand */}
        {filteredIncidents.map((incident) => (
          <Marker
            key={incident.id}
            longitude={incident.coordinates.lng}
            latitude={incident.coordinates.lat}
            anchor="bottom"
          >
            <button 
              className={styles.customMarker}
              onClick={() => setSelectedIncident(incident)}
            >
              <div className={`${styles.markerPin} ${styles[incident.priority]}`}>
                <AlertTriangle 
                  size={16} 
                  color={getPriorityColor(incident.priority)} 
                  fill={getPriorityColor(incident.priority) + '20'} 
                />
              </div>
            </button>
          </Marker>
        ))}
      </Map>
    </div>
  );
}