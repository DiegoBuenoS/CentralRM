// Dashboard

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { SidebarProvider, useSidebar } from '../components/ui/sidebar';
import {
  logoutUser,
  isAuthenticated,
  getConsultaSql,
  getTravelRouteEstimate,
  uploadFiles,
  getPlaceSuggestions,
} from '../services';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/textarea';
import { Separator } from '../components/ui/separator';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { Calendar } from '../components/ui/calendar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { DataTable } from '../components/ui/data-table';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '../components/ui/chart';
import API_CONFIG from '../config/api.config';
import { getRuntimeConfig, saveRuntimeConfig } from '../config/runtime.config';
import { ComposedChart, Line, Area, CartesianGrid, XAxis, YAxis, Legend } from 'recharts';
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  PaperClipIcon,
  ClockIcon,
  CheckCircleIcon,
  EllipsisVerticalIcon,
  AdjustmentsHorizontalIcon,
  ArrowsUpDownIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  CalendarIcon,
  ChartBarIcon,
  CheckBadgeIcon,
  FolderIcon,
  ReceiptPercentIcon,
  ShoppingCartIcon,
  DocumentTextIcon,
  UsersIcon,
  ChevronDownIcon,
  EyeIcon,
  EyeSlashIcon,
  MapPinIcon,
  ArrowRightIcon,
  BriefcaseIcon,
  FlagIcon,
  PrinterIcon,
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';

const DashboardLayout = ({
  user,
  activeCover,
  currentPage,
  onLogout,
  onNavigate,
  children,
  dialog,
}) => {
  const { collapsed } = useSidebar();

  return (
    <div className="min-h-screen bg-mist dark:bg-graphite-900">
      <Sidebar
        onLogout={onLogout}
        currentPage={currentPage}
        onNavigate={onNavigate}
      />

      <Header
        user={user}
        sidebarCollapsed={collapsed}
        title={activeCover.title}
        breadcrumb={['Início', activeCover.title]}
      />

      <main
        className={`
          ${collapsed ? 'ml-[4.5rem]' : 'ml-60'}
          mt-16
          p-5
          transition-all duration-300
        `}
      >
        {children}
      </main>
      {dialog}
    </div>
  );
};

