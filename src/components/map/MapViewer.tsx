'use client';
import { useState, useMemo, useRef } from 'react';
import Map, { Marker, NavigationControl, Source, Layer, MapRef } from 'react-map-gl';
import { useIncidentStore } from '@/store/useIncidentStore';
import { AlertTriangle, MapPin } from 'lucide-react';
import styles from '../../styles/_map.module.scss';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

export default function MapViewer() {
  const mapRef = useRef<MapRef>(null); // Referencia para controlar el zoom al clickear clusters
  const filteredIncidents = useIncidentStore((state) => state.filteredIncidents);
  const setSelectedIncident = useIncidentStore((state) => state.setSelectedIncident);
  
  const isCreating = useIncidentStore((state) => state.isCreating);
  const placementCoordinates = useIncidentStore((state) => state.placementCoordinates);
  const setPlacementCoordinates = useIncidentStore((state) => state.setPlacementCoordinates);

  const [mapLoaded, setMapLoaded] = useState(false);
  const [viewport, setViewport] = useState({
    longitude: -74.05772,
    latitude: 4.652022,
    zoom: 15
  });

  // 1. CONVERTIR ARREGLO DE INCIDENCIAS A GEOJSON VALIDO CON CLUSTERING
  const geojsonData = useMemo(() => {
    return {
      type: 'FeatureCollection',
      features: filteredIncidents.map((incident) => ({
        type: 'Feature',
        properties: {
          id: incident.id,
          priority: incident.priority,
          isCluster: false
        },
        geometry: {
          type: 'Point',
          coordinates: [incident.coordinates.lng, incident.coordinates.lat]
        }
      }))
    };
  }, [filteredIncidents]);

  // 2. CAPAS DE ESTILO PARA LOS CLUSTERS (Estilo Spybee)
  const clusterLayer: any = {
    id: 'clusters',
    type: 'circle',
    source: 'incidents-source',
    filter: ['has', 'point_count'],
    paint: {
      'circle-color': ['step', ['get', 'point_count'], '#f2b724', 10, '#f4a261', 30, '#e63946'],
      'circle-radius': ['step', ['get', 'point_count'], 18, 10, 22, 30, 28],
      'circle-stroke-width': 2,
      'circle-stroke-color': '#ffffff'
    }
  };

  const clusterCountLayer: any = {
    id: 'cluster-count',
    type: 'symbol',
    source: 'incidents-source',
    filter: ['has', 'point_count'],
    layout: {
      'text-field': '{point_count_abbreviated}',
      'text-font': ['DIN Offc Pro Medium', 'Arial HTML Bold'],
      'text-size': 11
    },
    paint: {
      'text-color': '#1a1a1a'
    }
  };

  // Manejo de clicks en el mapa (Verifica si clickeó un cluster o el mapa base)
  const handleMapClick = (event: any) => {
    const map = mapRef.current;
    if (!map) return;

    // Buscamos si el click dio en la capa de clusters
    const features = map.queryRenderedFeatures(event.point, { layers: ['clusters'] });
    
    if (features.length > 0) {
      const clusterId = features[0].properties?.cluster_id;
      const mapboxSource: any = map.getMap().getSource('incidents-source');
      
      mapboxSource.getClusterExpansionZoom(clusterId, (err: any, zoom: number) => {
        if (err) return;
        const coordinates = (features[0].geometry as any).coordinates;
        map.easeTo({
          center: [coordinates[0], coordinates[1]],
          zoom: zoom + 0.5
        });
      });
      return; // Detiene la ejecución si fue click en cluster
    }

    // Si está creando y dio click en el mapa vacío, guarda coordenadas
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
        ref={mapRef} // Asignamos la referencia
        onMove={evt => setViewport(evt.viewState)}
        mapStyle="mapbox://styles/mapbox/light-v11"
        mapboxAccessToken={MAPBOX_TOKEN}
        style={{ width: '100%', height: '100%', display: 'block' }}
        onClick={handleMapClick}
        cursor={isCreating ? 'crosshair' : 'grab'}
        onLoad={() => setMapLoaded(true)}
        interactiveLayerIds={['clusters']} // Le dice a Mapbox que escuche clicks en esta capa
      >
        <NavigationControl position="top-right" showCompass={false} />

        {mapLoaded && (
          <>
            {/* INYECTAMOS LA FUENTE DE DATOS CON CLUSTERING DECLARATIVO */}
            <Source
              id="incidents-source"
              type="geojson"
              data={geojsonData as any}
              cluster={true}
              clusterMaxZoom={14}
              clusterRadius={45}
            >
              {/* Capas visuales para los grupos */}
              <Layer {...clusterLayer} />
              <Layer {...clusterCountLayer} />
            </Source>

            {/* PINES INDIVIDUALES: Se pintan usando Markers tradicionales sólo cuando no están agrupados */}
            {filteredIncidents.map((incident) => {
              // Si el zoom actual es muy bajo, dejamos que los clusters controlen el renderizado de mapas compactos
              // para no encimar marcadores HTML encima de los círculos de Mapbox
              if (viewport.zoom < 14.5) return null;

              return (
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
              );
            })}

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