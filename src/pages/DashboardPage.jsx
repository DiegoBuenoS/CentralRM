// Dashboard

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { logoutUser, isAuthenticated, getConsultaSql } from '../services';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
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
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/table';
import API_CONFIG from '../config/api.config';
import {
  TrendingUp,
  TrendingDown,
  Paperclip,
  Clock,
  CheckCircle2,
  MoreVertical,
  SlidersHorizontal,
  ArrowUpDown,
  Trash2,
  Circle,
  Info,
  Check,
  X,
  Calendar as CalendarIcon,
  ShoppingCart,
  FileText,
  Users,
  ChevronDown,
} from 'lucide-react';

const DashboardPage = ({ initialPage = 'dashboard' }) => {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [user, setUser] = useState(null);
  const [taskTab, setTaskTab] = useState('itens');
  const [requestFieldConfig, setRequestFieldConfig] = useState({
    header: {
      BranchId: false,
      WarehouseCode: false,
      DeliveryWarehouseCode: false,
      DestinyWarehouseCode: false,
      CustomerVendorCompanyId: false,
      CustomerVendorCode: false,
      Number: false,
      Series: false,
      MovementTypeCode: false,
      Type: false,
      Date: false,
    },
    items: {
      ProductId: false,
      Quantity: true,
      UnitPrice: false,
    },
    payments: {
      Value: true,
      PaymentType: false,
      DueDate: false,
    },
  });

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

  const updateRequestHeaderField = (field, value) => {
    setRequestFieldConfig((prev) => ({
      ...prev,
      header: {
        ...prev.header,
        [field]: value,
      },
    }));
  };

  const updateRequestItemField = (field, value) => {
    setRequestFieldConfig((prev) => ({
      ...prev,
      items: {
        ...prev.items,
        [field]: value,
      },
    }));
  };

  const updateRequestPaymentField = (field, value) => {
    setRequestFieldConfig((prev) => ({
      ...prev,
      payments: {
        ...prev.payments,
        [field]: value,
      },
    }));
  };

  const buildRequestPayloadPreview = () => {
    const headerFieldTypes = {
      BranchId: 0,
      WarehouseCode: 'string',
      DeliveryWarehouseCode: 'string',
      DestinyWarehouseCode: 'string',
      CustomerVendorCompanyId: 0,
      CustomerVendorCode: 'string',
      Number: 'string',
      Series: 'string',
      MovementTypeCode: 'string',
      Type: 'string',
      Date: '2026-01-30T19:51:37Z',
    };
    const itemFieldTypes = {
      ProductId: 0,
      Quantity: 0,
      UnitPrice: 0,
    };
    const paymentFieldTypes = {
      Value: 0,
      PaymentType: 0,
      DueDate: '2026-01-30T19:51:37Z',
    };

    const payload = {
      InternalId: '1|2500',
      CompanyId: 0,
      MovementId: 0,
      Status: 'string',
      AplicationIntegration: 'string',
    };

    Object.entries(requestFieldConfig.header).forEach(([field, enabled]) => {
      if (!enabled) return;
      payload[field] = headerFieldTypes[field];
    });

    const item = {
      CompanyId: 0,
      MovementId: 0,
      SequentialId: 0,
      SequentialNumber: 0,
      IsSubstituteProduct: 0,
      AplicationIntegration: 'string',
    };
    Object.entries(requestFieldConfig.items).forEach(([field, enabled]) => {
      if (!enabled) return;
      item[field] = itemFieldTypes[field];
    });
    payload.Items = [item];

    const payment = {
      CompanyId: 0,
      PaymentSequentialId: 0,
      MovementId: 0,
      DebitCredit: 'string',
    };
    Object.entries(requestFieldConfig.payments).forEach(([field, enabled]) => {
      if (!enabled) return;
      payment[field] = paymentFieldTypes[field];
    });
    payload.Payments = [payment];

    return payload;
  };

  // Stats
  const statsCards = [
    {
      title: 'Requisições Abertas',
      value: '18',
      change: '+4',
      trend: 'up',
      icon: ShoppingCart,
      color: 'accent',
    },
    {
      title: 'Itens Críticos',
      value: '7',
      change: '+1',
      trend: 'up',
      icon: FileText,
      color: 'graphite-light',
    },
    {
      title: 'Pedidos em Aprovação',
      value: '12',
      change: '-2',
      trend: 'down',
      icon: Users,
      color: 'accent-soft',
    },
    {
      title: 'Recebimentos Hoje',
      value: '5',
      change: '+2',
      trend: 'up',
      icon: ShoppingCart,
      color: 'accent',
    },
  ];

  const tasks = [
    {
      title: 'Revisar aprovações pendentes',
      meta: 'Hoje • Alta prioridade',
      status: 'Em andamento',
    },
    {
      title: 'Conferir pedidos do setor comercial',
      meta: 'Hoje • Médio',
      status: 'Aguardando',
    },
    {
      title: 'Validar notas fiscais do dia',
      meta: 'Amanhã • Médio',
      status: 'Planejada',
    },
    {
      title: 'Atualizar relatório de status semanal',
      meta: 'Sexta • Baixa',
      status: 'Planejada',
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
  const approvalColorMap = {
    pendente: 'text-amber-600',
    aprovado: 'text-emerald-600',
    reprovado: 'text-red-600',
  };

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
  const [requestSaved, setRequestSaved] = useState(false);
  const [requestProgress, setRequestProgress] = useState(0);
  const [requestSaving, setRequestSaving] = useState(false);
  const [requestDates, setRequestDates] = useState({ emissao: null, necessidade: null });
  const [approvalSelected, setApprovalSelected] = useState(null);
  const [approvalProcessing, setApprovalProcessing] = useState(false);
  const [approvalProgress, setApprovalProgress] = useState(0);
  const [approvalResult, setApprovalResult] = useState('');
  const [approvalInfoId, setApprovalInfoId] = useState(null);
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
    if (pedidoSelecionado?.itens?.length) {
      setItemSelecionado(pedidoSelecionado.itens[0].sku);
    }
  }, [pedidoSelecionado]);

  useEffect(() => {
    if (currentPage === 'tarefas' && !approvalSelected) {
      setApprovalSelected(approvalPedidos[0]);
    }
  }, [currentPage, approvalSelected]);

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

  const handleOpenRequest = async () => {
    const now = new Date();
    const dataHora = now.toLocaleString('pt-BR');
    const usuarioExibicao = user?.name?.formatted || user?.name || user?.username || 'Usuário';
    setRequestStamp({ dataHora, usuario: usuarioExibicao });
    setRequestSaved(false);
    setRequestDates({ emissao: null, necessidade: null });
    setRequestTipoError('');
    setRequestTipoLoading(true);
    setRequestCentroError('');
    setRequestCentroLoading(true);
    setShowRequestCard(true);

    try {
      const loginUsuario = localStorage.getItem('username') || user?.username || '';
      const parameters = `${API_CONFIG.CONSULTA_SQL.PARAMS.USUARIO}=${loginUsuario};${API_CONFIG.CONSULTA_SQL.PARAMS.CODCOLIGADA}=${API_CONFIG.CONSULTA_SQL.COD_COLIGADA_PARAM}`;
      const result = await getConsultaSql({
        codSentenca: API_CONFIG.CONSULTA_SQL.SENTENCAS.TIPO_SOLICITACAO,
        codColigada: API_CONFIG.CONSULTA_SQL.COD_COLIGADA_PATH,
        codSistema: API_CONFIG.CONSULTA_SQL.COD_SISTEMA,
        parameters,
        useUppercaseParameters: API_CONFIG.CONSULTA_SQL.USE_UPPERCASE_PARAMS,
        encodeQuery: API_CONFIG.CONSULTA_SQL.ENCODE_QUERY,
        basePath: API_CONFIG.CONSULTA_SQL.BASE_PATH,
      });

      const rows = Array.isArray(result)
        ? result
        : Array.isArray(result?.data)
          ? result.data
          : Array.isArray(result?.values)
            ? result.values
            : Array.isArray(result?.items)
              ? result.items
              : [];

      const mapped = rows
        .map((row) => ({
          codigo: row?.CODTMV ?? row?.codtmv ?? row?.Codigo ?? row?.codigo ?? '',
          nome: row?.NOME ?? row?.nome ?? row?.Nome ?? row?.descricao ?? '',
        }))
        .filter((row) => row.codigo);

      setRequestTipoOptions(mapped);

      if (mapped.length > 0) {
        setRequestMeta((prev) => ({
          ...prev,
          tipoSolicitacao: mapped[0].codigo,
        }));
      }
    } catch (error) {
      setRequestTipoError('Não foi possível carregar o tipo de solicitação.');
      if (API_CONFIG.GENERAL.DEBUG) {
        console.error('Erro ao carregar tipo de solicitação:', error);
      }
    } finally {
      setRequestTipoLoading(false);
    }

    try {
      const loginUsuario = localStorage.getItem('username') || user?.username || '';
      const parameters = `${API_CONFIG.CONSULTA_SQL.PARAMS.USUARIO}=${loginUsuario};${API_CONFIG.CONSULTA_SQL.PARAMS.CODCOLIGADA}=${API_CONFIG.CONSULTA_SQL.COD_COLIGADA_PARAM}`;
      const result = await getConsultaSql({
        codSentenca: API_CONFIG.CONSULTA_SQL.SENTENCAS.CENTRO_CUSTO,
        codColigada: API_CONFIG.CONSULTA_SQL.COD_COLIGADA_PATH,
        codSistema: API_CONFIG.CONSULTA_SQL.COD_SISTEMA,
        parameters,
        useUppercaseParameters: API_CONFIG.CONSULTA_SQL.USE_UPPERCASE_PARAMS,
        encodeQuery: API_CONFIG.CONSULTA_SQL.ENCODE_QUERY,
        basePath: API_CONFIG.CONSULTA_SQL.BASE_PATH,
      });

      const rows = Array.isArray(result)
        ? result
        : Array.isArray(result?.data)
          ? result.data
          : Array.isArray(result?.values)
            ? result.values
            : Array.isArray(result?.items)
              ? result.items
              : [];

      const mapped = rows
        .map((row) => ({
          codigo: row?.CODCCUSTO ?? row?.codccusto ?? '',
          nome: row?.NOME ?? row?.nome ?? '',
        }))
        .filter((row) => row.codigo);

      setRequestCentroOptions(mapped);

      if (mapped.length > 0) {
        setRequestMeta((prev) => ({
          ...prev,
          centroCusto: mapped[0].codigo,
        }));
      }
    } catch (error) {
      setRequestCentroError('Não foi possível carregar o centro de custo.');
      if (API_CONFIG.GENERAL.DEBUG) {
        console.error('Erro ao carregar centro de custo:', error);
      }
    } finally {
      setRequestCentroLoading(false);
    }
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
    const usuario = user?.username || localStorage.getItem('username') || '';
    const codColigada = 0;
    const parameters = `usuario=${usuario};codcoligada=1`;
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

  const formatDate = (date) => (date ? date.toLocaleDateString('pt-BR') : 'Selecione...');

  const coverByPage = {
    dashboard: {
      title: 'Painel Geral',
      description: 'Resumo Operacional',
      status: 'Ativo',
      owner: 'Controladoria',
    },
    tarefas: {
      title: 'Central de Tarefas',
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
  };

  const activeCover = coverByPage[currentPage] || coverByPage.dashboard;

  // Render
  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {statsCards.map((card, index) => {
                const Icon = card.icon;
                const TrendIcon = card.trend === 'up' ? TrendingUp : TrendingDown;
                const colorClasses = {
                  graphite: 'bg-graphite-900',
                  accent: 'bg-accent-600',
                  'graphite-light': 'bg-graphite-700',
                  'accent-soft': 'bg-accent-500',
                };

                return (
                  <div
                    key={index}
                    className="bg-white rounded-lg border border-graphite-200 p-5
                             hover:border-graphite-300 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-2.5 rounded-md ${colorClasses[card.color]}`}>
                        {card.iconLabel ? (
                          <span className="text-white text-sm font-semibold">
                            {card.iconLabel}
                          </span>
                        ) : (
                          <Icon size={24} className="text-white" />
                        )}
                      </div>
                      <div
                        className={`flex items-center space-x-1 text-sm font-medium
                                  ${
                                    card.trend === 'up'
                                      ? 'text-emerald-600'
                                      : 'text-red-500'
                                  }`}
                      >
                        <TrendIcon size={16} />
                        <span>{card.change}</span>
                      </div>
                    </div>
                    <h3 className="text-graphite-500 text-sm font-medium mb-1">
                      {card.title}
                    </h3>
                    <p className="text-2xl font-semibold text-graphite-900">{card.value}</p>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg border border-graphite-200 p-6">
                <h3 className="text-lg font-semibold text-graphite-900 mb-4">
                  Requisições Recentes
                </h3>
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((item) => (
                    <div
                      key={item}
                      className="flex items-center justify-between py-3 border-b border-graphite-100 last:border-0"
                    >
                      <div>
                        <p className="font-medium text-graphite-900">
                          Requisição #{4300 + item}
                        </p>
                        <p className="text-sm text-graphite-500">Centro de Custo: Administrativo</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-graphite-900">Prioridade Média</p>
                        <p className="text-xs text-graphite-500">Hoje, 10:24</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg border border-graphite-200 p-6">
                <h3 className="text-lg font-semibold text-graphite-900 mb-4">
                  Itens em Reposição
                </h3>
                <div className="space-y-4">
                  {[
                    { name: 'Cabo USB-C', qty: 145, value: 12500 },
                    { name: 'Mouse Ergonômico', qty: 98, value: 8900 },
                    { name: 'Monitor 24"', qty: 76, value: 6800 },
                    { name: 'Dock USB-C', qty: 54, value: 4200 },
                    { name: 'Teclado Slim', qty: 32, value: 2800 },
                  ].map((product, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-3 border-b border-graphite-100 last:border-0"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-graphite-900">{product.name}</p>
                        <p className="text-sm text-graphite-500">
                          {product.qty} unidades
                        </p>
                      </div>
                      <div className="w-32">
                        <div className="w-full bg-graphite-100 rounded-full h-2">
                          <div
                            className="bg-accent-500 h-2 rounded-full"
                            style={{ width: `${(product.qty / 145) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="w-24 text-right">
                        <p className="font-semibold text-graphite-900">
                          R$ {product.value.toLocaleString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'tarefas':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-graphite-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-semibold text-graphite-900">Aprovação</h2>
                  <p className="text-graphite-500">
                    Pedidos de compra aguardando decisão.
                  </p>
                </div>
                <Button variant="secondary" size="default">Filtros avançados</Button>
              </div>
              <Tabs value={taskTab} onValueChange={setTaskTab} className="mb-4">
                <TabsList className="flex flex-wrap gap-2">
                  <TabsTrigger value="itens">Itens</TabsTrigger>
                  <TabsTrigger value="anexos">Anexos</TabsTrigger>
                  <TabsTrigger value="historico">Histórico</TabsTrigger>
                  <TabsTrigger value="aprovacao">Aprovação</TabsTrigger>
                </TabsList>
                <TabsContent value="itens">
                  <div className="mt-4 border border-graphite-200 rounded-md overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Pedido</TableHead>
                          <TableHead>Fornecedor</TableHead>
                          <TableHead>Centro de Custo</TableHead>
                          <TableHead>Criado por</TableHead>
                          <TableHead className="text-right">Valor</TableHead>
                          <TableHead>Status da Aprovação</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {approvalPedidos.map((pedido) => (
                          <TableRow
                            key={pedido.id}
                            onClick={() => {
                              setApprovalSelected(pedido);
                              setApprovalResult('');
                              setApprovalProgress(0);
                              setApprovalProcessing(false);
                              setApprovalInfoId(null);
                            }}
                            className={`cursor-pointer ${
                              approvalSelected?.id === pedido.id ? 'bg-accent-50' : 'hover:bg-graphite-50'
                            }`}
                          >
                            <TableCell className="font-medium">{pedido.id}</TableCell>
                            <TableCell className="text-graphite-500">{pedido.fornecedor}</TableCell>
                            <TableCell className="text-graphite-500">{pedido.centro}</TableCell>
                            <TableCell className="text-graphite-500">{pedido.criadoPor}</TableCell>
                            <TableCell className="text-right font-medium">{pedido.valor}</TableCell>
                            <TableCell>
                              <div className="relative inline-flex items-center gap-2">
                                <span
                                  className={`px-2.5 py-1 rounded-full border text-xs inline-flex items-center gap-2 ${
                                    pedido.aprovacao === 'aprovado'
                                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                      : pedido.aprovacao === 'reprovado'
                                      ? 'border-red-200 bg-red-50 text-red-700'
                                      : 'border-amber-200 bg-amber-50 text-amber-700'
                                  }`}
                                >
                                  {approvalStatusMap[pedido.aprovacao]}
                                </span>
                                {(pedido.aprovacao === 'aprovado' || pedido.aprovacao === 'reprovado') && (
                                  <div
                                    className="relative"
                                    onMouseEnter={(e) => {
                                      e.stopPropagation();
                                      setApprovalInfoId(pedido.id);
                                    }}
                                    onMouseLeave={(e) => {
                                      e.stopPropagation();
                                      setApprovalInfoId(null);
                                    }}
                                  >
                                    <button
                                      className="p-1.5 rounded-md border border-graphite-200 text-graphite-500 hover:text-graphite-900 hover:bg-graphite-50"
                                      title="Informações da aprovação"
                                    >
                                      <Info size={14} />
                                    </button>
                                    {approvalInfoId === pedido.id && (
                                      <div className="absolute right-0 top-8 z-50 w-56 text-xs font-mono border border-graphite-300 rounded-md bg-white px-2 py-2 text-graphite-800 shadow-lg">
                                        {pedido.aprovacao === 'aprovado' ? (
                                          <>
                                            <div className="text-graphite-500">Aprovado por</div>
                                            <div className="mb-1">{pedido.aprovadoPor || '—'}</div>
                                            <div className="text-graphite-500">Data / Hora</div>
                                            <div>{pedido.aprovadoEm || '—'}</div>
                                          </>
                                        ) : (
                                          <>
                                            <div className="text-graphite-500">Reprovado por</div>
                                            <div className="mb-1">{pedido.reprovadoPor || '—'}</div>
                                            <div className="text-graphite-500">Data / Hora</div>
                                            <div>{pedido.reprovadoEm || '—'}</div>
                                          </>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <div className="mt-4 border border-graphite-300 rounded-md p-4 font-mono">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs uppercase text-graphite-500">Detalhes do Pedido</p>
                        <h4 className="text-sm font-semibold text-graphite-900">
                          Pedido {approvalSelected?.id || '—'}
                        </h4>
                      </div>
                      <div className="text-xs flex items-center gap-2">
                        <Circle
                          size={14}
                          className={approvalColorMap[approvalSelected?.aprovacao] || 'text-graphite-400'}
                          fill="currentColor"
                        />
                        <span className={approvalColorMap[approvalSelected?.aprovacao] || 'text-graphite-500'}>
                          {approvalStatusMap[approvalSelected?.aprovacao] || '—'}
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 text-sm text-graphite-800 border border-graphite-300 rounded-md p-3 bg-graphite-50">
                      <p className="text-xs uppercase text-graphite-500 mb-1">Resumo</p>
                      <p>{approvalSelected?.resumo || '—'}</p>
                    </div>
                    <div className="mt-3 text-sm text-graphite-800 border border-graphite-300 rounded-md p-3">
                      <p className="text-xs uppercase text-graphite-500 mb-1">Observação</p>
                      <p>{approvalSelected?.observacao || '—'}</p>
                    </div>
                    <div className="mt-3 border border-graphite-300 rounded-md overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="font-semibold">Item</TableHead>
                            <TableHead className="text-right font-semibold">Qtde.</TableHead>
                            <TableHead className="text-right font-semibold">UN</TableHead>
                            <TableHead className="text-right font-semibold">Valor Unitário</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {(approvalSelected?.itens || []).map((linha) => (
                            <TableRow key={linha.item}>
                              <TableCell>{linha.item}</TableCell>
                              <TableCell className="text-right">{linha.qtd}</TableCell>
                              <TableCell className="text-right">{linha.un}</TableCell>
                              <TableCell className="text-right">{linha.unit}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    <div className="mt-3 border border-graphite-300 rounded-md overflow-hidden text-sm">
                      <div className="grid grid-cols-1 md:grid-cols-2 bg-graphite-100 text-xs text-graphite-600">
                        <div className="px-3 py-2 border-b border-graphite-300 md:border-r">Fornecedor</div>
                        <div className="px-3 py-2 border-b border-graphite-300">Centro de Custo</div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2">
                        <div className="px-3 py-2 border-b border-graphite-300 md:border-r font-medium text-graphite-900">
                          {approvalSelected?.fornecedor || '—'}
                        </div>
                        <div className="px-3 py-2 border-b border-graphite-300 font-medium text-graphite-900">
                          {approvalSelected?.centro || '—'}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 bg-graphite-100 text-xs text-graphite-600">
                        <div className="px-3 py-2 border-b border-graphite-300 md:border-r">Criado por</div>
                        <div className="px-3 py-2 border-b border-graphite-300">Valor</div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2">
                        <div className="px-3 py-2 border-b border-graphite-300 md:border-r font-medium text-graphite-900">
                          {approvalSelected?.criadoPor || '—'}
                        </div>
                        <div className="px-3 py-2 border-b border-graphite-300 font-medium text-graphite-900">
                          {approvalSelected?.valor || '—'}
                        </div>
                      </div>
                    </div>
                    {approvalResult && (
                      <div
                        className={`mt-4 px-3 py-2 rounded-md text-xs border ${
                          approvalResult === 'Aprovado com sucesso'
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                            : 'border-red-200 bg-red-50 text-red-700'
                        }`}
                      >
                        {approvalResult}
                      </div>
                    )}
                    {approvalSelected?.aprovacao === 'pendente' ? (
                      <div className="mt-4 space-y-3">
                        <div className="flex items-center gap-2">
                          <button
                            className="px-2.5 py-1.5 text-xs rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 disabled:opacity-60"
                            onClick={() => handleApprovalAction('aprovado')}
                            disabled={approvalProcessing}
                          >
                            <Check size={14} className="inline mr-1" />
                            Aprovar pedido
                          </button>
                          <button
                            className="px-2.5 py-1.5 text-xs rounded-md bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 disabled:opacity-60"
                            onClick={() => handleApprovalAction('reprovado')}
                            disabled={approvalProcessing}
                          >
                            <X size={14} className="inline mr-1" />
                            Reprovar pedido
                          </button>
                        </div>
                        {approvalProcessing && (
                          <div className="border border-graphite-200 bg-white rounded-md px-3 py-2">
                            <div className="flex items-center justify-between text-xs text-graphite-500 mb-2">
                              <span>Processando decisão...</span>
                              <span>{approvalProgress}%</span>
                            </div>
                            <div className="h-2 w-full bg-graphite-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-accent-600 transition-all"
                                style={{ width: `${approvalProgress}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="mt-4 inline-flex items-center gap-2 text-xs">
                        <span className={`px-2.5 py-1 rounded-full border ${
                          approvalSelected?.aprovacao === 'aprovado'
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                            : 'border-red-200 bg-red-50 text-red-700'
                        }`}>
                          {approvalStatusMap[approvalSelected?.aprovacao]}
                        </span>
                      </div>
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="anexos">
                  <div className="mt-3 border border-graphite-200 rounded-md p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 text-sm text-graphite-600">
                      <Paperclip size={18} className="text-graphite-400" />
                      Nenhum anexo disponível. Adicione arquivos para registrar evidências.
                    </div>
                    <Button variant="secondary" size="sm">Adicionar anexo</Button>
                  </div>
                </TabsContent>
                <TabsContent value="historico">
                  <div className="mt-3 border border-graphite-200 rounded-md p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 text-sm text-graphite-600">
                      <Clock size={18} className="text-graphite-400" />
                      Histórico de ações será exibido aqui.
                    </div>
                    <Button variant="ghost" size="sm">Ver histórico</Button>
                  </div>
                </TabsContent>
                <TabsContent value="aprovacao">
                  <div className="mt-3 border border-graphite-200 rounded-md p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 text-sm text-graphite-600">
                      <CheckCircle2 size={18} className="text-graphite-400" />
                      Fluxo de aprovação pendente de configuração.
                    </div>
                    <Button variant="secondary" size="sm">Configurar fluxo</Button>
                  </div>
                </TabsContent>
              </Tabs>
              <div className="text-xs text-graphite-500">
                Linhas exibidas na aba Itens para manter consistência visual.
              </div>
            </div>
          </div>
        );

      case 'pedidos':
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
                    <MoreVertical size={18} />
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
                      {pedidosFiltrados.length} resultados
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
                      <SlidersHorizontal size={16} />
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
                      <ArrowUpDown size={16} />
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
                  <div className="border border-graphite-200 rounded-md overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Pedido</TableHead>
                          <TableHead>Fornecedor</TableHead>
                          <TableHead>Centro de Custo</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pedidosFiltrados.map((pedido) => (
                          <TableRow
                            key={pedido.id}
                            onClick={() => {
                              setPedidoSelecionado(pedido);
                              setItemSelecionado(pedido.itens[0]?.sku);
                            }}
                            className={`cursor-pointer ${
                              pedidoSelecionado?.id === pedido.id ? 'bg-accent-50' : 'hover:bg-graphite-50'
                            }`}
                          >
                            <TableCell>
                              <div className="text-sm font-medium">{pedido.id}</div>
                              <div className="text-xs text-graphite-500">{pedido.data}</div>
                            </TableCell>
                            <TableCell className="text-graphite-500">{pedido.fornecedor}</TableCell>
                            <TableCell className="text-graphite-500">{pedido.centroCusto}</TableCell>
                            <TableCell>
                              <div className="text-xs text-graphite-500 flex items-center gap-2">
                                <Circle
                                  size={14}
                                  className={statusColorMap[pedido.status]
                                    ? statusColorMap[pedido.status].replace('bg-', 'text-')
                                    : 'text-graphite-400'}
                                  fill="currentColor"
                                />
                                {statusMovimentoMap[pedido.status]}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="text-sm font-medium">{pedido.total}</div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
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
                            <Circle
                              size={14}
                              className={statusColorMap[pedidoSelecionado?.status]
                                ? statusColorMap[pedidoSelecionado?.status].replace('bg-', 'text-')
                                : 'text-graphite-400'}
                              fill="currentColor"
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
                          <span>{pedidoSelecionado?.itens?.length || 0} itens</span>
                          <Input
                            value={itemSearch}
                            onChange={(e) => setItemSearch(e.target.value)}
                            placeholder="Buscar item..."
                            className="w-40 h-8 text-xs"
                          />
                        </div>
                        <div className="border border-graphite-200 rounded-md overflow-hidden max-h-56 overflow-y-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>SKU</TableHead>
                                <TableHead>Produto</TableHead>
                                <TableHead className="text-right">Qtd</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {itensFiltrados.map((item) => (
                                <TableRow
                                  key={item.sku}
                                  onClick={() => setItemSelecionado(item.sku)}
                                  className={`cursor-pointer ${
                                    itemSelecionado === item.sku
                                      ? 'bg-accent-50'
                                      : 'hover:bg-graphite-50'
                                  }`}
                                >
                                  <TableCell>{item.sku}</TableCell>
                                  <TableCell className="text-graphite-500">{item.nome}</TableCell>
                                  <TableCell className="text-right">{item.qtd}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
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
                          <Paperclip size={18} className="text-graphite-400" />
                          Nenhum anexo. Envie documentos de cotação ou contratos.
                        </div>
                        <Button variant="secondary" size="sm">Adicionar anexo</Button>
                      </div>
                    </TabsContent>
                    <TabsContent value="historico">
                      <div className="mt-4 border border-graphite-200 rounded-md p-4 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 text-sm text-graphite-600">
                          <Clock size={18} className="text-graphite-400" />
                          Histórico de mudanças e aprovações ficará disponível aqui.
                        </div>
                        <Button variant="ghost" size="sm">Ver histórico</Button>
                      </div>
                    </TabsContent>
                    <TabsContent value="aprovacao">
                      <div className="mt-4 border border-graphite-200 rounded-md p-4 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 text-sm text-graphite-600">
                          <CheckCircle2 size={18} className="text-graphite-400" />
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

      case 'notas-fiscais':
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
                  <div className="mt-4 border border-graphite-200 rounded-md overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>NF</TableHead>
                          <TableHead>Fornecedor</TableHead>
                          <TableHead className="text-right">Valor</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {[1, 2, 3].map((row) => (
                          <TableRow key={row}>
                            <TableCell>NF-{2000 + row}</TableCell>
                            <TableCell className="text-graphite-500">Fornecedor XYZ</TableCell>
                            <TableCell className="text-right">R$ 8.320,00</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
                <TabsContent value="anexos">
                  <div className="mt-4 border border-graphite-200 rounded-md p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 text-sm text-graphite-600">
                      <Paperclip size={18} className="text-graphite-400" />
                      Nenhum anexo. Inclua XML, PDF e documentos fiscais.
                    </div>
                    <Button variant="secondary" size="sm">Adicionar XML</Button>
                  </div>
                </TabsContent>
                <TabsContent value="historico">
                  <div className="mt-4 border border-graphite-200 rounded-md p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 text-sm text-graphite-600">
                      <Clock size={18} className="text-graphite-400" />
                      Histórico fiscal será listado aqui.
                    </div>
                    <Button variant="ghost" size="sm">Ver histórico</Button>
                  </div>
                </TabsContent>
                <TabsContent value="aprovacao">
                  <div className="mt-4 border border-graphite-200 rounded-md p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 text-sm text-graphite-600">
                      <CheckCircle2 size={18} className="text-graphite-400" />
                      Aprovação aguardando validação do responsável.
                    </div>
                    <Button variant="secondary" size="sm">Solicitar aprovação</Button>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        );

      case 'relatorios':
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
                  <div className="mt-4 border border-graphite-200 rounded-md overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Relatório</TableHead>
                          <TableHead>Periodicidade</TableHead>
                          <TableHead className="text-right">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {['Mensal', 'Trimestral', 'Anual'].map((item, index) => (
                          <TableRow key={item}>
                            <TableCell>Consolidação {index + 1}</TableCell>
                            <TableCell className="text-graphite-500">{item}</TableCell>
                            <TableCell className="text-right">Atualizado</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
                <TabsContent value="anexos">
                  <div className="mt-4 border border-graphite-200 rounded-md p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 text-sm text-graphite-600">
                      <Paperclip size={18} className="text-graphite-400" />
                      Nenhum anexo. Adicione relatórios ou planilhas de apoio.
                    </div>
                    <Button variant="secondary" size="sm">Adicionar arquivo</Button>
                  </div>
                </TabsContent>
                <TabsContent value="historico">
                  <div className="mt-4 border border-graphite-200 rounded-md p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 text-sm text-graphite-600">
                      <Clock size={18} className="text-graphite-400" />
                      Histórico de versões ficará disponível aqui.
                    </div>
                    <Button variant="ghost" size="sm">Ver histórico</Button>
                  </div>
                </TabsContent>
                <TabsContent value="aprovacao">
                  <div className="mt-4 border border-graphite-200 rounded-md p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 text-sm text-graphite-600">
                      <CheckCircle2 size={18} className="text-graphite-400" />
                      Aprovação pendente do gestor da área.
                    </div>
                    <Button variant="secondary" size="sm">Solicitar aprovação</Button>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        );

      case 'configuracoes':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-graphite-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-semibold text-graphite-900">Configurações</h2>
                  <p className="text-graphite-500">Parâmetros e perfis do sistema.</p>
                </div>
                <Button variant="secondary" size="default">Salvar alterações</Button>
              </div>
              <Tabs defaultValue="requisicao">
                <TabsList>
                  <TabsTrigger value="requisicao">
                    <span className="mr-2">Requisição</span>
                    <Badge variant="secondary">Novo</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="itens">Itens</TabsTrigger>
                  <TabsTrigger value="anexos">Anexos</TabsTrigger>
                  <TabsTrigger value="historico">Histórico</TabsTrigger>
                  <TabsTrigger value="aprovacao">Aprovação</TabsTrigger>
                </TabsList>
                <TabsContent value="requisicao">
                  <div className="mt-4">
                    <Tabs defaultValue="criar-movimento">
                      <div className="flex flex-col lg:flex-row gap-4">
                        <div className="lg:w-60 w-full bg-white rounded-lg border border-graphite-200 p-4">
                          <p className="text-xs font-semibold uppercase tracking-wide text-graphite-400 mb-3">
                            Tipos de requisição
                          </p>
                          <TabsList className="grid gap-2">
                            <TabsTrigger value="criar-movimento">Criar movimento</TabsTrigger>
                            <TabsTrigger value="requisicao-material">Requisição de material</TabsTrigger>
                            <TabsTrigger value="requisicao-servico">Requisição de serviço</TabsTrigger>
                          </TabsList>
                        </div>

                        <div className="flex-1 min-w-0 space-y-4">
                        <TabsContent value="criar-movimento">
                          <div className="bg-white rounded-lg border border-graphite-200 p-5">
                            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                              <div>
                                <h3 className="text-lg font-semibold text-graphite-900">
                                  Campos enviados na requisição
                                </h3>
                                <p className="text-sm text-graphite-500">
                                  Envie obrigatórios + Itens + Pagamentos.
                                </p>
                              </div>
                              <Button variant="secondary" size="sm">Aplicar</Button>
                            </div>

                            <div className="space-y-4">
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <div className="rounded-md border border-graphite-200 p-4">
                                  <div className="flex items-center justify-between mb-3">
                                    <h4 className="text-sm font-semibold text-graphite-900">Cabeçalho</h4>
                                    <Badge variant="secondary">Obrigatórios</Badge>
                                  </div>
                                  <div className="text-xs text-graphite-500 space-y-1">
                                    {['InternalId', 'CompanyId', 'MovementId', 'Status', 'AplicationIntegration'].map((field) => (
                                      <div key={field} className="flex items-center justify-between">
                                        <span className="font-mono text-graphite-700">{field}</span>
                                        <span>required</span>
                                      </div>
                                    ))}
                                  </div>
                                  <div className="mt-4">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-graphite-400">
                                      Opcionais
                                    </p>
                                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                      {[
                                        { id: 'BranchId', label: 'BranchId' },
                                        { id: 'WarehouseCode', label: 'WarehouseCode' },
                                        { id: 'DeliveryWarehouseCode', label: 'DeliveryWarehouseCode' },
                                        { id: 'DestinyWarehouseCode', label: 'DestinyWarehouseCode' },
                                        { id: 'CustomerVendorCompanyId', label: 'CustomerVendorCompanyId' },
                                        { id: 'CustomerVendorCode', label: 'CustomerVendorCode' },
                                        { id: 'Number', label: 'Number' },
                                        { id: 'Series', label: 'Series' },
                                        { id: 'MovementTypeCode', label: 'MovementTypeCode' },
                                        { id: 'Type', label: 'Type' },
                                        { id: 'Date', label: 'Date' },
                                      ].map((field) => (
                                        <label
                                          key={field.id}
                                          className="flex items-center justify-between gap-3 rounded-md border border-graphite-200 px-3 py-2"
                                        >
                                          <span className="text-sm text-graphite-700">{field.label}</span>
                                          <input
                                            type="checkbox"
                                            checked={requestFieldConfig.header[field.id]}
                                            onChange={(event) => updateRequestHeaderField(field.id, event.target.checked)}
                                            className="h-4 w-4 rounded border-graphite-300 text-graphite-900 focus:ring-graphite-200"
                                          />
                                        </label>
                                      ))}
                                    </div>
                                  </div>
                                </div>

                                <div className="rounded-md border border-graphite-200 p-4">
                                  <div className="flex items-center justify-between mb-3">
                                    <h4 className="text-sm font-semibold text-graphite-900">Items</h4>
                                    <Badge variant="secondary">Obrigatórios</Badge>
                                  </div>
                                  <div className="text-xs text-graphite-500 space-y-1">
                                    {['CompanyId', 'MovementId', 'SequentialId', 'SequentialNumber', 'IsSubstituteProduct', 'AplicationIntegration'].map((field) => (
                                      <div key={field} className="flex items-center justify-between">
                                        <span className="font-mono text-graphite-700">{field}</span>
                                        <span>required</span>
                                      </div>
                                    ))}
                                  </div>
                                  <div className="mt-4">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-graphite-400">
                                      Opcionais
                                    </p>
                                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                      {[
                                        { id: 'ProductId', label: 'ProductId' },
                                        { id: 'Quantity', label: 'Quantity' },
                                        { id: 'UnitPrice', label: 'UnitPrice' },
                                      ].map((field) => (
                                        <label
                                          key={field.id}
                                          className="flex items-center justify-between gap-3 rounded-md border border-graphite-200 px-3 py-2"
                                        >
                                          <span className="text-sm text-graphite-700">{field.label}</span>
                                          <input
                                            type="checkbox"
                                            checked={requestFieldConfig.items[field.id]}
                                            onChange={(event) => updateRequestItemField(field.id, event.target.checked)}
                                            className="h-4 w-4 rounded border-graphite-300 text-graphite-900 focus:ring-graphite-200"
                                          />
                                        </label>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="rounded-md border border-graphite-200 p-4">
                                <div className="flex items-center justify-between mb-3">
                                  <h4 className="text-sm font-semibold text-graphite-900">Payments</h4>
                                  <Badge variant="secondary">Obrigatórios</Badge>
                                </div>
                                <div className="text-xs text-graphite-500 space-y-1">
                                  {['CompanyId', 'PaymentSequentialId', 'MovementId', 'DebitCredit'].map((field) => (
                                    <div key={field} className="flex items-center justify-between">
                                      <span className="font-mono text-graphite-700">{field}</span>
                                      <span>required</span>
                                    </div>
                                  ))}
                                </div>
                                <div className="mt-4">
                                  <p className="text-xs font-semibold uppercase tracking-wide text-graphite-400">
                                    Opcionais
                                  </p>
                                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {[
                                      { id: 'Value', label: 'Value' },
                                      { id: 'PaymentType', label: 'PaymentType' },
                                      { id: 'DueDate', label: 'DueDate' },
                                    ].map((field) => (
                                      <label
                                        key={field.id}
                                        className="flex items-center justify-between gap-3 rounded-md border border-graphite-200 px-3 py-2"
                                      >
                                        <span className="text-sm text-graphite-700">{field.label}</span>
                                        <input
                                          type="checkbox"
                                          checked={requestFieldConfig.payments[field.id]}
                                          onChange={(event) => updateRequestPaymentField(field.id, event.target.checked)}
                                          className="h-4 w-4 rounded border-graphite-300 text-graphite-900 focus:ring-graphite-200"
                                        />
                                      </label>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                            <div className="bg-white rounded-lg border border-graphite-200 p-5">
                              <div className="flex items-center justify-between mb-3">
                                <div>
                                  <h4 className="text-sm font-semibold text-graphite-900">Prévia JSON</h4>
                                  <p className="text-xs text-graphite-500">Campos ativos serão enviados.</p>
                                </div>
                                <Badge variant="secondary">POST</Badge>
                              </div>
                              <pre className="bg-graphite-900 text-graphite-100 text-xs rounded-md p-4 overflow-auto">
                                {JSON.stringify(buildRequestPayloadPreview(), null, 2)}
                              </pre>
                            </div>
                          </TabsContent>

                          <TabsContent value="requisicao-material">
                            <div className="rounded-md border border-graphite-200 p-4 text-sm text-graphite-600">
                              Em breve: configuração específica para requisição de material.
                            </div>
                          </TabsContent>

                          <TabsContent value="requisicao-servico">
                            <div className="rounded-md border border-graphite-200 p-4 text-sm text-graphite-600">
                              Em breve: configuração específica para requisição de serviço.
                            </div>
                          </TabsContent>
                        </div>
                      </div>
                    </Tabs>
                  </div>
                </TabsContent>
                <TabsContent value="itens">
                  <div className="mt-4 border border-graphite-200 rounded-md overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Parâmetro</TableHead>
                          <TableHead>Valor</TableHead>
                          <TableHead className="text-right">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {['Fluxo de aprovação', 'Perfil padrão', 'Integração'].map((item) => (
                          <TableRow key={item}>
                            <TableCell>{item}</TableCell>
                            <TableCell className="text-graphite-500">Ativo</TableCell>
                            <TableCell className="text-right">OK</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
                <TabsContent value="anexos">
                  <div className="mt-4 border border-graphite-200 rounded-md p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 text-sm text-graphite-600">
                      <Paperclip size={18} className="text-graphite-400" />
                      Nenhum anexo. Adicione políticas ou documentos de suporte.
                    </div>
                    <Button variant="secondary" size="sm">Adicionar arquivo</Button>
                  </div>
                </TabsContent>
                <TabsContent value="historico">
                  <div className="mt-4 border border-graphite-200 rounded-md p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 text-sm text-graphite-600">
                      <Clock size={18} className="text-graphite-400" />
                      Histórico de ajustes ficará disponível aqui.
                    </div>
                    <Button variant="ghost" size="sm">Ver histórico</Button>
                  </div>
                </TabsContent>
                <TabsContent value="aprovacao">
                  <div className="mt-4 border border-graphite-200 rounded-md p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 text-sm text-graphite-600">
                      <CheckCircle2 size={18} className="text-graphite-400" />
                      Aprovação pendente para mudanças sensíveis.
                    </div>
                    <Button variant="secondary" size="sm">Solicitar aprovação</Button>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-mist dark:bg-graphite-900">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        onLogout={handleLogout}
        currentPage={currentPage}
        onNavigate={handleNavigate}
      />

      <Header
        user={user}
        sidebarCollapsed={sidebarCollapsed}
        title={activeCover.title}
        breadcrumb={['Início', activeCover.title]}
      />

      <main
        className={`
          ${sidebarCollapsed ? 'ml-20' : 'ml-64'}
          mt-20
          p-6
          transition-all duration-300
        `}
      >
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
      </main>
      <Dialog open={showRequestCard} onOpenChange={setShowRequestCard}>
        <DialogContent className="max-w-5xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{requestSaved ? 'Solicitação criada' : 'Nova solicitação'}</DialogTitle>
            {!requestSaved && (
              <DialogDescription>Preencha os dados do pedido</DialogDescription>
            )}
          </DialogHeader>

          <div className="flex-1 overflow-y-auto pr-1">
            <div className="space-y-6">
              {requestSaving && (
                <div className="border border-graphite-200 bg-white rounded-md px-4 py-3">
                  <div className="flex items-center justify-between text-xs text-graphite-500 mb-2">
                    <span>Processando solicitação...</span>
                    <span>{requestProgress}%</span>
                  </div>
                  <div className="h-2 w-full bg-graphite-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent-600 transition-all"
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
                    <summary className="cursor-pointer list-none px-5 py-4 flex items-center justify-between rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-accent-300 dark:focus-visible:ring-offset-graphite-900 [-webkit-details-marker]:hidden group-hover:text-graphite-900 dark:group-hover:text-graphite-100">
                      <div>
                        <p className="text-xs uppercase text-graphite-500">Dados gerais</p>
                        <h4 className="text-sm font-semibold text-graphite-900">Informações da solicitação</h4>
                      </div>
                      <ChevronDown className="text-graphite-600 transition-transform group-open:rotate-180 group-hover:text-graphite-800" size={18} />
                    </summary>
                    <div className="px-5 pb-5 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2 border border-accent-100 bg-accent-50 rounded-md p-4">
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
                                <CalendarIcon size={16} className="text-graphite-400" />
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
                                <CalendarIcon size={16} className="text-graphite-400" />
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
                    <summary className="cursor-pointer list-none px-5 py-4 flex items-center justify-between rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-accent-300 dark:focus-visible:ring-offset-graphite-900 [-webkit-details-marker]:hidden group-hover:text-graphite-900 dark:group-hover:text-graphite-100">
                      <div>
                        <p className="text-xs uppercase text-graphite-500">Dados financeiros</p>
                        <h4 className="text-sm font-semibold text-graphite-900">Condições e valores</h4>
                      </div>
                      <ChevronDown className="text-graphite-600 transition-transform group-open:rotate-180 group-hover:text-graphite-800" size={18} />
                    </summary>
                    <div className="px-5 pb-5 space-y-3">
                      <div className="text-sm text-graphite-500">
                        Nenhum campo configurado.
                      </div>
                    </div>
                  </details>

                  <details className="group border border-graphite-200 rounded-lg bg-white">
                    <summary className="cursor-pointer list-none px-5 py-4 flex items-center justify-between rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-accent-300 dark:focus-visible:ring-offset-graphite-900 [-webkit-details-marker]:hidden group-hover:text-graphite-900 dark:group-hover:text-graphite-100">
                      <div>
                        <p className="text-xs uppercase text-graphite-500">Dados fiscais</p>
                        <h4 className="text-sm font-semibold text-graphite-900">Impostos e natureza</h4>
                      </div>
                      <ChevronDown className="text-graphite-600 transition-transform group-open:rotate-180 group-hover:text-graphite-800" size={18} />
                    </summary>
                    <div className="px-5 pb-5 space-y-3">
                      <div className="text-sm text-graphite-500">
                        Nenhum campo configurado.
                      </div>
                    </div>
                  </details>

                  <details className="group border border-graphite-200 rounded-lg bg-white" open>
                    <summary className="cursor-pointer list-none px-5 py-4 flex items-center justify-between rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-accent-300 dark:focus-visible:ring-offset-graphite-900 [-webkit-details-marker]:hidden group-hover:text-graphite-900 dark:group-hover:text-graphite-100">
                      <div>
                        <p className="text-xs uppercase text-graphite-500">Itens</p>
                        <h4 className="text-sm font-semibold text-graphite-900">Linhas da solicitação</h4>
                      </div>
                      <ChevronDown className="text-graphite-600 transition-transform group-open:rotate-180 group-hover:text-graphite-800" size={18} />
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
                                <Trash2 size={16} />
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
                    <summary className="cursor-pointer list-none px-5 py-4 flex items-center justify-between rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-accent-300 dark:focus-visible:ring-offset-graphite-900 [-webkit-details-marker]:hidden group-hover:text-graphite-900 dark:group-hover:text-graphite-100">
                      <div>
                        <p className="text-xs uppercase text-graphite-500">Observação</p>
                        <h4 className="text-sm font-semibold text-graphite-900">Observação da Solicitação</h4>
                      </div>
                      <ChevronDown className="text-graphite-600 transition-transform group-open:rotate-180 group-hover:text-graphite-800" size={18} />
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
    </div>
  );
};

export default DashboardPage;
