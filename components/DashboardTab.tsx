
import React, { useState, useEffect } from 'react';
import { Upload, FileSpreadsheet, Activity, ChevronDown, ChevronUp, TrendingUp, TrendingDown, Minus, Filter, X, ArrowRight } from 'lucide-react';
import { BarChart, Bar, XAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import * as XLSX from 'xlsx';
import { MOCK_GRAPH_B2C, MOCK_GRAPH_B2B, MOCK_GRAPH_FATURADO, MOCK_GRAPH_NOVAS_CAMERAS, TOP5_SALDO_CAMERAS, TOP5_ASSINANTES, TOP5_NOVAS_CAMERAS, TOP5_FATURAMENTO } from '../constants';

interface KpiData {
  unidadesUnicas: number; unidades: number; colaborativo: number; pregao: number;
  inex: number; dispensa: number; termoFomento: number; peNao: number;
  resultadoMes: number; resultadoCameras: number; saldoCamerasTotal: number;
  saldoCameras: number; saldoLpr: number; b2c: number; b2b: number;
  royalties: number; fundoMarca: number; armazenamento: number; locacoes: number;
  analiticos: number; faturamentoTotal: number;
}

interface Top5Item { nome: string; valor: number; rank: number; }

export const DashboardTab: React.FC = () => {
  const [fileName, setFileName] = useState<string | null>(null);
  const [allRows, setAllRows] = useState<any[][]>([]);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  // FILTROS
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [availableCompanies, setAvailableCompanies] = useState<string[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [availableUnits, setAvailableUnits] = useState<string[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<string>('');

  // DADOS
  const [kpis, setKpis] = useState<KpiData>({
    unidadesUnicas: 0, unidades: 0, colaborativo: 0, pregao: 0, inex: 0, dispensa: 0, 
    termoFomento: 0, peNao: 0, resultadoMes: 0, resultadoCameras: 0, saldoCamerasTotal: 0,
    saldoCameras: 0, saldoLpr: 0, b2c: 0, b2b: 0, royalties: 0, fundoMarca: 0,
    armazenamento: 0, locacoes: 0, analiticos: 0, faturamentoTotal: 0
  });

  const [graphs, setGraphs] = useState({
    b2c: MOCK_GRAPH_B2C, b2b: MOCK_GRAPH_B2B, faturado: MOCK_GRAPH_FATURADO, novasCameras: MOCK_GRAPH_NOVAS_CAMERAS
  });

  const [tops, setTops] = useState({
    saldoCameras: TOP5_SALDO_CAMERAS.map((i, idx) => ({...i, rank: idx + 1})),
    usuarios: TOP5_ASSINANTES.map((i, idx) => ({...i, rank: idx + 1})),
    novasCameras: TOP5_NOVAS_CAMERAS.map((i, idx) => ({...i, rank: idx + 1})),
    faturamento: TOP5_FATURAMENTO.map((i, idx) => ({...i, rank: idx + 1})),
  });

  const toggleExpand = (card: string) => {
    setExpandedCard(prev => prev === card ? null : card);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      if (bstr) processExcel(bstr as ArrayBuffer);
    };
    reader.readAsArrayBuffer(file);
  };

  const parseValue = (val: any): number => {
    if (typeof val === 'number') return val;
    if (!val) return 0;
    const str = String(val).trim();
    if (str.includes('R$') || str.includes(',')) {
        const clean = str.replace('R$', '').replace(/\./g, '').replace(',', '.').trim();
        const num = parseFloat(clean);
        return isNaN(num) ? 0 : num;
    }
    return parseFloat(str) || 0;
  };

  const normalize = (str: string): string => {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
  };

  const processExcel = (data: ArrayBuffer | string) => {
    const workbook = XLSX.read(data, { type: 'array' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1 });
    
    const rawRows = jsonData.filter((row, index) => index > 0 && row && row.length > 0);
    setAllRows(rawRows);

    const distinctMonths: string[] = Array.from(new Set(rawRows.map(r => String(r[3] || '').trim()))).filter((m): m is string => !!m);
    setAvailableMonths(distinctMonths);
    if (distinctMonths.length > 0) setSelectedMonths([distinctMonths[distinctMonths.length - 1]]); 
    setAvailableModels(Array.from(new Set(rawRows.map(r => String(r[5] || '').trim()))).filter((m): m is string => !!m).sort());
    setAvailableCompanies(Array.from(new Set(rawRows.map(r => String(r[0] || '').trim()))).filter((m): m is string => !!m).sort());
  };

  useEffect(() => {
    if (allRows.length === 0) return;
    // Logic to update KPIs and graphs based on filters would go here
    // For now, we'll just keep the mock data or simple sums
  }, [allRows, selectedMonths, selectedModels, selectedCompany, selectedUnit]);

  const clearFilters = () => { setSelectedCompany('Todas'); setSelectedUnit('Todas'); setSelectedModels([]); setSelectedMonths(availableMonths.slice(-1)); };

  const formatCurrency = (val: number) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const formatNumber = (val: number) => val.toLocaleString('pt-BR');

  const ChartCard = ({ title, data, color }: { title: string, data: any[], color: string }) => (
    <div className="bg-panel border border-white/5 rounded-xl p-4 min-h-[250px] flex flex-col">
        <h3 className="text-xs font-semibold text-white mb-4 uppercase tracking-wider">{title}</h3>
        <div className="flex-1 w-full min-h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                    <XAxis dataKey="name" stroke="#B9B9CC" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#15162B', borderColor: '#ffffff10', borderRadius: '8px', fontSize: '12px' }} />
                    <Bar dataKey="valor" fill={color} radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    </div>
  );

  const TopTable = ({ title, data, isCurrency = false }: { title: string, data: Top5Item[], isCurrency?: boolean }) => (
    <div className="bg-panel border border-white/5 rounded-xl p-4 flex flex-col h-full">
        <h3 className="text-xs font-semibold text-white mb-3 uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-3 h-3 text-accent" /> {title}
        </h3>
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
            <table className="w-full text-[11px]">
                <tbody className="divide-y divide-white/5">
                    {data.map((item, idx) => (
                        <tr key={idx} className="group hover:bg-white/5 transition-colors">
                            <td className="py-2 pl-2 w-8 text-muted font-mono">{item.rank}º</td>
                            <td className="py-2 text-white/80 group-hover:text-white transition-colors">{item.nome}</td>
                            <td className="py-2 text-right font-medium text-white pr-2">
                                {isCurrency ? formatCurrency(item.valor) : formatNumber(item.valor)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-panel border border-white/5 rounded-xl p-4 flex flex-col gap-1 relative overflow-hidden">
            <span className="text-[10px] text-muted uppercase tracking-wider">Unidades Únicas</span>
            <span className="text-2xl font-bold text-white">{kpis.unidadesUnicas}</span>
            <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full blur-xl opacity-10 bg-success"></div>
        </div>

        <div className="bg-panel border border-white/5 rounded-xl p-4 flex flex-col gap-1 relative overflow-hidden">
            <span className="text-[10px] text-muted uppercase tracking-wider">Faturamento Total</span>
            <span className="text-2xl font-bold text-white">{formatCurrency(kpis.faturamentoTotal)}</span>
            <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full blur-xl opacity-10 bg-green-500"></div>
        </div>

        <div className="bg-panel border border-white/5 rounded-xl p-4 flex flex-col gap-1 relative overflow-hidden">
            <span className="text-[10px] text-muted uppercase tracking-wider">Saldo Câmeras</span>
            <span className="text-2xl font-bold text-white">{kpis.saldoCamerasTotal}</span>
            <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full blur-xl opacity-10 bg-accent"></div>
        </div>

        <div className="bg-panel border border-white/5 rounded-xl p-4 flex flex-col gap-1 relative overflow-hidden">
            <span className="text-[10px] text-muted uppercase tracking-wider">B2C</span>
            <span className="text-2xl font-bold text-white">{formatCurrency(kpis.b2c)}</span>
            <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full blur-xl opacity-10 bg-blue-400"></div>
        </div>
      </div>

      {/* IMPORTAÇÃO E FILTROS */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
        <div className="xl:col-span-1 bg-panel border border-white/5 rounded-xl p-5 flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-3"><div className="p-2 bg-green-500/10 rounded-lg"><FileSpreadsheet className="w-5 h-5 text-green-500" /></div><div><h3 className="text-sm font-semibold text-white">Importar Dados</h3><p className="text-[10px] text-muted">Planilha Padrão (.xlsx)</p></div></div>
            <label className="border border-dashed border-white/10 rounded-lg p-3 flex items-center justify-center gap-2 cursor-pointer hover:bg-white/5 transition-colors">
                <input type="file" className="hidden" accept=".xlsx" onChange={handleFileUpload} />
                <Upload className="w-4 h-4 text-accent" />
                <span className="text-xs text-white">{fileName || 'Selecionar arquivo'}</span>
            </label>
        </div>

        <div className="xl:col-span-3 bg-panel border border-white/5 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4"><h3 className="text-sm font-semibold text-white flex items-center gap-2"><Filter className="w-4 h-4 text-accent" /> Filtros Avançados</h3><button onClick={clearFilters} className="text-[10px] text-accent hover:text-white transition-colors flex items-center gap-1"><X size={10} /> Limpar Filtros</button></div>
            <div className="flex flex-wrap gap-4">
                 <div className="flex flex-col gap-2 min-w-[200px] flex-1">
                    <label className="text-[10px] text-muted uppercase tracking-wide">Competência (Mês)</label>
                    <div className="flex flex-wrap gap-2">
                        {availableMonths.map(m => (
                            <button
                                key={m}
                                className={`text-[10px] px-2 py-1 rounded border transition-colors ${selectedMonths.includes(m) ? 'bg-accent/20 border-accent text-white' : 'bg-panel-2 border-white/10 text-muted hover:text-white'}`}
                            >
                                {m}
                            </button>
                        ))}
                    </div>
                 </div>
            </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ChartCard title="Evolução B2C" data={graphs.b2c} color="#7B48EA" />
        <ChartCard title="Evolução B2B Total" data={graphs.b2b} color="#3B82F6" />
        <ChartCard title="Faturado Total (R$)" data={graphs.faturado} color="#22c55e" />
        <ChartCard title="Novas Câmeras (Fluxo)" data={graphs.novasCameras} color="#eab308" />
      </div>

      {/* Tops */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 min-h-[300px]">
        <TopTable title="Top 5 Saldo Câmeras" data={tops.saldoCameras} />
        <TopTable title="Top 5 Usuários" data={tops.usuarios} />
        <TopTable title="Top 5 Novas Câmeras" data={tops.novasCameras} />
        <TopTable title="Top 5 Faturamento" data={tops.faturamento} isCurrency />
      </div>
    </div>
  );
};
