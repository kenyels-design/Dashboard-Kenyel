import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, AlertCircle, Clock, CheckCircle, PauseCircle, Trash2, HelpCircle, Edit2, Check, X as CloseIcon, Maximize2, Loader2 } from 'lucide-react';
import { StatusDemanda, Prioridade, Demanda } from '../types';
// Importamos o cliente do Supabase que você criou
import { supabase } from '../supabase';

export const DemandasTab: React.FC = () => {
  // O estado agora começa vazio, sem ler do localStorage
  const [demandas, setDemandas] = useState<Demanda[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [filterText, setFilterText] = useState('');
  
  // Filters State
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const [priorityFilters, setPriorityFilters] = useState<string[]>([]);
  
  // Form State
  const [newWL, setNewWL] = useState('');
  const [newTipo, setNewTipo] = useState('');
  const [newPrazo, setNewPrazo] = useState('');
  const [newDescricao, setNewDescricao] = useState('');

  // Editing State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Demanda>>({});

  // View Modal State
  const [viewingText, setViewingText] = useState<{ title: string, content: string } | null>(null);

  // 1. LER DADOS DO SUPABASE QUANDO A TELA CARREGAR
  useEffect(() => {
    fetchDemandas();
  }, []);

  const fetchDemandas = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('demandas')
      .select('*')
      .order('created_at', { ascending: false }); // Ordena pelas mais novas

    if (error) {
      console.error('Erro ao buscar demandas:', error);
    } else {
      setDemandas(data as Demanda[]);
    }
    setLoading(false);
  };

  const getStatusIcon = (status: StatusDemanda) => {
    switch (status) {
      case StatusDemanda.NAO_INICIADA: return <AlertCircle className="w-3 h-3 text-muted" />;
      case StatusDemanda.ANDAMENTO: return <Clock className="w-3 h-3 text-accent" />;
      case StatusDemanda.AGUARDANDO: return <PauseCircle className="w-3 h-3 text-warning" />;
      case StatusDemanda.ACOMPANHAMENTO: return <HelpCircle className="w-3 h-3 text-blue-400" />;
      case StatusDemanda.CONCLUIDA: return <CheckCircle className="w-3 h-3 text-success" />;
      default: return <AlertCircle className="w-3 h-3 text-muted" />;
    }
  };

  const getPriorityClass = (priority: Prioridade) => {
    switch (priority) {
      case Prioridade.ALTA: return 'text-danger bg-danger/10 border-danger/20';
      case Prioridade.MEDIA: return 'text-warning bg-warning/10 border-warning/20';
      case Prioridade.BAIXA: return 'text-success bg-success/10 border-success/20';
    }
  };

  // 2. CRIAR NOVA DEMANDA NO SUPABASE
  const handleAdd = async () => {
    if (!newWL || !newDescricao) return;
    
    const novaDemanda = {
      wl: newWL,
      unidade: '', 
      tipo: newTipo,
      descricao: newDescricao,
      responsavel: '', 
      prazo: newPrazo || null, // Supabase prefere null a string vazia para datas
      status: StatusDemanda.NAO_INICIADA,
      prioridade: Prioridade.MEDIA,
      observacao: ''
    };

    // Inserir no banco
    const { error } = await supabase
      .from('demandas')
      .insert([novaDemanda]);

    if (error) {
      console.error('Erro ao adicionar demanda:', error);
    } else {
      setNewWL('');
      setNewTipo('');
      setNewPrazo('');
      setNewDescricao('');
      fetchDemandas(); // Recarregar lista
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('demandas')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao excluir demanda:', error);
    } else {
      fetchDemandas();
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from('demandas')
      .update({ status: newStatus as StatusDemanda })
      .eq('id', id);

    if (error) {
      console.error('Erro ao atualizar status:', error);
    } else {
      fetchDemandas();
    }
  };

  const updatePrioridade = async (id: string, newPrioridade: string) => {
    const { error } = await supabase
      .from('demandas')
      .update({ prioridade: newPrioridade as Prioridade })
      .eq('id', id);

    if (error) {
      console.error('Erro ao atualizar prioridade:', error);
    } else {
      fetchDemandas();
    }
  };

  const updateObservacao = async (id: string, newObs: string) => {
    const { error } = await supabase
      .from('demandas')
      .update({ observacao: newObs })
      .eq('id', id);

    if (error) {
      console.error('Erro ao atualizar observação:', error);
    } else {
      fetchDemandas();
    }
  };

  const startEditing = (demanda: Demanda) => {
    setEditingId(demanda.id);
    setEditForm({ ...demanda });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEdit = async () => {
    if (!editingId) return;
    const { error } = await supabase
      .from('demandas')
      .update(editForm)
      .eq('id', editingId);

    if (error) {
      console.error('Erro ao salvar edição:', error);
    } else {
      setEditingId(null);
      setEditForm({});
      fetchDemandas();
    }
  };

  const toggleStatusFilter = (status: string) => {
    setStatusFilters(prev => 
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    );
  };

  const togglePriorityFilter = (priority: string) => {
    setPriorityFilters(prev => 
      prev.includes(priority) ? prev.filter(p => p !== priority) : [...prev, priority]
    );
  };

  const clearFilters = () => {
    setStatusFilters([]);
    setPriorityFilters([]);
    setFilterText('');
  };

  // Filter Logic
  const filteredDemandas = demandas.filter(d => {
    const matchesText = String(d.wl).includes(filterText) || d.descricao.toLowerCase().includes(filterText.toLowerCase());
    const matchesStatus = statusFilters.length === 0 || statusFilters.includes(d.status);
    const matchesPriority = priorityFilters.length === 0 || priorityFilters.includes(d.prioridade);
    return matchesText && matchesStatus && matchesPriority;
  });

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      {/* Top Filter & Input Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Filters */}
        <div className="bg-panel border border-white/5 rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Filtros de demandas</h3>
              <p className="text-xs text-muted">Use para enxergar apenas o que impacta seu dia.</p>
            </div>
            <div className="flex items-center gap-3">
              {(statusFilters.length > 0 || priorityFilters.length > 0) && (
                <button 
                  onClick={clearFilters}
                  className="text-[10px] text-accent hover:text-white transition-colors flex items-center gap-1"
                >
                  <CloseIcon size={10} /> Limpar
                </button>
              )}
              <Filter className="w-4 h-4 text-accent" />
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex flex-col">
              <label className="text-[10px] text-muted mb-2 uppercase tracking-wide">Status</label>
              <div className="flex flex-wrap gap-2">
                {Object.values(StatusDemanda).map(s => (
                  <button
                    key={s}
                    onClick={() => toggleStatusFilter(s)}
                    className={`text-[10px] px-2 py-1 rounded border transition-colors ${
                      statusFilters.includes(s) 
                        ? 'bg-accent/20 border-accent text-white' 
                        : 'bg-panel-2 border-white/10 text-muted hover:text-white'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col">
              <label className="text-[10px] text-muted mb-2 uppercase tracking-wide">Prioridade</label>
              <div className="flex flex-wrap gap-2">
                {Object.values(Prioridade).map(p => (
                  <button
                    key={p}
                    onClick={() => togglePriorityFilter(p)}
                    className={`text-[10px] px-2 py-1 rounded border transition-colors ${
                      priorityFilters.includes(p) 
                        ? 'bg-accent/20 border-accent text-white' 
                        : 'bg-panel-2 border-white/10 text-muted hover:text-white'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* New Demand Input */}
        <div className="bg-panel border border-white/5 rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Nova demanda rápida</h3>
              <p className="text-xs text-muted">Registre tarefas que não podem escapar.</p>
            </div>
            <Plus className="w-4 h-4 text-accent" />
          </div>
          <div className="grid grid-cols-3 gap-2 mb-2">
            <input 
                value={newWL} 
                onChange={e => setNewWL(e.target.value)}
                placeholder="WL (ID)" 
                className="col-span-1 bg-panel-2 border border-white/10 rounded-lg text-xs p-2 text-white placeholder-muted/50 outline-none focus:border-accent" 
            />
            <input 
                value={newTipo}
                onChange={e => setNewTipo(e.target.value)}
                placeholder="Tipo (ex: Churn)" 
                className="col-span-1 bg-panel-2 border border-white/10 rounded-lg text-xs p-2 text-white placeholder-muted/50 outline-none focus:border-accent" 
            />
            <input 
                type="date"
                value={newPrazo}
                onChange={e => setNewPrazo(e.target.value)}
                className="col-span-1 bg-panel-2 border border-white/10 rounded-lg text-xs p-2 text-white placeholder-muted/50 outline-none focus:border-accent" 
            />
          </div>
          <textarea 
            value={newDescricao}
            onChange={e => setNewDescricao(e.target.value)}
            placeholder="Descrição da demanda..." 
            className="w-full bg-panel-2 border border-white/10 rounded-lg text-xs p-2 text-white placeholder-muted/50 outline-none focus:border-accent h-16 mb-2 resize-none"
          ></textarea>
          <button 
            onClick={handleAdd}
            className="w-full bg-gradient-to-r from-accent to-accent-hover text-white text-xs font-medium py-2 rounded-lg hover:opacity-90 transition-opacity"
          >
            + Adicionar à lista
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-panel border border-white/5 rounded-xl overflow-hidden min-h-[300px] relative">
        {loading && (
          <div className="absolute inset-0 bg-panel/50 backdrop-blur-sm z-10 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-accent animate-spin" />
          </div>
        )}
        <div className="p-4 border-b border-white/5 flex justify-between items-center">
          <div>
            <h3 className="text-sm font-semibold text-white">Fila de demandas</h3>
            <p className="text-xs text-muted">Acompanhamento e execução.</p>
          </div>
          <div className="flex gap-2">
             <input 
              type="text" 
              placeholder="Buscar WL..." 
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="bg-panel-2 border border-white/10 rounded-lg text-xs px-3 py-1.5 text-white outline-none focus:border-accent"
             />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/5 text-muted uppercase">
              <tr>
                <th className="px-4 py-3 font-medium w-16">WL</th>
                <th className="px-4 py-3 font-medium w-24">Tipo</th>
                <th className="px-4 py-3 font-medium w-48">Descrição</th>
                <th className="px-4 py-3 font-medium w-48">Observação</th>
                <th className="px-4 py-3 font-medium w-24">Prazo</th>
                <th className="px-4 py-3 font-medium w-28">Status</th>
                <th className="px-4 py-3 font-medium text-center w-24">Prioridade</th>
                <th className="px-4 py-3 font-medium text-center w-12">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredDemandas.map((demanda) => (
                <tr key={demanda.id} className={`hover:bg-white/5 transition-colors group ${editingId === demanda.id ? 'bg-accent/5' : ''}`}>
                  <td className="px-4 py-3 font-medium text-white">
                    {editingId === demanda.id ? (
                      <input 
                        type="text"
                        value={editForm.wl || ''}
                        onChange={e => setEditForm({ ...editForm, wl: e.target.value })}
                        className="w-full bg-panel-2 border border-white/10 rounded px-1 py-0.5 text-white outline-none focus:border-accent"
                      />
                    ) : demanda.wl}
                  </td>
                  <td className="px-4 py-3">
                    {editingId === demanda.id ? (
                      <input 
                        type="text"
                        value={editForm.tipo || ''}
                        onChange={e => setEditForm({ ...editForm, tipo: e.target.value })}
                        className="w-full bg-panel-2 border border-white/10 rounded px-1 py-0.5 text-white outline-none focus:border-accent"
                      />
                    ) : (
                      <span className="text-muted">{demanda.tipo}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-white max-w-[200px]">
                    {editingId === demanda.id ? (
                      <textarea 
                        value={editForm.descricao || ''}
                        onChange={e => setEditForm({ ...editForm, descricao: e.target.value })}
                        className="w-full bg-panel-2 border border-white/10 rounded px-1 py-0.5 text-white outline-none focus:border-accent resize-none h-12"
                      />
                    ) : (
                      <div className="flex items-center justify-between gap-2 group/cell">
                        <div className="truncate flex-1" title={demanda.descricao}>{demanda.descricao}</div>
                        <button 
                          onClick={() => setViewingText({ title: 'Descrição da Demanda', content: demanda.descricao })}
                          className="opacity-0 group-hover/cell:opacity-100 p-1 hover:bg-white/10 rounded transition-all text-accent"
                          title="Ver descrição completa"
                        >
                          <Maximize2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </td>
                  
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 group/cell">
                      <input 
                        type="text"
                        value={editingId === demanda.id ? (editForm.observacao || '') : (demanda.observacao || '')}
                        onChange={(e) => {
                          if (editingId === demanda.id) {
                            setEditForm({ ...editForm, observacao: e.target.value });
                          } else {
                            updateObservacao(demanda.id, e.target.value);
                          }
                        }}
                        placeholder="Adicionar obs..."
                        className="flex-1 bg-transparent border-b border-transparent hover:border-white/10 focus:border-accent text-white/80 placeholder-muted/30 outline-none text-xs py-1"
                      />
                      {(demanda.observacao || (editingId === demanda.id && editForm.observacao)) && (
                        <button 
                          onClick={() => setViewingText({ 
                            title: 'Observação', 
                            content: editingId === demanda.id ? (editForm.observacao || '') : (demanda.observacao || '') 
                          })}
                          className="opacity-0 group-hover/cell:opacity-100 p-1 hover:bg-white/10 rounded transition-all text-accent"
                          title="Ver observação completa"
                        >
                          <Maximize2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </td>

                  <td className="px-4 py-3 text-muted">
                    {editingId === demanda.id ? (
                      <input 
                        type="date"
                        value={editForm.prazo || ''}
                        onChange={e => setEditForm({ ...editForm, prazo: e.target.value })}
                        className="w-full bg-panel-2 border border-white/10 rounded px-1 py-0.5 text-white outline-none focus:border-accent"
                      />
                    ) : (
                      demanda.prazo ? new Date(demanda.prazo).toLocaleDateString() : '-'
                    )}
                  </td>
                  
                  <td className="px-4 py-3">
                    <select 
                        value={editingId === demanda.id ? editForm.status : demanda.status} 
                        onChange={(e) => {
                          if (editingId === demanda.id) {
                            setEditForm({ ...editForm, status: e.target.value as StatusDemanda });
                          } else {
                            updateStatus(demanda.id, e.target.value);
                          }
                        }}
                        className="bg-transparent border border-transparent hover:border-white/10 rounded px-1 py-0.5 text-white outline-none cursor-pointer focus:bg-panel-2 w-full"
                    >
                        {Object.values(StatusDemanda).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>

                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center">
                        <select 
                            value={editingId === demanda.id ? editForm.prioridade : demanda.prioridade}
                            onChange={(e) => {
                              if (editingId === demanda.id) {
                                setEditForm({ ...editForm, prioridade: e.target.value as Prioridade });
                              } else {
                                updatePrioridade(demanda.id, e.target.value);
                              }
                            }}
                            className={`bg-transparent border border-transparent rounded px-2 py-0.5 outline-none cursor-pointer text-center appearance-none ${getPriorityClass(editingId === demanda.id ? (editForm.prioridade as Prioridade) : demanda.prioridade)}`}
                        >
                            {Object.values(Prioridade).map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>
                  </td>

                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {editingId === demanda.id ? (
                        <>
                          <button 
                            onClick={saveEdit}
                            className="text-success hover:bg-success/10 p-1 rounded transition-colors"
                            title="Salvar"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={cancelEditing}
                            className="text-danger hover:bg-danger/10 p-1 rounded transition-colors"
                            title="Cancelar"
                          >
                            <CloseIcon className="w-3.5 h-3.5" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button 
                            onClick={() => startEditing(demanda)}
                            className="text-muted hover:text-accent p-1 rounded hover:bg-white/5 transition-colors"
                            title="Editar"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => handleDelete(demanda.id)}
                            className="text-muted hover:text-danger p-1 rounded hover:bg-white/5 transition-colors"
                            title="Excluir"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredDemandas.length === 0 && !loading && (
            <div className="p-12 text-center">
              <p className="text-muted">Nenhuma demanda encontrada.</p>
            </div>
          )}
        </div>
      </div>
      {/* Text Viewer Modal */}
      {viewingText && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-panel border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-white/5">
              <h3 className="text-sm font-semibold text-white">{viewingText.title}</h3>
              <button 
                onClick={() => setViewingText(null)}
                className="p-1.5 hover:bg-white/5 rounded-full text-muted hover:text-white transition-colors"
              >
                <CloseIcon className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6">
              <div className="bg-panel-2 border border-white/5 rounded-xl p-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
                <p className="text-sm text-text leading-relaxed whitespace-pre-wrap">
                  {viewingText.content || <span className="text-muted italic">Sem conteúdo.</span>}
                </p>
              </div>
            </div>
            <div className="p-4 border-t border-white/5 flex justify-end">
              <button 
                onClick={() => setViewingText(null)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-xs font-medium rounded-lg transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
