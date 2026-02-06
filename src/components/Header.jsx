// Header

import React from 'react';
import {
  UserCircleIcon,
  BellIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { Input } from './ui/input';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from './ui/breadcrumb';

const Header = ({
  user,
  sidebarCollapsed,
  title = 'Painel',
  breadcrumb = ['Início', 'Painel'],
}) => {
  // User name
  const getUserName = () => {
    if (!user) return 'Usuário';
    if (user.name && typeof user.name === 'object' && user.name.formatted) {
      return user.name.formatted;
    }
    if (user.name && typeof user.name === 'object' && user.name.givenName) {
      return user.name.givenName;
    }
    if (typeof user.name === 'string') {
      return user.name;
    }
    if (user.username) {
      return user.username;
    }
    
    return 'Usuário';
  };

  // User code
  const getUserCode = () => {
    if (!user) return 'N/A';
    if (user.id) return user.id;
    if (user.code) return user.code;
    if (user.username) return user.username;
    if (user.login) return user.login;
    
    return 'N/A';
  };

  return (
    <header
      className={`
        ${sidebarCollapsed ? 'ml-20' : 'ml-64'}
        fixed top-0 right-0
        bg-white border-b border-graphite-200
        dark:bg-black dark:border-graphite-800
        transition-all duration-300
        z-40
        shadow-sm
        h-20
      `}
      style={{ width: sidebarCollapsed ? 'calc(100% - 5rem)' : 'calc(100% - 16rem)' }}
    >
      <div className="px-6 h-full">
        <div className="flex items-center justify-between gap-6 h-full">
          <div>
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumb.map((item, index) => {
                  const isLast = index === breadcrumb.length - 1;
                  return (
                    <React.Fragment key={item}>
                      <BreadcrumbItem>
                        {isLast ? (
                          <BreadcrumbPage>{item}</BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink href="#">{item}</BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                      {!isLast && <BreadcrumbSeparator />}
                    </React.Fragment>
                  );
                })}
              </BreadcrumbList>
            </Breadcrumb>
            <h1 className="text-2xl font-semibold text-graphite-900 dark:text-graphite-50">{title}</h1>
          </div>

          <div className="flex items-center space-x-4 pt-1">
            <div className="relative hidden md:block">
              <Input
                type="text"
                placeholder="Buscar..."
                className="pl-10 pr-4 w-64 text-sm text-graphite-700 bg-white dark:bg-black dark:text-graphite-100"
              />
              <MagnifyingGlassIcon
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-graphite-400 dark:text-graphite-300"
              />
            </div>

            <div className="relative group">
              <button
                className="relative p-2 text-graphite-500 hover:text-graphite-900
                         hover:bg-graphite-100 rounded-md transition-colors
                         dark:text-graphite-300 dark:hover:text-graphite-100 dark:hover:bg-graphite-800"
                title="Notificações"
              >
                <BellIcon className="h-5 w-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-black rounded-full dark:bg-white"></span>
              </button>
              <div className="absolute right-0 mt-2 w-72 rounded-md border border-graphite-200 bg-white shadow-sm opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all dark:border-graphite-700 dark:bg-graphite-900">
                <div className="px-3 py-2 text-xs font-medium text-graphite-500 border-b border-graphite-100 dark:text-graphite-300 dark:border-graphite-700">
                  Notificações
                </div>
                <div className="px-3 py-3 text-sm text-graphite-700 dark:text-graphite-200">
                  Solicitação de Compras aguardando aprovação
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3 pl-4 border-l border-graphite-200 dark:border-graphite-700">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-graphite-900 dark:text-graphite-50">
                  {getUserName()}
                </p>
                <p className="text-xs text-graphite-500 dark:text-graphite-300">
                  Código: <span className="font-mono font-semibold">{getUserCode()}</span>
                </p>
              </div>
              <div className="w-9 h-9 bg-black rounded-full flex items-center justify-center dark:bg-white">
                <UserCircleIcon className="h-5 w-5 text-white dark:text-black" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
