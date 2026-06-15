// src/store/useIncidentStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface UserRef {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
}

export interface MediaRef {
  id: string;
  name: string;
  type: 'image' | 'video';
  format: string;
  size: number;
  status: string;
  url: string;
}

export interface TagRef {
  id: string;
  name: string;
  color: string;
}

export interface Incident {
  id: string;
  sequenceId: string;
  order: number;
  title: string;
  description: string;
  type: {
    id: string;
    key: string;
    name: string;      // "Hidrosanitario"
    name_en: string;   // "Plumbing"
  };
  priority: 'low' | 'medium' | 'high'; // Mapeado a los strings del JSON
  status: 'open' | 'paused' | 'closed';  // Mapeado a los strings del JSON
  approval: boolean;
  project: {
    id: string;
    name: string;
  };
  owner: UserRef;
  assignees: UserRef[];
  observers: UserRef[];
  coordinates: {
    lat: number;
    lng: number;
  };
  locationDescription: string;
  dueDate: string | null;
  closingDate: string | null;
  media: MediaRef[];
  tags: TagRef[];
  createdAt: string;
  updatedAt: string;
}

interface IncidentState {
  incidents: Incident[];
  filteredIncidents: Incident[];
  selectedPeriod: string; // '7' | '30' | '90' | 'all'
  searchQuery: string;
  selectedType: string; // 'all' o la 'key' del tipo (ej: 'plumbing')
  isLoading: boolean;
  selectedIncident: Incident | null;
  isCreating: boolean;
  placementCoordinates: { lat: number; lng: number } | null;
  activeTab: 'map' | 'dashboard';
  
  setIncidents: (incidents: Incident[]) => void;
  addIncident: (incident: Partial<Incident>) => void;
  setSelectedPeriod: (period: string) => void;
  setSearchQuery: (query: string) => void;
  setSelectedType: (type: string) => void;
  setSelectedIncident: (incident: Incident | null) => void;
  applyFilters: () => void;
  setIsCreating: (active: boolean) => void;
  setPlacementCoordinates: (coords: { lat: number; lng: number } | null) => void;
  setActiveTab: (tab: 'map' | 'dashboard') => void;
}

export const useIncidentStore = create<IncidentState>()(
  persist(
    (set, get) => ({
      incidents: [],
      filteredIncidents: [],
      selectedPeriod: 'all',
      searchQuery: '',
      selectedType: 'all',
      isLoading: false,
      selectedIncident: null,
      isCreating: false,
      placementCoordinates: null,
      activeTab: 'map',
      setIncidents: (data) => set({ incidents: data, filteredIncidents: data }),

      addIncident: (newIncident) => {
        const totalCount = get().incidents.length + 1;
        const generatedIncident: Incident = {
          id: Math.random().toString(16).slice(2, 26), // Genera un hash similar al del JSON
          sequenceId: String(totalCount).padStart(4, '0'),
          order: totalCount,
          title: newIncident.title || '',
          description: newIncident.description || '',
          type: newIncident.type || { id: 'custom', key: 'general', name: 'General', name_en: 'General' },
          priority: newIncident.priority || 'medium',
          status: 'open',
          approval: false,
          project: newIncident.project || { id: 'p1', name: 'Proyecto Principal' },
          owner: {
            id: 'current-user',
            name: 'Jonatan Gaona',
            email: 'jonatan@dev.com',
            avatarUrl: 'https://i.pravatar.cc/150?u=jonatan'
          },
          assignees: newIncident.assignees || [],
          observers: [],
          coordinates: newIncident.coordinates || { lat: 4.6520, lng: -74.0577 },
          locationDescription: newIncident.locationDescription || '',
          dueDate: newIncident.dueDate || null,
          closingDate: null,
          media: newIncident.media || [],
          tags: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          incidents: [generatedIncident, ...state.incidents],
        }));
        
        get().applyFilters();
      },

      setSelectedIncident: (incident) => set({ selectedIncident: incident }),

      setSelectedPeriod: (period) => {
        set({ selectedPeriod: period });
        get().applyFilters();
      },

      setSearchQuery: (query) => {
        set({ searchQuery: query });
        get().applyFilters();
      },

      setSelectedType: (type) => {
        set({ selectedType: type });
        get().applyFilters();
      },

      setActiveTab: (tab) => set({ activeTab: tab }),

      applyFilters: () => {
        const { incidents, selectedPeriod, searchQuery, selectedType } = get();
        
        let result = [...incidents];

        // 1. Filtrado por Periodo de Tiempo (Basado en el presente de Junio 2026)
        if (selectedPeriod !== 'all') {
          const referenceDate = new Date('2026-06-12'); 
          const daysLimit = parseInt(selectedPeriod, 10);

          result = result.filter((incident) => {
            const incidentDate = new Date(incident.createdAt);
            const timeDifference = referenceDate.getTime() - incidentDate.getTime();
            const elapsedDays = timeDifference / (1000 * 60 * 60 * 24);
            return elapsedDays >= 0 && elapsedDays <= daysLimit;
          });
        }

        // 2. Filtrado por Categoría / Tipo
        if (selectedType !== 'all') {
          result = result.filter((incident) => incident.type.key === selectedType);
        }

        // 3. Filtrado por Buscador de Texto (Búsqueda difusa en título o descripción)
        if (searchQuery.trim() !== '') {
          const query = searchQuery.toLowerCase();
          result = result.filter(
            (incident) =>
              incident.title.toLowerCase().includes(query) ||
              incident.description.toLowerCase().includes(query) ||
              incident.sequenceId.includes(query)
          );
        }

        set({ filteredIncidents: result });
      },

      setIsCreating: (active) => set({ isCreating: active }),
      setPlacementCoordinates: (coords) => set({ placementCoordinates: coords }),
    }),
    {
      name: 'buildpulse-incidents-storage', // <-- Clave única para guardar en el navegador
      partialize: (state) => ({ incidents: state.incidents }), // Opcional: solo guarda la lista base
    }
  )
);