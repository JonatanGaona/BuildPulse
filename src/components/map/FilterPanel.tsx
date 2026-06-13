'use client';
import { useIncidentStore } from '@/store/useIncidentStore';
import { Search, Filter } from 'lucide-react';
import styles from '../../styles/_filters.module.scss';

export default function FilterPanel() {
  const { 
    incidents, 
    filteredIncidents, 
    searchQuery, 
    setSearchQuery, 
    selectedType, 
    setSelectedType 
  } = useIncidentStore();

  // Extracción pro y dinámica de las categorías presentes en el JSON original
  const uniqueTypes = Array.from(
    new Map(incidents.map(item => [item.type.key, item.type])).values()
  );

  return (
    <div className={styles.filterControlPanel}>
      {/* Input de Búsqueda */}
      <div className={styles.searchBox}>
        <Search size={16} color="#718096" />
        <input 
          type="text" 
          placeholder="Buscar por título, descripción o ID..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Select de Categorías */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Filter size={16} color="#f2b724" />
        <select
          className={styles.categorySelect}
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
        >
          <option value="all">Todas las especialidades</option>
          {uniqueTypes.map((type) => (
            <option key={type.id} value={type.key}>
              {type.name}
            </option>
          ))}
        </select>
      </div>

      {/* Contador de Impacto Visual */}
      <div className={styles.resultsCounter}>
        <span>Resultados filtrados:</span>
        <div><strong>{filteredIncidents.length}</strong> / {incidents.length}</div>
      </div>
    </div>
  );
}