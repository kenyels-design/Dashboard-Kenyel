import { StatusDemanda, Prioridade, Demanda } from './types';

export const MOCK_DEMANDAS: Demanda[] = [
  {
    id: '1',
    wl: '1024',
    unidade: 'Franquia São Paulo',
    tipo: 'Churn',
    descricao: 'Cliente solicitou cancelamento por falta de suporte técnico.',
    responsavel: 'João Silva',
    prazo: '2025-03-15',
    status: StatusDemanda.ANDAMENTO,
    prioridade: Prioridade.ALTA,
    observacao: 'Aguardando retorno do comercial.'
  },
  {
    id: '2',
    wl: '2048',
    unidade: 'Franquia Rio de Janeiro',
    tipo: 'Expansão',
    descricao: 'Instalação de 10 novas câmeras no setor norte.',
    responsavel: 'Maria Souza',
    prazo: '2025-03-20',
    status: StatusDemanda.NAO_INICIADA,
    prioridade: Prioridade.MEDIA,
    observacao: ''
  }
];

export const MOCK_GRAPH_B2C = [
  { name: 'Jan', valor: 4000 },
  { name: 'Fev', valor: 3000 },
  { name: 'Mar', valor: 2000 },
  { name: 'Abr', valor: 2780 },
  { name: 'Mai', valor: 1890 },
  { name: 'Jun', valor: 2390 },
];

export const MOCK_GRAPH_B2B = [
  { name: 'Jan', valor: 2400 },
  { name: 'Fev', valor: 1398 },
  { name: 'Mar', valor: 9800 },
  { name: 'Abr', valor: 3908 },
  { name: 'Mai', valor: 4800 },
  { name: 'Jun', valor: 3800 },
];

export const MOCK_GRAPH_FATURADO = [
  { name: 'Jan', valor: 12000 },
  { name: 'Fev', valor: 15000 },
  { name: 'Mar', valor: 13000 },
  { name: 'Abr', valor: 17000 },
  { name: 'Mai', valor: 21000 },
  { name: 'Jun', valor: 19000 },
];

export const MOCK_GRAPH_NOVAS_CAMERAS = [
  { name: 'Jan', valor: 45 },
  { name: 'Fev', valor: 52 },
  { name: 'Mar', valor: 38 },
  { name: 'Abr', valor: 65 },
  { name: 'Mai', valor: 48 },
  { name: 'Jun', valor: 59 },
];

export const TOP5_SALDO_CAMERAS = [
  { nome: 'Franquia SP', valor: 150 },
  { nome: 'Franquia RJ', valor: 120 },
  { nome: 'Franquia BH', valor: 95 },
  { nome: 'Franquia PR', valor: 80 },
  { nome: 'Franquia SC', valor: 75 },
];

export const TOP5_ASSINANTES = [
  { nome: 'Franquia SP', valor: 1200 },
  { nome: 'Franquia RJ', valor: 950 },
  { nome: 'Franquia BH', valor: 800 },
  { nome: 'Franquia PR', valor: 600 },
  { nome: 'Franquia SC', valor: 550 },
];

export const TOP5_NOVAS_CAMERAS = [
  { nome: 'Franquia SP', valor: 35 },
  { nome: 'Franquia RJ', valor: 28 },
  { nome: 'Franquia BH', valor: 22 },
  { nome: 'Franquia PR', valor: 18 },
  { nome: 'Franquia SC', valor: 15 },
];

export const TOP5_FATURAMENTO = [
  { nome: 'Franquia SP', valor: 55000 },
  { nome: 'Franquia RJ', valor: 42000 },
  { nome: 'Franquia BH', valor: 38000 },
  { nome: 'Franquia PR', valor: 29000 },
  { nome: 'Franquia SC', valor: 25000 },
];
