'use client';

import { useState } from 'react';
import { Key, Shield, Smartphone, Globe, Plus, Trash2, Power, Eye, Users, Layers, Activity, Edit3 } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { crearLicencia, crearProducto, toggleLicencia, borrarLicencia, editarLicencia, editarProducto, borrarProducto, checkLicenciaDependencies, checkProductoDependencies } from './actions';

export default function AdminClient({ licencias, productos }: { licencias: any[], productos: any[] }) {
  const [view, setView] = useState<'LIST' | 'NEW_LICENSE' | 'NEW_PRODUCT' | 'EDIT_LICENSE'>('LIST');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{
    type: 'LICENSE' | 'PRODUCT';
    id: string;
    name: string;
    details: any;
  } | null>(null);

  const [formData, setFormData] = useState({
    key: '',
    productoId: productos[0]?.id || '',
    nombreUsuario: '',
    emailUsuario: '',
    maxActivaciones: '1',
    maxAsociaciones: '1',
    initialPassword: '',
    fechaExpiracion: ''
  });

  const [productFormData, setProductFormData] = useState({
    nombre: '',
    url: ''
  });

  const generateRandomKey = (productName: string) => {
    const prefix = productName.substring(0, 3).toUpperCase();
    const random = Math.random().toString(36).substring(2, 10).toUpperCase();
    const date = new Date().getFullYear();
    setFormData({ ...formData, key: `${prefix}-${random}-${date}` });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    let res;
    if (view === 'EDIT_LICENSE' && editingId) {
      res = await editarLicencia(editingId, { ...formData, maxActivaciones: Number(formData.maxActivaciones), maxAsociaciones: Number(formData.maxAsociaciones) });
    } else {
      res = await crearLicencia({ ...formData, maxActivaciones: Number(formData.maxActivaciones), maxAsociaciones: Number(formData.maxAsociaciones) });
    }

    if (res.success) {
      toast.success(view === 'EDIT_LICENSE' ? 'Licencia actualizada' : 'Licencia creada con éxito');
      setView('LIST');
      setEditingId(null);
      setFormData({ 
        key: '', 
        productoId: productos[0]?.id || '', 
        nombreUsuario: '', 
        emailUsuario: '', 
        maxActivaciones: '1', 
        maxAsociaciones: '1',
        initialPassword: '',
        fechaExpiracion: '' 
      });
    } else {
      toast.error(res.error || 'Error al procesar licencia');
    }
    setLoading(false);
  };

  const startEdit = (l: any) => {
    setEditingId(l.id);
    setFormData({
      key: l.key,
      productoId: l.productoId,
      nombreUsuario: l.nombreUsuario || '',
      emailUsuario: l.emailUsuario || '',
      maxActivaciones: String(l.maxActivaciones),
      maxAsociaciones: String(l.maxAsociaciones || 1),
      initialPassword: l.initialPassword || '',
      fechaExpiracion: l.fechaExpiracion ? format(new Date(l.fechaExpiracion), 'yyyy-MM-dd') : ''
    });
    setView('EDIT_LICENSE');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 p-8">
      {/* Sidebar / Nav */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-64 space-y-6">
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-500/20">
              <Shield className="text-white w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black tracking-tight uppercase italic">GASAL <span className="text-blue-600">AUTH</span></h1>
          </div>

          <nav className="space-y-1">
            <NavItem active={view === 'LIST'} onClick={() => setView('LIST')} icon={Globe} label="Licencias Activas" />
            <NavItem active={view === 'NEW_LICENSE'} onClick={() => { setView('NEW_LICENSE'); if (productos.length > 0) generateRandomKey(productos[0].nombre); }} icon={Key} label="Nueva Licencia" />
            <NavItem active={view === 'NEW_PRODUCT'} onClick={() => setView('NEW_PRODUCT')} icon={Layers} label="Gestionar Productos" />
          </nav>

          <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm mt-10">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
              <Activity size={14} className="text-emerald-500" /> Sistema Online
            </div>
            <p className="text-[10px] leading-relaxed text-slate-500">Servidor de activación activo y sincronizado. Protocolo GASAL v1.0.</p>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          {view === 'LIST' && (
            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <div>
                  <h2 className="text-3xl font-black tracking-tight">Gestión de Licencias</h2>
                  <p className="text-slate-500 dark:text-slate-400 font-medium ml-1">Control total sobre accesos y activaciones.</p>
                </div>
                <div className="text-sm font-bold bg-white dark:bg-slate-900 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  {licencias.length} Licencias Totales
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {licencias.map((l) => (
                  <div key={l.id} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group">
                    <div className="flex justify-between items-start">
                      <div className="flex gap-4">
                        <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl">
                          <Key className={l.activa ? "text-blue-600" : "text-slate-400"} size={24} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-black font-mono tracking-wider">{l.key}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tight ${l.activa ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                              {l.activa ? 'Activa' : 'Revocada'}
                            </span>
                          </div>
                          <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-tight flex items-center gap-2">
                             <span>{l.producto.nombre}</span>
                             <span className="text-slate-300">&bull;</span>
                             <span className="text-slate-600 dark:text-slate-300">{l.nombreUsuario || 'Sin Cliente'}</span>
                             {l.emailUsuario && (
                               <span className="text-[10px] bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-lg lowercase font-medium">
                                 {l.emailUsuario}
                               </span>
                             )}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => startEdit(l)} className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100">
                          <Edit3 size={18} />
                        </button>
                        <button onClick={() => toggleLicencia(l.id, !l.activa)} className={`p-2 rounded-xl border transition-colors ${l.activa ? 'bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100'}`}>
                          <Power size={18} />
                        </button>
                        <button 
                          onClick={async () => { 
                            const deps = await checkLicenciaDependencies(l.id);
                            if (deps.hasActivations) {
                              setConfirmDelete({
                                type: 'LICENSE',
                                id: l.id,
                                name: l.key,
                                details: deps
                              });
                            } else {
                              if(confirm('¿Eliminar licencia?')) {
                                const res = await borrarLicencia(l.id);
                                if(res.success) toast.success('Licencia eliminada');
                                else toast.error(res.error || 'Error al eliminar');
                              }
                            }
                          }} 
                          className="p-2 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs font-bold uppercase tracking-widest text-slate-400">
                      <div className="flex gap-6">
                        <div className="flex items-center gap-2">
                          <Smartphone size={14} className="text-slate-400" />
                          <span>{l.activaciones.length} / {l.maxActivaciones} Inst.</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users size={14} className="text-slate-400" />
                          <span>0 / {l.maxAsociaciones || 1} Asoc.</span>
                        </div>
                        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold">
                          <Key size={14} />
                          <span>{l.initialPassword || 'Sin Pass'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          < Globe size={14} className="text-slate-400" />
                          <span>{l.emailUsuario || 'No Mail'}</span>
                        </div>
                      </div>
                      <div className="text-slate-300 flex flex-col items-end gap-1">
                        <div>Creada {format(new Date(l.createdAt), 'dd MMM yyyy')}</div>
                        {l.fechaExpiracion && (
                          <div className="text-amber-500">Expira {format(new Date(l.fechaExpiracion), 'dd MMM yyyy')}</div>
                        )}
                      </div>
                    </div>

                    {l.activaciones.length > 0 && (
                      <div className="mt-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl space-y-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Historial Equipos</p>
                        {l.activaciones.map((a: any) => (
                          <div key={a.id} className="flex justify-between text-[11px] font-medium">
                            <span className="font-mono text-slate-600 dark:text-slate-400">{a.hardwareId}</span>
                            <span className="text-slate-400">{format(new Date(a.fecha), 'dd/MM/yy HH:mm')}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {(view === 'NEW_LICENSE' || view === 'EDIT_LICENSE') && (
            <div className="max-w-xl bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl">
              <div className="flex justify-between items-start mb-8">
                <h2 className="text-3xl font-black tracking-tight">
                  {view === 'EDIT_LICENSE' ? 'Editar Licencia' : 'Emitir Nueva Licencia'}
                </h2>
                <button onClick={() => setView('LIST')} className="text-sm font-bold text-slate-400 hover:text-slate-600">Cancelar</button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Producto</label>
                  <select 
                    value={formData.productoId} 
                    onChange={e => setFormData({ ...formData, productoId: e.target.value })}
                    className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none ring-2 ring-transparent focus:ring-blue-500 transition-all font-bold"
                  >
                    {productos.map(p => (
                      <option key={p.id} value={p.id}>{p.nombre}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Clave de Licencia</label>
                  <div className="flex gap-2">
                    <input 
                      required 
                      value={formData.key} 
                      onChange={e => setFormData({ ...formData, key: e.target.value.toUpperCase() })}
                      className="flex-1 p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none ring-2 ring-transparent focus:ring-blue-500 transition-all font-mono font-black"
                    />
                    {view === 'NEW_LICENSE' && (
                      <button type="button" onClick={() => generateRandomKey(productos.find(p => p.id === formData.productoId)?.nombre || 'GAS')} className="bg-slate-900 text-white p-4 rounded-2xl hover:bg-black transition-colors">
                        <Plus />
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Cliente / Organización</label>
                    <input 
                      value={formData.nombreUsuario} 
                      onChange={e => setFormData({ ...formData, nombreUsuario: e.target.value })}
                      className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none ring-2 ring-transparent focus:ring-blue-500 transition-all"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Email Cliente</label>
                    <input 
                      type="email"
                      value={formData.emailUsuario} 
                      onChange={e => setFormData({ ...formData, emailUsuario: e.target.value })}
                      className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none ring-2 ring-transparent focus:ring-blue-500 transition-all font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 text-amber-600">Password Inicial</label>
                    <input 
                      type="text"
                      value={formData.initialPassword} 
                      onChange={e => setFormData({ ...formData, initialPassword: e.target.value })}
                      className="w-full p-4 bg-amber-50 dark:bg-amber-900/20 border-none rounded-2xl outline-none ring-2 ring-transparent focus:ring-amber-500 transition-all font-bold text-amber-700 dark:text-amber-300"
                    />
                  </div>
                </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Fecha Expiración (Opcional)</label>
                    <input 
                      type="date"
                      value={formData.fechaExpiracion} 
                      onChange={e => setFormData({ ...formData, fechaExpiracion: e.target.value })}
                      className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none ring-2 ring-transparent focus:ring-blue-500 transition-all font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Nº Equipos (Inst.)</label>
                    <input 
                      type="number"
                      value={formData.maxActivaciones} 
                      onChange={e => setFormData({ ...formData, maxActivaciones: e.target.value })}
                      className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none ring-2 ring-transparent focus:ring-blue-500 transition-all font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Nº Asociaciones</label>
                    <input 
                      type="number"
                      value={formData.maxAsociaciones} 
                      onChange={e => setFormData({ ...formData, maxAsociaciones: e.target.value })}
                      className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none ring-2 ring-transparent focus:ring-blue-500 transition-all font-bold"
                    />
                  </div>
                </div>

                <button disabled={loading} type="submit" className="w-full p-5 bg-blue-600 text-white rounded-3xl font-black uppercase tracking-widest shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all hover:scale-[1.02] active:scale-[0.98]">
                  {loading ? 'Procesando...' : view === 'EDIT_LICENSE' ? 'Actualizar Licencia' : 'Generar y Activar Clave'}
                </button>
              </form>
            </div>
          )}

          {view === 'NEW_PRODUCT' && (
             <div className="max-w-xl bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl">
                <h2 className="text-3xl font-black mb-8 tracking-tight">Gestionar Productos</h2>
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  setLoading(true);
                  const name = (e.currentTarget.elements.namedItem('pname') as HTMLInputElement).value;
                  const url = (e.currentTarget.elements.namedItem('purl') as HTMLInputElement).value;
                  const res = await crearProducto(name, url);
                  setLoading(false);
                  if (res.success) {
                    toast.success('Producto añadido');
                    (e.target as HTMLFormElement).reset();
                  } else toast.error(res.error);
                }} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Nombre de Aplicación</label>
                    <input name="pname" required className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none ring-2 ring-transparent focus:ring-blue-500 transition-all font-bold" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">URL de Ejecución</label>
                    <input name="purl" placeholder="http://localhost:3000" className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none ring-2 ring-transparent focus:ring-blue-500 transition-all" />
                  </div>
                  <button disabled={loading} type="submit" className="w-full p-5 bg-slate-900 text-white rounded-3xl font-black uppercase tracking-widest hover:bg-black transition-all">
                    {loading ? 'Registrando...' : 'Registrar Aplicación'}
                  </button>
                </form>

                <div className="mt-10 space-y-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase ml-1 mb-2">Portafolio Actual</p>
                  {productos.map(p => (
                    <div key={p.id} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl flex justify-between items-center group transition-all">
                      <div className="flex flex-col">
                        <span className="font-bold">{p.nombre}</span>
                        {p.url && <span className="text-xs text-blue-500 font-medium">{p.url}</span>}
                      </div>
                      <div className="flex gap-2">
                        {p.url && (
                          <a href={p.url} target="_blank" rel="noopener noreferrer" className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100 flex items-center gap-1 text-xs font-bold uppercase tracking-widest">
                            <Globe size={14} /> Abrir
                          </a>
                        )}
                        <button 
                          onClick={() => {
                            setEditingProductId(p.id);
                            setProductFormData({ nombre: p.nombre, url: p.url || '' });
                          }} 
                          className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button 
                          onClick={async () => {
                            const deps = await checkProductoDependencies(p.id);
                            if (deps.hasLicencias) {
                              setConfirmDelete({
                                type: 'PRODUCT',
                                id: p.id,
                                name: p.nombre,
                                details: deps
                              });
                            } else {
                              if(confirm(`¿Eliminar producto ${p.nombre}?`)) {
                                const res = await borrarProducto(p.id);
                                if(res.success) toast.success('Producto eliminado');
                                else toast.error(res.error);
                              }
                            }
                          }} 
                          className="p-2 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {editingProductId && (
                  <div className="mt-10 pt-10 border-t border-slate-100 dark:border-slate-800">
                    <h3 className="font-black text-xl mb-6 tracking-tight">Editar Producto</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Nombre</label>
                        <input
                          value={productFormData.nombre}
                          onChange={e => setProductFormData({ ...productFormData, nombre: e.target.value })}
                          className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none ring-2 ring-transparent focus:ring-blue-500 transition-all font-bold"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">URL de Ejecución</label>
                        <input
                          value={productFormData.url}
                          placeholder="http://localhost:3000"
                          onChange={e => setProductFormData({ ...productFormData, url: e.target.value })}
                          className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none ring-2 ring-transparent focus:ring-blue-500 transition-all"
                        />
                      </div>
                      <div className="flex gap-4">
                        <button 
                          onClick={async () => {
                            const res = await (import('./actions').then(m => m.editarProducto(editingProductId, productFormData)));
                            if(res.success) {
                              toast.success('Producto actualizado');
                              setEditingProductId(null);
                            } else {
                              toast.error(res.error);
                            }
                          }}
                          className="flex-1 p-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest"
                        >
                          Guardar Cambios
                        </button>
                        <button 
                          onClick={() => setEditingProductId(null)}
                          className="flex-1 p-4 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase tracking-widest"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  </div>
                )}
             </div>
          )}
        </main>
      </div>
      {/* Modal de confirmación de borrado */}
      {confirmDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="flex items-center gap-4 text-rose-600 mb-6 font-black uppercase tracking-widest text-sm">
              <Trash2 /> ¡Atención! Datos Activos
            </div>
            
            <h3 className="text-2xl font-black mb-4 tracking-tight">
              ¿Eliminar {confirmDelete.type === 'LICENSE' ? 'Licencia' : 'Producto'} <span className="text-blue-600">{confirmDelete.name}</span>?
            </h3>
            
            <div className="p-4 bg-rose-50 dark:bg-rose-900/10 rounded-2xl border border-rose-100 dark:border-rose-900/30 mb-8 space-y-4">
              <p className="text-sm font-bold text-rose-800 dark:text-rose-400">
                Este elemento tiene datos asociados que se perderán permanentemente:
              </p>
              
              <ul className="text-xs font-bold text-slate-500 uppercase tracking-tight space-y-2">
                {confirmDelete.type === 'LICENSE' ? (
                  <>
                    <li className="flex justify-between items-center px-3 py-2 bg-white dark:bg-slate-800 rounded-xl">
                      <span>Equipos Activados</span>
                      <span className="text-rose-600">{confirmDelete.details.activations.length}</span>
                    </li>
                    {confirmDelete.details.activations.slice(0, 3).map((a: any) => (
                      <li key={a.id} className="text-[10px] text-slate-400 px-3 bg-white/50 dark:bg-slate-800/50 py-1 rounded-lg">
                        Machine ID: {a.hardwareId}
                      </li>
                    ))}
                  </>
                ) : (
                  <>
                    <li className="flex justify-between items-center px-3 py-2 bg-white dark:bg-slate-800 rounded-xl">
                      <span>Licencias Emitidas</span>
                      <span className="text-rose-600">{confirmDelete.details.licenseCount}</span>
                    </li>
                    <li className="flex justify-between items-center px-3 py-2 bg-white dark:bg-slate-800 rounded-xl">
                      <span>Activaciones Totales</span>
                      <span className="text-rose-600">{confirmDelete.details.activationCount}</span>
                    </li>
                  </>
                )}
              </ul>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={async () => {
                  setLoading(true);
                  const res = confirmDelete.type === 'LICENSE' 
                    ? await borrarLicencia(confirmDelete.id)
                    : await borrarProducto(confirmDelete.id);
                  
                  setLoading(false);
                  if (res.success) {
                    toast.success('Eliminado correctamente');
                    setConfirmDelete(null);
                  } else {
                    toast.error(res.error || 'Error al eliminar');
                  }
                }}
                disabled={loading}
                className="flex-1 bg-rose-600 text-white p-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-rose-700 transition-all hover:scale-[1.02]"
              >
                {loading ? 'Borrando...' : 'Confirmar Borrado'}
              </button>
              <button 
                onClick={() => setConfirmDelete(null)}
                className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 p-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function NavItem({ icon: Icon, label, active, onClick }: any) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-black uppercase tracking-tight transition-all ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
      <Icon size={18} />
      {label}
    </button>
  );
}
