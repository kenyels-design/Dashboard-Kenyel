export enum StatusDemanda {
  NAO_INICIADA = 'Não Iniciada',
  ANDAMENTO = 'Em Andamento',
  AGUARDANDO = 'Aguardando',
  ACOMPANHAMENTO = 'Acompanhamento',
  CONCLUIDA = 'Concluída'
}

export enum Prioridade {
  ALTA = 'Alta',
  MEDIA = 'Média',
  BAIXA = 'Baixa'
}

export interface Demanda {
  id: string;
  wl: string;
  unidade: string;
  tipo: string;
  descricao: string;
  responsavel: string;
  prazo: string;
  status: StatusDemanda;
  prioridade: Prioridade;
  observacao: string;
}
