'use client';
import { useState, useMemo, useRef } from 'react';
import { useIncidentStore } from '@/store/useIncidentStore';
import { X, Save, Users, Image as ImageIcon, Trash2 } from 'lucide-react';
import styles from '../../styles/_drawer.module.scss';

export default function CreateIncidentForm() {
  const { isCreating, setIsCreating, placementCoordinates, setPlacementCoordinates, addIncident } = useIncidentStore();
  const incidents = useIncidentStore((state) => state.incidents);
  const fileInputRef = useRef<HTMLInputElement>(null);


  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [categoryKey, setCategoryKey] = useState('plumbing');
  const [locationDesc, setLocationDesc] = useState('');
  const [selectedAssigneeIds, setSelectedAssigneeIds] = useState<string[]>([]);

  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  const categoryMap: Record<string, string> = {
    plumbing: 'Hidrosanitario',
    electrical: 'Eléctrico',
    structural: 'Estructura',
    finishes: 'Acabados',
    safety: 'Seguridad de Obra'
  };

  const availableUsers = useMemo(() => {
    const userMap = new Map<string, any>();
    incidents.forEach((incident) => {
      if (incident.owner) userMap.set(incident.owner.id, incident.owner);
      incident.assignees?.forEach((assignee) => {
        userMap.set(assignee.id, assignee);
      });
    });
    return Array.from(userMap.values());
  }, [incidents]);

  if (!isCreating || !placementCoordinates) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    
    const files = Array.from(e.target.files);
    
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setUploadedImages((prev) => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeUploadedImage = (indexToRemove: number) => {
    setUploadedImages((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return alert('Por favor rellena los campos principales.');

    const finalAssignees = availableUsers.filter((user: any) => 
      selectedAssigneeIds.includes(user.id)
    );

    const finalMedia = uploadedImages.map((base64String, index) => ({
      id: `media_local_${Date.now()}_${index}`,
      name: `evidencia_usuario_${index + 1}.png`,
      type: 'image',
      format: 'png',
      size: 102400,
      status: 'uploaded',
      url: base64String
    }));

    addIncident({
      title,
      description,
      priority,
      type: {
        id: Math.random().toString(16).slice(2, 10),
        key: categoryKey,
        name: categoryMap[categoryKey],
        name_en: categoryKey.toUpperCase()
      },
      coordinates: placementCoordinates,
      locationDescription: locationDesc || 'Ubicación general en obra',
      project: { id: '51ae14076884e5134d3afcde', name: 'Torre Acqua - Etapa 2' },
      assignees: finalAssignees,
      media: finalMedia
    } as any);

    setTitle('');
    setDescription('');
    setLocationDesc('');
    setSelectedAssigneeIds([]);
    setUploadedImages([]);
    setIsCreating(false);
    setPlacementCoordinates(null);
  };

  return (
    <div className={`${styles.drawerOverlay} ${styles.active}`}>
      <div className={styles.drawerHeader} style={{ backgroundColor: '#f2b724', color: '#1a1a1a' }}>
        <h3 style={{ fontWeight: 700 }}>Nueva Incidencia en Obra</h3>
        <button className={styles.btnClose} style={{ color: '#1a1a1a' }} onClick={() => setPlacementCoordinates(null)}>
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className={styles.drawerContent} style={{ gap: '0.85rem', overflowY: 'auto' }}>
        <p style={{ fontSize: '0.75rem', color: '#718096', background: '#f7fafc', padding: '0.4rem', borderRadius: '4px', margin: 0 }}>
          📍 Coordenadas: <code>Lat: {placementCoordinates.lat.toFixed(5)}, Lng: {placementCoordinates.lng.toFixed(5)}</code>
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#4a5568' }}>Título del hallazgo *</label>
          <input type="text" placeholder="Ej: Grieta visible en losa..." value={title} onChange={(e) => setTitle(e.target.value)} style={{ padding: '0.5rem', border: '1px solid #cbd5e0', borderRadius: '6px', fontSize: '0.85rem' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#4a5568' }}>Descripción técnica *</label>
          <textarea placeholder="Describe lo evidenciado..." value={description} onChange={(e) => setDescription(e.target.value)} rows={2} style={{ padding: '0.5rem', border: '1px solid #cbd5e0', borderRadius: '6px', fontSize: '0.85rem', resize: 'none' }} />
        </div>

        {/* CAMPO DE SELECCIÓN DE ENCARGADOS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#4a5568', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Users size={12} /> Asignar Encargados</label>
          <div style={{ maxHeight: '90px', overflowY: 'auto', border: '1px solid #cbd5e0', borderRadius: '6px', padding: '0.4rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', background: '#fff' }}>
            {availableUsers.map((user: any) => (
              <label key={user.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={selectedAssigneeIds.includes(user.id)} onChange={() => setSelectedAssigneeIds(prev => prev.includes(user.id) ? prev.filter(id => id !== user.id) : [...prev, user.id])} style={{ cursor: 'pointer' }} />
                <img src={user.avatarUrl} alt={user.name} style={{ width: '18px', height: '18px', borderRadius: '50%' }} />
                <span>{user.name}</span>
              </label>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#4a5568', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <ImageIcon size={12} /> Evidencias Fotográficas
          </label>
          
          <input 
            type="file" 
            accept="image/*" 
            multiple 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            style={{ display: 'none' }} 
          />

          <button 
            type="button"
            onClick={() => fileInputRef.current?.click()}
            style={{ padding: '0.5rem', background: '#edf2f7', border: '1px dashed #cbd5e0', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, color: '#4a5568', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}
          >
            + Seleccionar Fotos de Campo
          </button>

          {/* Carrete de previsualización interna en el formulario */}
          {uploadedImages.length > 0 && (
            <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.4rem', overflowX: 'auto', padding: '0.25rem 0' }}>
              {uploadedImages.map((src, idx) => (
                <div key={idx} style={{ width: '50px', height: '50px', borderRadius: '4px', overflow: 'hidden', position: 'relative', border: '1px solid #e2e8f0', flexShrink: 0 }}>
                  <img src={src} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button type="button" onClick={() => removeUploadedImage(idx)} style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(239, 68, 68, 0.8)', color: 'white', border: 'none', borderRadius: '2px', padding: '2px', cursor: 'pointer' }}>
                    <Trash2 size={10} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#4a5568' }}>Especialidad</label>
            <select value={categoryKey} onChange={(e) => setCategoryKey(e.target.value)} style={{ padding: '0.4rem', border: '1px solid #cbd5e0', borderRadius: '6px', fontSize: '0.8rem' }}>
              <option value="plumbing">Hidrosanitario</option>
              <option value="electrical">Eléctrico</option>
              <option value="structural">Estructura</option>
              <option value="finishes">Acabados</option>
              <option value="safety">Seguridad</option>
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#4a5568' }}>Prioridad</label>
            <select value={priority} onChange={(e) => setPriority(e.target.value as any)} style={{ padding: '0.4rem', border: '1px solid #cbd5e0', borderRadius: '6px', fontSize: '0.8rem' }}>
              <option value="low">Baja</option>
              <option value="medium">Media</option>
              <option value="high">Alta</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#4a5568' }}>Ubicación interna</label>
          <input type="text" placeholder="Ej: Nivel 14, Eje C-4" value={locationDesc} onChange={(e) => setLocationDesc(e.target.value)} style={{ padding: '0.4rem', border: '1px solid #cbd5e0', borderRadius: '6px', fontSize: '0.85rem' }} />
        </div>

        <button type="submit" style={{ backgroundColor: '#1a1a1a', color: '#fff', padding: '0.55rem', borderRadius: '6px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '0.25rem', cursor: 'pointer', fontSize: '0.85rem' }}>
          <Save size={14} color="#f2b724" /> Guardar Incidencia
        </button>
      </form>
    </div>
  );
}