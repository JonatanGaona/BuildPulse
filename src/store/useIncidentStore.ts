// src/store/useIncidentStore.ts
import { create } from 'zustand';

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
  isLoading: boolean;
  
  setIncidents: (incidents: Incident[]) => void;
  addIncident: (incident: Partial<Incident>) => void;
  setSelectedPeriod: (period: string) => void;
  applyFilters: () => void;
}

export const useIncidentStore = create<IncidentState>((set, get) => ({
  incidents: [],
  filteredIncidents: [],
  selectedPeriod: 'all',
  isLoading: false,

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
      assignees: [],
      observers: [],
      coordinates: newIncident.coordinates || { lat: 4.6520, lng: -74.0577 },
      locationDescription: newIncident.locationDescription || '',
      dueDate: newIncident.dueDate || null,
      closingDate: null,
      media: [],
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    set((state) => ({
      incidents: [generatedIncident, ...state.incidents],
    }));
    
    get().applyFilters();
  },

  setSelectedPeriod: (period) => {
    set({ selectedPeriod: period });
    get().applyFilters();
  },

  applyFilters: () => {
    const { incidents, selectedPeriod } = get();
    if (selectedPeriod === 'all') {
      set({ filteredIncidents: incidents });
      return;
    }

    // Basado en tu JSON de Mayo/Junio 2026, usamos el presente real de Junio 2026
    const referenceDate = new Date('2026-06-12'); 
    const daysLimit = parseInt(selectedPeriod, 10);

    const filtered = incidents.filter((incident) => {
      const incidentDate = new Date(incident.createdAt);
      const timeDifference = referenceDate.getTime() - incidentDate.getTime();
      const elapsedDays = timeDifference / (1000 * 60 * 60 * 24);
      
      return elapsedDays >= 0 && elapsedDays <= daysLimit;
    });

    set({ filteredIncidents: filtered });
  }
}));