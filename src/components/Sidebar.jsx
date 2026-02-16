// Sidebar

import React from 'react';
import {
  Squares2X2Icon,
  CheckBadgeIcon,
  DocumentTextIcon,
  ReceiptPercentIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  FolderIcon,
  ArrowLeftOnRectangleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  ChevronDoubleDownIcon,
  ChevronDoubleUpIcon,
  MoonIcon,
  SunIcon,
  ShoppingBagIcon,
  ArchiveBoxIcon,
  CurrencyDollarIcon,
  CalculatorIcon,
  FolderOpenIcon,
  BuildingStorefrontIcon,
  RectangleStackIcon,
} from '@heroicons/react/24/outline';
import { useTheme } from '../hooks/useTheme';
import {
  Sidebar as SidebarRoot,
  SidebarHeader,
  SidebarFooter,
  SidebarContent,
  SidebarGroup,
  SidebarTrigger,
  useSidebar,
} from './ui/sidebar';

const GROUP_MAP = {
  dashboard: 'dashboard',
  'dashboard-compras': 'dashboard',
  'dashboard-estoque': 'dashboard',
  'dashboard-faturamento': 'dashboard',
  'dashboard-orcamento': 'dashboard',
  pedidos: 'pedidos',
  'pedidos-estoque': 'pedidos',
  'pedidos-compras': 'pedidos',
  'pedidos-faturamento': 'pedidos',
  cadastros: 'cadastros',
  'cadastros-est-compras-fat': 'cadastros',
  'cadastros-financeiro': 'cadastros',
  'cadastros-globais': 'cadastros',
  'cadastros-estoque': 'cadastros',
  'cadastros-estoque-produtos': 'cadastros',
  'cadastros-estoque-local': 'cadastros',
  'cadastros-financeiro-clientes': 'cadastros',
  'cadastros-financeiro-contas': 'cadastros',
};

const SUBGROUP_MAP = {
  'cadastros-estoque-produtos': 'cadastros-estoque',
  'cadastros-estoque-local': 'cadastros-estoque',
  'cadastros-financeiro-clientes': 'cadastros-financeiro',
  'cadastros-financeiro-contas': 'cadastros-financeiro',
};

const OPEN_GROUPS_INITIAL = {
  dashboard: false,
  pedidos: false,
  cadastros: false,
};

const OPEN_SUBGROUPS_INITIAL = {
  'cadastros-estoque': false,
  'cadastros-financeiro': false,
};

const SUBITEM_ICON_MAP = {
  'dashboard-compras': ShoppingBagIcon,
  'dashboard-estoque': ArchiveBoxIcon,
  'dashboard-faturamento': CurrencyDollarIcon,
  'dashboard-orcamento': CalculatorIcon,
  'pedidos-estoque': ArchiveBoxIcon,
  'pedidos-compras': ShoppingBagIcon,
  'pedidos-faturamento': CurrencyDollarIcon,
  'cadastros-estoque': FolderOpenIcon,
  'cadastros-financeiro': BuildingStorefrontIcon,
  'cadastros-estoque-produtos': RectangleStackIcon,
  'cadastros-estoque-local': BuildingStorefrontIcon,
  'cadastros-financeiro-clientes': BuildingStorefrontIcon,
  'cadastros-financeiro-contas': CurrencyDollarIcon,
};

