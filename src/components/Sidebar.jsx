// Sidebar

import React from 'react';
import {
  ArrowLeftOnRectangleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Cog6ToothIcon,
  ClockIcon,
  KeyIcon,
  MoonIcon,
  ReceiptPercentIcon,
  SunIcon,
  UsersIcon,
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

const navigationSections = [
  {
    id: 'operacao',
    label: 'Operação',
    items: [
      {
        id: 'despesas-viagens',
        label: 'Despesas de Viagem',
        icon: ReceiptPercentIcon,
        path: '/despesas-viagens',
      },
      {
        id: 'timesheet',
        label: 'Time Sheet RM',
        icon: ClockIcon,
        path: '/timesheet',
      },
    ],
  },
  {
    id: 'configuracoes',
    label: 'Configurações',
    items: [],
  },
];

const NavButton = ({ item, collapsed, isActive, onNavigate }) => {
  const Icon = item.icon;

  return (
    <button
      type="button"
      onClick={() => onNavigate(item)}
      className={`group relative w-full overflow-hidden rounded-xl py-2.5 transition-all duration-200 ${
        collapsed ? 'px-0' : 'px-3'
      } ${
        isActive
          ? 'bg-[#255b9c] text-white shadow-sm ring-1 ring-[#255b9c]/35 dark:bg-blue-600 dark:ring-blue-400/40'
          : 'text-graphite-700 hover:bg-slate-100 hover:text-slate-900 dark:text-graphite-300 dark:hover:bg-graphite-800 dark:hover:text-graphite-50'
      }`}
      title={collapsed ? item.label : ''}
      aria-current={isActive ? 'page' : undefined}
    >
      <span className={`flex items-center ${collapsed ? 'justify-center' : 'gap-2.5'}`}>
        <Icon className="h-[18px] w-[18px] flex-shrink-0" />
        {!collapsed && <span className="text-[13px] font-medium tracking-tight">{item.label}</span>}
      </span>
      {isActive && !collapsed && (
        <span className="absolute inset-y-1 left-1 w-1 rounded-full bg-white/80" aria-hidden="true" />
      )}
    </button>
  );
};

const Sidebar = ({ onLogout, currentPage, onNavigate }) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { collapsed } = useSidebar();

  return (
    <SidebarRoot className="fixed left-0 top-0 z-50 overflow-x-hidden border-r border-slate-300 bg-gradient-to-b from-[#f8fafc] via-white to-[#f8fafc] shadow-[0_24px_48px_-36px_rgba(15,23,42,0.28)] dark:border-graphite-700 dark:bg-graphite-950">
      <SidebarHeader className="flex h-16 items-center justify-between px-3">
        {!collapsed && (
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#255b9c] shadow-sm dark:bg-blue-500">
              <span className="text-xs font-bold tracking-wide text-white">RM</span>
            </div>
            <div>
              <p className="text-[15px] font-semibold leading-none tracking-tight text-graphite-900 dark:text-graphite-100">
                RM Despesas
              </p>
              <p className="mt-0.5 text-[11px] text-graphite-500 dark:text-graphite-400">
                Controle corporativo
              </p>
            </div>
          </div>
        )}

        <SidebarTrigger
          className="rounded-lg p-2 text-graphite-700 transition-colors hover:bg-graphite-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-graphite-300 dark:text-graphite-200 dark:hover:bg-graphite-800"
          title={collapsed ? 'Expandir menu' : 'Recolher menu'}
        >
          {collapsed ? <ChevronRightIcon className="h-5 w-5" /> : <ChevronLeftIcon className="h-5 w-5" />}
        </SidebarTrigger>
      </SidebarHeader>

      <SidebarContent className="space-y-4 py-3">
        {navigationSections.map((section) => (
          <div key={section.id} className="space-y-1.5 px-2.5">
            {!collapsed && (
              <p className="px-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-graphite-500 dark:text-graphite-400">
                {section.label}
              </p>
            )}
            <SidebarGroup className="space-y-1">
              {section.items.map((item) => (
                <NavButton
                  key={item.id}
                  item={item}
                  collapsed={collapsed}
                  isActive={currentPage === item.id}
                  onNavigate={onNavigate}
                />
              ))}
            </SidebarGroup>
          </div>
        ))}

        {!collapsed && (
          <div className="mx-2.5 rounded-xl border border-slate-300 bg-slate-50 p-3 dark:border-graphite-700 dark:bg-graphite-900">
            <p className="inline-flex items-center gap-1 text-[11px] font-semibold text-graphite-900 dark:text-graphite-100">
              <Cog6ToothIcon className="h-3.5 w-3.5" />
              Ambiente Administrativo
            </p>
            <p className="mt-1 text-[11px] leading-relaxed text-graphite-600 dark:text-graphite-300">
              Gerencie usuários locais e credenciais técnicas de integração.
            </p>
          </div>
        )}
      </SidebarContent>

      <SidebarFooter className="space-y-2 p-3">
        <button
          type="button"
          onClick={() =>
            onNavigate({
              id: 'configuracoes-usuarios',
              path: '/configuracoes/usuarios',
            })
          }
          className={`w-full rounded-xl py-2.5 transition-colors ${
            collapsed ? 'px-0' : 'px-3'
          } inline-flex items-center ${
            collapsed ? 'justify-center' : 'gap-2.5'
          } text-graphite-700 hover:bg-graphite-100 hover:text-graphite-900 dark:text-graphite-300 dark:hover:bg-graphite-800 dark:hover:text-graphite-50`}
          title={collapsed ? 'Gestão de Usuários' : ''}
          aria-current={currentPage === 'configuracoes-usuarios' ? 'page' : undefined}
        >
          <UsersIcon className="h-5 w-5" />
          {!collapsed && <span className="text-sm font-medium">Gestão de Usuários</span>}
        </button>

        <button
          type="button"
          onClick={() =>
            onNavigate({
              id: 'configuracoes-chaves-api',
              path: '/configuracoes/chaves-api',
            })
          }
          className={`w-full rounded-xl py-2.5 transition-colors ${
            collapsed ? 'px-0' : 'px-3'
          } inline-flex items-center ${
            collapsed ? 'justify-center' : 'gap-2.5'
          } text-graphite-700 hover:bg-graphite-100 hover:text-graphite-900 dark:text-graphite-300 dark:hover:bg-graphite-800 dark:hover:text-graphite-50`}
          title={collapsed ? 'Gestão de Chaves API' : ''}
          aria-current={currentPage === 'configuracoes-chaves-api' ? 'page' : undefined}
        >
          <KeyIcon className="h-5 w-5" />
          {!collapsed && <span className="text-sm font-medium">Gestão de Chaves API</span>}
        </button>

        <button
          type="button"
          onClick={toggleTheme}
          className={`w-full rounded-xl py-2.5 transition-colors ${
            collapsed ? 'px-0' : 'px-3'
          } inline-flex items-center ${
            collapsed ? 'justify-center' : 'gap-2.5'
          } text-graphite-700 hover:bg-graphite-100 hover:text-graphite-900 dark:text-graphite-300 dark:hover:bg-graphite-800 dark:hover:text-graphite-50`}
          title={collapsed ? 'Tema' : ''}
          aria-pressed={isDarkMode}
        >
          {isDarkMode ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
          {!collapsed && <span className="text-sm font-medium">{isDarkMode ? 'Tema claro' : 'Tema escuro'}</span>}
        </button>

        <button
          type="button"
          onClick={onLogout}
          className={`w-full rounded-xl py-2.5 transition-colors ${
            collapsed ? 'px-0' : 'px-3'
          } inline-flex items-center ${
            collapsed ? 'justify-center' : 'gap-2.5'
          } text-graphite-700 hover:bg-red-50 hover:text-red-700 dark:text-graphite-300 dark:hover:bg-red-950/40 dark:hover:text-red-300`}
          title={collapsed ? 'Sair' : ''}
        >
          <ArrowLeftOnRectangleIcon className="h-5 w-5" />
          {!collapsed && <span className="text-sm font-medium">Sair</span>}
        </button>
      </SidebarFooter>
    </SidebarRoot>
  );
};

export default Sidebar;
