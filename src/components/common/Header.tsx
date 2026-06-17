'use client';
import { useIncidentStore } from '@/store/useIncidentStore';
import { ChevronDown, Plus, HardHat, X } from 'lucide-react';
import styles from '../../styles/_layout.module.scss';

export default function Header() {
  const { selectedPeriod, setSelectedPeriod, isCreating, setIsCreating, setPlacementCoordinates } = useIncidentStore();

  const handleToggleCreate = () => {
    if (isCreating) {
      setIsCreating(false);
      setPlacementCoordinates(null);
    } else {
      setIsCreating(true);
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles.projectSelector}>
        <HardHat size={18} color="#f2b724" />
        <span>Torre Acqua - Etapa 2</span>
        <ChevronDown size={16} />
      </div>

      <div className={styles.topActions}>
        <select 
          className={styles.periodSelect}
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
        >
          <option value="7">Últimos 7 días</option>
          <option value="30">Últimos 30 días</option>
          <option value="90">Últimos 90 días</option>
          <option value="all">Todo el histórico</option>
        </select>

        <button 
          className={styles.btnPrimary} 
          onClick={handleToggleCreate}
          style={isCreating ? { backgroundColor: '#ef4444', color: '#fff' } : {}}
        >
          {isCreating ? <X size={16} /> : <Plus size={16} />}
          {isCreating ? 'Cancelar Registro' : 'Registrar Incidencia'}
        </button>
      </div>
    </header>
  );
}