const Sidebar = ({ onLogout, currentPage, onNavigate }) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { collapsed } = useSidebar();

  const groupedMenu = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Squares2X2Icon,
      path: '/dashboard',
      children: [
        { id: 'dashboard-compras', label: 'Compras', path: '/dashboard' },
        { id: 'dashboard-estoque', label: 'Estoque', path: '/dashboard' },
        { id: 'dashboard-faturamento', label: 'Faturamento', path: '/dashboard' },
        { id: 'dashboard-orcamento', label: 'Orçamento', path: '/dashboard' },
      ],
    },
    {
      id: 'pedidos',
      label: 'Pedidos',
      icon: DocumentTextIcon,
      path: '/pedidos',
      badge: '12',
      children: [
        { id: 'pedidos-estoque', label: 'Estoque', path: '/pedidos' },
        { id: 'pedidos-compras', label: 'Compras', path: '/pedidos' },
        { id: 'pedidos-faturamento', label: 'Faturamento', path: '/pedidos' },
      ],
    },
    {
      id: 'cadastros',
      label: 'Cadastros',
      icon: FolderIcon,
      path: '/cadastros',
      children: [
        {
          id: 'cadastros-estoque',
          label: 'Estoque',
          path: '/cadastros/estoque',
          children: [
            { id: 'cadastros-estoque-produtos', label: 'Produtos', path: '/cadastros/estoque/produtos' },
            { id: 'cadastros-estoque-local', label: 'Local de estoque', path: '/cadastros/estoque/local' },
          ],
        },
        {
          id: 'cadastros-financeiro',
          label: 'Financeiro',
          path: '/cadastros/financeiro',
          children: [
            { id: 'cadastros-financeiro-clientes', label: 'Cliente e Fornecedor', path: '/cadastros/financeiro/clientes' },
            { id: 'cadastros-financeiro-contas', label: 'Contas Caixa', path: '/cadastros/financeiro/contas' },
          ],
        },
        { id: 'cadastros-est-compras-fat', label: 'Est. Compras e Fat.', path: '/cadastros/est-compras-fat' },
        { id: 'cadastros-globais', label: 'Globais', path: '/cadastros/globais' },
      ],
    },
  ];

  const secondaryMenu = [
    {
      id: 'tarefas',
      label: 'Tarefas/Aprovações',
      icon: CheckBadgeIcon,
      path: '/tarefas',
      badge: '4',
    },
    {
      id: 'notas-fiscais',
      label: 'Notas Fiscais',
      icon: ReceiptPercentIcon,
      path: '/notas-fiscais',
    },
    {
      id: 'despesas-viagens',
      label: 'Despesas com Viagens',
      icon: ReceiptPercentIcon,
      path: '/despesas-viagens',
    },
    {
      id: 'relatorios',
      label: 'Relatórios',
      icon: ChartBarIcon,
      path: '/relatorios',
    },
    {
      id: 'configuracoes',
      label: 'Configurações',
      icon: Cog6ToothIcon,
      path: '/configuracoes',
    },
  ];

  const [openGroups, setOpenGroups] = React.useState(OPEN_GROUPS_INITIAL);
  const [openSubgroups, setOpenSubgroups] = React.useState(OPEN_SUBGROUPS_INITIAL);
  const hasMountedRef = React.useRef(false);

  React.useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }
    const groupId = GROUP_MAP[currentPage];
    if (groupId) {
      setOpenGroups((prev) => ({ ...prev, [groupId]: true }));
    }
    const subGroupId = SUBGROUP_MAP[currentPage];
    if (subGroupId) {
      setOpenSubgroups((prev) => ({ ...prev, [subGroupId]: true }));
    }
  }, [currentPage]);

  const toggleGroup = (groupId) => {
    setOpenGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const toggleSubgroup = (groupId) => {
    setOpenSubgroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const allExpanded = React.useMemo(() => {
    const groupsExpanded = Object.values(openGroups).every(Boolean);
    const subgroupsExpanded = Object.values(openSubgroups).every(Boolean);
    return groupsExpanded && subgroupsExpanded;
  }, [openGroups, openSubgroups]);

  const setAllExpanded = (expanded) => {
    setOpenGroups(
      Object.keys(OPEN_GROUPS_INITIAL).reduce((acc, key) => {
        acc[key] = expanded;
        return acc;
      }, {})
    );
    setOpenSubgroups(
      Object.keys(OPEN_SUBGROUPS_INITIAL).reduce((acc, key) => {
        acc[key] = expanded;
        return acc;
      }, {})
    );
  };

  const handleGroupClick = (group) => {
    onNavigate(group);
    if (collapsed) {
      return;
    }
    setOpenGroups((prev) => ({ ...prev, [group.id]: true }));
  };

  const handleSubGroupClick = (group) => {
    onNavigate(group);
    if (collapsed) {
      return;
    }
    setOpenSubgroups((prev) => ({ ...prev, [group.id]: true }));
  };

  const getSubItemIcon = (itemId) => SUBITEM_ICON_MAP[itemId] || DocumentTextIcon;

  return (
    <SidebarRoot className="fixed left-0 top-0 z-50 overflow-x-hidden border-r-2 border-graphite-300 bg-graphite-50 shadow-md dark:border-graphite-700 dark:bg-graphite-950">
      <SidebarHeader className="h-16 px-3 flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 bg-graphite-900 rounded-md flex items-center justify-center dark:bg-graphite-200">
              <span className="text-white font-semibold text-sm dark:text-graphite-900">RM</span>
            </div>
            <div>
              <span className="font-semibold tracking-tight text-[15px] leading-none">TOTVS RM</span>
              <p className="text-[11px] tracking-tight text-graphite-600 dark:text-graphite-300">Central RM</p>
            </div>
          </div>
        )}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setAllExpanded(!allExpanded)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-graphite-600 transition-colors hover:bg-graphite-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-graphite-500 dark:text-graphite-300 dark:hover:bg-graphite-800"
            title={allExpanded ? 'Recolher tudo' : 'Expandir tudo'}
            aria-label={allExpanded ? 'Recolher tudo' : 'Expandir tudo'}
          >
            {allExpanded ? <ChevronDoubleUpIcon className="h-5 w-5" /> : <ChevronDoubleDownIcon className="h-5 w-5" />}
          </button>
          <SidebarTrigger
            className="p-2 hover:bg-graphite-200 rounded-md transition-colors text-graphite-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-graphite-500 dark:text-graphite-200 dark:hover:bg-graphite-800"
            title={collapsed ? 'Expandir menu' : 'Recolher menu'}
          >
            {collapsed ? (
              <ChevronRightIcon className="h-5 w-5" />
            ) : (
              <ChevronLeftIcon className="h-5 w-5" />
            )}
          </SidebarTrigger>
        </div>
      </SidebarHeader>

      <SidebarContent className="py-3">
        {!collapsed && (
          <div className="px-2.5 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-graphite-500 dark:text-graphite-400">
            Principal
          </div>
        )}
        <SidebarGroup className="space-y-1.5 px-2">
          {groupedMenu.map((group) => {
            const Icon = group.icon;
            const isGroupActive =
              currentPage === group.id || currentPage?.startsWith(`${group.id}-`);
            const isOpen = openGroups[group.id];

            return (
              <div key={group.id} className="space-y-1">
                <div
                  className={`
                    w-full flex items-center rounded-md py-2
                    transition-all duration-200 ring-1 ring-inset
                    ${collapsed ? 'justify-center px-0' : 'justify-between px-2.5'}
                    ${
                      isGroupActive
                        ? 'bg-graphite-900 text-white ring-graphite-900 dark:bg-graphite-800 dark:text-graphite-50 dark:ring-graphite-600'
                        : 'text-graphite-800 hover:bg-graphite-200 hover:text-graphite-950 ring-transparent dark:text-graphite-200 dark:hover:bg-graphite-800 dark:hover:text-graphite-50'
                    }
                  `}
                >
                  <button
                    type="button"
                    onClick={() => handleGroupClick(group)}
                    title={collapsed ? group.label : ''}
                    className={`
                      flex min-w-0 items-center
                      ${collapsed ? 'w-full justify-center' : 'flex-1 space-x-2.5 text-left'}
                    `}
                  >
                    <Icon className="h-[18px] w-[18px] flex-shrink-0" />
                    {!collapsed && (
                      <span className="flex-1 text-left font-medium text-[13px] tracking-tight">
                        {group.label}
                      </span>
                    )}
                  </button>
                  {!collapsed && (
                    <div className="flex items-center space-x-2">
                      {group.badge && (
                        <span className="bg-graphite-100 text-graphite-900 text-xs px-2 py-0.5 rounded-full dark:bg-graphite-900 dark:text-graphite-100">
                          {group.badge}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          toggleGroup(group.id);
                        }}
                        className="p-0.5 text-current/70 hover:text-current"
                        aria-label={isOpen ? `Recolher ${group.label}` : `Expandir ${group.label}`}
                      >
                        <ChevronDownIcon
                          className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                          aria-hidden="true"
                        />
                      </button>
                    </div>
                  )}
                </div>

                {!collapsed && isOpen && (
                  <div className="ml-3 pl-2.5 space-y-0.5 border-l border-graphite-200/70 dark:border-graphite-700/70">
                    {group.children.map((child) => {
                      const hasChildren = Boolean(child.children?.length);
                      const isChildActive = currentPage === child.id || currentPage?.startsWith(`${child.id}-`);
                      const isChildOpen = openSubgroups[child.id];
                      const ChildIcon = getSubItemIcon(child.id);

                      if (hasChildren) {
                        return (
                          <div key={child.id} className="space-y-0.5">
                            <div
                              className={`
                                w-full flex items-center justify-between rounded-md px-2 py-1.5 text-sm
                                transition-colors ring-1 ring-inset
                                ${
                                  isChildActive
                                    ? 'bg-graphite-900 text-white ring-graphite-900 dark:bg-graphite-800 dark:text-graphite-50 dark:ring-graphite-600'
                                    : 'text-graphite-700 hover:bg-graphite-200 hover:text-graphite-950 ring-transparent dark:text-graphite-300 dark:hover:bg-graphite-800 dark:hover:text-graphite-50'
                                }
                              `}
                            >
                              <button
                                type="button"
                                onClick={() => handleSubGroupClick(child)}
                                className="flex flex-1 items-center gap-1.5 text-left font-medium"
                              >
                                <ChildIcon className="h-3.5 w-3.5 flex-shrink-0" />
                                {child.label}
                              </button>
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  toggleSubgroup(child.id);
                                }}
                                className="p-0.5 text-current/70 hover:text-current"
                                aria-label={isChildOpen ? `Recolher ${child.label}` : `Expandir ${child.label}`}
                              >
                                <ChevronDownIcon
                                  className={`h-4 w-4 transition-transform ${isChildOpen ? 'rotate-180' : ''}`}
                                  aria-hidden="true"
                                />
                              </button>
                            </div>
                            {isChildOpen && (
                              <div className="ml-2.5 pl-2 space-y-0.5 border-l border-graphite-200/60 dark:border-graphite-700/60">
                                {child.children.map((grandchild) => {
                                  const isGrandActive = currentPage === grandchild.id;
                                  const GrandchildIcon = getSubItemIcon(grandchild.id);
                                  return (
                                    <button
                                      key={grandchild.id}
                                      onClick={() => onNavigate(grandchild)}
                                      className={`
                                        w-full flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[12px]
                                        transition-colors ring-1 ring-inset
                                        ${
                                          isGrandActive
                                            ? 'bg-graphite-900 text-white ring-graphite-900 dark:bg-graphite-800 dark:text-graphite-50 dark:ring-graphite-600'
                                            : 'text-graphite-700 hover:bg-graphite-200 hover:text-graphite-950 ring-transparent dark:text-graphite-300 dark:hover:bg-graphite-800 dark:hover:text-graphite-50'
                                        }
                                      `}
                                    >
                                      <GrandchildIcon className="h-3 w-3 flex-shrink-0" />
                                      <span className="text-left tracking-tight">{grandchild.label}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      }

                      return (
                        <button
                          key={child.id}
                          onClick={() => onNavigate(child)}
                          className={`
                            w-full flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[12px]
                            transition-colors ring-1 ring-inset
                            ${
                              isChildActive
                                ? 'bg-graphite-900 text-white ring-graphite-900 dark:bg-graphite-800 dark:text-graphite-50 dark:ring-graphite-600'
                                : 'text-graphite-700 hover:bg-graphite-200 hover:text-graphite-950 ring-transparent dark:text-graphite-300 dark:hover:bg-graphite-800 dark:hover:text-graphite-50'
                            }
                          `}
                        >
                          <ChildIcon className="h-3.5 w-3.5 flex-shrink-0" />
                          <span className="text-left tracking-tight">{child.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </SidebarGroup>

        {!collapsed && (
          <div className="mt-3 px-2.5 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-graphite-500 dark:text-graphite-400">
            Operações
          </div>
        )}
        <SidebarGroup className="space-y-1 px-2">
          {secondaryMenu.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item)}
                className={`
                  w-full flex items-center py-2 rounded-md
                  ${collapsed ? 'justify-center px-0' : 'space-x-2.5 px-2.5'}
                  transition-all duration-200 ring-1 ring-inset
                  ${
                    isActive
                      ? 'bg-graphite-900 text-white ring-graphite-900 dark:bg-graphite-800 dark:text-graphite-50 dark:ring-graphite-600'
                      : 'text-graphite-800 hover:bg-graphite-200 hover:text-graphite-950 ring-transparent dark:text-graphite-300 dark:hover:bg-graphite-800 dark:hover:text-graphite-50'
                  }
                `}
                title={collapsed ? item.label : ''}
              >
                <Icon className="h-[18px] w-[18px] flex-shrink-0" />
                {!collapsed && (
                  <>
                    <span className="flex-1 text-left text-[13px] font-medium tracking-tight">
                      {item.label}
                    </span>
                    {item.badge && (
                      <span className="bg-graphite-100 text-graphite-900 text-xs px-2 py-0.5 rounded-full dark:bg-graphite-900 dark:text-graphite-100">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3">
        <button
          onClick={toggleTheme}
          className={`w-full flex items-center py-2 rounded-md
                     ${collapsed ? 'justify-center px-0' : 'space-x-2.5 px-2.5'}
                     text-graphite-800 hover:bg-graphite-200 hover:text-graphite-950
                     dark:text-graphite-300 dark:hover:bg-graphite-800 dark:hover:text-graphite-50
                     transition-all duration-200 mb-2`}
          title={collapsed ? 'Tema' : ''}
          aria-pressed={isDarkMode}
        >
          {isDarkMode ? (
            <SunIcon className="h-5 w-5 flex-shrink-0" />
          ) : (
            <MoonIcon className="h-5 w-5 flex-shrink-0" />
          )}
          {!collapsed && <span className="font-medium">{isDarkMode ? 'Tema claro' : 'Tema escuro'}</span>}
        </button>
        <button
          onClick={onLogout}
          className={`w-full flex items-center py-2 rounded-md
                     ${collapsed ? 'justify-center px-0' : 'space-x-2.5 px-2.5'}
                     text-graphite-800 hover:bg-graphite-200 hover:text-graphite-950
                     dark:text-graphite-300 dark:hover:bg-graphite-800 dark:hover:text-graphite-50
                     transition-all duration-200`}
          title={collapsed ? 'Sair' : ''}
        >
          <ArrowLeftOnRectangleIcon className="h-5 w-5 flex-shrink-0" />
          {!collapsed && <span className="font-medium">Sair</span>}
        </button>
      </SidebarFooter>
    </SidebarRoot>
  );
};

export default Sidebar;
