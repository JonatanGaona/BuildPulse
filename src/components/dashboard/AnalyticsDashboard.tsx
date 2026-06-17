'use client';
import { useMemo, useState } from 'react';
import { useIncidentStore } from '@/store/useIncidentStore';
import { ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Folder, PlusCircle, CheckCircle, Percent, Clock, AlertCircle, AlertTriangle, CalendarClock, SlidersHorizontal, X } from 'lucide-react';
import styles from '../../styles/_dashboard.module.scss';

function getRelativeDueDate(dueDateString?: string): string {
  if (!dueDateString) return 'Sin fecha';
  
  const today = new Date();
  const dueDate = new Date(dueDateString);
  
  if (isNaN(dueDate.getTime())) return 'Fecha inválida';

  // Diferencia en milisegundos convertida a días enteros
  const diffTime = today.getTime() - dueDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays > 0) {
    return `Vencida hace ${diffDays}d`;
  } else if (diffDays === 0) {
    return 'Vence hoy';
  } else {
    return `Faltan ${Math.abs(diffDays)}d`;
  }
}

export default function AnalyticsDashboard() {
  const filteredIncidents = useIncidentStore((state) => state.filteredIncidents);
  const [showFilters, setShowFilters] = useState(false);

  // Estados de los filtros flotantes
  const [companyCreated, setCompanyCreated] = useState('all');
  const [companyResponsible, setCompanyResponsible] = useState('all');
  const [userResponsible, setUserResponsible] = useState('all');
  const [activeSubTab, setActiveSubTab] = useState<'frentes' | 'empresas'>('frentes');

  const availableProjects = useMemo(() => {
    const projectMap = new Map<string, string>();
    filteredIncidents.forEach((incident) => {
      if (incident.project?.id) {
        projectMap.set(incident.project.id, incident.project.name);
      }
    });
    return Array.from(projectMap.entries()).map(([id, name]) => ({ id, name }));
  }, [filteredIncidents]);

  // 1. CORRECCIÓN CRÍTICA: Filtramos la data localmente antes de calcular métricas
  const dashboardData = useMemo(() => {
    return filteredIncidents.filter((incident) => {
      
      // Filtro por Creado por Compañía (Simulado con el nombre del proyecto o tags si no hay campo)
      if (companyCreated !== 'all') {
        // Ejemplo: Si el id del proyecto no coincide, se descarta
        if (incident.project.id !== companyCreated) return false;
      }

      // Filtro por Responsable por Compañía (Simulado)
      if (companyResponsible !== 'all') {
        if (incident.type.key !== companyResponsible) return false;
      }

      // Filtro por Usuario Responsable Asignado (Real con datos del JSON)
      if (userResponsible !== 'all') {
        // Buscamos si el ID del usuario seleccionado está en el arreglo de assignees
        const isAssigned = incident.assignees?.some(user => user.id === userResponsible);
        
        // Mapeo especial para los usuarios mockeados de tu select:
        if (userResponsible === 'u1') {
          return incident.assignees?.some(u => u.name === 'Daniela Acosta');
        }
        if (userResponsible === 'u2') {
          return incident.assignees?.some(u => u.name === 'Sebastián Méndez');
        }
        
        if (!isAssigned) return false;
      }

      return true;
    });
  }, [filteredIncidents, companyCreated, companyResponsible, userResponsible]);

  // 1. Cómputo de Métricas Avanzadas
  // 2. Ahora recalculamos las métricas usando el arreglo ya filtrado (dashboardData)
  const metrics = useMemo(() => {
    const total = dashboardData.length;
    const open = dashboardData.filter(i => i.status === 'open').length;
    const paused = dashboardData.filter(i => i.status === 'paused').length;
    const closed = dashboardData.filter(i => i.status === 'closed').length;
    const high = dashboardData.filter(i => i.priority === 'high').length;
    const medium = dashboardData.filter(i => i.priority === 'medium').length;
    const low = dashboardData.filter(i => i.priority === 'low').length;
    
    const vencidasHoy = dashboardData.filter(i => i.priority === 'high' && i.status === 'open').length;
    const sinActualizar7d = dashboardData.filter(i => i.status === 'open').length;
    const proximasVencer = dashboardData.filter(i => i.priority === 'medium' && i.status === 'open').length;

    const closureRate = total > 0 ? Math.round((closed / total) * 100) : 0;

    return { 
      total, open, paused, closed, high, medium, low, closureRate,
      vencidasHoy, sinActualizar7d, proximasVencer
    };
  }, [dashboardData]); // Depende estrictamente del arreglo filtrado arriba

  const handleCleanFilters = () => {
    setCompanyCreated('all');
    setCompanyResponsible('all');
    setUserResponsible('all');
    setShowFilters(false);
  };

  // Data para gráficos circulares
  const statusData = [
    { name: 'Abierta', value: metrics.open, color: '#2b9348' },
    { name: 'Pausada', value: metrics.paused, color: '#e9c46a' },
    { name: 'Cerrada', value: metrics.closed, color: '#6c757d' }
  ].filter(d => d.value > 0);

  const priorityData = [
    { name: 'Alta', value: metrics.high, color: '#e63946' },
    { name: 'Media', value: metrics.medium, color: '#f4a261' },
    { name: 'Baja', value: metrics.low, color: '#2a9d8f' }
  ].filter(d => d.value > 0);

  // Histórico para la tendencia
  const timelineData = [
    { date: '19 May', 'Incidencias Creadas': Math.round(metrics.total * 0.2), 'Casos Cerrados': Math.round(metrics.closed * 0.1) },
    { date: '26 May', 'Incidencias Creadas': Math.round(metrics.total * 0.5), 'Casos Cerrados': Math.round(metrics.closed * 0.4) },
    { date: '02 Jun', 'Incidencias Creadas': Math.round(metrics.total * 0.8), 'Casos Cerrados': Math.round(metrics.closed * 0.7) },
    { date: '09 Jun', 'Incidencias Creadas': metrics.total, 'Casos Cerrados': metrics.closed },
  ];

  return (
    <div className={styles.dashboardWrapper}>
      {/* HEADER */}
      <div className={styles.dashboardHeader}>
        <div className={styles.subtitle}>
          Resumen general · Indicadores clave del período analizado
        </div>
        
        <div style={{ display: 'flex', gap: '0.75rem', position: 'relative' }}>
          <button 
            className={`${styles.btnFilterPopover} ${showFilters ? styles.active : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal size={14} />
            Filtros
          </button>

          <button className={styles.btnPdf}>
            Exportar reporte
          </button>

          {/* POPOVER FLOTANTE CON FILTROS CONTROLADOS */}
          {showFilters && (
            <div className={styles.filterPopover}>
              <div className={styles.popoverHeader}>
                <h5>Filtros del dashboard</h5>
                <button onClick={() => setShowFilters(false)}><X size={14} /></button>
              </div>
              
              <div className={styles.popoverBody}>
                {/* Selector 1 */}
                <div className={styles.formGroup}>
                    <label>Proyecto de Origen</label>
                    <select 
                        value={companyCreated} 
                        onChange={(e) => setCompanyCreated(e.target.value)}
                    >
                        <option value="all">Todos los proyectos</option>
                        {availableProjects.map((project) => (
                        <option key={project.id} value={project.id}>{project.name}</option>
                        ))}
                    </select>
                </div>

                {/* Selector 2 */}
                <div className={styles.formGroup}>
                    <label>Especialidad / Frente</label>
                    <select 
                        value={companyResponsible} 
                        onChange={(e) => setCompanyResponsible(e.target.value)}
                    >
                        <option value="all">Todas las especialidades</option>
                        <option value="structural">Estructura</option>
                        <option value="plumbing">Hidrosanitario</option>
                        <option value="electrical">Eléctrico</option>
                        <option value="finishes">Acabados</option>
                    </select>
                </div>

                {/* Selector 3 */}
                <div className={styles.formGroup}>
                  <label>Responsable por usuario</label>
                  <select 
                    value={userResponsible} 
                    onChange={(e) => setUserResponsible(e.target.value)}
                  >
                    <option value="all">Todos los usuarios</option>
                    <option value="u1">Daniela Acosta</option>
                    <option value="u2">Sebastián Méndez</option>
                  </select>
                </div>
              </div>

              <div className={styles.popoverFooter}>
                <button className={styles.btnClean} onClick={handleCleanFilters}>
                  Limpiar
                </button>
                <button className={styles.btnApply} onClick={() => setShowFilters(false)}>
                  Aplicar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* GRID DE CARDS PRINCIPALES */}
      <div className={styles.spybeeKpiGrid}>
        <div className={`${styles.spybeeCard} ${styles.green}`}>
          <div className={styles.cardMain}>
            <label>Abiertas</label>
            <div className={styles.value}>{metrics.open}</div>
            <div className={styles.context}>en seguimiento</div>
          </div>
          <Folder size={16} className={styles.cardIcon} />
        </div>

        <div className={`${styles.spybeeCard} ${styles.blue}`}>
          <div className={styles.cardMain}>
            <label>Creadas</label>
            <div className={styles.value}>{metrics.total}</div>
            <div className={styles.trendUp}>↑ Ajustado al período</div>
          </div>
          <PlusCircle size={16} className={styles.cardIcon} />
        </div>

        <div className={`${styles.spybeeCard} ${styles.red}`}>
          <div className={styles.cardMain}>
            <label>Cerradas</label>
            <div className={styles.value}>{metrics.closed}</div>
            <div className={styles.context}>completadas con éxito</div>
          </div>
          <CheckCircle size={16} className={styles.cardIcon} />
        </div>

        <div className={`${styles.spybeeCard} ${styles.orange}`}>
          <div className={styles.cardMain}>
            <label>Tasa de cierre</label>
            <div className={styles.value}>{metrics.closureRate}%</div>
            <div className={styles.context}>eficiencia de resolución</div>
          </div>
          <Percent size={16} className={styles.cardIcon} />
        </div>

        <div className={`${styles.spybeeCard} ${styles.blue}`}>
          <div className={styles.cardMain}>
            <label>Tiempo de respuesta</label>
            <div className={styles.value}>5.2d</div>
            <div className={styles.context}>promedio global</div>
          </div>
          <Clock size={16} className={styles.cardIcon} />
        </div>

        <div className={`${styles.spybeeCard} ${styles.red}`}>
          <div className={styles.cardMain}>
            <label>Críticas Activas</label>
            <div className={styles.value}>{metrics.high}</div>
            <div className={styles.context}>requieren atención inmediata</div>
          </div>
          <AlertCircle size={16} className={styles.cardIcon} />
        </div>
      </div>

      {/* BLOQUE MEDIO: GRÁFICOS CIRCULARES */}
      <div className={styles.mainVisualGrid}>
        <div className={styles.spybeeChartPanel}>
          <h4>Por estado <span className={styles.badgeCount}>{metrics.total}</span></h4>
          <div className={styles.chartLayoutRow}>
            <div className={styles.pieWrapper} style={{ minWidth: '100px', height: '140px' }}>
              <ResponsiveContainer width="99%" height={140} minWidth={0}>
                <PieChart>
                  <Pie 
                    data={statusData} 
                    innerRadius={35} 
                    outerRadius={48} 
                    paddingAngle={3} 
                    dataKey="value"
                    cx="50%"
                    cy="50%"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className={styles.advancedLegendList}>
              {statusData.map((item, index) => (
                <div key={index} className={styles.legendRow}>
                  <span className={styles.dot} style={{ backgroundColor: item.color }} />
                  <span className={styles.labelName}>{item.name}</span>
                  <div className={styles.progressBarBg}>
                    <div className={styles.progressFill} style={{ width: `${(item.value / metrics.total) * 100}%`, backgroundColor: item.color }} />
                  </div>
                  <span className={styles.numericValue}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.spybeeChartPanel}>
          <h4>Por prioridad <span className={styles.badgeCount}>{metrics.total}</span></h4>
          <div className={styles.chartLayoutRow}>
            <div className={styles.pieWrapper} style={{ minWidth: '100px', height: '140px' }}>
              <ResponsiveContainer width="99%" height={140} minWidth={0}>
                <PieChart>
                  <Pie 
                    data={priorityData} 
                    innerRadius={35} 
                    outerRadius={48} 
                    paddingAngle={3} 
                    dataKey="value"
                    cx="50%"
                    cy="50%"
                  >
                    {priorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className={styles.advancedLegendList}>
              {priorityData.map((item, index) => (
                <div key={index} className={styles.legendRow}>
                  <span className={styles.dot} style={{ backgroundColor: item.color }} />
                  <span className={styles.labelName}>{item.name}</span>
                  <div className={styles.progressBarBg}>
                    <div className={styles.progressFill} style={{ width: `${(item.value / metrics.total) * 100}%`, backgroundColor: item.color }} />
                  </div>
                  <span className={styles.numericValue}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* GRÁFICO INFERIOR: TENDENCIA */}
      <div className={styles.fullWidthPanel}>
        <div className={styles.panelMeta}>
          <h4>Tendencia de incidencias</h4>
          <p>Evolución del flujo de trabajo acumulado contra casos cerrados en obra</p>
        </div>
        <div style={{ width: '100%', height: 180, minWidth: 0 }}>
          <ResponsiveContainer width="99%" height={180} minWidth={0} id="tendencia-chart">
            <AreaChart data={timelineData} margin={{ top: 10, right: 20, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCreadas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#224263" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#224263" stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="colorCerradas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#28a745" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#28a745" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f5" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#adb5bd' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#adb5bd' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e9ecef', borderRadius: '4px', fontSize: '11px' }} />
              <Area type="monotone" dataKey="Incidencias Creadas" stroke="#224263" strokeWidth={2} fillOpacity={1} fill="url(#colorCreadas)" />
              <Area type="monotone" dataKey="Casos Cerrados" stroke="#28a745" strokeWidth={2} fillOpacity={1} fill="url(#colorCerradas)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ======================================================== */}
      {/* PASO 1: INDICADORES DE RIESGO CON CHIPS (ESTILO SPYBEE) */}
      {/* ======================================================== */}
      <div className={styles.riskIndicatorsSection}>
        <label>Indicadores de riesgo</label>
        <span className={styles.helperText}>Click en cada chip para ver el detalle de alertas accionables</span>
        
        <div className={styles.indicatorsGrid}>
          <div className={styles.riskChip}>
            <div className={styles.chipLeft}>
              <AlertCircle size={14} color="#e63946" />
              <span>Vencidas hoy</span>
            </div>
            <div className={`${styles.chipCount} ${styles.critical}`}>{metrics.vencidasHoy}</div>
          </div>

          <div className={styles.riskChip}>
            <div className={styles.chipLeft}>
              <Clock size={14} color="#f4a261" />
              <span>Sin actualizar 7d+ (actual)</span>
            </div>
            <div className={styles.chipCount}>{metrics.sinActualizar7d}</div>
          </div>

          <div className={styles.riskChip}>
            <div className={styles.chipLeft}>
              <AlertTriangle size={14} color="#e63946" />
              <span>Alta prioridad abiertas</span>
            </div>
            <div className={`${styles.chipCount} ${styles.critical}`}>{metrics.high}</div>
          </div>

          <div className={styles.riskChip}>
            <div className={styles.chipLeft}>
              <CalendarClock size={14} color="#2a9d8f" />
              <span>Próximas a vencer (7d)</span>
            </div>
            <div className={styles.chipCount}>{metrics.proximasVencer}</div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* PASO 2: TABLA DE HALLAZGOS CRÍTICOS (ESTILO SPYBEE)      */}
      {/* ======================================================== */}
      <div className={styles.tableSection}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h4>Críticas para hoy</h4>
          <span className={styles.badgeCount}>
            {filteredIncidents.filter(i => i.priority === 'high' && i.status === 'open').length} en total
          </span>
        </div>
        <p className={styles.tableMeta}>Alta prioridad o con fecha próxima de vencimiento operativo</p>

        <div style={{ overflowX: 'auto' }}>
          <table className={styles.spybeeTable}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Título</th>
                <th>Prioridad</th>
                <th>Estado</th>
                <th>Asignados</th>
                <th>Creado por</th>
                <th>Vencimiento</th>
              </tr>
            </thead>
            <tbody>
              {dashboardData
                .filter(i => i.priority === 'high' && i.status !== 'closed')
                .slice(0, 6)
                .map((incident) => (
                  <tr key={incident.id}>
                    {/* Columna ID */}
                    <td className={styles.incidentId}>#{incident.sequenceId || '0000'}</td>
                    
                    {/* Columna Título */}
                    <td className={styles.incidentTitle}>{incident.title}</td>
                    
                    {/* Columna Prioridad con Badge de Color */}
                    <td>
                      <span className={`${styles.badgeTable} ${styles[incident.priority]}`}>
                        {incident.priority === 'high' ? 'Alta' : incident.priority === 'medium' ? 'Media' : 'Baja'}
                      </span>
                    </td>
                    
                    {/* Columna Estado con Badge de Color */}
                    <td>
                      <span className={`${styles.badgeTable} ${styles[incident.status]}`}>
                        {incident.status === 'open' ? 'Abierta' : incident.status === 'paused' ? 'Pausada' : 'Cerrada'}
                      </span>
                    </td>
                    
                    {/* Columna Asignados (Solapamiento de Burbujas) */}
                    <td>
                      <div className={styles.avatarStack}>
                        {incident.assignees && incident.assignees.length > 0 ? (
                          incident.assignees.slice(0, 3).map((user, idx) => (
                            <img 
                              key={user.id || idx} 
                              src={user.avatarUrl || 'https://i.pravatar.cc/50'} 
                              alt={user.name} 
                              title={user.name}
                              className={styles.stackAvatar} 
                            />
                          ))
                        ) : (
                          <span className={styles.noAssignees}>Sin asignar</span>
                        )}
                      </div>
                    </td>
                    
                    {/* Columna Creado por */}
                    <td style={{ color: '#495057', fontSize: '0.75rem' }}>
                      {incident.owner?.name || 'Sistema'}
                    </td>
                    
                    {/* Columna Vencimiento con Lógica Relativa Real */}
                    <td>
                      {incident.status !== 'closed' ? (
                        <span className={styles.textVencimiento}>
                          {getRelativeDueDate(incident.dueDate || incident.createdAt)} 
                        </span>
                      ) : (
                        <span style={{ color: '#868e96', fontSize: '0.75rem' }}>Finalizado</span>
                      )}
                    </td>
                  </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* ======================================================== */}
      {/* PASO 3: DISTRIBUCIÓN ESPACIAL Y DESEMPEÑO (ESTILO SPYBEE) */}
      {/* ======================================================== */}
      <div className={styles.distributionSection}>
        <div className={styles.panelMeta}>
          <h4>Distribución espacial de criticidad</h4>
          <p>Ubicación analítica de incidencias activas agrupadas por sectores y responsables de obra</p>
        </div>

        <div className={styles.distributionGrid}>
          {/* LADO IZQUIERDO: SIMULACIÓN DEL MINI MAPA DE CALOR */}
          <div className={styles.miniMapCanvas}>
            <div className={styles.heatOverlay} />
            <div className={styles.mapBadgeFloating}>Vista Analítica</div>
            
            {/* Pines flotantes con animación de pulso simulando clusters de la obra */}
            <div className={`${styles.heatPin} ${styles.p1}`} style={{ top: '30%', left: '40%' }}>12</div>
            <div className={`${styles.heatPin} ${styles.p2}`} style={{ top: '60%', left: '70%' }}>5</div>
            <div className={`${styles.heatPin} ${styles.p3}`} style={{ top: '45%', left: '25%' }}>3</div>
          </div>

          {/* LADO DERECHO: PANEL INTERACTIVO CON SUB-TABS COMPACTOS */}
          <div className={styles.frentesListPanel}>
            {/* Cabecera de navegación interna */}
            <div className={styles.subTabHeader}>
              <button 
                className={activeSubTab === 'frentes' ? styles.active : ''} 
                onClick={() => setActiveSubTab('frentes')}
              >
                Frentes Operativos
              </button>
              <button 
                className={activeSubTab === 'empresas' ? styles.active : ''} 
                onClick={() => setActiveSubTab('empresas')}
              >
                Empresas Responsables
              </button>
            </div>
            
            {/* Renderizado condicional basado en el switch de pestañas */}
            {activeSubTab === 'frentes' ? (
              <div className={styles.tabContentContainer}>
                <div className={styles.frenteRow}>
                  <div className={styles.frenteMeta}>
                    <span className={styles.frenteName}>Sector A - Estructura / Torre 1</span>
                    <span className={styles.frenteCount}>12 críticas</span>
                  </div>
                  <div className={styles.progressBarBg}>
                    <div className={styles.progressFill} style={{ width: '65%', backgroundColor: '#e63946' }} />
                  </div>
                </div>

                <div className={styles.frenteRow}>
                  <div className={styles.frenteMeta}>
                    <span className={styles.frenteName}>Sector B - Redes Hidrosanitarias</span>
                    <span className={styles.frenteCount}>5 activas</span>
                  </div>
                  <div className={styles.progressBarBg}>
                    <div className={styles.progressFill} style={{ width: '35%', backgroundColor: '#f4a261' }} />
                  </div>
                </div>

                <div className={styles.frenteRow}>
                  <div className={styles.frenteMeta}>
                    <span className={styles.frenteName}>Sector C - Acabados e Interiores</span>
                    <span className={styles.frenteCount}>3 reportadas</span>
                  </div>
                  <div className={styles.progressBarBg}>
                    <div className={styles.progressFill} style={{ width: '18%', backgroundColor: '#2a9d8f' }} />
                  </div>
                </div>

                <div className={styles.frenteRow}>
                  <div className={styles.frenteMeta}>
                    <span className={styles.frenteName}>Zona Exterior - Urbanismo y Fachada</span>
                    <span className={styles.frenteCount}>0 críticas</span>
                  </div>
                  <div className={styles.progressBarBg}>
                    <div className={styles.progressFill} style={{ width: '0%', backgroundColor: '#6c757d' }} />
                  </div>
                </div>
              </div>
            ) : (
              <div className={styles.tabContentContainer}>
                <div className={styles.frenteRow}>
                  <div className={styles.frenteMeta}>
                    <span className={styles.frenteName}>Concretos del Norte S.A.</span>
                    <span className={styles.frenteCount}>10 retrasos</span>
                  </div>
                  <div className={styles.progressBarBg}>
                    <div className={styles.progressFill} style={{ width: '55%', backgroundColor: '#e63946' }} />
                  </div>
                </div>

                <div className={styles.frenteRow}>
                  <div className={styles.frenteMeta}>
                    <span className={styles.frenteName}>Inst. Eléctricas e Hidráulicas</span>
                    <span className={styles.frenteCount}>6 pendientes</span>
                  </div>
                  <div className={styles.progressBarBg}>
                    <div className={styles.progressFill} style={{ width: '40%', backgroundColor: '#f4a261' }} />
                  </div>
                </div>

                <div className={styles.frenteRow}>
                  <div className={styles.frenteMeta}>
                    <span className={styles.frenteName}>Diseños y Acabados de Cuyo</span>
                    <span className={styles.frenteCount}>4 abiertas</span>
                  </div>
                  <div className={styles.progressBarBg}>
                    <div className={styles.progressFill} style={{ width: '22%', backgroundColor: '#2a9d8f' }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
         
    </div>    
  );
}