const DashboardPage = ({ initialPage = 'dashboard' }) => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [user, setUser] = useState(null);
  const [taskTab, setTaskTab] = useState('pendente');

  // Auth
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/');
      return;
    }

    // User data
    const userData = localStorage.getItem('user_data');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
      }
    }

    // Fallback
    if (!userData) {
      const username = localStorage.getItem('username');
      setUser({ username, id: username });
    }
  }, [navigate]);

  useEffect(() => {
    setCurrentPage(initialPage);
  }, [initialPage]);

  // Logout
  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate('/');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      navigate('/');
    }
  };

  // Navegação
  const handleNavigate = (item) => {
    const pageId = item?.id || item;
    setCurrentPage(pageId);
    if (item?.path) {
      navigate(item.path);
    }
    console.log('Navegando para:', pageId);
  };


  // Stats
  const statsCards = [
    {
      title: 'Requisições Abertas',
      value: '18',
      change: '+4',
      trend: 'up',
      icon: ShoppingCartIcon,
      color: 'blue',
    },
    {
      title: 'Itens Críticos',
      value: '7',
      change: '+1',
      trend: 'up',
      icon: DocumentTextIcon,
      color: 'blue-soft',
    },
    {
      title: 'Pedidos em Aprovação',
      value: '12',
      change: '-2',
      trend: 'down',
      icon: UsersIcon,
      color: 'blue-mid',
    },
    {
      title: 'Recebimentos Hoje',
      value: '5',
      change: '+2',
      trend: 'up',
      icon: ShoppingCartIcon,
      color: 'blue',
    },
  ];

  const comprasTrendData = [
    { mes: 'Set', valor: 128000, pedidos: 24 },
    { mes: 'Out', valor: 146000, pedidos: 29 },
    { mes: 'Nov', valor: 139000, pedidos: 27 },
    { mes: 'Dez', valor: 162000, pedidos: 32 },
    { mes: 'Jan', valor: 171000, pedidos: 35 },
    { mes: 'Fev', valor: 184000, pedidos: 38 },
  ];

  const comprasCategoriaData = [
    { categoria: 'TI', valor: 92000 },
    { categoria: 'Serviços', valor: 58000 },
    { categoria: 'Escritório', valor: 34000 },
    { categoria: 'Facilities', valor: 27000 },
    { categoria: 'Logística', valor: 22000 },
  ];

  const comprasPipelineData = [
    { status: 'Aprovadas', quantidade: 18 },
    { status: 'Em análise', quantidade: 11 },
    { status: 'Cotação', quantidade: 9 },
    { status: 'Bloqueadas', quantidade: 4 },
  ];

  const comprasChartConfig = {
    valor: { label: 'Valor (R$)', color: '#1d4ed8' },
    pedidos: { label: 'Pedidos', color: '#2563eb' },
    quantidade: { label: 'Quantidade', color: '#1e40af' },
  };

  const estoqueStatsCards = [
    { title: 'Itens em estoque', value: '4.820', change: '+3,2%', trend: 'up', icon: FolderIcon, color: 'teal' },
    { title: 'Rupturas críticas', value: '14', change: '-2', trend: 'down', icon: ReceiptPercentIcon, color: 'teal-soft' },
    { title: 'Cobertura média', value: '26 dias', change: '+1 dia', trend: 'up', icon: ClockIcon, color: 'teal-mid' },
    { title: 'Inventários pendentes', value: '6', change: '+1', trend: 'up', icon: DocumentTextIcon, color: 'teal' },
  ];
  const estoqueNivelData = [
    { mes: 'Set', saldo: 4180, ruptura: 22 },
    { mes: 'Out', saldo: 4320, ruptura: 19 },
    { mes: 'Nov', saldo: 4405, ruptura: 18 },
    { mes: 'Dez', saldo: 4520, ruptura: 21 },
    { mes: 'Jan', saldo: 4680, ruptura: 16 },
    { mes: 'Fev', saldo: 4820, ruptura: 14 },
  ];
  const estoqueGiroData = [
    { categoria: 'Periféricos', giro: 7.2 },
    { categoria: 'Hardware', giro: 4.1 },
    { categoria: 'Mobiliário', giro: 2.8 },
    { categoria: 'Serviços', giro: 3.5 },
    { categoria: 'Facilities', giro: 2.2 },
  ];
  const estoqueChartConfig = {
    saldo: { label: 'Saldo', color: '#059669' },
    ruptura: { label: 'Rupturas', color: '#10b981' },
    giro: { label: 'Giro', color: '#047857' },
  };
  const estoqueAlertas = [
    { sku: 'PRD-011', item: 'Hub USB', local: 'CD SP-01', saldo: '8 un', nivel: 'Crítico' },
    { sku: 'PRD-052', item: 'Toner Original', local: 'CD RJ-02', saldo: '11 un', nivel: 'Baixo' },
    { sku: 'PRD-008', item: 'Cabo USB-C', local: 'CD BH-03', saldo: '95 un', nivel: 'Normal' },
    { sku: 'PRD-021', item: 'Scanner Fiscal', local: 'CD SP-01', saldo: '3 un', nivel: 'Crítico' },
  ];

  const faturamentoStatsCards = [
    { title: 'Faturado no mês', value: 'R$ 2,34 mi', change: '+8,4%', trend: 'up', icon: ChartBarIcon, color: 'amber' },
    { title: 'Meta atingida', value: '94%', change: '+6 p.p.', trend: 'up', icon: CheckBadgeIcon, color: 'amber-soft' },
    { title: 'NFs emitidas', value: '1.286', change: '+92', trend: 'up', icon: ReceiptPercentIcon, color: 'amber-mid' },
    { title: 'Devoluções', value: 'R$ 62 mil', change: '-9%', trend: 'down', icon: ArrowTrendingDownIcon, color: 'amber' },
  ];
  const faturamentoMensalData = [
    { mes: 'Set', faturado: 1840000, devolucao: 98000 },
    { mes: 'Out', faturado: 1970000, devolucao: 91000 },
    { mes: 'Nov', faturado: 2050000, devolucao: 88000 },
    { mes: 'Dez', faturado: 2210000, devolucao: 76000 },
    { mes: 'Jan', faturado: 2280000, devolucao: 71000 },
    { mes: 'Fev', faturado: 2340000, devolucao: 62000 },
  ];
  const faturamentoCanalData = [
    { canal: 'Varejo', valor: 980000 },
    { canal: 'Distribuição', valor: 760000 },
    { canal: 'E-commerce', valor: 420000 },
    { canal: 'Marketplace', valor: 180000 },
  ];
  const faturamentoChartConfig = {
    faturado: { label: 'Faturado', color: '#d97706' },
    devolucao: { label: 'Devolução', color: '#f59e0b' },
    valor: { label: 'Valor', color: '#b45309' },
  };
  const faturamentoTitulos = [
    { fatura: 'FT-93451', cliente: 'Rede Sigma', vencimento: '18/02/2026', valor: 'R$ 84.600,00', status: 'Aberto' },
    { fatura: 'FT-93452', cliente: 'Grupo Brava', vencimento: '19/02/2026', valor: 'R$ 42.180,00', status: 'Pago' },
    { fatura: 'FT-93453', cliente: 'Comercial Zeta', vencimento: '20/02/2026', valor: 'R$ 63.900,00', status: 'Aberto' },
    { fatura: 'FT-93454', cliente: 'Lumen Serviços', vencimento: '21/02/2026', valor: 'R$ 18.400,00', status: 'Atrasado' },
  ];

  const orcamentoStatsCards = [
    { title: 'Orçado no mês', value: 'R$ 3,12 mi', change: '+4,1%', trend: 'up', icon: ChartBarIcon, color: 'slate' },
    { title: 'Realizado no mês', value: 'R$ 2,96 mi', change: '+6,8%', trend: 'up', icon: CheckBadgeIcon, color: 'slate-soft' },
    { title: 'Aderência', value: '94,8%', change: '+1,3 p.p.', trend: 'up', icon: ReceiptPercentIcon, color: 'slate-mid' },
    { title: 'Variação', value: '-R$ 160 mil', change: '-0,9%', trend: 'down', icon: ArrowTrendingDownIcon, color: 'slate' },
  ];
  const orcamentoTrendData = [
    { mes: 'Set', orcado: 2550000, realizado: 2480000 },
    { mes: 'Out', orcado: 2640000, realizado: 2590000 },
    { mes: 'Nov', orcado: 2720000, realizado: 2680000 },
    { mes: 'Dez', orcado: 2840000, realizado: 2760000 },
    { mes: 'Jan', orcado: 2980000, realizado: 2890000 },
    { mes: 'Fev', orcado: 3120000, realizado: 2960000 },
  ];
  const orcamentoChartConfig = {
    orcado: { label: 'Orçado', color: '#0f766e' },
    realizado: { label: 'Realizado', color: '#0ea5e9' },
  };

  const comprasResumoTabela = comprasCategoriaData.map((item, index) => ({
    categoria: item.categoria,
    valor: item.valor,
    status: comprasPipelineData[index % comprasPipelineData.length].status,
    pedidos: comprasPipelineData[index % comprasPipelineData.length].quantidade,
  }));

  const estoqueResumoTabela = estoqueAlertas.map((item, index) => ({
    ...item,
    giro: estoqueGiroData[index % estoqueGiroData.length].giro,
  }));

  const faturamentoResumoTabela = faturamentoTitulos.map((item, index) => ({
    ...item,
    canal: faturamentoCanalData[index % faturamentoCanalData.length].canal,
  }));

  const orcamentoResumoTabela = [
    {
      codigoPeriodo: '2026-01',
      ano: 2026,
      mes: 'Janeiro',
      orcado: 2980000,
      realizado: 2890000,
      naturezaOrcamentaria: 'Custeio',
      centroCusto: 'Compras Corporativas',
      receitas: 3520000,
      despesas: 630000,
    },
    {
      codigoPeriodo: '2026-02',
      ano: 2026,
      mes: 'Fevereiro',
      orcado: 3120000,
      realizado: 2960000,
      naturezaOrcamentaria: 'Operacional',
      centroCusto: 'Supply Chain',
      receitas: 3660000,
      despesas: 700000,
    },
    {
      codigoPeriodo: '2026-03',
      ano: 2026,
      mes: 'Março',
      orcado: 3200000,
      realizado: 3050000,
      naturezaOrcamentaria: 'Administrativa',
      centroCusto: 'Financeiro',
      receitas: 3780000,
      despesas: 730000,
    },
    {
      codigoPeriodo: '2026-04',
      ano: 2026,
      mes: 'Abril',
      orcado: 3280000,
      realizado: 3175000,
      naturezaOrcamentaria: 'Comercial',
      centroCusto: 'Faturamento',
      receitas: 3910000,
      despesas: 735000,
    },
  ];

  const statusMovimentoMap = {
    A: 'Pendente / A Faturar',
    B: 'Bloqueado',
    C: 'Cancelado',
    F: 'Recebido / Faturado',
    G: 'Parcialmente Recebido / Faturado',
    N: 'Normal',
    P: 'Parcialmente Quitado',
    Q: 'Quitado',
    R: 'Não Processado',
    U: 'Em Faturamento',
    O: 'Aguardando Análise',
    Y: 'Não Iniciado',
    E: 'Em Andamento',
    Z: 'Terminado',
  };
  const statusColorMap = {
    A: 'bg-amber-500',
    B: 'bg-red-500',
    C: 'bg-rose-500',
    F: 'bg-emerald-500',
    G: 'bg-yellow-500',
    N: 'bg-slate-500',
    P: 'bg-orange-500',
    Q: 'bg-green-600',
    R: 'bg-gray-400',
    U: 'bg-blue-500',
    O: 'bg-indigo-500',
    Y: 'bg-sky-500',
    E: 'bg-teal-500',
    Z: 'bg-lime-500',
  };
  const approvalStatusMap = {
    pendente: 'Aguardando aprovação',
    aprovado: 'Aprovado',
    reprovado: 'Reprovado',
  };

  const TRAVEL_EXPENSE_ITEMS = [
    { value: 'Hospedagem', label: 'Hospedagem' },
    { value: 'Combustível', label: 'Combustível' },
    { value: 'Taxi', label: 'Taxi' },
    { value: 'Uber', label: 'Uber' },
    { value: 'Passagem aérea', label: 'Passagem aérea' },
    { value: 'Alimentação', label: 'Alimentação' },
    { value: 'Pedágio', label: 'Pedágio' },
    { value: 'Estacionamento', label: 'Estacionamento' },
    { value: 'KM estimado', label: 'KM estimado' },
  ];
  const TRAVEL_TYPE_OPTIONS = [
    {
      value: 'Atividades administrativas',
      label: 'Atividades administrativas',
      description: 'Viagens administrativas internas e externas.',
    },
    {
      value: 'Visitas iniciais para obras em Orçamento',
      label: 'Visitas iniciais para obras em Orçamento',
      description: 'Levantamentos e visitas técnicas para fase de orçamento.',
    },
    {
      value: 'Manutenção em campo',
      label: 'Manutenção em campo',
      description: 'Atendimentos de manutenção e suporte operacional em campo.',
    },
  ];
  const createTravelItemLine = () => ({ item: '', valorUnitario: '', quantidade: '' });

  const createTravelDraft = () => ({
    tipoSolicitacao: '',
    origem: '',
    destino: '',
    motivo: '',
    kmEstimado: '',
    periodoInicio: '',
    periodoFim: '',
    observacao: '',
    numeroRm: '',
  });

  const initialTravelExpenses = [
    {
      id: 'DV-0001',
      tipoSolicitacao: 'Nova viagem',
      destino: 'São Paulo/SP',
      periodo: '10/02/2026 a 12/02/2026',
      kmEstimado: '76,2 km',
      numeroRm: 'RM-120045',
      total: 'R$ 1.420,00',
      dataPrevistaPgto: '18/02/2026',
      status: 'Em fila de pagamento',
      itens: ['Hospedagem', 'Uber'],
      anexos: 2,
    },
    {
      id: 'DV-0002',
      tipoSolicitacao: 'Adiantamento para viagem',
      destino: 'Curitiba/PR',
      periodo: '08/02/2026 a 09/02/2026',
      kmEstimado: '410,5 km',
      numeroRm: 'RM-120052',
      total: 'R$ 860,00',
      dataPrevistaPgto: '19/02/2026',
      status: 'Viagem em andamento',
      itens: ['Combustível', 'Pedágio', 'Alimentação'],
      anexos: 1,
    },
    {
      id: 'DV-0003',
      tipoSolicitacao: 'Nova viagem',
      destino: 'Rio de Janeiro/RJ',
      periodo: '05/02/2026 a 07/02/2026',
      kmEstimado: '72,8 km',
      numeroRm: '',
      total: 'R$ 1.980,00',
      dataPrevistaPgto: '--',
      status: 'Aguardando integração',
      itens: ['Passagem aérea', 'Hospedagem', 'Uber'],
      anexos: 0,
    },
    {
      id: 'DV-0004',
      tipoSolicitacao: 'Adiantamento para viagem',
      destino: 'Belo Horizonte/MG',
      periodo: '14/02/2026 a 16/02/2026',
      kmEstimado: '586,4 km',
      numeroRm: 'RM-120063',
      total: 'R$ 1.150,00',
      dataPrevistaPgto: '23/02/2026',
      status: 'Aprovada',
      itens: ['Combustível', 'Pedágio', 'Hospedagem'],
      anexos: 3,
    },
    {
      id: 'DV-0005',
      tipoSolicitacao: 'Nova viagem',
      destino: 'Campinas/SP',
      periodo: '17/02/2026 a 18/02/2026',
      kmEstimado: '175,2 km',
      numeroRm: 'RM-120071',
      total: 'R$ 740,00',
      dataPrevistaPgto: '25/02/2026',
      status: 'Em fila de pagamento',
      itens: ['Uber', 'Alimentação'],
      anexos: 1,
    },
    {
      id: 'DV-0006',
      tipoSolicitacao: 'Nova viagem',
      destino: 'Sorocaba/SP',
      periodo: '20/02/2026 a 20/02/2026',
      kmEstimado: '112,0 km',
      numeroRm: '',
      total: 'R$ 420,00',
      dataPrevistaPgto: '--',
      status: 'Aguardando integração',
      itens: ['Combustível', 'Estacionamento'],
      anexos: 0,
    },
    {
      id: 'DV-0007',
      tipoSolicitacao: 'Adiantamento para viagem',
      destino: 'Joinville/SC',
      periodo: '11/02/2026 a 13/02/2026',
      kmEstimado: '534,7 km',
      numeroRm: 'RM-120059',
      total: 'R$ 1.630,00',
      dataPrevistaPgto: '21/02/2026',
      status: 'Viagem em andamento',
      itens: ['Passagem aérea', 'Hospedagem', 'Taxi'],
      anexos: 2,
    },
    {
      id: 'DV-0008',
      tipoSolicitacao: 'Nova viagem',
      destino: 'São José dos Campos/SP',
      periodo: '02/02/2026 a 03/02/2026',
      kmEstimado: '96,3 km',
      numeroRm: 'RM-120031',
      total: 'R$ 690,00',
      dataPrevistaPgto: '12/02/2026',
      pgtoRealizadoEm: '12/02/2026',
      status: 'Finalizada',
      itens: ['Combustível', 'Pedágio', 'Alimentação'],
      anexos: 2,
    },
    {
      id: 'DV-0009',
      tipoSolicitacao: 'Adiantamento para viagem',
      destino: 'Ribeirão Preto/SP',
      periodo: '28/01/2026 a 30/01/2026',
      kmEstimado: '320,1 km',
      numeroRm: 'RM-119998',
      total: 'R$ 1.240,00',
      dataPrevistaPgto: '10/02/2026',
      pgtoRealizadoEm: '11/02/2026',
      status: 'Finalizada',
      itens: ['Hospedagem', 'Uber', 'Alimentação'],
      anexos: 3,
    },
  ];

  const pedidosData = [
    {
      id: '000000235',
      fornecedor: 'Distribuidora Alpha',
      centroCusto: 'Operações',
      data: '10/02/2026',
      status: 'A',
      total: 'R$ 18.420,00',
      itens: [
        { sku: 'PRD-001', nome: 'Notebook Corporativo', qtd: 4, unit: 'R$ 3.200,00', total: 'R$ 12.800,00' },
        { sku: 'PRD-002', nome: 'Mouse Ergonômico', qtd: 10, unit: 'R$ 85,00', total: 'R$ 850,00' },
        { sku: 'PRD-003', nome: 'Teclado Slim', qtd: 10, unit: 'R$ 120,00', total: 'R$ 1.200,00' },
        { sku: 'PRD-004', nome: 'Headset Corporativo', qtd: 6, unit: 'R$ 240,00', total: 'R$ 1.440,00' },
        { sku: 'PRD-005', nome: 'Monitor 24"', qtd: 6, unit: 'R$ 780,00', total: 'R$ 4.680,00' },
        { sku: 'PRD-006', nome: 'Suporte de Monitor', qtd: 6, unit: 'R$ 160,00', total: 'R$ 960,00' },
        { sku: 'PRD-007', nome: 'Cabo HDMI', qtd: 12, unit: 'R$ 35,00', total: 'R$ 420,00' },
        { sku: 'PRD-008', nome: 'Cabo USB-C', qtd: 12, unit: 'R$ 48,00', total: 'R$ 576,00' },
        { sku: 'PRD-009', nome: 'Filtro de Linha', qtd: 8, unit: 'R$ 90,00', total: 'R$ 720,00' },
        { sku: 'PRD-010', nome: 'Webcam Full HD', qtd: 4, unit: 'R$ 390,00', total: 'R$ 1.560,00' },
        { sku: 'PRD-011', nome: 'Hub USB', qtd: 6, unit: 'R$ 110,00', total: 'R$ 660,00' },
        { sku: 'PRD-012', nome: 'Adaptador HDMI', qtd: 8, unit: 'R$ 55,00', total: 'R$ 440,00' },
        { sku: 'PRD-013', nome: 'Mousepad', qtd: 10, unit: 'R$ 25,00', total: 'R$ 250,00' },
        { sku: 'PRD-014', nome: 'Dock USB-C', qtd: 4, unit: 'R$ 1.405,00', total: 'R$ 5.620,00' },
        { sku: 'PRD-015', nome: 'Cadeira Escritório', qtd: 2, unit: 'R$ 1.250,00', total: 'R$ 2.500,00' },
        { sku: 'PRD-016', nome: 'Suporte Notebook', qtd: 6, unit: 'R$ 140,00', total: 'R$ 840,00' },
        { sku: 'PRD-017', nome: 'Organizador Cabos', qtd: 12, unit: 'R$ 18,00', total: 'R$ 216,00' },
        { sku: 'PRD-018', nome: 'Carregador USB-C', qtd: 6, unit: 'R$ 150,00', total: 'R$ 900,00' },
        { sku: 'PRD-019', nome: 'Licença Antivírus', qtd: 20, unit: 'R$ 35,00', total: 'R$ 700,00' },
        { sku: 'PRD-020', nome: 'Licença Office', qtd: 10, unit: 'R$ 120,00', total: 'R$ 1.200,00' },
      ],
    },
    {
      id: '000000236',
      fornecedor: 'Soluções Beta',
      centroCusto: 'Financeiro',
      data: '11/02/2026',
      status: 'B',
      total: 'R$ 9.760,00',
      itens: [
        { sku: 'PRD-021', nome: 'Scanner Fiscal', qtd: 2, unit: 'R$ 2.880,00', total: 'R$ 5.760,00' },
        { sku: 'PRD-032', nome: 'Licença ERP', qtd: 1, unit: 'R$ 4.000,00', total: 'R$ 4.000,00' },
      ],
    },
    {
      id: '000000237',
      fornecedor: 'Comercial Gama',
      centroCusto: 'Compras',
      data: '12/02/2026',
      status: 'N',
      total: 'R$ 6.230,00',
      itens: [
        { sku: 'PRD-041', nome: 'Impressora Laser', qtd: 1, unit: 'R$ 2.450,00', total: 'R$ 2.450,00' },
        { sku: 'PRD-052', nome: 'Toner Original', qtd: 6, unit: 'R$ 630,00', total: 'R$ 3.780,00' },
      ],
    },
  ];

  const initialApprovalPedidos = [
    {
      id: '000000245',
      fornecedor: 'Delta Suprimentos',
      centro: 'Administrativo',
      valor: 'R$ 14.320,00',
      aprovacao: 'pendente',
      criadoPor: 'Luciana Prado',
      resumo: 'Aquisição de materiais de escritório para reposição.',
      observacao: 'Solicitação alinhada ao orçamento mensal.',
      itens: [
        { item: 'Papel A4', qtd: 20, un: 'CX', unit: 'R$ 18,00' },
        { item: 'Canetas esferográficas', qtd: 50, un: 'UN', unit: 'R$ 2,10' },
        { item: 'Post-its', qtd: 15, un: 'UN', unit: 'R$ 6,50' },
        { item: 'Pastas suspensas', qtd: 30, un: 'UN', unit: 'R$ 3,20' },
      ],
    },
    {
      id: '000000246',
      fornecedor: 'Mega Office',
      centro: 'Financeiro',
      valor: 'R$ 6.780,00',
      aprovacao: 'aprovado',
      aprovadoEm: '09/02/2026 14:18',
      aprovadoPor: 'Juliana Freitas',
      criadoPor: 'Carlos Menezes',
      resumo: 'Compra de suprimentos de TI para equipe financeira.',
      observacao: 'Aprovado após validação do gestor.',
      itens: [
        { item: 'Mouse ergonômico', qtd: 10, un: 'UN', unit: 'R$ 85,00' },
        { item: 'Teclado slim', qtd: 10, un: 'UN', unit: 'R$ 120,00' },
        { item: 'Monitor 24"', qtd: 4, un: 'UN', unit: 'R$ 780,00' },
        { item: 'Dock USB-C', qtd: 4, un: 'UN', unit: 'R$ 1.405,00' },
      ],
    },
    {
      id: '000000247',
      fornecedor: 'Distribuidora Alpha',
      centro: 'Controladoria',
      valor: 'R$ 9.540,00',
      aprovacao: 'reprovado',
      reprovadoEm: '10/02/2026 16:42',
      reprovadoPor: 'Bruno Almeida',
      criadoPor: 'Fernanda Costa',
      resumo: 'Requisição de equipamentos sem orçamento aprovado.',
      observacao: 'Reprovado por falta de verba disponível.',
      itens: [
        { item: 'Monitor 24"', qtd: 6, un: 'UN', unit: 'R$ 780,00' },
        { item: 'Dock USB-C', qtd: 6, un: 'UN', unit: 'R$ 1.405,00' },
        { item: 'Webcam Full HD', qtd: 6, un: 'UN', unit: 'R$ 390,00' },
        { item: 'Headset corporativo', qtd: 8, un: 'UN', unit: 'R$ 240,00' },
      ],
    },
    {
      id: '000000248',
      fornecedor: 'Supply Tech',
      centro: 'Recursos Humanos',
      valor: 'R$ 4.210,00',
      aprovacao: 'pendente',
      criadoPor: 'Rafael Souza',
      resumo: 'Solicitação de materiais para onboarding.',
      observacao: 'Itens para integração de novos colaboradores.',
      itens: [
        { item: 'Cadernos', qtd: 30, un: 'UN', unit: 'R$ 12,00' },
        { item: 'Canecas personalizadas', qtd: 30, un: 'UN', unit: 'R$ 25,00' },
        { item: 'Kits boas-vindas', qtd: 30, un: 'UN', unit: 'R$ 45,00' },
        { item: 'Blocos de notas', qtd: 40, un: 'UN', unit: 'R$ 4,50' },
      ],
    },
    {
      id: '000000249',
      fornecedor: 'Comercial Gama',
      centro: 'Compras',
      valor: 'R$ 11.980,00',
      aprovacao: 'aprovado',
      aprovadoEm: '11/02/2026 09:05',
      aprovadoPor: 'Renata Carvalho',
      criadoPor: 'Patrícia Lima',
      resumo: 'Reposição de periféricos de TI.',
      observacao: 'Aprovado pela área de TI.',
      itens: [
        { item: 'Headset corporativo', qtd: 12, un: 'UN', unit: 'R$ 240,00' },
        { item: 'Webcam Full HD', qtd: 8, un: 'UN', unit: 'R$ 390,00' },
        { item: 'Mouse ergonômico', qtd: 15, un: 'UN', unit: 'R$ 85,00' },
        { item: 'Teclado slim', qtd: 15, un: 'UN', unit: 'R$ 120,00' },
      ],
    },
    {
      id: '000000250',
      fornecedor: 'Logística Nova',
      centro: 'Operações',
      valor: 'R$ 7.400,00',
      aprovacao: 'pendente',
      criadoPor: 'Diego Ramos',
      resumo: 'Suprimentos para área operacional.',
      observacao: 'Solicitação em análise do gestor.',
      itens: [
        { item: 'Luvas de segurança', qtd: 100, un: 'PAR', unit: 'R$ 18,00' },
        { item: 'Capacetes', qtd: 40, un: 'UN', unit: 'R$ 65,00' },
        { item: 'Óculos de proteção', qtd: 60, un: 'UN', unit: 'R$ 22,00' },
        { item: 'Colete refletivo', qtd: 50, un: 'UN', unit: 'R$ 35,00' },
      ],
    },
  ];
  const [approvalPedidos, setApprovalPedidos] = useState(initialApprovalPedidos);

  const [pedidoSearch, setPedidoSearch] = useState('');
  const [pedidoSort, setPedidoSort] = useState('data');
  const [pedidoStatus, setPedidoStatus] = useState('todos');
  const [pedidoSelecionado, setPedidoSelecionado] = useState(pedidosData[0]);
  const [itemSelecionado, setItemSelecionado] = useState(pedidosData[0].itens[0].sku);
  const [itemSearch, setItemSearch] = useState('');
  const [pedidosTableCount, setPedidosTableCount] = useState(pedidosData.length);
  const [itensTableCount, setItensTableCount] = useState(pedidosData[0]?.itens?.length || 0);
  const [showRequestCard, setShowRequestCard] = useState(false);
  const [requestMeta, setRequestMeta] = useState({
    tipoSolicitacao: '1.1.04',
    filial: '',
    centroCusto: '',
    localEstoque: '',
    dataEmissao: '',
    dataNecessidade: '',
    observacao: '',
    numeroRm: '',
  });
  const [requestItems, setRequestItems] = useState([
    { codigo: '', descricao: '', tipo: 'Servico', quantidade: '', unidade: '' },
  ]);
  const [requestStamp, setRequestStamp] = useState({ dataHora: '', usuario: '' });
  const [requestTipoOptions, setRequestTipoOptions] = useState([]);
  const [requestTipoLoading, setRequestTipoLoading] = useState(false);
  const [requestTipoError, setRequestTipoError] = useState('');
  const [requestCentroOptions, setRequestCentroOptions] = useState([]);
  const [requestCentroLoading, setRequestCentroLoading] = useState(false);
  const [requestCentroError, setRequestCentroError] = useState('');
  const [requestLookupsLoaded, setRequestLookupsLoaded] = useState(false);
  const requestLookupsInFlight = React.useRef(null);
  const requestLookupsLoading = requestTipoLoading || requestCentroLoading;
  const [requestSaved, setRequestSaved] = useState(false);
  const [requestProgress, setRequestProgress] = useState(0);
  const [requestSaving, setRequestSaving] = useState(false);
  const [requestDates, setRequestDates] = useState({ emissao: null, necessidade: null });
  const [approvalSelected, setApprovalSelected] = useState(null);
  const [approvalProcessing, setApprovalProcessing] = useState(false);
  const [approvalProgress, setApprovalProgress] = useState(0);
  const [approvalResult, setApprovalResult] = useState('');
  const [approvalSearch, setApprovalSearch] = useState('');
  const [travelExpenses, setTravelExpenses] = useState(initialTravelExpenses);
  const [selectedTravelExpenseId, setSelectedTravelExpenseId] = useState(initialTravelExpenses[0]?.id || null);
  const [travelReportDialogOpen, setTravelReportDialogOpen] = useState(false);
  const [travelReportMapDialogOpen, setTravelReportMapDialogOpen] = useState(false);
  const [travelDialogOpen, setTravelDialogOpen] = useState(false);
  const [travelMapDialogOpen, setTravelMapDialogOpen] = useState(false);
  const [travelRateioEnabled, setTravelRateioEnabled] = useState(false);
  const [travelRateioDialogOpen, setTravelRateioDialogOpen] = useState(false);
  const [travelRateioLines, setTravelRateioLines] = useState([{ centroCusto: '', percentual: '', valor: '' }]);
  const [travelRateioError, setTravelRateioError] = useState('');
  const [travelPendingSubmission, setTravelPendingSubmission] = useState(null);
  const [travelDraft, setTravelDraft] = useState(createTravelDraft);
  const [travelItems, setTravelItems] = useState([createTravelItemLine()]);
  const [travelItemAttachments, setTravelItemAttachments] = useState({});
  const [travelAttachmentTargetItem, setTravelAttachmentTargetItem] = useState('');
  const [travelIntegrating, setTravelIntegrating] = useState(false);
  const [travelKmLoading, setTravelKmLoading] = useState(false);
  const [travelKmError, setTravelKmError] = useState('');
  const [travelRoundTrip, setTravelRoundTrip] = useState(false);
  const [travelTollLoading, setTravelTollLoading] = useState(false);
  const [travelTollEstimated, setTravelTollEstimated] = useState('');
  const [travelTollError, setTravelTollError] = useState('');
  const [travelMapsConfigMissing, setTravelMapsConfigMissing] = useState(false);
  const [travelSaving, setTravelSaving] = useState(false);
  const [travelUploadError, setTravelUploadError] = useState('');
  const [travelFormError, setTravelFormError] = useState('');
  const [travelOriginSuggestions, setTravelOriginSuggestions] = useState([]);
  const [travelDestinationSuggestions, setTravelDestinationSuggestions] = useState([]);
  const [travelAutocompleteLoading, setTravelAutocompleteLoading] = useState({
    origem: false,
    destino: false,
  });
  const [travelAutocompleteError, setTravelAutocompleteError] = useState('');
  const travelAutocompleteTimers = React.useRef({ origem: null, destino: null });
  const travelAutocompleteRequestSeq = React.useRef({ origem: 0, destino: 0 });
  const travelKmAutoTimer = React.useRef(null);
  const lastTravelKmQuery = React.useRef('');
  const travelItemFileInputRef = React.useRef(null);
  const [integrationConfig, setIntegrationConfig] = useState(() => getRuntimeConfig());
  const [integrationConfigSaving, setIntegrationConfigSaving] = useState(false);
  const [integrationConfigStatus, setIntegrationConfigStatus] = useState('');
  const [integrationConfigError, setIntegrationConfigError] = useState('');
  const [showGoogleApiKey, setShowGoogleApiKey] = useState(false);
  const travelRouteMap = React.useMemo(() => {
    const origin = travelDraft.origem?.trim();
    const destination = travelDraft.destino?.trim();
    if (!origin || !destination) {
      return { embedUrl: '', externalUrl: '' };
    }

    const encodedOrigin = encodeURIComponent(origin);
    const encodedDestination = encodeURIComponent(destination);

    return {
      embedUrl: `https://www.google.com/maps?output=embed&saddr=${encodedOrigin}&daddr=${encodedDestination}`,
      externalUrl: `https://www.google.com/maps/dir/?api=1&origin=${encodedOrigin}&destination=${encodedDestination}&travelmode=driving`,
    };
  }, [travelDraft.origem, travelDraft.destino]);
  const canOpenTravelMap = Boolean(travelDraft.origem?.trim() && travelDraft.destino?.trim());
  const travelRateioTotalPercent = travelRateioLines.reduce(
    (sum, line) => sum + (Number(line.percentual) || 0),
    0
  );
  const travelRateioValidLines = travelRateioLines.filter(
    (line) => line.centroCusto && Number(line.percentual) > 0
  );
  const canSaveTravelRateio =
    travelRateioValidLines.length > 0 && Math.abs(travelRateioTotalPercent - 100) <= 0.01;
  const toNumber = (value) => {
    if (value === null || value === undefined) return 0;
    if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
    const normalized = String(value).trim().replace(/\./g, '').replace(',', '.');
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  };
  const parseCurrencyAmount = (value) => {
    if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
    const normalized = String(value || '')
      .replace(/[^\d,.-]/g, '')
      .replace(/\./g, '')
      .replace(',', '.');
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  };
  const getTravelItemLineTotal = (entry) =>
    (Number(entry.quantidade) || 0) * (Number(entry.valorUnitario) || 0);
  const travelItemsTotal = React.useMemo(
    () => travelItems.reduce((sum, entry) => sum + getTravelItemLineTotal(entry), 0),
    [travelItems]
  );
  const hasEstimatedKmItem = travelItems.some((entry) => entry.item === 'KM estimado');
  const hasEstimatedTollItem = travelItems.some((entry) => entry.item === 'Pedágio');
  const disableEstimatedInsertButtons = hasEstimatedKmItem && hasEstimatedTollItem;
  const travelRateioTotalValue = React.useMemo(() => {
    const baseTotal = Number(travelPendingSubmission?.totalValue || 0);
    return travelRateioLines.reduce(
      (sum, line) => sum + (baseTotal * (Number(line.percentual) || 0)) / 100,
      0
    );
  }, [travelPendingSubmission?.totalValue, travelRateioLines]);
  const travelRateioPercentDifference = 100 - travelRateioTotalPercent;
  const travelRateioValueDifference = Number(travelPendingSubmission?.totalValue || 0) - travelRateioTotalValue;
  const hasInvalidTravelDateRange =
    Boolean(travelDraft.periodoInicio) &&
    Boolean(travelDraft.periodoFim) &&
    travelDraft.periodoFim < travelDraft.periodoInicio;

  const normalizePage = (page) => {
    if (!page) return 'dashboard';
    if (page.startsWith('dashboard-')) return page;
    if (page.startsWith('pedidos-')) return 'pedidos';
    return page;
  };
  const normalizedPage = normalizePage(currentPage);
  const requestItemCatalog = [
    { codigo: '02.01.0001', descricao: 'Servico Fornecimento de Agua/Esgoto', tipo: 'Servico', unidade: 'SV' },
    { codigo: '02.01.0002', descricao: 'Servico de Fornecimento de Telecomunicacao', tipo: 'Servico', unidade: 'SV' },
    { codigo: '02.01.0003', descricao: 'Servico de Fornecimento de Energia Eletrica', tipo: 'Servico', unidade: 'SV' },
    { codigo: '02.02.0001', descricao: 'Comissao de Vendedores', tipo: 'Servico', unidade: 'SV' },
    { codigo: '02.03.0001', descricao: 'Adiantamento a Fornecedor', tipo: 'Servico', unidade: 'SV' },
    { codigo: '02.03.0002', descricao: 'Adiantamento de Viagem', tipo: 'Servico', unidade: 'SV' },
    { codigo: '03.01.0001', descricao: 'Notebook Corporativo', tipo: 'Produto', unidade: 'UN' },
    { codigo: '03.01.0002', descricao: 'Monitor 24"', tipo: 'Produto', unidade: 'UN' },
    { codigo: '03.01.0003', descricao: 'Mouse Ergonômico', tipo: 'Produto', unidade: 'UN' },
    { codigo: '03.01.0004', descricao: 'Teclado Slim', tipo: 'Produto', unidade: 'UN' },
    { codigo: '03.01.0005', descricao: 'Headset Corporativo', tipo: 'Produto', unidade: 'UN' },
    { codigo: '03.01.0006', descricao: 'Dock USB-C', tipo: 'Produto', unidade: 'UN' },
    { codigo: '03.01.0007', descricao: 'Cadeira Escritório', tipo: 'Produto', unidade: 'UN' },
    { codigo: '03.01.0008', descricao: 'Suporte Notebook', tipo: 'Produto', unidade: 'UN' },
  ];

  useEffect(() => {
    if (normalizedPage !== 'configuracoes') return;

    const sessionToken = localStorage.getItem('session_token');
    if (!sessionToken) return;

    const localConfig = getRuntimeConfig();
    fetch(`${localConfig.backendBaseUrl}/api/admin/runtime-config`, {
      headers: {
        Authorization: `Bearer ${sessionToken}`,
      },
    })
      .then(async (response) => {
        const payload = await response.json().catch(() => null);
        if (!response.ok) {
          throw new Error(payload?.message || 'Não foi possível carregar configurações do backend.');
        }
        return payload;
      })
      .then((payload) => {
        setIntegrationConfig((prev) => ({
          ...prev,
          ...payload,
          backendBaseUrl: localConfig.backendBaseUrl,
        }));
      })
      .catch(() => {
        // Mantém configuração local se backend não responder.
      });
  }, [normalizedPage]);

  useEffect(() => {
    if (pedidoSelecionado?.itens?.length) {
      setItemSelecionado(pedidoSelecionado.itens[0].sku);
    }
  }, [pedidoSelecionado]);

  useEffect(() => {
    if (normalizedPage === 'tarefas' && !approvalSelected) {
      setApprovalSelected(approvalPedidos[0]);
    }
  }, [normalizedPage, approvalSelected, approvalPedidos]);

  useEffect(() => {
    if (normalizedPage !== 'despesas-viagens') return;
    if (!travelExpenses.length) return;
    const stillExists = travelExpenses.some((row) => row.id === selectedTravelExpenseId);
    if (!stillExists) {
      setSelectedTravelExpenseId(travelExpenses[0].id);
    }
  }, [normalizedPage, travelExpenses, selectedTravelExpenseId]);

  const pedidosFiltrados = pedidosData
    .filter((pedido) => {
      const term = pedidoSearch.toLowerCase();
      const matchTerm =
        pedido.id.toLowerCase().includes(term) ||
        pedido.fornecedor.toLowerCase().includes(term) ||
        pedido.centroCusto.toLowerCase().includes(term);
      const matchStatus = pedidoStatus === 'todos' || pedido.status === pedidoStatus;
      return matchTerm && matchStatus;
    })
    .sort((a, b) => {
      if (pedidoSort === 'data') return a.data.localeCompare(b.data);
      if (pedidoSort === 'total') return a.total.localeCompare(b.total);
      return a.id.localeCompare(b.id);
    });

  const itensFiltrados = (pedidoSelecionado?.itens || []).filter((item) => {
    const term = itemSearch.toLowerCase();
    return (
      item.sku.toLowerCase().includes(term) ||
      item.nome.toLowerCase().includes(term)
    );
  });

  useEffect(() => {
    setPedidosTableCount(pedidosFiltrados.length);
  }, [pedidosFiltrados.length]);

  useEffect(() => {
    setItensTableCount(itensFiltrados.length);
  }, [itensFiltrados.length]);

  const loadRequestLookups = React.useCallback(() => {
    if (requestLookupsLoaded) {
      return Promise.resolve();
    }
    if (requestLookupsInFlight.current) {
      return requestLookupsInFlight.current;
    }

    setRequestTipoError('');
    setRequestCentroError('');
    setRequestTipoLoading(true);
    setRequestCentroLoading(true);

    const loginUsuario = localStorage.getItem('username') || user?.username || '';
    const parameters = `${API_CONFIG.CONSULTA_SQL.PARAMS.USUARIO}=${loginUsuario};${API_CONFIG.CONSULTA_SQL.PARAMS.CODCOLIGADA}=${API_CONFIG.CONSULTA_SQL.COD_COLIGADA_PARAM}`;

    const tipoPromise = getConsultaSql({
      codSentenca: API_CONFIG.CONSULTA_SQL.SENTENCAS.TIPO_SOLICITACAO,
      codColigada: API_CONFIG.CONSULTA_SQL.COD_COLIGADA_PATH,
      codSistema: API_CONFIG.CONSULTA_SQL.COD_SISTEMA,
      parameters,
      useUppercaseParameters: API_CONFIG.CONSULTA_SQL.USE_UPPERCASE_PARAMS,
      encodeQuery: API_CONFIG.CONSULTA_SQL.ENCODE_QUERY,
      basePath: API_CONFIG.CONSULTA_SQL.BASE_PATH,
    });

    const centroPromise = getConsultaSql({
      codSentenca: API_CONFIG.CONSULTA_SQL.SENTENCAS.CENTRO_CUSTO,
      codColigada: API_CONFIG.CONSULTA_SQL.COD_COLIGADA_PATH,
      codSistema: API_CONFIG.CONSULTA_SQL.COD_SISTEMA,
      parameters,
      useUppercaseParameters: API_CONFIG.CONSULTA_SQL.USE_UPPERCASE_PARAMS,
      encodeQuery: API_CONFIG.CONSULTA_SQL.ENCODE_QUERY,
      basePath: API_CONFIG.CONSULTA_SQL.BASE_PATH,
    });

    const normalizeSqlRows = (result) => {
      if (Array.isArray(result)) return result;
      if (Array.isArray(result?.data)) return result.data;
      if (Array.isArray(result?.values)) return result.values;
      if (Array.isArray(result?.items)) return result.items;
      return [];
    };

    requestLookupsInFlight.current = Promise.allSettled([tipoPromise, centroPromise])
      .then(([tipoResult, centroResult]) => {
        if (tipoResult.status === 'fulfilled') {
          const rows = normalizeSqlRows(tipoResult.value);
          const mapped = rows
            .map((row) => ({
              codigo: row?.CODTMV ?? row?.codtmv ?? row?.Codigo ?? row?.codigo ?? '',
              nome: row?.NOME ?? row?.nome ?? row?.Nome ?? row?.descricao ?? '',
            }))
            .filter((row) => row.codigo);

          setRequestTipoOptions(mapped);
          setRequestMeta((prev) => ({
            ...prev,
            tipoSolicitacao: mapped.some((opt) => opt.codigo === prev.tipoSolicitacao)
              ? prev.tipoSolicitacao
              : mapped[0]?.codigo || prev.tipoSolicitacao,
          }));
        } else {
          setRequestTipoError('Não foi possível carregar o tipo de solicitação.');
          if (API_CONFIG.GENERAL.DEBUG) {
            console.error('Erro ao carregar tipo de solicitação:', tipoResult.reason);
          }
        }

        if (centroResult.status === 'fulfilled') {
          const rows = normalizeSqlRows(centroResult.value);
          const mapped = rows
            .map((row) => ({
              codigo: row?.CODCCUSTO ?? row?.codccusto ?? '',
              nome: row?.NOME ?? row?.nome ?? '',
            }))
            .filter((row) => row.codigo);

          setRequestCentroOptions(mapped);
          setRequestMeta((prev) => ({
            ...prev,
            centroCusto: mapped.some((opt) => opt.codigo === prev.centroCusto)
              ? prev.centroCusto
              : mapped[0]?.codigo || prev.centroCusto,
          }));
        } else {
          setRequestCentroError('Não foi possível carregar o centro de custo.');
          if (API_CONFIG.GENERAL.DEBUG) {
            console.error('Erro ao carregar centro de custo:', centroResult.reason);
          }
        }

        setRequestLookupsLoaded(true);
      })
      .finally(() => {
        setRequestTipoLoading(false);
        setRequestCentroLoading(false);
        requestLookupsInFlight.current = null;
      });

    return requestLookupsInFlight.current;
  }, [requestLookupsLoaded, user]);

  const handleOpenRequest = async () => {
    const now = new Date();
    const dataHora = now.toLocaleString('pt-BR');
    const usuarioExibicao = user?.name?.formatted || user?.name || user?.username || 'Usuário';
    setRequestStamp({ dataHora, usuario: usuarioExibicao });
    setRequestSaved(false);
    setRequestDates({ emissao: null, necessidade: null });
    setShowRequestCard(true);
    loadRequestLookups();
  };

  const handleAddItem = () => {
    setRequestItems((prev) => [
      ...prev,
      { codigo: '', descricao: '', tipo: 'Servico', quantidade: '', unidade: '' },
    ]);
  };

  const handleRemoveItem = (index) => {
    setRequestItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleItemChange = (index, field, value) => {
    setRequestItems((prev) =>
      prev.map((item, idx) => {
        if (idx !== index) return item;
        const next = { ...item, [field]: value };
        if (field === 'codigo') {
          const match = requestItemCatalog.find((opt) => opt.codigo === value);
          if (match) {
            next.descricao = match.descricao;
            next.tipo = match.tipo;
            next.unidade = match.unidade;
          }
        }
        if (field === 'descricao') {
          const match = requestItemCatalog.find((opt) => opt.descricao === value);
          if (match) {
            next.codigo = match.codigo;
            next.tipo = match.tipo;
            next.unidade = match.unidade;
          }
        }
        return next;
      })
    );
  };

  const handleApprovalAction = (action) => {
    if (!approvalSelected || approvalProcessing) return;
    setApprovalProcessing(true);
    setApprovalProgress(0);
    setApprovalResult('');

    const interval = setInterval(() => {
      setApprovalProgress((prev) => {
        const next = Math.min(prev + 20, 100);
        if (next === 100) {
          clearInterval(interval);
          const now = new Date().toLocaleString('pt-BR');
          const approvers = ['Juliana Freitas', 'Bruno Almeida', 'Renata Carvalho', 'Marina Duarte'];
          const approver = approvers[Math.floor(Math.random() * approvers.length)];
          const updated =
            action === 'aprovado'
              ? { ...approvalSelected, aprovacao: action, aprovadoEm: now, aprovadoPor: approver }
              : { ...approvalSelected, aprovacao: action, reprovadoEm: now, reprovadoPor: approver };
          setApprovalPedidos((prevList) =>
            prevList.map((item) => (item.id === updated.id ? updated : item))
          );
          setApprovalSelected(updated);
          setApprovalProcessing(false);
          setApprovalResult(
            action === 'aprovado'
              ? 'Aprovado com sucesso'
              : 'Pedido de compras Reprovado'
          );
        }
        return next;
      });
    }, 300);
  };

  const handleSaveRequest = () => {
    setRequestSaving(true);
    setRequestProgress(0);
    const interval = setInterval(() => {
      setRequestProgress((prev) => {
        const next = Math.min(prev + 20, 100);
        if (next === 100) {
          clearInterval(interval);
          setRequestMeta((prevMeta) => ({ ...prevMeta, numeroRm: '000235' }));
          setRequestSaved(true);
          setRequestSaving(false);
        }
        return next;
      });
    }, 300);
  };

  const resetTravelDraft = () => {
    Object.values(travelAutocompleteTimers.current).forEach((timerId) => {
      if (timerId) clearTimeout(timerId);
    });
    travelAutocompleteTimers.current = { origem: null, destino: null };
    if (travelKmAutoTimer.current) clearTimeout(travelKmAutoTimer.current);
    travelKmAutoTimer.current = null;
    lastTravelKmQuery.current = '';
    setTravelDraft(createTravelDraft());
    setTravelItems([createTravelItemLine()]);
    setTravelItemAttachments({});
    setTravelAttachmentTargetItem('');
    setTravelIntegrating(false);
    setTravelKmLoading(false);
    setTravelKmError('');
    setTravelRoundTrip(false);
    setTravelTollLoading(false);
    setTravelTollEstimated('');
    setTravelTollError('');
    setTravelMapsConfigMissing(false);
    setTravelSaving(false);
    setTravelUploadError('');
    setTravelFormError('');
    setTravelOriginSuggestions([]);
    setTravelDestinationSuggestions([]);
    setTravelAutocompleteLoading({ origem: false, destino: false });
    setTravelAutocompleteError('');
    setTravelMapDialogOpen(false);
    setTravelRateioEnabled(false);
    setTravelRateioDialogOpen(false);
    setTravelRateioLines([{ centroCusto: '', percentual: '', valor: '' }]);
    setTravelRateioError('');
    setTravelPendingSubmission(null);
  };

  const handleOpenTravelDialog = () => {
    resetTravelDraft();
    loadRequestLookups();
    setTravelDialogOpen(true);
  };

  const handleSelectTravelType = (type) => {
    setTravelDraft((prev) => ({ ...prev, tipoSolicitacao: type }));
  };

  const handleAddTravelItem = () => {
    setTravelItems((prev) => [...prev, createTravelItemLine()]);
  };

  const handleRemoveTravelItem = (index) => {
    setTravelItems((prev) => {
      if (prev.length === 1) return prev;
      const removedItem = prev[index]?.item;
      if (removedItem) {
        setTravelItemAttachments((current) => {
          const next = { ...current };
          delete next[removedItem];
          return next;
        });
      }
      return prev.filter((_, idx) => idx !== index);
    });
  };

  const handleTravelItemChange = (index, field, value) => {
    setTravelFormError('');
    setTravelItems((prev) =>
      prev.map((entry, idx) => {
        if (idx !== index) return entry;
        const nextEntry = { ...entry, [field]: value };
        if (field === 'item' && entry.item && entry.item !== value) {
          setTravelItemAttachments((current) => {
            const next = { ...current };
            delete next[entry.item];
            return next;
          });
        }
        return nextEntry;
      })
    );
  };

  const handleOpenTravelItemAttachment = (itemName) => {
    if (!itemName || itemName === 'KM estimado') return;
    setTravelAttachmentTargetItem(itemName);
    travelItemFileInputRef.current?.click();
  };

  const handleTravelItemAttachmentUpload = (event) => {
    const files = Array.from(event.target.files || []);
    if (!travelAttachmentTargetItem || files.length === 0) return;
    setTravelUploadError('');
    setTravelItemAttachments((prev) => ({
      ...prev,
      [travelAttachmentTargetItem]: [...(prev[travelAttachmentTargetItem] || []), ...files],
    }));
    event.target.value = '';
  };

  const handleRemoveTravelItemAttachment = (itemName, fileIndex) => {
    setTravelItemAttachments((prev) => {
      const current = prev[itemName] || [];
      const nextFiles = current.filter((_, idx) => idx !== fileIndex);
      const next = { ...prev };
      if (nextFiles.length === 0) {
        delete next[itemName];
      } else {
        next[itemName] = nextFiles;
      }
      return next;
    });
  };

  const handleIncludeEstimatedKmItem = () => {
    const km = toNumber(travelDraft.kmEstimado);
    if (km <= 0) {
      setTravelKmError('Calcule o KM estimado antes de incluir esse item.');
      return;
    }
    setTravelKmError('');
    setTravelItems((prev) => {
      const index = prev.findIndex((entry) => entry.item === 'KM estimado');
      const kmAsText = km.toFixed(2);
      if (index >= 0) {
        return prev.map((entry, idx) =>
          idx === index ? { ...entry, item: 'KM estimado', quantidade: kmAsText, valorUnitario: '1' } : entry
        );
      }
      return [...prev, { item: 'KM estimado', quantidade: kmAsText, valorUnitario: '1' }];
    });
  };

  const handleIncludeEstimatedTollItem = () => {
    const tollAmount = parseCurrencyAmount(travelTollEstimated);
    if (tollAmount <= 0) {
      setTravelTollError('Calcule o pedágio estimado antes de incluir esse item.');
      return;
    }
    setTravelTollError('');
    setTravelItems((prev) => {
      const index = prev.findIndex((entry) => entry.item === 'Pedágio');
      const tollAsText = tollAmount.toFixed(2);
      if (index >= 0) {
        return prev.map((entry, idx) =>
          idx === index ? { ...entry, item: 'Pedágio', quantidade: '1', valorUnitario: tollAsText } : entry
        );
      }
      return [...prev, { item: 'Pedágio', quantidade: '1', valorUnitario: tollAsText }];
    });
  };

  const handleTravelDraftChange = (field, value) => {
    setTravelDraft((prev) => {
      const next = { ...prev, [field]: value };
      if (field === 'origem' || field === 'destino') {
        next.kmEstimado = '';
      }
      if (field === 'periodoInicio' && next.periodoFim && next.periodoFim < value) {
        next.periodoFim = '';
      }
      return next;
    });
    if (field === 'periodoInicio' || field === 'periodoFim' || field === 'motivo') {
      setTravelFormError('');
    }
    if (field === 'origem' || field === 'destino') {
      setTravelFormError('');
      setTravelKmError('');
      setTravelTollEstimated('');
      setTravelTollError('');
      setTravelAutocompleteError('');
      const suggestionsSetter =
        field === 'origem' ? setTravelOriginSuggestions : setTravelDestinationSuggestions;

      if (!value || value.trim().length < 3) {
        suggestionsSetter([]);
        setTravelAutocompleteLoading((prev) => ({ ...prev, [field]: false }));
        return;
      }

      if (travelAutocompleteTimers.current[field]) {
        clearTimeout(travelAutocompleteTimers.current[field]);
      }

      travelAutocompleteTimers.current[field] = setTimeout(async () => {
        const requestId = (travelAutocompleteRequestSeq.current[field] || 0) + 1;
        travelAutocompleteRequestSeq.current[field] = requestId;
        setTravelAutocompleteLoading((prev) => ({ ...prev, [field]: true }));
        try {
          const suggestions = await getPlaceSuggestions(value);
          if (travelAutocompleteRequestSeq.current[field] !== requestId) {
            return;
          }
          suggestionsSetter(suggestions);
        } catch (error) {
          if (travelAutocompleteRequestSeq.current[field] !== requestId) {
            return;
          }
          const message = error?.message || 'Falha ao buscar sugestões de endereço.';
          if (message.includes('GOOGLE_MAPS_API_KEY')) {
            setTravelMapsConfigMissing(true);
            setTravelAutocompleteError('Autocomplete indisponível: configure a chave Google em Configurações.');
          } else {
            setTravelAutocompleteError(message);
          }
          suggestionsSetter([]);
        } finally {
          if (travelAutocompleteRequestSeq.current[field] === requestId) {
            setTravelAutocompleteLoading((prev) => ({ ...prev, [field]: false }));
          }
        }
      }, 280);
    }
  };

  const handleSelectTravelSuggestion = async (field, suggestion) => {
    const selectedText = suggestion?.text || '';
    if (!selectedText) return;

    setTravelDraft((prev) => {
      const next = { ...prev, [field]: selectedText };
      if (field === 'origem' || field === 'destino') {
        next.kmEstimado = '';
      }
      return next;
    });

    if (field === 'origem') {
      setTravelOriginSuggestions([]);
    } else {
      setTravelDestinationSuggestions([]);
    }
    setTravelAutocompleteError('');
    setTravelKmError('');
    setTravelTollError('');

    const origin = field === 'origem' ? selectedText : travelDraft.origem;
    const destination = field === 'destino' ? selectedText : travelDraft.destino;
    if (origin && destination) {
      await handleCalculateTravelKm(origin, destination);
    }
  };

  const handleCalculateTravelKm = React.useCallback(async (originOverride, destinationOverride) => {
    const origin = originOverride || travelDraft.origem;
    const destination = destinationOverride || travelDraft.destino;
    if (!origin || !destination) {
      setTravelKmError('Informe origem e destino para calcular o KM estimado.');
      return;
    }
    setTravelKmLoading(true);
    setTravelKmError('');
    try {
      const estimate = await getTravelRouteEstimate({
        origin,
        destination,
        roundTrip: travelRoundTrip,
        includeTolls: false,
      });
      setTravelMapsConfigMissing(false);
      setTravelDraft((prev) => ({
        ...prev,
        kmEstimado: estimate.distanceKm.toString().replace('.', ','),
      }));
    } catch (error) {
      const message = error?.message || 'Falha ao calcular KM estimado.';
      if (message.includes('GOOGLE_MAPS_API_KEY')) {
        setTravelMapsConfigMissing(true);
        setTravelKmError('Integração de mapa não configurada. Defina a chave Google em Configurações.');
      } else {
        setTravelKmError(message);
      }
    } finally {
      setTravelKmLoading(false);
    }
  }, [travelDraft.origem, travelDraft.destino, travelRoundTrip]);

  const handleCalculateEstimatedToll = async () => {
    const origin = travelDraft.origem;
    const destination = travelDraft.destino;
    if (!origin || !destination) {
      setTravelTollError('Informe origem e destino para calcular o pedágio estimado.');
      return;
    }

    setTravelTollLoading(true);
    setTravelTollError('');
    try {
      const estimate = await getTravelRouteEstimate({
        origin,
        destination,
        roundTrip: travelRoundTrip,
        includeTolls: true,
      });
      setTravelMapsConfigMissing(false);
      setTravelDraft((prev) => ({
        ...prev,
        kmEstimado: estimate.distanceKm.toString().replace('.', ','),
      }));
      if (estimate.tollAmount === null || estimate.tollAmount === undefined) {
        setTravelTollEstimated('Sem valor disponível para esta rota');
      } else {
        const currency = estimate.tollCurrency || 'BRL';
        const formatted = new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency,
        }).format(Number(estimate.tollAmount));
        setTravelTollEstimated(formatted);
      }
    } catch (error) {
      const message = error?.message || 'Falha ao calcular pedágio estimado.';
      if (message.includes('GOOGLE_MAPS_API_KEY')) {
        setTravelMapsConfigMissing(true);
        setTravelTollError('Integração de mapa não configurada. Defina a chave Google em Configurações.');
      } else {
        setTravelTollError(message);
      }
    } finally {
      setTravelTollLoading(false);
    }
  };

  const handleOpenTravelMap = () => {
    if (!canOpenTravelMap) {
      setTravelKmError('Preencha origem e destino para visualizar o mapa.');
      return;
    }
    setTravelKmError('');
    setTravelMapDialogOpen(true);
  };

  useEffect(() => {
    const origem = travelDraft.origem?.trim();
    const destino = travelDraft.destino?.trim();
    if (!origem || !destino || origem.length < 3 || destino.length < 3) {
      return;
    }

    const queryKey = `${origem}::${destino}::${travelRoundTrip ? 'rt' : 'ow'}`;
    if (lastTravelKmQuery.current === queryKey) {
      return;
    }

    if (travelKmAutoTimer.current) {
      clearTimeout(travelKmAutoTimer.current);
    }

    travelKmAutoTimer.current = setTimeout(() => {
      handleCalculateTravelKm(origem, destino).then(() => {
        lastTravelKmQuery.current = queryKey;
      });
    }, 700);

    return () => {
      if (travelKmAutoTimer.current) {
        clearTimeout(travelKmAutoTimer.current);
      }
    };
  }, [travelDraft.origem, travelDraft.destino, travelRoundTrip, handleCalculateTravelKm]);

  const handleIntegrateTravelWithRm = () => {
    if (
      !travelDraft.tipoSolicitacao ||
      !travelDraft.origem ||
      !travelDraft.destino ||
      (!travelRateioEnabled && !travelDraft.motivo) ||
      !travelDraft.periodoInicio ||
      !travelDraft.periodoFim ||
      travelDraft.periodoFim < travelDraft.periodoInicio
    ) {
      setTravelFormError('Revise os campos obrigatórios e o período da viagem.');
      return;
    }
    setTravelFormError('');
    setTravelIntegrating(true);
    setTimeout(() => {
      const rmNumber = `RM-${Math.floor(100000 + Math.random() * 899999)}`;
      setTravelDraft((prev) => ({ ...prev, numeroRm: rmNumber }));
      setTravelIntegrating(false);
    }, 900);
  };

  const validateTravelFormBeforeSave = () => {
    if (!travelDraft.tipoSolicitacao) {
      setTravelFormError('Selecione o tipo da solicitação.');
      return null;
    }
    if (!travelDraft.origem || !travelDraft.destino) {
      setTravelFormError('Preencha origem e destino.');
      return null;
    }
    if (!travelRateioEnabled && !travelDraft.motivo) {
      setTravelFormError('Informe o centro de custo.');
      return null;
    }
    if (!travelDraft.periodoInicio || !travelDraft.periodoFim) {
      setTravelFormError('Preencha as datas de início e fim.');
      return null;
    }
    if (travelDraft.periodoFim < travelDraft.periodoInicio) {
      setTravelFormError('A data fim não pode ser menor que a data início.');
      return null;
    }

    const completeItems = travelItems.filter(
      (entry) => entry.item && Number(entry.valorUnitario) > 0 && Number(entry.quantidade) > 0
    );
    const selectedItems = completeItems.map((entry) => entry.item);
    if (selectedItems.length === 0) {
      setTravelFormError('Informe ao menos um item com valor unitário e quantidade.');
      return null;
    }
    if (completeItems.length !== travelItems.filter((entry) => entry.item).length) {
      setTravelFormError('Complete valor unitário e quantidade de todos os itens selecionados.');
      return null;
    }

    const totalValue = travelItems.reduce((sum, entry) => sum + getTravelItemLineTotal(entry), 0);
    setTravelFormError('');
    return { selectedItems, totalValue };
  };

  const saveTravelExpense = async ({ selectedItems, totalValue, rateio = [] }) => {
    setTravelSaving(true);
    setTravelUploadError('');

    const filesByItem = Object.entries(travelItemAttachments).reduce((acc, [itemName, files]) => {
      if (itemName && Array.isArray(files) && files.length > 0) {
        acc[itemName] = files;
      }
      return acc;
    }, {});
    const allFiles = Object.values(filesByItem).flat();

    let uploadedFiles = [];
    try {
      uploadedFiles = allFiles.length > 0 ? await uploadFiles(allFiles) : [];
    } catch (error) {
      setTravelUploadError(error?.message || 'Falha ao enviar anexos.');
      setTravelSaving(false);
      return;
    }

    const nextIdNumber = travelExpenses.length + 1;
    const endDate = travelDraft.periodoFim ? new Date(`${travelDraft.periodoFim}T00:00:00`) : new Date();
    const paymentDate = new Date(endDate);
    paymentDate.setDate(paymentDate.getDate() + 7);
    const dataPrevistaPgto = travelDraft.numeroRm ? paymentDate.toLocaleDateString('pt-BR') : '--';
    const newExpense = {
      id: `DV-${String(nextIdNumber).padStart(4, '0')}`,
      tipoSolicitacao: travelDraft.tipoSolicitacao,
      origem: travelDraft.origem,
      destino: travelDraft.destino,
      motivo: travelDraft.motivo,
      centroCusto: rateio.length > 0 ? 'Rateado' : travelDraft.motivo,
      periodo: `${travelDraft.periodoInicio} a ${travelDraft.periodoFim}`,
      kmEstimado: travelDraft.kmEstimado ? `${travelDraft.kmEstimado} km` : 'Não calculado',
      numeroRm: travelDraft.numeroRm,
      total: `R$ ${totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      dataPrevistaPgto,
      pgtoRealizadoEm: '--',
      status: travelDraft.numeroRm ? 'Em fila de pagamento' : 'Aguardando integração',
      itens: selectedItems,
      itensDetalhes: travelItems
        .filter((entry) => entry.item)
        .map((entry) => ({
          item: entry.item,
          quantidade: Number(entry.quantidade) || 0,
          valorUnitario: Number(entry.valorUnitario) || 0,
          total: getTravelItemLineTotal(entry),
        })),
      anexosPorItem: Object.entries(filesByItem).map(([item, files]) => ({
        item,
        arquivos: files.map((file) => file.name),
      })),
      rateio,
      anexos: uploadedFiles.length,
    };

    setTravelExpenses((prev) => [newExpense, ...prev]);
    setTravelDialogOpen(false);
    setTravelRateioDialogOpen(false);
    resetTravelDraft();
    setTravelSaving(false);
  };

  const handleAddTravelRateioLine = () => {
    setTravelRateioLines((prev) => [...prev, { centroCusto: '', percentual: '', valor: '' }]);
  };

  const handleRemoveTravelRateioLine = (index) => {
    setTravelRateioLines((prev) => {
      if (prev.length === 1) return prev;
      return prev.filter((_, idx) => idx !== index);
    });
  };

  const handleTravelRateioLineChange = (index, field, value) => {
    setTravelRateioError('');
    const baseTotal = Number(travelPendingSubmission?.totalValue || 0);
    setTravelRateioLines((prev) =>
      prev.map((line, idx) => {
        if (idx !== index) return line;
        if (field === 'centroCusto') {
          return { ...line, centroCusto: value };
        }
        if (field === 'percentual') {
          const percentual = toNumber(value);
          const valor = baseTotal > 0 ? (baseTotal * percentual) / 100 : 0;
          return {
            ...line,
            percentual: value,
            valor: valor ? valor.toFixed(2) : '',
          };
        }
        if (field === 'valor') {
          const valor = toNumber(value);
          const percentual = baseTotal > 0 ? (valor / baseTotal) * 100 : 0;
          return {
            ...line,
            valor: value,
            percentual: percentual ? percentual.toFixed(2) : '',
          };
        }
        return { ...line, [field]: value };
      })
    );
  };

  const handleSaveTravel = async () => {
    const prepared = validateTravelFormBeforeSave();
    if (!prepared) {
      return;
    }

    if (travelRateioEnabled) {
      setTravelPendingSubmission(prepared);
      setTravelRateioError('');
      setTravelRateioLines((prev) => {
        if (prev.length > 0 && prev.some((line) => line.centroCusto || line.percentual)) {
          return prev;
        }
        return [{ centroCusto: travelDraft.motivo || '', percentual: '100', valor: prepared.totalValue.toFixed(2) }];
      });
      setTravelDialogOpen(false);
      setTravelRateioDialogOpen(true);
      return;
    }

    await saveTravelExpense({ ...prepared, rateio: [] });
  };

  const handleProceedToTravelRateio = () => {
    const prepared = validateTravelFormBeforeSave();
    if (!prepared) {
      return;
    }
    setTravelPendingSubmission(prepared);
    setTravelRateioError('');
    setTravelRateioLines((prev) => {
      if (prev.length > 0 && prev.some((line) => line.centroCusto || line.percentual)) {
        return prev;
      }
      return [{ centroCusto: '', percentual: '', valor: '' }];
    });
    setTravelDialogOpen(false);
    setTravelRateioDialogOpen(true);
  };

  const handleConfirmTravelRateio = async () => {
    if (!travelPendingSubmission) {
      setTravelRateioError('Não há uma solicitação pendente para rateio.');
      return;
    }

    const validLines = travelRateioLines.filter(
      (line) => line.centroCusto && Number(line.percentual) > 0
    );
    if (validLines.length === 0) {
      setTravelRateioError('Informe ao menos um centro de custo com percentual.');
      return;
    }

    if (Math.abs(travelRateioTotalPercent - 100) > 0.01) {
      setTravelRateioError('O rateio deve totalizar exatamente 100%.');
      return;
    }

    const totalValue = Number(travelPendingSubmission.totalValue || 0);
    const rateio = validLines.map((line) => {
      const percentual = Number(line.percentual) || 0;
      const valor = (totalValue * percentual) / 100;
      return {
        centroCusto: line.centroCusto,
        percentual,
        valor,
      };
    });

    await saveTravelExpense({ ...travelPendingSubmission, rateio });
  };

  const handleIntegrationConfigChange = (field, value) => {
    setIntegrationConfig((prev) => ({ ...prev, [field]: value }));
    setIntegrationConfigStatus('');
    setIntegrationConfigError('');
  };

  const handleSaveIntegrationConfig = async () => {
    setIntegrationConfigSaving(true);
    setIntegrationConfigStatus('');
    setIntegrationConfigError('');

    const storedConfig = saveRuntimeConfig(integrationConfig);
    setIntegrationConfig(storedConfig);

    const sessionToken = localStorage.getItem('session_token');
    if (!sessionToken) {
      setIntegrationConfigSaving(false);
      setIntegrationConfigStatus('Configuração local salva. Faça login novamente para sincronizar no backend.');
      return;
    }

    try {
      const response = await fetch(`${storedConfig.backendBaseUrl}/api/admin/runtime-config`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({
          rmApiBaseUrl: storedConfig.rmApiBaseUrl,
          rmAuthUsersPath: storedConfig.rmAuthUsersPath,
          rmConsultaBasePath: storedConfig.rmConsultaBasePath,
          googleMapsApiKey: storedConfig.googleMapsApiKey,
        }),
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(payload?.message || 'Falha ao sincronizar configurações no backend.');
      }

      setIntegrationConfigStatus('Configurações salvas e sincronizadas com o backend.');
    } catch (error) {
      setIntegrationConfigError(
        error?.message || 'Configuração local salva, mas não foi possível sincronizar no backend.'
      );
    } finally {
      setIntegrationConfigSaving(false);
    }
  };

  const formatDate = (date) => (date ? date.toLocaleDateString('pt-BR') : 'Selecione...');

  const coverByPage = {
    dashboard: {
      title: 'Painel Geral',
      description: 'Resumo Operacional',
      status: 'Ativo',
      owner: 'Controladoria',
    },
    'dashboard-compras': {
      title: 'Dashboard - Compras',
      description: 'Indicadores de pedidos, aprovações e gastos.',
      status: 'Ativo',
      owner: 'Compras',
    },
    'dashboard-estoque': {
      title: 'Dashboard - Estoque',
      description: 'Níveis de saldo, rupturas e giro por categoria.',
      status: 'Ativo',
      owner: 'Supply',
    },
    'dashboard-faturamento': {
      title: 'Dashboard - Faturamento',
      description: 'Evolução de receita, devoluções e títulos.',
      status: 'Ativo',
      owner: 'Financeiro',
    },
    'dashboard-orcamento': {
      title: 'Dashboard - Orçamento',
      description: 'Visão comparativa entre orçado e realizado.',
      status: 'Ativo',
      owner: 'Controladoria',
    },
    tarefas: {
      title: 'Tarefas e Aprovações',
      description: 'Acompanhamento de aprovações e pendências.',
      status: 'Em análise',
      owner: 'Financeiro',
    },
    pedidos: {
      title: 'Pedidos',
      description: 'Gestão de solicitações e aprovações.',
      status: 'Em revisão',
      owner: 'Compras',
    },
    'notas-fiscais': {
      title: 'Notas Fiscais',
      description: 'Controle fiscal e validações.',
      status: 'Em dia',
      owner: 'Fiscal',
    },
    'despesas-viagens': {
      title: 'Despesas com Viagens',
      description: 'Controle de gastos de deslocamento e prestação de contas.',
      status: 'Em revisão',
      owner: 'Financeiro',
    },
    relatorios: {
      title: 'Relatórios',
      description: 'Indicadores e consolidações.',
      status: 'Atualizado',
      owner: 'BI',
    },
    configuracoes: {
      title: 'Configurações',
      description: 'Parâmetros do sistema e perfis.',
      status: 'Restrito',
      owner: 'TI',
    },
    cadastros: {
      title: 'Cadastros',
      description: 'Base corporativa de dados.',
      status: 'Em revisão',
      owner: 'Controladoria',
    },
    'cadastros-estoque': {
      title: 'Cadastros - Estoque',
      description: 'Catálogo de produtos e locais.',
      status: 'Ativo',
      owner: 'Supply',
    },
    'cadastros-estoque-produtos': {
      title: 'Produtos',
      description: 'Cadastro e manutenção de itens.',
      status: 'Ativo',
      owner: 'Supply',
    },
    'cadastros-estoque-local': {
      title: 'Local de estoque',
      description: 'Endereços e depósitos.',
      status: 'Ativo',
      owner: 'Supply',
    },
    'cadastros-financeiro': {
      title: 'Cadastros - Financeiro',
      description: 'Clientes, fornecedores e contas.',
      status: 'Ativo',
      owner: 'Financeiro',
    },
    'cadastros-financeiro-clientes': {
      title: 'Cliente e Fornecedor',
      description: 'Cadastro financeiro consolidado.',
      status: 'Ativo',
      owner: 'Financeiro',
    },
    'cadastros-financeiro-contas': {
      title: 'Contas Caixa',
      description: 'Contas e centros financeiros.',
      status: 'Ativo',
      owner: 'Financeiro',
    },
    'cadastros-est-compras-fat': {
      title: 'Est. Compras e Fat.',
      description: 'Parâmetros de compras e faturamento.',
      status: 'Em revisão',
      owner: 'Compras',
    },
    'cadastros-globais': {
      title: 'Globais',
      description: 'Parâmetros globais do sistema.',
      status: 'Restrito',
      owner: 'TI',
    },
  };

  const activeCover = coverByPage[normalizedPage] || coverByPage.dashboard;

  const cadastrosOverviewCards = [
    {
      id: 'cadastros-estoque',
      title: 'Estoque',
      description: 'Produtos, locais e endereços.',
      path: '/cadastros/estoque',
    },
    {
      id: 'cadastros-financeiro',
      title: 'Financeiro',
      description: 'Clientes, fornecedores e contas.',
      path: '/cadastros/financeiro',
    },
    {
      id: 'cadastros-est-compras-fat',
      title: 'Est. Compras e Fat.',
      description: 'Parâmetros de compras e faturamento.',
      path: '/cadastros/est-compras-fat',
    },
    {
      id: 'cadastros-globais',
      title: 'Globais',
      description: 'Regras e parâmetros globais.',
      path: '/cadastros/globais',
    },
  ];

  const cadastrosEstoqueCards = [
    {
      id: 'cadastros-estoque-produtos',
      title: 'Produtos',
      description: 'Catálogo e classificação de itens.',
      path: '/cadastros/estoque/produtos',
    },
    {
      id: 'cadastros-estoque-local',
      title: 'Local de estoque',
      description: 'Depósitos e áreas de guarda.',
      path: '/cadastros/estoque/local',
    },
  ];

  const cadastrosFinanceiroCards = [
    {
      id: 'cadastros-financeiro-clientes',
      title: 'Cliente e Fornecedor',
      description: 'Parceiros financeiros e tributação.',
      path: '/cadastros/financeiro/clientes',
    },
    {
      id: 'cadastros-financeiro-contas',
      title: 'Contas Caixa',
      description: 'Caixas, bancos e conciliações.',
      path: '/cadastros/financeiro/contas',
    },
  ];

  const cadastrosProdutos = [
    { codigo: 'PRD-001', descricao: 'Notebook Corporativo', categoria: 'Equipamentos', status: 'Ativo' },
    { codigo: 'PRD-014', descricao: 'Monitor 24"', categoria: 'Periféricos', status: 'Ativo' },
    { codigo: 'PRD-021', descricao: 'Headset', categoria: 'Periféricos', status: 'Bloqueado' },
    { codigo: 'PRD-038', descricao: 'Cadeira Escritório', categoria: 'Mobiliário', status: 'Ativo' },
  ];

  const cadastrosLocais = [
    { codigo: 'ALM-CENTRAL', descricao: 'Almoxarifado Central', tipo: 'Depósito', responsavel: 'Logística', status: 'Ativo' },
    { codigo: 'TI-ANDAR-2', descricao: 'TI - Andar 2', tipo: 'Área', responsavel: 'TI', status: 'Ativo' },
    { codigo: 'FIL-SP-01', descricao: 'Filial São Paulo', tipo: 'Filial', responsavel: 'Operações', status: 'Em revisão' },
  ];

  const cadastrosClientes = [
    { nome: 'Grupo Horizonte', tipo: 'Cliente', documento: '12.345.678/0001-90', status: 'Ativo' },
    { nome: 'Alpha Fornecimentos', tipo: 'Fornecedor', documento: '08.234.567/0001-11', status: 'Ativo' },
    { nome: 'Lumen Serviços', tipo: 'Fornecedor', documento: '04.987.654/0001-22', status: 'Bloqueado' },
    { nome: 'Nova Linha', tipo: 'Cliente', documento: '32.456.789/0001-45', status: 'Ativo' },
  ];

  const cadastrosContas = [
    { conta: 'Caixa Matriz', banco: 'Itaú', agencia: '0001', status: 'Ativa' },
    { conta: 'Conta Operacional', banco: 'Bradesco', agencia: '0134', status: 'Ativa' },
    { conta: 'Caixa Filial SP', banco: 'Santander', agencia: '2450', status: 'Em revisão' },
  ];

  const notasFiscaisData = [
    { numero: 'NF-2001', fornecedor: 'Fornecedor XYZ', valor: 'R$ 8.320,00' },
    { numero: 'NF-2002', fornecedor: 'Alpha Serviços', valor: 'R$ 6.540,00' },
    { numero: 'NF-2003', fornecedor: 'Nova Linha', valor: 'R$ 12.980,00' },
  ];

  const relatoriosData = [
    { relatorio: 'Consolidação 1', periodicidade: 'Mensal', status: 'Atualizado' },
    { relatorio: 'Consolidação 2', periodicidade: 'Trimestral', status: 'Atualizado' },
    { relatorio: 'Consolidação 3', periodicidade: 'Anual', status: 'Atualizado' },
  ];

  const renderCadastrosCards = (cards) => (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card key={card.id} className="border-graphite-200">
          <CardHeader className="space-y-2">
            <CardTitle className="text-lg text-graphite-900">{card.title}</CardTitle>
            <CardDescription className="text-graphite-500">
              {card.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <span className="text-xs text-graphite-500">Atualizado recentemente</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleNavigate({ id: card.id, path: card.path })}
            >
              Acessar
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderCadastrosTable = ({ title, description, columns, rows }) => (
    <Card className="border-graphite-200">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="text-lg text-graphite-900">{title}</CardTitle>
          <CardDescription className="text-graphite-500">{description}</CardDescription>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm">Exportar</Button>
          <Button variant="default" size="sm">Novo</Button>
        </div>
      </CardHeader>
      <CardContent>
        <DataTable columns={columns} data={rows} />
      </CardContent>
    </Card>
  );

  const renderCadastrosPage = (pageId) => {
    if (pageId === 'cadastros') {
      return renderCadastrosCards(cadastrosOverviewCards);
    }
    if (pageId === 'cadastros-estoque') {
      return renderCadastrosCards(cadastrosEstoqueCards);
    }
    if (pageId === 'cadastros-financeiro') {
      return renderCadastrosCards(cadastrosFinanceiroCards);
    }
    if (pageId === 'cadastros-estoque-produtos') {
      return renderCadastrosTable({
        title: 'Produtos',
        description: 'Catálogo de itens ativos e bloqueados.',
        columns: [
          { key: 'codigo', label: 'Código' },
          { key: 'descricao', label: 'Descrição' },
          { key: 'categoria', label: 'Categoria' },
          {
            key: 'status',
            label: 'Status',
            filterMode: 'select',
            cell: (row) => (
              <Badge variant="secondary" className="bg-graphite-100 text-graphite-700">
                {row.status}
              </Badge>
            ),
          },
        ],
        rows: cadastrosProdutos,
      });
    }
    if (pageId === 'cadastros-estoque-local') {
      return renderCadastrosTable({
        title: 'Local de estoque',
        description: 'Depósitos e áreas de guarda.',
        columns: [
          { key: 'codigo', label: 'Código' },
          { key: 'descricao', label: 'Descrição' },
          { key: 'tipo', label: 'Tipo' },
          { key: 'responsavel', label: 'Responsável' },
          {
            key: 'status',
            label: 'Status',
            filterMode: 'select',
            cell: (row) => (
              <Badge variant="secondary" className="bg-graphite-100 text-graphite-700">
                {row.status}
              </Badge>
            ),
          },
        ],
        rows: cadastrosLocais,
      });
    }
    if (pageId === 'cadastros-financeiro-clientes') {
      return renderCadastrosTable({
        title: 'Cliente e Fornecedor',
        description: 'Cadastro de parceiros financeiros.',
        columns: [
          { key: 'nome', label: 'Nome' },
          { key: 'tipo', label: 'Tipo' },
          { key: 'documento', label: 'Documento' },
          {
            key: 'status',
            label: 'Status',
            filterMode: 'select',
            cell: (row) => (
              <Badge variant="secondary" className="bg-graphite-100 text-graphite-700">
                {row.status}
              </Badge>
            ),
          },
        ],
        rows: cadastrosClientes,
      });
    }
    if (pageId === 'cadastros-financeiro-contas') {
      return renderCadastrosTable({
        title: 'Contas Caixa',
        description: 'Contas bancárias e caixas.',
        columns: [
          { key: 'conta', label: 'Conta' },
          { key: 'banco', label: 'Banco' },
          { key: 'agencia', label: 'Agência' },
          {
            key: 'status',
            label: 'Status',
            filterMode: 'select',
            cell: (row) => (
              <Badge variant="secondary" className="bg-graphite-100 text-graphite-700">
                {row.status}
              </Badge>
            ),
          },
        ],
        rows: cadastrosContas,
      });
    }
    if (pageId === 'cadastros-est-compras-fat') {
      return (
        <Card className="border-graphite-200">
          <CardHeader>
            <CardTitle className="text-lg text-graphite-900">Est. Compras e Fat.</CardTitle>
            <CardDescription className="text-graphite-500">
              Parâmetros operacionais para compras e faturamento.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-graphite-600">
            <div className="flex items-center justify-between border border-graphite-200 rounded-md p-3">
              <span>Fluxo de aprovação padrão</span>
              <Badge variant="secondary" className="bg-graphite-100 text-graphite-700">Ativo</Badge>
            </div>
            <div className="flex items-center justify-between border border-graphite-200 rounded-md p-3">
              <span>Integração fiscal automática</span>
              <Badge variant="secondary" className="bg-graphite-100 text-graphite-700">Ativo</Badge>
            </div>
            <div className="flex items-center justify-between border border-graphite-200 rounded-md p-3">
              <span>Política de descontos</span>
              <Badge variant="secondary" className="bg-graphite-100 text-graphite-700">Em revisão</Badge>
            </div>
          </CardContent>
        </Card>
      );
    }
    if (pageId === 'cadastros-globais') {
      return (
        <Card className="border-graphite-200">
          <CardHeader>
            <CardTitle className="text-lg text-graphite-900">Globais</CardTitle>
            <CardDescription className="text-graphite-500">
              Parâmetros globais e integrações corporativas.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-graphite-600">
            <div className="flex items-center justify-between border border-graphite-200 rounded-md p-3">
              <span>Ambiente fiscal</span>
              <Badge variant="secondary" className="bg-graphite-100 text-graphite-700">Produção</Badge>
            </div>
            <div className="flex items-center justify-between border border-graphite-200 rounded-md p-3">
              <span>Integração bancária</span>
              <Badge variant="secondary" className="bg-graphite-100 text-graphite-700">Ativa</Badge>
            </div>
            <div className="flex items-center justify-between border border-graphite-200 rounded-md p-3">
              <span>Regra de centro de custo</span>
              <Badge variant="secondary" className="bg-graphite-100 text-graphite-700">Controlada</Badge>
            </div>
          </CardContent>
        </Card>
      );
    }
    return null;
  };

  const dashboardColorClasses = {
    graphite: 'bg-graphite-900 dark:bg-graphite-200',
    accent: 'bg-black dark:bg-graphite-200',
    'graphite-light': 'bg-graphite-700 dark:bg-graphite-300',
    'accent-soft': 'bg-graphite-800 dark:bg-graphite-200',
    blue: 'bg-blue-700 dark:bg-blue-200',
    'blue-soft': 'bg-blue-600 dark:bg-blue-300',
    'blue-mid': 'bg-blue-800 dark:bg-blue-100',
    teal: 'bg-emerald-700 dark:bg-emerald-200',
    'teal-soft': 'bg-emerald-600 dark:bg-emerald-300',
    'teal-mid': 'bg-emerald-800 dark:bg-emerald-100',
    amber: 'bg-amber-700 dark:bg-amber-200',
    'amber-soft': 'bg-amber-600 dark:bg-amber-300',
    'amber-mid': 'bg-amber-800 dark:bg-amber-100',
    slate: 'bg-cyan-700 dark:bg-cyan-200',
    'slate-soft': 'bg-cyan-600 dark:bg-cyan-300',
    'slate-mid': 'bg-sky-700 dark:bg-sky-200',
  };

  const dashboardThemeClasses = {
    compras: {
      glow: 'bg-blue-100/80',
      badge: 'bg-blue-50 text-blue-700 border border-blue-200',
    },
    estoque: {
      glow: 'bg-emerald-100/80',
      badge: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    },
    faturamento: {
      glow: 'bg-amber-100/80',
      badge: 'bg-amber-50 text-amber-700 border border-amber-200',
    },
    orcamento: {
      glow: 'bg-cyan-100/80',
      badge: 'bg-cyan-50 text-cyan-700 border border-cyan-200',
    },
  };

  const renderDashboardCards = (cards, theme = 'compras') => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        const TrendIcon = card.trend === 'up' ? ArrowTrendingUpIcon : ArrowTrendingDownIcon;

        return (
          <Card key={`${card.title}-${index}`} className="relative overflow-hidden border-graphite-200 bg-white shadow-sm">
            <CardContent className="p-4">
              <div className={`absolute -right-8 -top-8 h-24 w-24 rounded-full ${dashboardThemeClasses[theme]?.glow || 'bg-graphite-100/80'}`} />
              <div className="relative flex items-start justify-between">
                <div className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${dashboardColorClasses[card.color]}`}>
                  <Icon className="h-5 w-5 text-white dark:text-graphite-900" />
                </div>
                <div className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${card.trend === 'up' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                  <TrendIcon className="h-3.5 w-3.5" />
                  <span>{card.change}</span>
                </div>
              </div>
              <p className="mt-3 text-[11px] font-semibold uppercase tracking-wide text-graphite-500">{card.title}</p>
              <p className="mt-1 text-2xl font-semibold text-graphite-900">{card.value}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  const renderDashboardStandard = ({
    cards,
    theme = 'compras',
    chartTitle,
    chartDescription,
    chartConfig,
    chartData,
    primaryKey,
    secondaryKey,
    tooltipFormatter,
    primaryTickFormatter,
    secondaryTickFormatter,
    tableTitle,
    tableDescription,
    tableColumns,
    tableData,
    tablePageSize = 8,
    tableWrapperClassName = '',
  }) => {
    const primaryGradientId = `${primaryKey}-gradient`;
    const secondaryGradientId = secondaryKey ? `${secondaryKey}-gradient` : null;

    return (
      <div className="space-y-5">
        {renderDashboardCards(cards, theme)}

        <Card className="border-graphite-200 bg-white shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="text-[1.04rem] font-semibold tracking-tight">{chartTitle}</CardTitle>
                <CardDescription className="text-[13px] leading-relaxed">{chartDescription}</CardDescription>
              </div>
              <Badge variant="secondary" className={dashboardThemeClasses[theme]?.badge || 'bg-graphite-100 text-graphite-700'}>Últimos 6 meses</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[320px] w-full">
              <ComposedChart data={chartData} margin={{ top: 24, right: 12, left: 4, bottom: 4 }}>
                <defs>
                  <linearGradient id={primaryGradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={`var(--color-${primaryKey})`} stopOpacity={0.35} />
                    <stop offset="95%" stopColor={`var(--color-${primaryKey})`} stopOpacity={0.02} />
                  </linearGradient>
                  {secondaryKey && (
                    <linearGradient id={secondaryGradientId} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={`var(--color-${secondaryKey})`} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={`var(--color-${secondaryKey})`} stopOpacity={0.01} />
                    </linearGradient>
                  )}
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="4 4" stroke="#d4d9e1" />
                <XAxis dataKey="mes" tickLine={false} axisLine={false} />
                <YAxis
                  yAxisId="left"
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={primaryTickFormatter}
                />
                {secondaryKey && (
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={secondaryTickFormatter}
                  />
                )}
                <Legend
                  verticalAlign="top"
                  align="center"
                  height={34}
                  iconType="circle"
                  wrapperStyle={{ fontSize: '12px', letterSpacing: '-0.01em' }}
                />
                <ChartTooltip content={<ChartTooltipContent formatter={tooltipFormatter} />} />
                <Area
                  yAxisId="left"
                  dataKey={primaryKey}
                  type="monotone"
                  fill={`url(#${primaryGradientId})`}
                  stroke="none"
                />
                <Line
                  yAxisId="left"
                  dataKey={primaryKey}
                  type="monotone"
                  stroke={`var(--color-${primaryKey})`}
                  strokeWidth={2.6}
                  dot={{ r: 2.5 }}
                  activeDot={{ r: 5 }}
                />
                {secondaryKey && (
                  <>
                    <Area
                      yAxisId="right"
                      dataKey={secondaryKey}
                      type="monotone"
                      fill={`url(#${secondaryGradientId})`}
                      stroke="none"
                    />
                    <Line
                      yAxisId="right"
                      dataKey={secondaryKey}
                      type="monotone"
                      stroke={`var(--color-${secondaryKey})`}
                      strokeWidth={2}
                      dot={{ r: 2 }}
                      activeDot={{ r: 4 }}
                    />
                  </>
                )}
              </ComposedChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="border-graphite-200 bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-[1.02rem] font-semibold tracking-tight">{tableTitle}</CardTitle>
            <CardDescription className="text-[13px] leading-relaxed">{tableDescription}</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={tableColumns}
              data={tableData}
              pageSize={tablePageSize}
              tableWrapperClassName={tableWrapperClassName}
              emptyMessage="Nenhum registro para os filtros selecionados."
            />
          </CardContent>
        </Card>
      </div>
    );
  };

  // Render
  const renderContent = () => {
    if (normalizedPage.startsWith('cadastros')) {
      return renderCadastrosPage(normalizedPage);
    }

    switch (normalizedPage) {
      case 'dashboard':
      case 'dashboard-compras':
        return renderDashboardStandard({
          cards: statsCards,
          theme: 'compras',
          chartTitle: 'Evolução de Compras',
          chartDescription: 'Valor aprovado e volume de pedidos no período.',
          chartConfig: comprasChartConfig,
          chartData: comprasTrendData,
          primaryKey: 'valor',
          secondaryKey: 'pedidos',
          tooltipFormatter: (value, name) => (
            name === 'valor'
              ? `R$ ${Number(value).toLocaleString('pt-BR')}`
              : `${value} pedidos`
          ),
          primaryTickFormatter: (value) => `R$ ${Math.round(value / 1000)}k`,
          secondaryTickFormatter: (value) => `${value}`,
          tableTitle: 'Categorias e Pipeline',
          tableDescription: 'Visão consolidada de categorias com estágio atual de solicitação.',
          tableColumns: [
            { key: 'categoria', label: 'Categoria' },
            {
              key: 'valor',
              label: 'Valor',
              headerClassName: 'text-right',
              cellClassName: 'text-right',
              cell: (row) => <span className="font-medium">R$ {Number(row.valor).toLocaleString('pt-BR')}</span>,
            },
            {
              key: 'status',
              label: 'Status',
              filterMode: 'select',
              cell: (row) => <Badge variant="secondary" className="bg-graphite-100 text-graphite-700">{row.status}</Badge>,
            },
            {
              key: 'pedidos',
              label: 'Pedidos',
              headerClassName: 'text-right',
              cellClassName: 'text-right',
            },
          ],
          tableData: comprasResumoTabela,
        });

      case 'dashboard-estoque':
        return renderDashboardStandard({
          cards: estoqueStatsCards,
          theme: 'estoque',
          chartTitle: 'Nível de Estoque e Rupturas',
          chartDescription: 'Saldo consolidado e ocorrências críticas por mês.',
          chartConfig: estoqueChartConfig,
          chartData: estoqueNivelData,
          primaryKey: 'saldo',
          secondaryKey: 'ruptura',
          tooltipFormatter: (value, name) => (
            name === 'saldo' ? `${value} itens` : `${value} rupturas`
          ),
          primaryTickFormatter: (value) => `${value}`,
          secondaryTickFormatter: (value) => `${value}`,
          tableTitle: 'Alertas de Reposição',
          tableDescription: 'Itens com menor cobertura e prioridade de reabastecimento.',
          tableColumns: [
            { key: 'sku', label: 'SKU' },
            { key: 'item', label: 'Item' },
            { key: 'local', label: 'Local' },
            { key: 'saldo', label: 'Saldo', headerClassName: 'text-right', cellClassName: 'text-right' },
            {
              key: 'giro',
              label: 'Giro',
              headerClassName: 'text-right',
              cellClassName: 'text-right',
              cell: (row) => <span className="font-medium">{row.giro}x</span>,
            },
            {
              key: 'nivel',
              label: 'Nível',
              filterMode: 'select',
              cell: (row) => <Badge variant="secondary" className="bg-graphite-100 text-graphite-700">{row.nivel}</Badge>,
            },
          ],
          tableData: estoqueResumoTabela,
        });

      case 'dashboard-faturamento':
        return renderDashboardStandard({
          cards: faturamentoStatsCards,
          theme: 'faturamento',
          chartTitle: 'Evolução de Faturamento',
          chartDescription: 'Comparativo entre faturamento bruto e devoluções.',
          chartConfig: faturamentoChartConfig,
          chartData: faturamentoMensalData,
          primaryKey: 'faturado',
          secondaryKey: 'devolucao',
          tooltipFormatter: (value) => `R$ ${Number(value).toLocaleString('pt-BR')}`,
          primaryTickFormatter: (value) => `R$ ${Math.round(value / 1000)}k`,
          secondaryTickFormatter: (value) => `R$ ${Math.round(value / 1000)}k`,
          tableTitle: 'Títulos e Canais',
          tableDescription: 'Acompanhamento de cobrança com segmentação por canal.',
          tableColumns: [
            { key: 'fatura', label: 'Fatura' },
            { key: 'cliente', label: 'Cliente' },
            { key: 'canal', label: 'Canal', filterMode: 'select' },
            { key: 'vencimento', label: 'Vencimento' },
            { key: 'valor', label: 'Valor', headerClassName: 'text-right', cellClassName: 'text-right' },
            {
              key: 'status',
              label: 'Status',
              filterMode: 'select',
              cell: (row) => <Badge variant="secondary" className="bg-graphite-100 text-graphite-700">{row.status}</Badge>,
            },
          ],
          tableData: faturamentoResumoTabela,
        });

      case 'dashboard-orcamento':
        return renderDashboardStandard({
          cards: orcamentoStatsCards,
          theme: 'orcamento',
          chartTitle: 'Orçado x Realizado',
          chartDescription: 'Comparativo mensal de planejamento e execução orçamentária.',
          chartConfig: orcamentoChartConfig,
          chartData: orcamentoTrendData,
          primaryKey: 'orcado',
          secondaryKey: 'realizado',
          tooltipFormatter: (value) => `R$ ${Number(value).toLocaleString('pt-BR')}`,
          primaryTickFormatter: (value) => `R$ ${Math.round(value / 1000)}k`,
          secondaryTickFormatter: (value) => `R$ ${Math.round(value / 1000)}k`,
          tableTitle: 'Base Orçamentária',
          tableDescription: 'Detalhamento por período, natureza orçamentária e centro de custo.',
          tablePageSize: 12,
          tableWrapperClassName: 'max-h-[560px] overflow-y-auto',
          tableColumns: [
            { key: 'codigoPeriodo', label: 'Código do período' },
            { key: 'ano', label: 'Ano', filterMode: 'select' },
            { key: 'mes', label: 'Mês', filterMode: 'select' },
            {
              key: 'orcado',
              label: 'Orçado',
              headerClassName: 'text-right',
              cellClassName: 'text-right',
              cell: (row) => <span className="font-medium">R$ {Number(row.orcado).toLocaleString('pt-BR')}</span>,
            },
            {
              key: 'realizado',
              label: 'Realizado',
              headerClassName: 'text-right',
              cellClassName: 'text-right',
              cell: (row) => <span className="font-medium">R$ {Number(row.realizado).toLocaleString('pt-BR')}</span>,
            },
            { key: 'naturezaOrcamentaria', label: 'Natureza Orçamentária', filterMode: 'select' },
            { key: 'centroCusto', label: 'Centro de Custo', filterMode: 'select' },
          ],
          tableData: orcamentoResumoTabela,
        });

      case 'tarefas': {
        const parseCurrencyValue = (value) => {
          if (!value) return 0;
          return Number(String(value).replace(/[^\d,]/g, '').replace(',', '.')) || 0;
        };

        const kpis = approvalPedidos.reduce(
          (acc, pedido) => {
            acc.total += 1;
            acc.valorTotal += parseCurrencyValue(pedido.valor);
            if (pedido.aprovacao === 'pendente') {
              acc.pendentes += 1;
              acc.valorPendente += parseCurrencyValue(pedido.valor);
            }
            if (pedido.aprovacao === 'aprovado') acc.aprovados += 1;
            if (pedido.aprovacao === 'reprovado') acc.reprovados += 1;
            return acc;
          },
          {
            total: 0,
            pendentes: 0,
            aprovados: 0,
            reprovados: 0,
            valorTotal: 0,
            valorPendente: 0,
          }
        );

        const filteredApprovals = approvalPedidos
          .filter((pedido) => {
            if (taskTab !== 'todos' && pedido.aprovacao !== taskTab) return false;
            const term = approvalSearch.toLowerCase().trim();
            if (!term) return true;
            return (
              pedido.id.toLowerCase().includes(term) ||
              pedido.fornecedor.toLowerCase().includes(term) ||
              pedido.centro.toLowerCase().includes(term) ||
              pedido.criadoPor.toLowerCase().includes(term)
            );
          })
          .sort((a, b) => parseCurrencyValue(b.valor) - parseCurrencyValue(a.valor));

        const selectedIsVisible = filteredApprovals.some((row) => row.id === approvalSelected?.id);
        const activeApproval = selectedIsVisible ? approvalSelected : filteredApprovals[0] || null;

        const decisionMeta =
          activeApproval?.aprovacao === 'aprovado'
            ? {
                label: 'Aprovado',
                by: activeApproval?.aprovadoPor,
                at: activeApproval?.aprovadoEm,
                style: 'border-emerald-200 bg-emerald-50 text-emerald-700',
              }
            : activeApproval?.aprovacao === 'reprovado'
            ? {
                label: 'Reprovado',
                by: activeApproval?.reprovadoPor,
                at: activeApproval?.reprovadoEm,
                style: 'border-red-200 bg-red-50 text-red-700',
              }
            : {
                label: 'Pendente',
                by: '-',
                at: '-',
                style: 'border-amber-200 bg-amber-50 text-amber-700',
              };

        return (
          <div className="space-y-6">
            <Card className="overflow-hidden border-graphite-200">
              <CardContent className="relative p-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#dbeafe,transparent_52%),radial-gradient(circle_at_bottom_left,#e2e8f0,transparent_55%)] opacity-90" />
                <div className="relative grid gap-4 p-6 lg:grid-cols-[1.3fr_1fr] lg:items-end">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-graphite-500">Workbench de decisão</p>
                    <h2 className="mt-2 text-2xl font-semibold text-graphite-900">Tarefas e Aprovações</h2>
                    <p className="mt-2 max-w-xl text-sm text-graphite-600">
                      Foco no que é crítico: fila priorizada por impacto financeiro e decisão orientada por contexto.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-white/70 bg-white/85 p-3 shadow-sm">
                      <p className="text-xs text-graphite-500">Pendentes</p>
                      <p className="mt-1 text-xl font-semibold text-graphite-900">{kpis.pendentes}</p>
                    </div>
                    <div className="rounded-xl border border-white/70 bg-white/85 p-3 shadow-sm">
                      <p className="text-xs text-graphite-500">Valor pendente</p>
                      <p className="mt-1 text-xl font-semibold text-graphite-900">
                        R$ {kpis.valorPendente.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div className="rounded-xl border border-white/70 bg-white/85 p-3 shadow-sm">
                      <p className="text-xs text-graphite-500">Aprovados</p>
                      <p className="mt-1 text-xl font-semibold text-emerald-700">{kpis.aprovados}</p>
                    </div>
                    <div className="rounded-xl border border-white/70 bg-white/85 p-3 shadow-sm">
                      <p className="text-xs text-graphite-500">Reprovados</p>
                      <p className="mt-1 text-xl font-semibold text-red-700">{kpis.reprovados}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.05fr_1fr]">
              <Card className="border-graphite-200">
                <CardHeader className="gap-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <CardTitle className="text-lg text-graphite-900">Fila de decisão</CardTitle>
                      <CardDescription className="text-graphite-500">
                        Selecione um pedido para revisar detalhes e decidir.
                      </CardDescription>
                    </div>
                    <Badge variant="secondary" className="bg-graphite-100 text-graphite-700">
                      {filteredApprovals.length} itens
                    </Badge>
                  </div>

                  <Tabs value={taskTab} onValueChange={setTaskTab}>
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="pendente">Pendentes</TabsTrigger>
                      <TabsTrigger value="aprovado">Aprovados</TabsTrigger>
                      <TabsTrigger value="reprovado">Reprovados</TabsTrigger>
                      <TabsTrigger value="todos">Todos</TabsTrigger>
                    </TabsList>
                  </Tabs>

                  <div className="relative">
                    <Input
                      value={approvalSearch}
                      onChange={(e) => setApprovalSearch(e.target.value)}
                      placeholder="Buscar por pedido, fornecedor, centro ou solicitante..."
                    />
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-2">
                    {filteredApprovals.length === 0 && (
                      <div className="rounded-lg border border-dashed border-graphite-300 bg-graphite-50 p-6 text-center text-sm text-graphite-500">
                        Nenhum pedido encontrado para os filtros selecionados.
                      </div>
                    )}
                    {filteredApprovals.map((pedido) => (
                      <button
                        key={pedido.id}
                        type="button"
                        onClick={() => {
                          setApprovalSelected(pedido);
                          setApprovalResult('');
                          setApprovalProgress(0);
                          setApprovalProcessing(false);
                        }}
                        className={`w-full rounded-xl border p-4 text-left transition-all ${
                          activeApproval?.id === pedido.id
                            ? 'border-graphite-300 bg-graphite-100 text-graphite-900 shadow-sm'
                            : 'border-graphite-200 bg-white hover:border-graphite-400 hover:bg-graphite-50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className={`text-xs ${activeApproval?.id === pedido.id ? 'text-graphite-600' : 'text-graphite-500'}`}>
                              Pedido {pedido.id}
                            </p>
                            <p className="mt-1 text-sm font-semibold">{pedido.fornecedor}</p>
                          </div>
                          <span
                            className={`rounded-full border px-2 py-1 text-[11px] ${
                              pedido.aprovacao === 'aprovado'
                                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                : pedido.aprovacao === 'reprovado'
                                ? 'border-red-200 bg-red-50 text-red-700'
                                : 'border-amber-200 bg-amber-50 text-amber-700'
                            }`}
                          >
                            {approvalStatusMap[pedido.aprovacao]}
                          </span>
                        </div>
                        <p className={`mt-2 line-clamp-2 text-xs ${activeApproval?.id === pedido.id ? 'text-graphite-700' : 'text-graphite-600'}`}>
                          {pedido.resumo}
                        </p>
                        <div className={`mt-3 grid grid-cols-2 gap-2 text-xs ${activeApproval?.id === pedido.id ? 'text-graphite-700' : 'text-graphite-500'}`}>
                          <span>Centro: {pedido.centro}</span>
                          <span className="text-right font-medium">{pedido.valor}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-graphite-200">
                <CardHeader className="gap-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-graphite-500">Painel de aprovação</p>
                      <CardTitle className="text-lg text-graphite-900">
                        {activeApproval ? `Pedido ${activeApproval.id}` : 'Selecione um pedido'}
                      </CardTitle>
                    </div>
                    {activeApproval && (
                      <span className={`rounded-full border px-2.5 py-1 text-xs ${decisionMeta.style}`}>
                        {decisionMeta.label}
                      </span>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {!activeApproval && (
                    <div className="rounded-lg border border-dashed border-graphite-300 bg-graphite-50 p-8 text-center text-sm text-graphite-500">
                      Escolha um item da fila para visualizar detalhes de aprovação.
                    </div>
                  )}

                  {activeApproval && (
                    <>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="rounded-lg border border-graphite-200 p-3">
                          <p className="text-xs text-graphite-500">Fornecedor</p>
                          <p className="text-sm font-semibold text-graphite-900">{activeApproval.fornecedor}</p>
                        </div>
                        <div className="rounded-lg border border-graphite-200 p-3">
                          <p className="text-xs text-graphite-500">Centro de custo</p>
                          <p className="text-sm font-semibold text-graphite-900">{activeApproval.centro}</p>
                        </div>
                        <div className="rounded-lg border border-graphite-200 p-3">
                          <p className="text-xs text-graphite-500">Solicitante</p>
                          <p className="text-sm font-semibold text-graphite-900">{activeApproval.criadoPor}</p>
                        </div>
                        <div className="rounded-lg border border-graphite-200 p-3">
                          <p className="text-xs text-graphite-500">Valor total</p>
                          <p className="text-sm font-semibold text-graphite-900">{activeApproval.valor}</p>
                        </div>
                      </div>

                      <div className="rounded-lg border border-graphite-200 bg-graphite-50 p-3">
                        <p className="text-xs uppercase text-graphite-500">Resumo</p>
                        <p className="mt-1 text-sm text-graphite-800">{activeApproval.resumo}</p>
                      </div>

                      <div className="rounded-lg border border-graphite-200 p-3">
                        <p className="text-xs uppercase text-graphite-500">Observação</p>
                        <p className="mt-1 text-sm text-graphite-700">{activeApproval.observacao || 'Sem observações adicionais.'}</p>
                      </div>

                      <div className="overflow-hidden rounded-lg border border-graphite-200">
                        <div className="grid grid-cols-[1fr_70px_70px_120px] bg-graphite-50 px-3 py-2 text-xs text-graphite-500">
                          <span>Item</span>
                          <span className="text-right">Qtd</span>
                          <span className="text-right">UN</span>
                          <span className="text-right">Valor Unit.</span>
                        </div>
                        <div className="divide-y divide-graphite-200">
                          {(activeApproval.itens || []).map((item, index) => (
                            <div
                              key={`${activeApproval.id}-${item.item}-${index}`}
                              className="grid grid-cols-[1fr_70px_70px_120px] px-3 py-2 text-sm"
                            >
                              <span className="text-graphite-800">{item.item}</span>
                              <span className="text-right text-graphite-600">{item.qtd}</span>
                              <span className="text-right text-graphite-600">{item.un}</span>
                              <span className="text-right font-medium text-graphite-900">{item.unit}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {approvalResult && (
                        <div
                          className={`rounded-lg border px-3 py-2 text-sm ${
                            approvalResult === 'Aprovado com sucesso'
                              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                              : 'border-red-200 bg-red-50 text-red-700'
                          }`}
                        >
                          {approvalResult}
                        </div>
                      )}

                      {activeApproval.aprovacao === 'pendente' ? (
                        <div className="space-y-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleApprovalAction('aprovado')}
                              disabled={approvalProcessing}
                              className="border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                            >
                              <CheckIcon className="mr-1 h-4 w-4" />
                              Aprovar
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleApprovalAction('reprovado')}
                              disabled={approvalProcessing}
                              className="border-red-200 text-red-700 hover:bg-red-50"
                            >
                              <XMarkIcon className="mr-1 h-4 w-4" />
                              Reprovar
                            </Button>
                          </div>

                          {approvalProcessing && (
                            <div className="rounded-lg border border-graphite-200 bg-white px-3 py-2">
                              <div className="mb-2 flex items-center justify-between text-xs text-graphite-500">
                                <span>Processando decisão</span>
                                <span>{approvalProgress}%</span>
                              </div>
                              <div className="h-2 overflow-hidden rounded-full bg-graphite-100">
                                <div
                                  className="h-full bg-graphite-900 transition-all"
                                  style={{ width: `${approvalProgress}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="rounded-lg border border-graphite-200 bg-graphite-50 p-3 text-xs text-graphite-600">
                          <p className="font-medium text-graphite-800">Histórico da decisão</p>
                          <p className="mt-1">Responsável: {decisionMeta.by || '-'}</p>
                          <p>Data/Hora: {decisionMeta.at || '-'}</p>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        );
      }

      case 'pedidos': {
        const pedidoColumns = [
          {
            key: 'id',
            label: 'Pedido',
            accessor: (row) => row.id,
            cell: (row) => (
              <div>
                <div className="text-sm font-medium">{row.id}</div>
                <div className="text-xs text-graphite-500">{row.data}</div>
              </div>
            ),
          },
          {
            key: 'fornecedor',
            label: 'Fornecedor',
            cell: (row) => <span className="text-graphite-500">{row.fornecedor}</span>,
          },
          {
            key: 'centroCusto',
            label: 'Centro de Custo',
            cell: (row) => <span className="text-graphite-500">{row.centroCusto}</span>,
          },
          {
            key: 'status',
            label: 'Status',
            filterMode: 'select',
            accessor: (row) => statusMovimentoMap[row.status] || row.status,
            cell: (row) => (
              <div className="text-xs text-graphite-500 flex items-center gap-2">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    statusColorMap[row.status] || 'bg-graphite-400'
                  }`}
                />
                {statusMovimentoMap[row.status]}
              </div>
            ),
          },
          {
            key: 'total',
            label: 'Total',
            headerClassName: 'text-right',
            cellClassName: 'text-right',
            cell: (row) => <div className="text-sm font-medium">{row.total}</div>,
          },
        ];
        const itensColumns = [
          { key: 'sku', label: 'SKU' },
          { key: 'nome', label: 'Produto' },
          {
            key: 'qtd',
            label: 'Qtd',
            headerClassName: 'text-right',
            cellClassName: 'text-right',
          },
        ];

        return (
          <div className="space-y-6">
            <Card className="border-graphite-200">
              <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="text-2xl text-graphite-900">Pedidos</CardTitle>
                  <CardDescription className="text-graphite-500">
                    Registro, controle e acompanhamento de linhas.
                  </CardDescription>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button variant="secondary" size="default">Exportar</Button>
                  <Button variant="default" size="default">Novo pedido</Button>
                  <Button variant="default" size="default" onClick={handleOpenRequest}>
                    Nova solicitação
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 text-graphite-600"
                    title="Opções gerais"
                  >
                    <EllipsisVerticalIcon className="h-5 w-5" />
                  </Button>
                </div>
              </CardHeader>
            </Card>

            <div className="grid grid-cols-1 xl:grid-cols-[1.4fr_1fr] gap-6">
              <Card className="border-graphite-200">
                <CardHeader className="gap-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase text-graphite-500">Pedidos</p>
                      <CardTitle className="text-base text-graphite-900">Lista de pedidos</CardTitle>
                    </div>
                    <Badge variant="secondary" className="bg-graphite-100 text-graphite-700">
                      {pedidosTableCount} resultados
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="relative flex-1 min-w-[220px]">
                      <Input
                        value={pedidoSearch}
                        onChange={(e) => setPedidoSearch(e.target.value)}
                        placeholder="Buscar por pedido, fornecedor ou centro de custo..."
                        className="w-full text-sm"
                      />
                    </div>
                    <div className="flex items-center gap-2 text-sm text-graphite-600">
                      <AdjustmentsHorizontalIcon className="h-4 w-4" />
                      <Select value={pedidoStatus} onValueChange={setPedidoStatus}>
                        <SelectTrigger className="h-9 w-[200px]">
                          <SelectValue placeholder="Todos os status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todos">Todos os status</SelectItem>
                          {Object.keys(statusMovimentoMap).map((status) => (
                            <SelectItem key={status} value={status}>
                              {status} - {statusMovimentoMap[status]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-graphite-600">
                      <ArrowsUpDownIcon className="h-4 w-4" />
                      <Select value={pedidoSort} onValueChange={setPedidoSort}>
                        <SelectTrigger className="h-9 w-[180px]">
                          <SelectValue placeholder="Ordenar por" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="data">Ordenar por data</SelectItem>
                          <SelectItem value="total">Ordenar por valor</SelectItem>
                          <SelectItem value="codigo">Ordenar por código</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <DataTable
                    columns={pedidoColumns}
                    data={pedidosFiltrados}
                    onRowClick={(pedido) => {
                      setPedidoSelecionado(pedido);
                      setItemSelecionado(pedido.itens[0]?.sku);
                    }}
                    getRowClassName={(pedido) =>
                      `cursor-pointer ${
                        pedidoSelecionado?.id === pedido.id
                          ? 'bg-graphite-50 dark:bg-graphite-800'
                          : 'hover:bg-graphite-50'
                      }`
                    }
                    onFilteredRowCountChange={setPedidosTableCount}
                    emptyMessage="Nenhum pedido para os filtros selecionados."
                  />
                </CardContent>
              </Card>

              <Card className="border-graphite-200">
                <CardHeader className="gap-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase text-graphite-500">Capa e linha</p>
                      <CardTitle className="text-base text-graphite-900">
                        {pedidoSelecionado ? `Pedido ${pedidoSelecionado.id}` : 'Selecione um pedido'}
                      </CardTitle>
                      <CardDescription className="text-graphite-500">
                        {pedidoSelecionado
                          ? pedidoSelecionado.fornecedor
                          : 'Escolha um pedido para visualizar a capa e as linhas.'}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="text-graphite-600">
                      {pedidoSelecionado
                        ? statusMovimentoMap[pedidoSelecionado.status]
                        : 'Sem seleção'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="capa">
                    <TabsList className="flex flex-wrap">
                      <TabsTrigger value="capa">Capa</TabsTrigger>
                      <TabsTrigger value="linhas">Linhas</TabsTrigger>
                      <TabsTrigger value="anexos">Anexos</TabsTrigger>
                      <TabsTrigger value="historico">Histórico</TabsTrigger>
                      <TabsTrigger value="aprovacao">Aprovação</TabsTrigger>
                    </TabsList>
                    <TabsContent value="capa">
                      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div className="rounded-lg border border-graphite-200 p-3">
                          <p className="text-xs text-graphite-500">Pedido</p>
                          <p className="font-medium text-graphite-900">{pedidoSelecionado?.id || '-'}</p>
                        </div>
                        <div className="rounded-lg border border-graphite-200 p-3">
                          <p className="text-xs text-graphite-500">Fornecedor</p>
                          <p className="font-medium text-graphite-900">{pedidoSelecionado?.fornecedor || '-'}</p>
                        </div>
                        <div className="rounded-lg border border-graphite-200 p-3">
                          <p className="text-xs text-graphite-500">Centro de custo</p>
                          <p className="font-medium text-graphite-900">{pedidoSelecionado?.centroCusto || '-'}</p>
                        </div>
                        <div className="rounded-lg border border-graphite-200 p-3">
                          <p className="text-xs text-graphite-500">Status</p>
                          <div className="flex items-center gap-2 font-medium text-graphite-900">
                            <span
                              className={`h-2.5 w-2.5 rounded-full ${
                                statusColorMap[pedidoSelecionado?.status] || 'bg-graphite-400'
                              }`}
                            />
                            {pedidoSelecionado
                              ? statusMovimentoMap[pedidoSelecionado.status]
                              : '-'}
                          </div>
                        </div>
                        <div className="rounded-lg border border-graphite-200 p-3">
                          <p className="text-xs text-graphite-500">Total</p>
                          <p className="font-medium text-graphite-900">{pedidoSelecionado?.total || '-'}</p>
                        </div>
                        <div className="rounded-lg border border-graphite-200 p-3">
                          <p className="text-xs text-graphite-500">Data</p>
                          <p className="font-medium text-graphite-900">{pedidoSelecionado?.data || '-'}</p>
                        </div>
                      </div>
                    </TabsContent>
                    <TabsContent value="linhas">
                      <div className="mt-4 space-y-4">
                        <div className="flex items-center justify-between gap-3 text-xs text-graphite-500">
                          <span>{itensTableCount} itens</span>
                          <Input
                            value={itemSearch}
                            onChange={(e) => setItemSearch(e.target.value)}
                            placeholder="Buscar item..."
                            className="w-40 h-8 text-xs"
                          />
                        </div>
                        <DataTable
                          columns={itensColumns}
                          data={itensFiltrados}
                          hidePagination
                          tableWrapperClassName="max-h-56 overflow-y-auto"
                          onFilteredRowCountChange={setItensTableCount}
                          onRowClick={(item) => setItemSelecionado(item.sku)}
                          getRowClassName={(item) =>
                            `cursor-pointer ${
                              itemSelecionado === item.sku
                                ? 'bg-graphite-50 dark:bg-graphite-800'
                                : 'hover:bg-graphite-50'
                            }`
                          }
                          emptyMessage="Nenhum item para os filtros selecionados."
                        />
                        {pedidoSelecionado?.itens?.map((item) =>
                          item.sku === itemSelecionado ? (
                            <div key={item.sku} className="text-sm space-y-2 border border-graphite-200 rounded-md p-3">
                              <div className="flex justify-between">
                                <span className="text-graphite-500">Produto</span>
                                <span className="font-medium text-graphite-900">{item.nome}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-graphite-500">Quantidade</span>
                                <span className="font-medium text-graphite-900">{item.qtd}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-graphite-500">Unitário</span>
                                <span className="font-medium text-graphite-900">{item.unit}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-graphite-500">Total</span>
                                <span className="font-medium text-graphite-900">{item.total}</span>
                              </div>
                            </div>
                          ) : null
                        )}
                      </div>
                    </TabsContent>
                    <TabsContent value="anexos">
                      <div className="mt-4 border border-graphite-200 rounded-md p-4 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 text-sm text-graphite-600">
                          <PaperClipIcon className="h-5 w-5 text-graphite-400" />
                          Nenhum anexo. Envie documentos de cotação ou contratos.
                        </div>
                        <Button variant="secondary" size="sm">Adicionar anexo</Button>
                      </div>
                    </TabsContent>
                    <TabsContent value="historico">
                      <div className="mt-4 border border-graphite-200 rounded-md p-4 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 text-sm text-graphite-600">
                          <ClockIcon className="h-5 w-5 text-graphite-400" />
                          Histórico de mudanças e aprovações ficará disponível aqui.
                        </div>
                        <Button variant="ghost" size="sm">Ver histórico</Button>
                      </div>
                    </TabsContent>
                    <TabsContent value="aprovacao">
                      <div className="mt-4 border border-graphite-200 rounded-md p-4 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 text-sm text-graphite-600">
                          <CheckCircleIcon className="h-5 w-5 text-graphite-400" />
                          Fluxo de aprovação: aguardando definição de alçadas.
                        </div>
                        <Button variant="secondary" size="sm">Definir alçadas</Button>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      }

      case 'notas-fiscais': {
        const notasFiscaisColumns = [
          { key: 'numero', label: 'NF' },
          {
            key: 'fornecedor',
            label: 'Fornecedor',
            cell: (row) => <span className="text-graphite-500">{row.fornecedor}</span>,
          },
          {
            key: 'valor',
            label: 'Valor',
            headerClassName: 'text-right',
            cellClassName: 'text-right',
          },
        ];

        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-graphite-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-semibold text-graphite-900">Notas Fiscais</h2>
                  <p className="text-graphite-500">Monitoramento fiscal e compliance.</p>
                </div>
                <Button variant="default" size="default">Nova NF</Button>
              </div>
              <Tabs defaultValue="itens">
                <TabsList>
                  <TabsTrigger value="itens">Itens</TabsTrigger>
                  <TabsTrigger value="anexos">Anexos</TabsTrigger>
                  <TabsTrigger value="historico">Histórico</TabsTrigger>
                  <TabsTrigger value="aprovacao">Aprovação</TabsTrigger>
                </TabsList>
                <TabsContent value="itens">
                  <div className="mt-4">
                    <DataTable
                      columns={notasFiscaisColumns}
                      data={notasFiscaisData}
                      emptyMessage="Nenhuma nota fiscal para os filtros selecionados."
                    />
                  </div>
                </TabsContent>
                <TabsContent value="anexos">
                  <div className="mt-4 border border-graphite-200 rounded-md p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 text-sm text-graphite-600">
                      <PaperClipIcon className="h-5 w-5 text-graphite-400" />
                      Nenhum anexo. Inclua XML, PDF e documentos fiscais.
                    </div>
                    <Button variant="secondary" size="sm">Adicionar XML</Button>
                  </div>
                </TabsContent>
                <TabsContent value="historico">
                  <div className="mt-4 border border-graphite-200 rounded-md p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 text-sm text-graphite-600">
                      <ClockIcon className="h-5 w-5 text-graphite-400" />
                      Histórico fiscal será listado aqui.
                    </div>
                    <Button variant="ghost" size="sm">Ver histórico</Button>
                  </div>
                </TabsContent>
                <TabsContent value="aprovacao">
                  <div className="mt-4 border border-graphite-200 rounded-md p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 text-sm text-graphite-600">
                      <CheckCircleIcon className="h-5 w-5 text-graphite-400" />
                      Aprovação aguardando validação do responsável.
                    </div>
                    <Button variant="secondary" size="sm">Solicitar aprovação</Button>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        );
      }

      case 'despesas-viagens': {
        const travelStatusStyles = {
          Aprovada: 'border-teal-200 bg-teal-50 text-teal-700',
          Finalizada: 'border-violet-200 bg-violet-50 text-violet-700',
          'Em fila de pagamento': 'border-emerald-200 bg-emerald-50 text-emerald-700',
          'Aguardando integração': 'border-amber-200 bg-amber-50 text-amber-700',
          'Viagem em andamento': 'border-sky-200 bg-sky-50 text-sky-700',
        };

        const selectedTravelExpense = travelExpenses.find((row) => row.id === selectedTravelExpenseId) || null;
        const travelReport = selectedTravelExpense
          ? {
              ...selectedTravelExpense,
              origem: selectedTravelExpense.origem || 'Santos/SP',
              motivo: selectedTravelExpense.motivo || 'Visita técnica e alinhamento operacional.',
              solicitante: 'Diego Santos',
              centroCusto: selectedTravelExpense.centroCusto || 'Operações',
              filial: 'Filial Santos',
              aprovadoPor:
                selectedTravelExpense.status === 'Aprovada' || selectedTravelExpense.status === 'Em fila de pagamento'
                  ? 'Renata Carvalho'
                  : '--',
              observacao:
                selectedTravelExpense.status === 'Aguardando integração'
                  ? 'Aguardando integração do RM para seguir com o fluxo de pagamento.'
                  : 'Documentação conferida e valores validados para prestação.',
            }
          : null;

        const reportShareText = travelReport
          ? [
              `Relatório de Despesa de Viagem - ${travelReport.id}`,
              `Tipo: ${travelReport.tipoSolicitacao}`,
              `Solicitante: ${travelReport.solicitante}`,
              `Origem: ${travelReport.origem}`,
              `Destino: ${travelReport.destino}`,
              `Período: ${travelReport.periodo}`,
              `KM: ${travelReport.kmEstimado}`,
              `Total: ${travelReport.total}`,
              `Status: ${travelReport.status}`,
              `Data Prevista Pagamento: ${travelReport.dataPrevistaPgto || '--'}`,
              `Pagamento Realizado em: ${travelReport.pgtoRealizadoEm || '--'}`,
              `Número RM: ${travelReport.numeroRm || 'Pendente'}`,
            ].join('\n')
          : '';
        const reportRouteMap = (() => {
          if (!travelReport?.origem || !travelReport?.destino) {
            return { embedUrl: '', externalUrl: '' };
          }
          const encodedOrigin = encodeURIComponent(travelReport.origem);
          const encodedDestination = encodeURIComponent(travelReport.destino);
          return {
            embedUrl: `https://www.google.com/maps?output=embed&saddr=${encodedOrigin}&daddr=${encodedDestination}`,
            externalUrl: `https://www.google.com/maps/dir/?api=1&origin=${encodedOrigin}&destination=${encodedDestination}&travelmode=driving`,
          };
        })();

        const despesasViagensColumns = [
          { key: 'id', label: 'ID' },
          { key: 'tipoSolicitacao', label: 'Tipo de solicitação', filterMode: 'select' },
          { key: 'destino', label: 'Destino' },
          { key: 'kmEstimado', label: 'KM estimado', enableFilter: false },
          { key: 'periodo', label: 'Período', enableFilter: false },
          {
            key: 'dataPrevistaPgto',
            label: 'Data prevista Pgto.',
            enableFilter: false,
            cell: (row) => <span className="text-graphite-700">{row.dataPrevistaPgto || '--'}</span>,
          },
          {
            key: 'pgtoRealizadoEm',
            label: 'Pgto Realizado em',
            enableFilter: false,
            cell: (row) => <span className="text-graphite-700">{row.pgtoRealizadoEm || '--'}</span>,
          },
          {
            key: 'numeroRm',
            label: 'Número RM',
            cell: (row) => (
              <span className={row.numeroRm ? 'font-mono font-medium text-graphite-800' : 'text-graphite-400'}>
                {row.numeroRm || 'Pendente'}
              </span>
            ),
          },
          {
            key: 'total',
            label: 'Total',
            headerClassName: 'text-right',
            cellClassName: 'text-right',
            enableFilter: false,
          },
          {
            key: 'status',
            label: 'Status',
            filterMode: 'select',
            cell: (row) => (
              <Badge
                variant="secondary"
                className={travelStatusStyles[row.status] || 'border-graphite-200 bg-graphite-100 text-graphite-700'}
              >
                {row.status}
              </Badge>
            ),
          },
          {
            key: 'anexos',
            label: 'Anexos',
            headerClassName: 'text-right',
            cellClassName: 'text-right',
            cell: (row) => <span>{row.anexos}</span>,
            enableFilter: false,
          },
        ];

        return (
          <div className="space-y-6">
            <div className="rounded-lg border border-graphite-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-end">
                <Button variant="default" size="default" onClick={handleOpenTravelDialog}>
                  Nova
                </Button>
              </div>
              <DataTable
                columns={despesasViagensColumns}
                data={travelExpenses}
                filterTitle="Filtros de Despesas"
                filterContainerClassName="border-sky-200 bg-gradient-to-r from-sky-50 to-indigo-50 p-4 shadow-sm dark:border-sky-800/60 dark:from-graphite-900 dark:to-graphite-800"
                filterGridClassName="xl:grid-cols-5 gap-4"
                filterLabelClassName="text-graphite-700 dark:text-graphite-200"
                filterInputClassName="h-10 border-sky-200 bg-white shadow-sm focus:border-sky-400 focus:ring-sky-300 dark:border-sky-900/70 dark:bg-graphite-900"
                filterSelectTriggerClassName="h-10 border-sky-200 bg-white shadow-sm focus:border-sky-400 focus:ring-sky-300 dark:border-sky-900/70 dark:bg-graphite-900"
                onRowClick={(row) => {
                  setSelectedTravelExpenseId(row.id);
                  setTravelReportDialogOpen(true);
                }}
                getRowClassName={(row) =>
                  `cursor-pointer ${
                    selectedTravelExpenseId === row.id
                      ? 'bg-graphite-100/80 ring-1 ring-inset ring-graphite-300'
                      : 'hover:bg-graphite-50'
                  }`
                }
                emptyMessage="Nenhuma despesa de viagem para os filtros selecionados."
              />
            </div>

            <Dialog open={travelReportDialogOpen} onOpenChange={setTravelReportDialogOpen}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Resumo da despesa</DialogTitle>
                  <DialogDescription>Formato de relatório para envio e impressão.</DialogDescription>
                </DialogHeader>

                {travelReport && (
                  <div className="space-y-4">
                    {(() => {
                      const itemValuePresets = {
                        Hospedagem: 420,
                        Combustível: 180,
                        Taxi: 75,
                        Uber: 68,
                        'Passagem aérea': 860,
                        Alimentação: 92,
                        Pedágio: 54,
                        Estacionamento: 35,
                        Almoço: 68,
                        Jantar: 92,
                      };
                      const resumoItens = (travelReport.itens || []).map((nome) => ({
                        nome,
                        valor: `R$ ${(itemValuePresets[nome] || 0).toLocaleString('pt-BR', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}`,
                      }));
                      return (
                    <div className="rounded-xl border-2 border-dashed border-graphite-300 bg-white p-4 font-mono text-sm">
                      <div className="border-b border-dashed border-graphite-300 pb-2 text-center">
                        <p className="text-xs uppercase tracking-wide text-graphite-500">Resumo de Viagem</p>
                        <p className="text-base font-semibold text-graphite-900">{travelReport.id}</p>
                        <div className="mt-2 flex justify-center">
                          <Badge
                            variant="secondary"
                            className={travelStatusStyles[travelReport.status] || 'border-graphite-200 bg-graphite-100 text-graphite-700'}
                          >
                            {travelReport.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="mt-3 overflow-hidden rounded-md border border-graphite-200 text-xs text-graphite-700">
                        {[
                          ['Tipo', travelReport.tipoSolicitacao],
                          ['Solicitante', travelReport.solicitante],
                          ['Centro de custo', travelReport.centroCusto],
                          ['Origem', travelReport.origem],
                          ['Destino', travelReport.destino],
                          ['Período', travelReport.periodo],
                          ['KM estimado', travelReport.kmEstimado],
                          ['Total', travelReport.total],
                          ['Número RM', travelReport.numeroRm || 'Pendente'],
                        ].map(([label, value], index) => (
                          <div
                            key={label}
                            className={`flex justify-between px-2 py-1.5 ${
                              index % 2 === 0 ? 'bg-graphite-50/80' : 'bg-white'
                            }`}
                          >
                            <span>{label}</span>
                            <span>{value}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 border-t border-dashed border-graphite-300 pt-2 text-xs text-graphite-700">
                        <p className="font-semibold text-graphite-900">Motivo</p>
                        <p>{travelReport.motivo}</p>
                        <p className="mt-2 font-semibold text-graphite-900">Observação</p>
                        <p>{travelReport.observacao}</p>
                        <p className="mt-3 font-semibold text-graphite-900">Itens</p>
                        <div className="mt-1 overflow-hidden rounded-md border border-graphite-200">
                          {resumoItens.map((item, index) => (
                            <div
                              key={item.nome}
                              className={`flex items-center justify-between px-2 py-1.5 ${
                                index % 2 === 0 ? 'bg-graphite-50/80' : 'bg-white'
                              }`}
                            >
                              <span>{item.nome}</span>
                              <span>{item.valor}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="mt-3 border-t border-dashed border-graphite-300 pt-2 text-xs text-graphite-700">
                        <div className="overflow-hidden rounded-md border border-graphite-200">
                          {[
                            ['Data prevista Pagamento', travelReport.dataPrevistaPgto || '--'],
                            ['Pagamento Realizado em', travelReport.pgtoRealizadoEm || '--'],
                          ].map(([label, value], index) => (
                            <div
                              key={label}
                              className={`flex justify-between px-2 py-1.5 ${
                                index % 2 === 0 ? 'bg-graphite-50/80' : 'bg-white'
                              }`}
                            >
                              <span>{label}</span>
                              <span className="inline-flex items-center gap-1">
                                {label === 'Pagamento Realizado em' &&
                                  travelReport.status === 'Finalizada' &&
                                  value !== '--' && (
                                    <CheckIcon className="h-3.5 w-3.5 text-emerald-600" />
                                  )}
                                {value}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                      );
                    })()}

                    <div className="flex flex-wrap items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setTravelReportMapDialogOpen(true)}
                        disabled={!reportRouteMap.embedUrl}
                      >
                        <MapPinIcon className="mr-1 h-4 w-4" />
                        Visualizar mapa
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => window.print()}>
                        <PrinterIcon className="mr-1 h-4 w-4" />
                        Imprimir
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          window.open(`https://wa.me/?text=${encodeURIComponent(reportShareText)}`, '_blank', 'noopener,noreferrer')
                        }
                      >
                        <ChatBubbleLeftRightIcon className="mr-1 h-4 w-4" />
                        WhatsApp
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          window.location.assign(
                            `mailto:?subject=${encodeURIComponent(`Relatório de Despesa - ${travelReport.id}`)}&body=${encodeURIComponent(
                              reportShareText
                            )}`
                          )
                        }
                      >
                        <EnvelopeIcon className="mr-1 h-4 w-4" />
                        Email
                      </Button>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>

            <Dialog open={travelReportMapDialogOpen} onOpenChange={setTravelReportMapDialogOpen}>
              <DialogContent className="max-w-5xl">
                <DialogHeader>
                  <DialogTitle>Mapa do trajeto</DialogTitle>
                  <DialogDescription>Rota da solicitação selecionada.</DialogDescription>
                </DialogHeader>
                {reportRouteMap.embedUrl ? (
                  <div className="space-y-3">
                    <div className="overflow-hidden rounded-lg border border-graphite-200">
                      <iframe
                        title="Mapa do trajeto da solicitação"
                        src={reportRouteMap.embedUrl}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        className="h-[60vh] w-full bg-graphite-50"
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button
                        variant="outline"
                        onClick={() => window.open(reportRouteMap.externalUrl, '_blank', 'noopener,noreferrer')}
                      >
                        Abrir no Google Maps
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                    Endereços não disponíveis para esta solicitação.
                  </div>
                )}
              </DialogContent>
            </Dialog>

            <Dialog open={travelDialogOpen} onOpenChange={setTravelDialogOpen}>
              <DialogContent className="flex max-h-[88vh] max-w-3xl flex-col overflow-hidden">
                <DialogHeader>
                  <DialogTitle>Nova solicitação de viagem</DialogTitle>
                  <DialogDescription>
                    Escolha o tipo da solicitação e registre os dados básicos para integração ao RM.
                  </DialogDescription>
                </DialogHeader>

                <div className="overflow-y-auto pr-1">
                {!travelDraft.tipoSolicitacao ? (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {TRAVEL_TYPE_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleSelectTravelType(option.value)}
                        className="rounded-lg border border-graphite-200 bg-white p-4 text-left transition-colors hover:border-graphite-300 hover:bg-graphite-50"
                      >
                        <p className="text-sm font-semibold text-graphite-900">{option.label}</p>
                        <p className="mt-1 text-xs text-graphite-500">{option.description}</p>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="rounded-xl border border-graphite-200 bg-gradient-to-b from-white to-graphite-50/40 p-4 shadow-sm">
                      <div className="mb-3 flex items-center justify-between">
                        <p className="text-xs font-semibold uppercase tracking-wide text-graphite-500">Resumo da solicitação</p>
                        <Badge variant="secondary" className="bg-graphite-100 text-graphite-700">
                          {travelDraft.tipoSolicitacao}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="space-y-1">
                          <label className="text-xs font-semibold uppercase tracking-wide text-graphite-500">Tipo</label>
                          <Input
                            value={travelDraft.tipoSolicitacao}
                            disabled
                            className="bg-graphite-50"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold uppercase tracking-wide text-graphite-500">Número RM</label>
                          <Input
                            value={travelDraft.numeroRm || 'Será preenchido após integração no ERP'}
                            disabled
                            className="bg-graphite-50 font-mono"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold uppercase tracking-wide text-graphite-500">Início</label>
                          <Input
                            type="date"
                            value={travelDraft.periodoInicio}
                            onChange={(e) => handleTravelDraftChange('periodoInicio', e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold uppercase tracking-wide text-graphite-500">Fim</label>
                          <Input
                            type="date"
                            value={travelDraft.periodoFim}
                            onChange={(e) => handleTravelDraftChange('periodoFim', e.target.value)}
                            min={travelDraft.periodoInicio || undefined}
                            disabled={!travelDraft.periodoInicio}
                            required
                          />
                        </div>
                      </div>
                      {hasInvalidTravelDateRange && (
                        <p className="mt-2 text-xs text-red-600">A data fim não pode ser menor que a data início.</p>
                      )}
                    </div>

                    <div className="overflow-visible rounded-xl border border-sky-200 bg-gradient-to-b from-sky-50/70 to-white p-4 shadow-sm">
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-sky-700">
                            <ArrowRightIcon className="h-4 w-4" />
                            Traslado
                          </p>
                          <p className="text-xs text-graphite-600">
                            Informe origem e destino para calcular automaticamente a distância estimada.
                          </p>
                          <label className="mt-2 inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-graphite-700">
                            <input
                              type="checkbox"
                              checked={travelRoundTrip}
                              onChange={(e) => {
                                setTravelRoundTrip(e.target.checked);
                                setTravelTollEstimated('');
                                setTravelTollError('');
                                lastTravelKmQuery.current = '';
                              }}
                              className="h-4 w-4 rounded border-graphite-300 text-sky-700 focus:ring-sky-200"
                            />
                            Considerar ida e volta
                          </label>
                        </div>
                        <div className="rounded-lg border border-sky-200 bg-white px-3 py-2 text-right">
                          <p className="text-[10px] font-semibold uppercase tracking-wide text-graphite-500">KM estimado</p>
                          <p className="text-base font-semibold text-sky-800">
                            {travelKmLoading
                              ? 'Calculando...'
                              : travelDraft.kmEstimado
                              ? `${travelDraft.kmEstimado} km`
                              : '--'}
                          </p>
                          <button
                            type="button"
                            onClick={handleCalculateEstimatedToll}
                            disabled={travelTollLoading}
                            className="mt-2 inline-flex items-center rounded-md border border-amber-300 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800 transition-colors hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {travelTollLoading ? 'Calculando...' : 'Pedágio estimado'}
                          </button>
                          <button
                            type="button"
                            onClick={handleOpenTravelMap}
                            disabled={!canOpenTravelMap}
                            className="mt-2 inline-flex items-center rounded-md border border-sky-300 bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-800 transition-colors hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <MapPinIcon className="mr-1 h-3.5 w-3.5" />
                            Visualizar mapa
                          </button>
                          {travelTollEstimated && (
                            <p className="mt-1 text-xs font-semibold text-amber-700">{travelTollEstimated}</p>
                          )}
                          {travelTollError && (
                            <p className="mt-1 text-xs text-red-600">{travelTollError}</p>
                          )}
                          {!canOpenTravelMap && (
                            <p className="mt-1 text-xs text-graphite-500">Preencha origem e destino para habilitar o mapa.</p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="rounded-lg border border-graphite-200 bg-white px-3 py-3 shadow-[0_1px_0_rgba(15,23,42,0.04)]">
                          <label className="mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-graphite-500">
                            <MapPinIcon className="h-4 w-4 text-sky-600" />
                            Endereço de origem
                          </label>
                          <div className="relative">
                            <Input
                              value={travelDraft.origem}
                              onChange={(e) => handleTravelDraftChange('origem', e.target.value)}
                              placeholder="Rua, número, bairro, cidade"
                              className="h-11"
                              required
                            />
                            {travelOriginSuggestions.length > 0 && (
                              <div className="absolute z-30 mt-1 max-h-48 w-full overflow-auto rounded-md border border-graphite-200 bg-white shadow-lg">
                                {travelOriginSuggestions.map((suggestion) => (
                                  <button
                                    key={`origem-${suggestion.placeId || suggestion.text}`}
                                    type="button"
                                    className="block w-full border-b border-graphite-100 px-3 py-2 text-left text-sm text-graphite-700 transition-colors hover:bg-graphite-50 last:border-b-0"
                                    onClick={() => handleSelectTravelSuggestion('origem', suggestion)}
                                  >
                                    {suggestion.text}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="rounded-lg border border-graphite-200 bg-white px-3 py-3 shadow-[0_1px_0_rgba(15,23,42,0.04)]">
                          <label className="mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-graphite-500">
                            <FlagIcon className="h-4 w-4 text-sky-600" />
                            Endereço de destino
                          </label>
                          <div className="relative">
                            <Input
                              value={travelDraft.destino}
                              onChange={(e) => handleTravelDraftChange('destino', e.target.value)}
                              placeholder="Rua, número, bairro, cidade"
                              className="h-11"
                              required
                            />
                            {travelDestinationSuggestions.length > 0 && (
                              <div className="absolute z-30 mt-1 max-h-48 w-full overflow-auto rounded-md border border-graphite-200 bg-white shadow-lg">
                                {travelDestinationSuggestions.map((suggestion) => (
                                  <button
                                    key={`destino-${suggestion.placeId || suggestion.text}`}
                                    type="button"
                                    className="block w-full border-b border-graphite-100 px-3 py-2 text-left text-sm text-graphite-700 transition-colors hover:bg-graphite-50 last:border-b-0"
                                    onClick={() => handleSelectTravelSuggestion('destino', suggestion)}
                                  >
                                    {suggestion.text}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {(travelAutocompleteLoading.origem || travelAutocompleteLoading.destino) && (
                          <p className="text-xs text-graphite-500">Buscando sugestões de endereço...</p>
                        )}
                        {travelMapsConfigMissing && (
                          <p className="text-xs text-amber-700">
                            Maps não configurado no backend. Ajuste a chave Google em Configurações.
                          </p>
                        )}
                        {travelAutocompleteError && (
                          <p className="text-xs text-red-600">{travelAutocompleteError}</p>
                        )}
                        {travelKmError && <p className="text-xs text-red-600">{travelKmError}</p>}
                      </div>
                    </div>

                    <div className="rounded-xl border border-graphite-200 bg-white p-4 shadow-sm">
                      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-graphite-500">
                        Centro de Custo
                      </label>
                      <Select
                        value={travelDraft.motivo}
                        onValueChange={(value) => handleTravelDraftChange('motivo', value)}
                        disabled={requestCentroLoading || travelRateioEnabled}
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              requestCentroLoading ? 'Carregando centros de custo...' : 'Selecione um centro de custo'
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {requestCentroLoading && (
                            <SelectItem value="loading" disabled>
                              Carregando...
                            </SelectItem>
                          )}
                          {!requestCentroLoading && requestCentroOptions.length === 0 && (
                            <SelectItem value="empty" disabled>
                              Nenhum centro disponível
                            </SelectItem>
                          )}
                          {!requestCentroLoading &&
                            requestCentroOptions.map((opt) => (
                              <SelectItem key={opt.codigo} value={opt.codigo}>
                                {opt.codigo} - {opt.nome || 'Sem descrição'}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      {travelRateioEnabled && (
                        <p className="mt-2 text-xs text-graphite-500">
                          Campo desabilitado enquanto o rateio estiver habilitado.
                        </p>
                      )}
                      {requestCentroError && <p className="mt-2 text-xs text-red-600">{requestCentroError}</p>}
                    </div>

                    <div className="rounded-xl border border-indigo-200 bg-indigo-50/40 p-4 shadow-sm">
                      <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-indigo-900">
                        <input
                          type="checkbox"
                          checked={travelRateioEnabled}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setTravelRateioEnabled(checked);
                            if (checked) {
                              setTravelDraft((prev) => ({ ...prev, motivo: '' }));
                            }
                            setTravelRateioError('');
                          }}
                          className="h-4 w-4 rounded border-indigo-300 text-indigo-700 focus:ring-indigo-200"
                        />
                        Ratear valores entre centros de custo
                      </label>
                      <p className="mt-2 text-xs text-indigo-700">
                        Quando habilitado, o sistema abrirá a próxima tela para distribuição por percentual.
                      </p>
                    </div>

                    <div className="rounded-xl border border-graphite-200 bg-gradient-to-b from-white to-graphite-50/50 p-4 shadow-sm">
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-graphite-500">
                            <BriefcaseIcon className="h-4 w-4 text-graphite-500" />
                            Itens da viagem
                          </p>
                          <p className="text-xs text-graphite-500">
                            Selecione os itens aplicáveis e informe os valores previstos.
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleIncludeEstimatedKmItem}
                            disabled={disableEstimatedInsertButtons}
                          >
                            Incluir KM estimado
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleIncludeEstimatedTollItem}
                            disabled={disableEstimatedInsertButtons}
                          >
                            Adicionar pedágio estimado
                          </Button>
                          <Button variant="secondary" size="sm" onClick={handleAddTravelItem}>
                            Adicionar item
                          </Button>
                        </div>
                      </div>
                      <div className="hidden grid-cols-[minmax(150px,1fr)_120px_90px_120px_110px_36px] gap-2 rounded-md bg-graphite-100/70 px-2 py-2 text-xs font-medium text-graphite-600 sm:grid">
                        <span>Item</span>
                        <span className="text-right">Valor unitário (R$)</span>
                        <span className="text-right">Qde.</span>
                        <span className="text-right">Total</span>
                        <span className="text-center">Anexar</span>
                        <span />
                      </div>
                      <div className="space-y-2">
                        {travelItems.map((entry, index) => (
                          <div
                            key={`travel-item-${index}`}
                            className="grid grid-cols-1 gap-2 rounded-lg border border-graphite-200 bg-white px-2 py-2 shadow-[0_1px_0_rgba(15,23,42,0.04)] sm:grid-cols-[minmax(150px,1fr)_120px_90px_120px_110px_36px] sm:items-center"
                          >
                            <Select
                              value={entry.item}
                              onValueChange={(value) => handleTravelItemChange(index, 'item', value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione um item..." />
                              </SelectTrigger>
                              <SelectContent>
                                {TRAVEL_EXPENSE_ITEMS.map((option) => (
                                  <SelectItem
                                    key={option.value}
                                    value={option.value}
                                    disabled={travelItems.some(
                                      (row, rowIndex) => rowIndex !== index && row.item === option.value
                                    )}
                                  >
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <div className="relative">
                              <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-xs text-graphite-500">
                                R$
                              </span>
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="0,00"
                                value={entry.valorUnitario}
                                onChange={(e) => handleTravelItemChange(index, 'valorUnitario', e.target.value)}
                                className="pl-8 text-right"
                              />
                            </div>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="0,00"
                              value={entry.quantidade}
                              onChange={(e) => handleTravelItemChange(index, 'quantidade', e.target.value)}
                              className="text-right"
                            />
                            <div className="rounded-md border border-graphite-200 bg-graphite-50 px-2 py-2 text-right text-sm font-medium text-graphite-800">
                              R$ {getTravelItemLineTotal(entry).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenTravelItemAttachment(entry.item)}
                              disabled={
                                !entry.item ||
                                entry.item === 'KM estimado' ||
                                !(Number(entry.valorUnitario) > 0) ||
                                !(Number(entry.quantidade) > 0)
                              }
                              className="justify-center"
                              title={
                                entry.item === 'KM estimado'
                                  ? 'Anexo indisponível para KM estimado'
                                  : 'Preencha item, valor unitário e quantidade para anexar'
                              }
                            >
                              <PaperClipIcon className="h-4 w-4" />
                              {entry.item && travelItemAttachments[entry.item]
                                ? `(${travelItemAttachments[entry.item].length})`
                                : 'Anexar'}
                            </Button>
                            <button
                              type="button"
                              className="rounded-md p-2 text-graphite-500 transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                              onClick={() => handleRemoveTravelItem(index)}
                              disabled={travelItems.length === 1}
                              title="Excluir item"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-right">
                        <p className="text-xs uppercase tracking-wide text-emerald-700">Valor total</p>
                        <p className="text-lg font-bold text-emerald-900">
                          R$ {travelItemsTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      <input
                        ref={travelItemFileInputRef}
                        type="file"
                        multiple
                        onChange={handleTravelItemAttachmentUpload}
                        className="hidden"
                      />
                    </div>

                    <div className="space-y-2 rounded-xl border border-graphite-200 bg-white p-4">
                      <label className="text-xs font-semibold uppercase tracking-wide text-graphite-500">
                        Conferir anexos
                      </label>
                      <div className="space-y-2 rounded-lg border border-graphite-200 bg-graphite-50 p-3">
                        {Object.keys(travelItemAttachments).length === 0 && (
                          <p className="text-sm text-graphite-500">
                            Nenhum anexo informado. Use o botão `Anexar` em cada item.
                          </p>
                        )}
                        {Object.entries(travelItemAttachments).map(([itemName, files]) => (
                          <div key={`attachments-${itemName}`} className="rounded-md border border-graphite-200 bg-white p-2">
                            <p className="text-sm font-semibold text-graphite-800">{itemName}</p>
                            <ul className="mt-1 space-y-1">
                              {files.map((file, fileIndex) => (
                                <li key={`${itemName}-${file.name}-${fileIndex}`} className="flex items-center justify-between text-sm text-graphite-600">
                                  <span className="truncate">{file.name}</span>
                                  <button
                                    type="button"
                                    className="ml-2 rounded px-2 py-0.5 text-xs text-red-600 hover:bg-red-50"
                                    onClick={() => handleRemoveTravelItemAttachment(itemName, fileIndex)}
                                  >
                                    Remover
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                      {travelUploadError && (
                        <p className="text-xs text-red-600">{travelUploadError}</p>
                      )}
                    </div>

                    <div className="rounded-xl border border-graphite-200 bg-white p-4">
                      <label className="text-xs font-semibold uppercase tracking-wide text-graphite-500">Observação</label>
                      <Textarea
                        value={travelDraft.observacao}
                        onChange={(e) => handleTravelDraftChange('observacao', e.target.value)}
                        placeholder="Descreva objetivo da viagem, centros atendidos e justificativa."
                        className="mt-2 min-h-[90px]"
                      />
                    </div>
                  </div>
                )}
                {travelFormError && (
                  <p className="mt-3 text-sm font-medium text-red-600">{travelFormError}</p>
                )}
                </div>

                <DialogFooter>
                  {travelDraft.tipoSolicitacao ? (
                    <div className="flex items-center gap-2">
                      <Button variant="outline" onClick={() => setTravelDraft(createTravelDraft())}>
                        Voltar
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={handleIntegrateTravelWithRm}
                        disabled={travelIntegrating || travelSaving || hasInvalidTravelDateRange}
                      >
                        {travelIntegrating ? 'Integrando...' : 'Integrar ao RM'}
                      </Button>
                      <Button
                        onClick={travelRateioEnabled ? handleProceedToTravelRateio : handleSaveTravel}
                        disabled={travelSaving || hasInvalidTravelDateRange}
                      >
                        {travelSaving
                          ? 'Salvando...'
                          : travelRateioEnabled
                          ? 'Informar Rateio'
                          : 'Salvar solicitação'}
                      </Button>
                    </div>
                  ) : (
                    <DialogClose asChild>
                      <Button variant="outline">Cancelar</Button>
                    </DialogClose>
                  )}
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={travelMapDialogOpen} onOpenChange={setTravelMapDialogOpen}>
              <DialogContent className="max-w-5xl">
                <DialogHeader>
                  <DialogTitle>Mapa do trajeto</DialogTitle>
                  <DialogDescription>Visualização da rota entre origem e destino informados.</DialogDescription>
                </DialogHeader>
                {travelRouteMap.embedUrl ? (
                  <div className="space-y-3">
                    <div className="overflow-hidden rounded-lg border border-graphite-200">
                      <iframe
                        title="Mapa do trajeto"
                        src={travelRouteMap.embedUrl}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        className="h-[60vh] w-full bg-graphite-50"
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button
                        variant="outline"
                        onClick={() => window.open(travelRouteMap.externalUrl, '_blank', 'noopener,noreferrer')}
                      >
                        Abrir no Google Maps
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                    Informe origem e destino para visualizar o trajeto no mapa.
                  </div>
                )}
              </DialogContent>
            </Dialog>

            <Dialog
              open={travelRateioDialogOpen}
              onOpenChange={(open) => {
                setTravelRateioDialogOpen(open);
                if (!open) setTravelRateioError('');
              }}
            >
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Rateio por centro de custo</DialogTitle>
                  <DialogDescription>Distribuição das despesas por percentual.</DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-3 text-sm text-indigo-900">
                    Você habilitou a opção ratear valores, na próxima tela informe os valores de cada centro de custo
                  </div>

                  <div className="grid grid-cols-1 gap-3 rounded-lg border border-graphite-200 bg-graphite-50 p-3 sm:grid-cols-4">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-graphite-500">Valor total (itens)</p>
                      <p className="text-lg font-bold text-graphite-900">
                        R$ {Number(travelPendingSubmission?.totalValue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-graphite-500">Percentual rateado</p>
                      <p
                        className={`text-base font-semibold ${
                          Math.abs(travelRateioTotalPercent - 100) <= 0.01 ? 'text-emerald-700' : 'text-amber-700'
                        }`}
                      >
                        {travelRateioTotalPercent.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-graphite-500">Valor rateado</p>
                      <p className="text-base font-semibold text-graphite-900">
                        R$ {travelRateioTotalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-graphite-500">Diferença que falta</p>
                      <p
                        className={`text-base font-semibold ${
                          Math.abs(travelRateioPercentDifference) <= 0.01 ? 'text-emerald-700' : 'text-red-700'
                        }`}
                      >
                        {travelRateioPercentDifference.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}% | R${' '}
                        {travelRateioValueDifference.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="hidden grid-cols-[minmax(220px,1fr)_120px_130px_36px] gap-2 rounded-md bg-graphite-100 px-2 py-2 text-xs font-medium text-graphite-600 sm:grid">
                      <span>Centro de custo</span>
                      <span className="text-right">Percentual</span>
                      <span className="text-right">Valor</span>
                      <span />
                    </div>
                    {travelRateioLines.map((line, index) => {
                      return (
                        <div
                          key={`rateio-line-${index}`}
                          className="grid grid-cols-1 gap-2 rounded-lg border border-graphite-200 bg-white px-2 py-2 sm:grid-cols-[minmax(220px,1fr)_120px_130px_36px] sm:items-center"
                        >
                          <Select
                            value={line.centroCusto}
                            onValueChange={(value) => handleTravelRateioLineChange(index, 'centroCusto', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione..." />
                            </SelectTrigger>
                            <SelectContent>
                              {requestCentroOptions.map((opt) => (
                                <SelectItem key={`${opt.codigo}-${index}`} value={opt.codigo}>
                                  {opt.codigo} - {opt.nome || 'Sem descrição'}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            placeholder="0,00"
                            value={line.percentual}
                            onChange={(e) => handleTravelRateioLineChange(index, 'percentual', e.target.value)}
                            className="text-right"
                          />
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="0,00"
                            value={line.valor}
                            onChange={(e) => handleTravelRateioLineChange(index, 'valor', e.target.value)}
                            className="text-right"
                          />
                          <button
                            type="button"
                            className="rounded-md p-2 text-graphite-500 transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                            onClick={() => handleRemoveTravelRateioLine(index)}
                            disabled={travelRateioLines.length === 1}
                            title="Excluir linha"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {travelRateioError && (
                    <p className="text-sm text-red-600">{travelRateioError}</p>
                  )}
                </div>

                <DialogFooter>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setTravelRateioDialogOpen(false);
                        setTravelDialogOpen(true);
                      }}
                    >
                      Voltar
                    </Button>
                    <Button variant="secondary" onClick={handleAddTravelRateioLine}>
                      Adicionar centro
                    </Button>
                    <Button onClick={handleConfirmTravelRateio} disabled={travelSaving || !canSaveTravelRateio}>
                      {travelSaving ? 'Salvando...' : 'Salvar rateio'}
                    </Button>
                  </div>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        );
      }

      case 'relatorios': {
        const relatoriosColumns = [
          { key: 'relatorio', label: 'Relatório' },
          {
            key: 'periodicidade',
            label: 'Periodicidade',
            cell: (row) => <span className="text-graphite-500">{row.periodicidade}</span>,
          },
          {
            key: 'status',
            label: 'Status',
            filterMode: 'select',
            headerClassName: 'text-right',
            cellClassName: 'text-right',
          },
        ];

        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-graphite-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-semibold text-graphite-900">Relatórios</h2>
                  <p className="text-graphite-500">Indicadores e consolidações.</p>
                </div>
                <Button variant="secondary" size="default">Exportar</Button>
              </div>
              <Tabs defaultValue="itens">
                <TabsList>
                  <TabsTrigger value="itens">Itens</TabsTrigger>
                  <TabsTrigger value="anexos">Anexos</TabsTrigger>
                  <TabsTrigger value="historico">Histórico</TabsTrigger>
                  <TabsTrigger value="aprovacao">Aprovação</TabsTrigger>
                </TabsList>
                <TabsContent value="itens">
                  <div className="mt-4">
                    <DataTable
                      columns={relatoriosColumns}
                      data={relatoriosData}
                      emptyMessage="Nenhum relatório para os filtros selecionados."
                    />
                  </div>
                </TabsContent>
                <TabsContent value="anexos">
                  <div className="mt-4 border border-graphite-200 rounded-md p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 text-sm text-graphite-600">
                      <PaperClipIcon className="h-5 w-5 text-graphite-400" />
                      Nenhum anexo. Adicione relatórios ou planilhas de apoio.
                    </div>
                    <Button variant="secondary" size="sm">Adicionar arquivo</Button>
                  </div>
                </TabsContent>
                <TabsContent value="historico">
                  <div className="mt-4 border border-graphite-200 rounded-md p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 text-sm text-graphite-600">
                      <ClockIcon className="h-5 w-5 text-graphite-400" />
                      Histórico de versões ficará disponível aqui.
                    </div>
                    <Button variant="ghost" size="sm">Ver histórico</Button>
                  </div>
                </TabsContent>
                <TabsContent value="aprovacao">
                  <div className="mt-4 border border-graphite-200 rounded-md p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 text-sm text-graphite-600">
                      <CheckCircleIcon className="h-5 w-5 text-graphite-400" />
                      Aprovação pendente do gestor da área.
                    </div>
                    <Button variant="secondary" size="sm">Solicitar aprovação</Button>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        );
      }

      case 'configuracoes': {
        return (
          <div className="space-y-6">
            <div className="rounded-lg border border-graphite-200 bg-white p-6">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-graphite-900">Configurações de Integração</h2>
                  <p className="text-graphite-500">
                    Centralize APIs e chaves em um único local (frontend + backend).
                  </p>
                </div>
                <Button
                  variant="default"
                  onClick={handleSaveIntegrationConfig}
                  disabled={integrationConfigSaving}
                >
                  {integrationConfigSaving ? 'Salvando...' : 'Salvar configurações'}
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wide text-graphite-500">
                    URL do backend
                  </label>
                  <Input
                    value={integrationConfig.backendBaseUrl}
                    onChange={(e) => handleIntegrationConfigChange('backendBaseUrl', e.target.value)}
                    placeholder="http://localhost:8787"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wide text-graphite-500">
                    URL da API RM
                  </label>
                  <Input
                    value={integrationConfig.rmApiBaseUrl}
                    onChange={(e) => handleIntegrationConfigChange('rmApiBaseUrl', e.target.value)}
                    placeholder="http://servidor-rm:8051"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wide text-graphite-500">
                    Endpoint usuários RM
                  </label>
                  <Input
                    value={integrationConfig.rmAuthUsersPath}
                    onChange={(e) => handleIntegrationConfigChange('rmAuthUsersPath', e.target.value)}
                    placeholder="/api/framework/v1/users"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wide text-graphite-500">
                    Endpoint Consulta SQL RM
                  </label>
                  <Input
                    value={integrationConfig.rmConsultaBasePath}
                    onChange={(e) => handleIntegrationConfigChange('rmConsultaBasePath', e.target.value)}
                    placeholder="/api/framework/v1/consultaSQLServer/RealizaConsulta"
                  />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-graphite-500">
                    Chave Google Maps (Routes/Places)
                  </label>
                  <div className="relative">
                    <Input
                      type={showGoogleApiKey ? 'text' : 'password'}
                      value={integrationConfig.googleMapsApiKey}
                      onChange={(e) => handleIntegrationConfigChange('googleMapsApiKey', e.target.value)}
                      placeholder="Cole aqui a chave da API"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowGoogleApiKey((prev) => !prev)}
                      className="absolute inset-y-0 right-0 inline-flex items-center px-3 text-graphite-500 transition-colors hover:text-graphite-700"
                      aria-label={showGoogleApiKey ? 'Ocultar chave' : 'Exibir chave'}
                      title={showGoogleApiKey ? 'Ocultar chave' : 'Exibir chave'}
                    >
                      {showGoogleApiKey ? (
                        <EyeSlashIcon className="h-4 w-4" />
                      ) : (
                        <EyeIcon className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-1">
                {integrationConfigStatus && (
                  <p className="text-sm text-emerald-600">{integrationConfigStatus}</p>
                )}
                {integrationConfigError && (
                  <p className="text-sm text-red-600">{integrationConfigError}</p>
                )}
                <p className="text-xs text-graphite-500">
                  Esta configuração é temporária e local. Depois você pode migrar para perfil Admin.
                </p>
              </div>
            </div>
          </div>
        );
      }

      default:
        return null;
    }
  };

  const dialog = (
      <Dialog open={showRequestCard} onOpenChange={setShowRequestCard}>
        <DialogContent className="max-w-5xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{requestSaved ? 'Solicitação criada' : 'Nova solicitação'}</DialogTitle>
            {!requestSaved && (
              <DialogDescription>Preencha os dados do pedido</DialogDescription>
            )}
          </DialogHeader>

          <div className="relative flex-1 overflow-y-auto pr-1">
            {requestLookupsLoading && (
              <div className="absolute inset-0 z-10 rounded-lg bg-white/80 dark:bg-graphite-950/65 backdrop-blur-[1px]">
                <div className="p-6 space-y-4 animate-pulse">
                  <div className="h-5 w-40 bg-graphite-200 rounded-md" />
                  <div className="h-24 w-full bg-graphite-200 rounded-lg" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="h-16 bg-graphite-200 rounded-lg" />
                    <div className="h-16 bg-graphite-200 rounded-lg" />
                  </div>
                  <div className="h-40 w-full bg-graphite-200 rounded-lg" />
                </div>
              </div>
            )}
            <div className={`space-y-6 ${requestLookupsLoading ? 'opacity-60 pointer-events-none' : ''}`}>
              {requestSaving && (
                <div className="border border-graphite-200 bg-white rounded-md px-4 py-3">
                  <div className="flex items-center justify-between text-xs text-graphite-500 mb-2">
                    <span>Processando solicitação...</span>
                    <span>{requestProgress}%</span>
                  </div>
                  <div className="h-2 w-full bg-graphite-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-black dark:bg-graphite-200 transition-all"
                      style={{ width: `${requestProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {!requestSaving && requestSaved && (
                <div className="border border-emerald-200 bg-emerald-50 text-emerald-700 rounded-md px-4 py-4">
                  <p className="text-sm font-medium">O movimento foi criado no RM com sucesso.</p>
                  <p className="text-sm mt-1">
                    Número RM: <span className="font-semibold">000235</span>
                  </p>
                  <div className="mt-4 flex items-center gap-2">
                    <DialogClose asChild>
                      <Button variant="secondary" size="sm">Sair</Button>
                    </DialogClose>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => {
                        setRequestSaved(false);
                        setRequestDates({ emissao: null, necessidade: null });
                        setRequestMeta((prev) => ({
                          ...prev,
                          observacao: '',
                          dataEmissao: '',
                          dataNecessidade: '',
                          numeroRm: '',
                        }));
                        setRequestItems([{ codigo: '', descricao: '', tipo: 'Servico', quantidade: '', unidade: '' }]);
                      }}
                    >
                      Criar nova solicitação
                    </Button>
                  </div>
                </div>
              )}

              {!requestSaved && (
                <Card className="border-graphite-200">
                  <CardContent className="p-6 space-y-6">
                  <details className="group border border-graphite-200 rounded-lg bg-white" open>
                    <summary className="cursor-pointer list-none px-5 py-4 flex items-center justify-between rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-graphite-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-graphite-600 dark:focus-visible:ring-offset-graphite-900 [-webkit-details-marker]:hidden group-hover:text-graphite-900 dark:group-hover:text-graphite-100">
                      <div>
                        <p className="text-xs uppercase text-graphite-500">Dados gerais</p>
                        <h4 className="text-sm font-semibold text-graphite-900">Informações da solicitação</h4>
                      </div>
                      <ChevronDownIcon className="h-4 w-4 text-graphite-600 transition-transform group-open:rotate-180 group-hover:text-graphite-800" />
                    </summary>
                    <div className="px-5 pb-5 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2 border border-graphite-200 dark:border-graphite-700 bg-graphite-50 dark:bg-graphite-800 rounded-md p-4">
                          <label className="text-xs uppercase text-graphite-500">Tipo de Solicitação</label>
                          <Select
                            value={requestMeta.tipoSolicitacao}
                            onValueChange={(value) =>
                              setRequestMeta({ ...requestMeta, tipoSolicitacao: value })
                            }
                          >
                            <SelectTrigger className="mt-2">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {requestTipoLoading && (
                                <SelectItem value="loading" disabled>
                                  Carregando...
                                </SelectItem>
                              )}
                              {!requestTipoLoading && requestTipoOptions.length === 0 && (
                                <SelectItem value="empty" disabled>
                                  Nenhum tipo disponível
                                </SelectItem>
                              )}
                              {!requestTipoLoading &&
                                requestTipoOptions.map((opt) => (
                                  <SelectItem key={opt.codigo} value={opt.codigo}>
                                    {opt.codigo} - {opt.nome || 'Sem descrição'}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                          {requestTipoError && (
                            <p className="mt-2 text-xs text-red-600">{requestTipoError}</p>
                          )}
                        </div>
                        <div>
                          <label className="text-sm text-graphite-600">Filial</label>
                          <Select
                            value={requestMeta.filial}
                            onValueChange={(value) => setRequestMeta({ ...requestMeta, filial: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">1 - Filial Santos</SelectItem>
                              <SelectItem value="2">2 - Filial São Paulo</SelectItem>
                              <SelectItem value="3">3 - Filial Cruzeiro SP</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="text-sm text-graphite-600">Centro de custo</label>
                        <Select
                          value={requestMeta.centroCusto}
                          onValueChange={(value) =>
                            setRequestMeta({ ...requestMeta, centroCusto: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione..." />
                          </SelectTrigger>
                          <SelectContent>
                            {requestCentroLoading && (
                              <SelectItem value="loading" disabled>
                                Carregando...
                              </SelectItem>
                            )}
                            {!requestCentroLoading && requestCentroOptions.length === 0 && (
                              <SelectItem value="empty" disabled>
                                Nenhum centro disponível
                              </SelectItem>
                            )}
                            {!requestCentroLoading &&
                              requestCentroOptions.map((opt) => (
                                <SelectItem key={opt.codigo} value={opt.codigo}>
                                  {opt.codigo} - {opt.nome || 'Sem descrição'}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        {requestCentroError && (
                          <p className="mt-2 text-xs text-red-600">{requestCentroError}</p>
                        )}
                      </div>
                        <div>
                          <label className="text-sm text-graphite-600">Local de estoque</label>
                          <Select
                            value={requestMeta.localEstoque}
                            onValueChange={(value) =>
                              setRequestMeta({ ...requestMeta, localEstoque: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ALM-CENTRAL">Almoxarifado Central</SelectItem>
                              <SelectItem value="TI">TI</SelectItem>
                              <SelectItem value="MANUT">Manutenção</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="text-sm text-graphite-600">Número RM</label>
                          <Input
                            value={requestMeta.numeroRm}
                            disabled
                            placeholder="Preenchido após retorno do ERP"
                            className="bg-graphite-50"
                          />
                        </div>
                        <div>
                          <label className="text-sm text-graphite-600">Data de emissão</label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" size="default" className="w-full justify-between">
                                {formatDate(requestDates.emissao)}
                                <CalendarIcon className="h-4 w-4 text-graphite-400" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={requestDates.emissao}
                                onSelect={(date) => {
                                  setRequestDates((prev) => ({ ...prev, emissao: date }));
                                  setRequestMeta({
                                    ...requestMeta,
                                    dataEmissao: date ? date.toISOString().slice(0, 10) : '',
                                  });
                                }}
                                captionLayout="dropdown"
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                        <div>
                          <label className="text-sm text-graphite-600">Data de necessidade</label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" size="default" className="w-full justify-between">
                                {formatDate(requestDates.necessidade)}
                                <CalendarIcon className="h-4 w-4 text-graphite-400" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={requestDates.necessidade}
                                onSelect={(date) => {
                                  setRequestDates((prev) => ({ ...prev, necessidade: date }));
                                  setRequestMeta({
                                    ...requestMeta,
                                    dataNecessidade: date ? date.toISOString().slice(0, 10) : '',
                                  });
                                }}
                                captionLayout="dropdown"
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                    </div>
                  </details>

                  <details className="group border border-graphite-200 rounded-lg bg-white">
                    <summary className="cursor-pointer list-none px-5 py-4 flex items-center justify-between rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-graphite-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-graphite-600 dark:focus-visible:ring-offset-graphite-900 [-webkit-details-marker]:hidden group-hover:text-graphite-900 dark:group-hover:text-graphite-100">
                      <div>
                        <p className="text-xs uppercase text-graphite-500">Dados financeiros</p>
                        <h4 className="text-sm font-semibold text-graphite-900">Condições e valores</h4>
                      </div>
                      <ChevronDownIcon className="h-4 w-4 text-graphite-600 transition-transform group-open:rotate-180 group-hover:text-graphite-800" />
                    </summary>
                    <div className="px-5 pb-5 space-y-3">
                      <div className="text-sm text-graphite-500">
                        Nenhum campo configurado.
                      </div>
                    </div>
                  </details>

                  <details className="group border border-graphite-200 rounded-lg bg-white">
                    <summary className="cursor-pointer list-none px-5 py-4 flex items-center justify-between rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-graphite-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-graphite-600 dark:focus-visible:ring-offset-graphite-900 [-webkit-details-marker]:hidden group-hover:text-graphite-900 dark:group-hover:text-graphite-100">
                      <div>
                        <p className="text-xs uppercase text-graphite-500">Dados fiscais</p>
                        <h4 className="text-sm font-semibold text-graphite-900">Impostos e natureza</h4>
                      </div>
                      <ChevronDownIcon className="h-4 w-4 text-graphite-600 transition-transform group-open:rotate-180 group-hover:text-graphite-800" />
                    </summary>
                    <div className="px-5 pb-5 space-y-3">
                      <div className="text-sm text-graphite-500">
                        Nenhum campo configurado.
                      </div>
                    </div>
                  </details>

                  <details className="group border border-graphite-200 rounded-lg bg-white" open>
                    <summary className="cursor-pointer list-none px-5 py-4 flex items-center justify-between rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-graphite-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-graphite-600 dark:focus-visible:ring-offset-graphite-900 [-webkit-details-marker]:hidden group-hover:text-graphite-900 dark:group-hover:text-graphite-100">
                      <div>
                        <p className="text-xs uppercase text-graphite-500">Itens</p>
                        <h4 className="text-sm font-semibold text-graphite-900">Linhas da solicitação</h4>
                      </div>
                      <ChevronDownIcon className="h-4 w-4 text-graphite-600 transition-transform group-open:rotate-180 group-hover:text-graphite-800" />
                    </summary>
                    <div className="px-5 pb-5 space-y-3">
                      <div className="flex items-center justify-end">
                        <Button variant="secondary" size="sm" onClick={handleAddItem}>
                          Adicionar item
                        </Button>
                      </div>
                      <div className="border border-graphite-200 rounded-md overflow-hidden">
                        <div className="hidden md:grid grid-cols-[56px_140px_minmax(240px,1fr)_120px_90px_80px_36px] gap-2 px-3 py-2 text-xs text-graphite-500 bg-graphite-50">
                          <span>Item</span>
                          <span>Código</span>
                          <span>Descrição do Item</span>
                          <span>Tipo</span>
                          <span>Qtde.</span>
                          <span>UN</span>
                          <span className="text-right"> </span>
                        </div>
                        <div className="space-y-2 p-3">
                          {requestItems.map((item, index) => (
                            <div
                              key={`item-${index}`}
                              className="grid grid-cols-1 md:grid-cols-[56px_140px_minmax(240px,1fr)_120px_90px_80px_36px] gap-2 items-center"
                            >
                              <Input
                                className="text-center bg-graphite-50"
                                value={String(index + 1).padStart(2, '0')}
                                readOnly
                              />
                              <Input
                                list="catalog-codigos"
                                className="font-mono tracking-tight"
                                placeholder="02.01.0002"
                                value={item.codigo}
                                onChange={(e) => handleItemChange(index, 'codigo', e.target.value)}
                              />
                              <Input
                                list="catalog-descricoes"
                                placeholder="Descrição"
                                value={item.descricao}
                                onChange={(e) => handleItemChange(index, 'descricao', e.target.value)}
                              />
                              <Input
                                className="bg-graphite-50"
                                value={item.tipo}
                                readOnly
                                placeholder="Tipo"
                              />
                              <Input
                                placeholder="Qtde."
                                value={item.quantidade}
                                onChange={(e) => handleItemChange(index, 'quantidade', e.target.value)}
                              />
                              <Input
                                className="bg-graphite-50"
                                placeholder="UN"
                                value={item.unidade}
                                readOnly
                              />
                              <button
                                className="p-2 text-graphite-500 hover:text-red-600 rounded-md hover:bg-red-50"
                                onClick={() => handleRemoveItem(index)}
                                disabled={requestItems.length === 1}
                                title="Excluir item"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                        <datalist id="catalog-codigos">
                          {requestItemCatalog.map((opt) => (
                            <option key={opt.codigo} value={opt.codigo}>
                              {opt.descricao}
                            </option>
                          ))}
                        </datalist>
                        <datalist id="catalog-descricoes">
                          {requestItemCatalog.map((opt) => (
                            <option key={opt.codigo} value={opt.descricao}>
                              {opt.codigo}
                            </option>
                          ))}
                        </datalist>
                      </div>
                    </div>
                  </details>

                  <details className="group border border-graphite-200 rounded-lg bg-white">
                    <summary className="cursor-pointer list-none px-5 py-4 flex items-center justify-between rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-graphite-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-graphite-600 dark:focus-visible:ring-offset-graphite-900 [-webkit-details-marker]:hidden group-hover:text-graphite-900 dark:group-hover:text-graphite-100">
                      <div>
                        <p className="text-xs uppercase text-graphite-500">Observação</p>
                        <h4 className="text-sm font-semibold text-graphite-900">Observação da Solicitação</h4>
                      </div>
                      <ChevronDownIcon className="h-4 w-4 text-graphite-600 transition-transform group-open:rotate-180 group-hover:text-graphite-800" />
                    </summary>
                    <div className="px-5 pb-5 space-y-2">
                      <Textarea
                        className="min-h-[90px] font-mono"
                        value={requestMeta.observacao}
                        onChange={(e) => setRequestMeta({ ...requestMeta, observacao: e.target.value })}
                      />
                    </div>
                  </details>
                </CardContent>
              </Card>
            )}
            </div>
          </div>

          <DialogFooter className="pt-2">
            <div className="text-xs text-graphite-500 mr-auto">
              <span>Data/Hora Geração: {requestStamp.dataHora || '-'}</span>
              <span className="mx-2">•</span>
              <span>Usuário Criação: {requestStamp.usuario || '-'}</span>
            </div>
            {!requestSaved && (
              <div className="flex items-center gap-2">
                <DialogClose asChild>
                  <Button variant="secondary" size="default">Cancelar</Button>
                </DialogClose>
                <Button variant="default" size="default" onClick={handleSaveRequest}>
                  Salvar
                </Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
  );

  return (
    <SidebarProvider defaultCollapsed={false}>
      <DashboardLayout
        user={user}
        activeCover={activeCover}
        currentPage={currentPage}
        onLogout={handleLogout}
        onNavigate={handleNavigate}
        dialog={dialog}
      >
        <>
        <section className="bg-white rounded-lg border border-graphite-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-graphite-900">{activeCover.title}</h2>
              <p className="text-sm text-graphite-500">{activeCover.description}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <div>
                <p className="text-xs text-graphite-500">Situação</p>
                <p className="text-sm font-medium text-graphite-900">{activeCover.status}</p>
              </div>
              <div>
                <p className="text-xs text-graphite-500">Responsável</p>
                <p className="text-sm font-medium text-graphite-900">{activeCover.owner}</p>
              </div>
              <div>
                <p className="text-xs text-graphite-500">Última atualização</p>
                <p className="text-sm font-medium text-graphite-900">Hoje, 10:24</p>
              </div>
            </div>
          </div>
        </section>
        {renderContent()}
        </>
      </DashboardLayout>
    </SidebarProvider>
  );

};

export default DashboardPage;
