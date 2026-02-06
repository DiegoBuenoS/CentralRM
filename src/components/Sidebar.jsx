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
  MoonIcon,
  SunIcon,
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

  const groupMap = {
    dashboard: 'dashboard',
    'dashboard-compras': 'dashboard',
    'dashboard-estoque': 'dashboard',
    'dashboard-faturamento': 'dashboard',
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

  const [openGroups, setOpenGroups] = React.useState({
    dashboard: true,
    pedidos: true,
    cadastros: true,
  });
  const [openSubgroups, setOpenSubgroups] = React.useState({
    'cadastros-estoque': true,
    'cadastros-financeiro': true,
  });

  const subGroupMap = {
    'cadastros-estoque-produtos': 'cadastros-estoque',
    'cadastros-estoque-local': 'cadastros-estoque',
    'cadastros-financeiro-clientes': 'cadastros-financeiro',
    'cadastros-financeiro-contas': 'cadastros-financeiro',
  };

  React.useEffect(() => {
    const groupId = groupMap[currentPage];
    if (groupId) {
      setOpenGroups((prev) => ({ ...prev, [groupId]: true }));
    }
    const subGroupId = subGroupMap[currentPage];
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

  return (
    <SidebarRoot className="fixed left-0 top-0 z-50 shadow-sm">
      <SidebarHeader className="h-20 px-4 flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-black rounded-md flex items-center justify-center dark:bg-white">
              <span className="text-white font-semibold text-sm dark:text-black">RM</span>
            </div>
            <div>
              <span className="font-semibold text-lg">TOTVS RM</span>
              <p className="text-xs text-graphite-500 dark:text-graphite-300">Central RM</p>
            </div>
          </div>
        )}
        <SidebarTrigger
          className="p-2 hover:bg-graphite-100 rounded-md transition-colors text-graphite-600 dark:text-graphite-300 dark:hover:bg-graphite-800"
          title={collapsed ? 'Expandir menu' : 'Recolher menu'}
        >
          {collapsed ? (
            <ChevronRightIcon className="h-5 w-5" />
          ) : (
            <ChevronLeftIcon className="h-5 w-5" />
          )}
        </SidebarTrigger>
      </SidebarHeader>

      <SidebarContent className="py-4">
        {!collapsed && (
          <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-graphite-500 dark:text-graphite-400">
            Principal
          </div>
        )}
        <SidebarGroup className="space-y-2 px-2">
          {groupedMenu.map((group) => {
            const Icon = group.icon;
            const isGroupActive =
              currentPage === group.id || currentPage?.startsWith(`${group.id}-`);
            const isOpen = openGroups[group.id];

            return (
              <div key={group.id} className="space-y-1">
                <div
                  className={`
                    w-full flex items-center justify-between px-3 py-3 rounded-lg
                    transition-all duration-200
                    ${
                      isGroupActive
                        ? 'bg-graphite-100 text-graphite-900 border border-graphite-200 dark:bg-graphite-800 dark:text-graphite-100 dark:border-graphite-700'
                        : 'text-graphite-600 hover:bg-graphite-100 hover:text-graphite-900 border border-transparent dark:text-graphite-300 dark:hover:bg-graphite-800 dark:hover:text-graphite-50'
                    }
                  `}
                >
                  <button
                    type="button"
                    onClick={() => handleGroupClick(group)}
                    title={collapsed ? group.label : ''}
                    className="flex flex-1 min-w-0 items-center space-x-3 text-left"
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    {!collapsed && (
                      <span className="flex-1 text-left font-semibold text-[15px] tracking-tight">
                        {group.label}
                      </span>
                    )}
                  </button>
                  {!collapsed && (
                    <div className="flex items-center space-x-2">
                      {group.badge && (
                        <span className="bg-black text-white text-xs px-2 py-0.5 rounded-full dark:bg-white dark:text-black">
                          {group.badge}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          toggleGroup(group.id);
                        }}
                        className="p-1 text-graphite-400 hover:text-graphite-700 dark:text-graphite-500 dark:hover:text-graphite-200"
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
                  <div className="ml-6 pl-4 space-y-1.5 border-l border-graphite-200/70 dark:border-graphite-700/70">
                    {group.children.map((child) => {
                      const hasChildren = Boolean(child.children?.length);
                      const isChildActive = currentPage === child.id || currentPage?.startsWith(`${child.id}-`);
                      const isChildOpen = openSubgroups[child.id];

                      if (hasChildren) {
                        return (
                          <div key={child.id} className="space-y-1">
                            <div
                              className={`
                                w-full flex items-center justify-between rounded-md px-3 py-2.5 text-sm
                                transition-colors
                                ${
                                  isChildActive
                                    ? 'bg-graphite-100 text-graphite-900 border border-graphite-200 dark:bg-graphite-800 dark:text-graphite-100 dark:border-graphite-700'
                                    : 'text-graphite-500 hover:bg-graphite-100 hover:text-graphite-900 dark:text-graphite-400 dark:hover:bg-graphite-800 dark:hover:text-graphite-50'
                                }
                              `}
                            >
                              <button
                                type="button"
                                onClick={() => handleSubGroupClick(child)}
                                className="flex-1 text-left font-medium"
                              >
                                {child.label}
                              </button>
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  toggleSubgroup(child.id);
                                }}
                                className="p-1 text-graphite-400 hover:text-graphite-700 dark:text-graphite-500 dark:hover:text-graphite-200"
                                aria-label={isChildOpen ? `Recolher ${child.label}` : `Expandir ${child.label}`}
                              >
                                <ChevronDownIcon
                                  className={`h-4 w-4 transition-transform ${isChildOpen ? 'rotate-180' : ''}`}
                                  aria-hidden="true"
                                />
                              </button>
                            </div>
                            {isChildOpen && (
                              <div className="ml-4 pl-3 space-y-1.5 border-l border-graphite-200/60 dark:border-graphite-700/60">
                                {child.children.map((grandchild) => {
                                  const isGrandActive = currentPage === grandchild.id;
                                  return (
                                    <button
                                      key={grandchild.id}
                                      onClick={() => onNavigate(grandchild)}
                                      className={`
                                        w-full flex items-center gap-2 rounded-md px-3 py-2 text-[13px]
                                        transition-colors
                                        ${
                                          isGrandActive
                                            ? 'bg-graphite-100 text-graphite-900 border border-graphite-200 dark:bg-graphite-800 dark:text-graphite-100 dark:border-graphite-700'
                                            : 'text-graphite-500 hover:bg-graphite-100 hover:text-graphite-900 dark:text-graphite-400 dark:hover:bg-graphite-800 dark:hover:text-graphite-50'
                                        }
                                      `}
                                    >
                                      <span
                                        className={`h-1.5 w-1.5 rounded-full ${
                                          isGrandActive
                                            ? 'bg-black dark:bg-white'
                                            : 'bg-graphite-400 dark:bg-graphite-500'
                                        }`}
                                      />
                                      <span className="text-left">{grandchild.label}</span>
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
                            w-full flex items-center gap-2 rounded-md px-3 py-2 text-sm
                            transition-colors
                            ${
                              isChildActive
                                ? 'bg-graphite-100 text-graphite-900 border border-graphite-200 dark:bg-graphite-800 dark:text-graphite-100 dark:border-graphite-700'
                                : 'text-graphite-500 hover:bg-graphite-100 hover:text-graphite-900 dark:text-graphite-400 dark:hover:bg-graphite-800 dark:hover:text-graphite-50'
                            }
                          `}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              isChildActive
                                ? 'bg-black dark:bg-white'
                                : 'bg-graphite-400 dark:bg-graphite-500'
                            }`}
                          />
                          <span className="text-left">{child.label}</span>
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
          <div className="mt-4 px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-graphite-500 dark:text-graphite-400">
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
                  w-full flex items-center space-x-3 px-3 py-3 rounded-lg
                  transition-all duration-200
                  ${
                    isActive
                      ? 'bg-graphite-100 text-graphite-900 border border-graphite-200 dark:bg-graphite-800 dark:text-graphite-100 dark:border-graphite-700'
                      : 'text-graphite-600 hover:bg-graphite-100 hover:text-graphite-900 border border-transparent dark:text-graphite-300 dark:hover:bg-graphite-800 dark:hover:text-graphite-50'
                  }
                `}
                title={collapsed ? item.label : ''}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!collapsed && (
                  <>
                    <span className="flex-1 text-left font-medium">
                      {item.label}
                    </span>
                    {item.badge && (
                      <span className="bg-black text-white text-xs px-2 py-0.5 rounded-full dark:bg-white dark:text-black">
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

      <SidebarFooter className="p-4">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center space-x-3 px-3 py-3 rounded-lg
                     text-graphite-600 hover:bg-graphite-100 hover:text-graphite-900
                     dark:text-graphite-300 dark:hover:bg-graphite-800 dark:hover:text-graphite-50
                     transition-all duration-200 mb-2"
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
          className="w-full flex items-center space-x-3 px-3 py-3 rounded-lg
                     text-graphite-600 hover:bg-graphite-100 hover:text-graphite-900
                     dark:text-graphite-300 dark:hover:bg-graphite-800 dark:hover:text-graphite-50
                     transition-all duration-200"
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
