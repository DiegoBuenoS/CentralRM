// Sidebar

import React from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  FileText,
  Receipt,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Moon,
  Sun,
} from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

const Sidebar = ({ collapsed, onToggle, onLogout, currentPage, onNavigate }) => {
  const { isDarkMode, toggleTheme } = useTheme();

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      path: '/dashboard',
    },
    {
      id: 'tarefas',
      label: 'Aprovação',
      icon: CheckSquare,
      path: '/tarefas',
      badge: '4',
    },
    {
      id: 'pedidos',
      label: 'Pedidos',
      icon: FileText,
      path: '/pedidos',
      badge: '12',
    },
    {
      id: 'notas-fiscais',
      label: 'Notas Fiscais',
      icon: Receipt,
      path: '/notas-fiscais',
    },
    {
      id: 'relatorios',
      label: 'Relatórios',
      icon: BarChart3,
      path: '/relatorios',
    },
    {
      id: 'configuracoes',
      label: 'Configurações',
      icon: Settings,
      path: '/configuracoes',
    },
  ];

  return (
    <div
      className={`
        ${collapsed ? 'w-20' : 'w-64'}
        bg-white
        text-graphite-900
        border-r border-graphite-200
        dark:bg-graphite-900 dark:text-graphite-100 dark:border-graphite-700
        transition-all duration-300
        flex flex-col
        h-screen
        fixed left-0 top-0
        shadow-sm
        z-50
      `}
    >
      <div className="h-20 px-4 flex items-center justify-between border-b border-graphite-200 dark:border-graphite-700">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-accent-600 rounded-md flex items-center justify-center">
              <span className="text-white font-semibold text-sm">RM</span>
            </div>
            <div>
              <span className="font-semibold text-lg">TOTVS RM</span>
              <p className="text-xs text-graphite-500 dark:text-graphite-300">Central RM</p>
            </div>
          </div>
        )}
        <button
          onClick={onToggle}
          className="p-2 hover:bg-graphite-100 rounded-md transition-colors text-graphite-600 dark:text-graphite-300 dark:hover:bg-graphite-800"
          title={collapsed ? 'Expandir menu' : 'Recolher menu'}
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <li key={item.id}>
                <button
                  onClick={() => onNavigate(item)}
                  className={`
                    w-full flex items-center space-x-3 px-3 py-3 rounded-lg
                    transition-all duration-200
                    ${
                      isActive
                        ? 'bg-accent-50 text-accent-700 border border-accent-100 dark:bg-graphite-800 dark:text-graphite-100 dark:border-graphite-700'
                        : 'text-graphite-600 hover:bg-graphite-100 hover:text-graphite-900 border border-transparent dark:text-graphite-300 dark:hover:bg-graphite-800 dark:hover:text-graphite-50'
                    }
                  `}
                  title={collapsed ? item.label : ''}
                >
                  <Icon size={20} className="flex-shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left font-medium">
                        {item.label}
                      </span>
                      {item.badge && (
                        <span className="bg-accent-600 text-white text-xs px-2 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-graphite-200 dark:border-graphite-700">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center space-x-3 px-3 py-3 rounded-lg
                     text-graphite-600 hover:bg-graphite-100 hover:text-graphite-900
                     dark:text-graphite-300 dark:hover:bg-graphite-800 dark:hover:text-graphite-50
                     transition-all duration-200 mb-2"
          title={collapsed ? 'Tema' : ''}
          aria-pressed={isDarkMode}
        >
          {isDarkMode ? <Sun size={20} className="flex-shrink-0" /> : <Moon size={20} className="flex-shrink-0" />}
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
          <LogOut size={20} className="flex-shrink-0" />
          {!collapsed && <span className="font-medium">Sair</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
