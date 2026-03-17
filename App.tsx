import React, { useState, useEffect } from 'react';
import { LayoutDashboard, ListTodo, RefreshCw } from 'lucide-react';
import { DemandasTab } from './components/DemandasTab';
import { DashboardTab } from './components/DashboardTab';

type Tab = 'demandas' | 'dashboard';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  // Forçar redimensionamento dos gráficos Recharts quando a aba mudar
  useEffect(() => {
    window.dispatchEvent(new Event('resize'));
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-bg text-text selection:bg-accent selection:text-white">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[10%] w-[500px] h-[500px] bg-[#2B2550] rounded-full blur-[120px] opacity-40"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-accent/20 rounded-full blur-[100px] opacity-20"></div>
      </div>

      <div className="relative z-10 max-w-[1760px] mx-auto p-4 lg:p-6 pb-20">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard CS Franquias</h1>
            <p className="text-xs text-muted mt-1">Painel pessoal de operação • Camerite</p>
          </div>
          <div className="flex items-center gap-3">
             <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/20 border border-white/10">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
                <span className="text-[10px] text-muted font-medium">Sistema Online</span>
             </div>
             <button 
                onClick={() => window.location.reload()}
                className="flex items-center gap-2 text-xs font-medium text-white bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-full transition-colors"
             >
                <RefreshCw className="w-3 h-3" /> Atualizar
             </button>
          </div>
        </header>

        {/* Tab Navigation */}
        <nav className="flex overflow-x-auto pb-2 mb-6 gap-2 border-b border-white/5 no-scrollbar">
          {[
            { id: 'demandas', label: 'Demandas', icon: ListTodo, sub: 'Kanban' },
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, sub: 'Visão Clínica' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`group flex items-center gap-3 px-5 py-3 rounded-full border transition-all duration-200 whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'bg-gradient-to-r from-accent/20 to-transparent border-accent/50 text-white' 
                  : 'bg-transparent border-transparent text-muted hover:bg-white/5 hover:text-white'
              }`}
            >
              <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-accent' : 'text-muted group-hover:text-white'}`} />
              <div className="flex flex-col items-start">
                <span className="text-sm font-medium leading-none">{tab.label}</span>
                <span className={`text-[10px] mt-1 ${activeTab === tab.id ? 'text-accent/80' : 'text-muted/60'}`}>{tab.sub}</span>
              </div>
            </button>
          ))}
        </nav>

        {/* Main Content Area */}
        <main className="min-h-[500px] relative">
          <div className={activeTab === 'dashboard' ? 'block' : 'hidden'}>
            <DashboardTab />
          </div>
          <div className={activeTab === 'demandas' ? 'block' : 'hidden'}>
            <DemandasTab />
          </div>
        </main>

      </div>
    </div>
  );
}

export default App;
