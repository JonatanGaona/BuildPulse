'use client';
import { useState } from 'react';
import { useIncidentStore } from '@/store/useIncidentStore';
import { Search, Filter, SlidersHorizontal, X } from 'lucide-react';
import styles from '../../styles/_filters.module.scss';

export default function FilterPanel() {
  const [isOpen, setIsOpen] = useState(false);
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
    <>
      {/* BOTÓN PÍLDORA DISPARADOR (Se ve siempre flotando limpio sobre el mapa) */}
      <button 
        className={styles.filterTriggerBtn} 
        onClick={() => setIsOpen(!isOpen)}
        title="Filtrar incidencias"
      >
        <SlidersHorizontal size={16} color="#ffffff" />
        <span>Filtros</span>
      </button>

      {/* PANEL FLOTANTE CONDICIONAL */}
      {isOpen && (
        <div className={styles.floatingFilterCard}>
          
          {/* Cabecera minimalista superior para cerrar */}
          <div className={styles.filterHeader}>
            <span>Filtros de búsqueda</span>
            <button onClick={() => setIsOpen(false)} className={styles.btnClose}>
              <X size={16} />
            </button>
          </div>

          {/* Cuerpo del panel con tus controles originales */}
          <div className={styles.filterBody}>
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

        </div>
      )}
    </>
  );
}