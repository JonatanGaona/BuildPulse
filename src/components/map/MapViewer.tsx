'use client';
import { useState } from 'react';
import Map, { Marker, NavigationControl } from 'react-map-gl';
import { useIncidentStore } from '@/store/useIncidentStore';
import { AlertTriangle, MapPin } from 'lucide-react';
import styles from '../../styles/_map.module.scss';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

export default function MapViewer() {
  const filteredIncidents = useIncidentStore((state) => state.filteredIncidents);
  const setSelectedIncident = useIncidentStore((state) => state.setSelectedIncident);
  
  const isCreating = useIncidentStore((state) => state.isCreating);
  const placementCoordinates = useIncidentStore((state) => state.placementCoordinates);
  const setPlacementCoordinates = useIncidentStore((state) => state.setPlacementCoordinates);

  // NUEVO: Bandera para saber si el mapa ya cargó en el navegador
  const [mapLoaded, setMapLoaded] = useState(false);

  const [viewport, setViewport] = useState({
    longitude: -74.05772,
    latitude: 4.652022,
    zoom: 15
  });

  const handleMapClick = (event: any) => {
    if (!isCreating) return;
    const { lng, lat } = event.lngLat;
    setPlacementCoordinates({ lng, lat });
  };

  if (!MAPBOX_TOKEN) return <div style={{ padding: '2rem', color: '#ef4444' }}>⚠️ Token faltante</div>;

  const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
    if (priority === 'high') return '#ef4444';
    if (priority === 'medium') return '#f59e0b';
    return '#22c55e';
  };

  return (
    <div className={styles.mapWrapper}>
      <Map
        {...viewport}
        onMove={evt => setViewport(evt.viewState)}
        mapStyle="mapbox://styles/mapbox/light-v11"
        mapboxAccessToken={MAPBOX_TOKEN}
        // SOLUCIÓN AL ESTILO: Aseguramos medidas fijas en el objeto style
        style={{ width: '100%', height: '100%', display: 'block' }}
        onClick={handleMapClick}
        cursor={isCreating ? 'crosshair' : 'grab'}
        // Escuchamos cuando el mapa esté 100% montado en el DOM
        onLoad={() => setMapLoaded(true)}
      >
        <NavigationControl position="top-right" showCompass={false} />

        {/* SOLUCIÓN AL APPENDCHILD: Solo pintamos marcadores si mapLoaded es TRUE */}
        {mapLoaded && (
          <>
            {/* PINES EXISTENTES */}
            {filteredIncidents.map((incident) => (
              <Marker
                key={incident.id}
                longitude={incident.coordinates.lng}
                latitude={incident.coordinates.lat}
                anchor="bottom"
              >
                <button className={styles.customMarker} onClick={() => setSelectedIncident(incident)}>
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

            {/* PIN TEMPORAL DE CREACIÓN */}
            {isCreating && placementCoordinates && (
              <Marker 
                longitude={placementCoordinates.lng} 
                latitude={placementCoordinates.lat} 
                anchor="bottom"
              >
                <div style={{ animation: 'bounce 1s infinite', cursor: 'pointer' }}>
                  <MapPin size={36} color="#f2b724" fill="#1a1a1a" />
                </div>
              </Marker>
            )}
          </>
        )}
      </Map>
    </div>
  );
}