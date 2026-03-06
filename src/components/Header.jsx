// Header

import React from 'react';
import {
  UserCircleIcon,
  BellIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { Input } from './ui/Input';
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
        ${sidebarCollapsed ? 'ml-[4.5rem]' : 'ml-60'}
        fixed top-0 right-0
        bg-white border-b border-slate-200
        dark:bg-graphite-950 dark:border-graphite-700
        transition-all duration-300
        z-40
        shadow-[0_8px_24px_-24px_rgba(15,23,42,0.6)]
        h-16
      `}
      style={{ width: sidebarCollapsed ? 'calc(100% - 4.5rem)' : 'calc(100% - 15rem)' }}
    >
      <div className="px-5 h-full">
        <div className="flex items-center justify-between gap-4 h-full">
          <div>
            <Breadcrumb>
              <BreadcrumbList className="text-xs tracking-tight text-graphite-500 dark:text-graphite-300">
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
            <h1 className="text-[1.32rem] font-semibold tracking-tight leading-tight text-graphite-900 dark:text-graphite-50">{title}</h1>
          </div>

          <div className="flex items-center space-x-3">
            <div className="relative hidden md:block">
              <Input
                type="text"
                placeholder="Buscar..."
                className="pl-9 pr-3 w-56 text-[13px] tracking-tight text-graphite-700 bg-slate-50 dark:bg-graphite-900 dark:text-graphite-100"
              />
              <MagnifyingGlassIcon
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-graphite-400 dark:text-graphite-300"
              />
            </div>

            <div className="relative group">
              <button
                className="relative p-2 text-graphite-500 hover:text-graphite-900
                         hover:bg-slate-100 rounded-md transition-colors
                         dark:text-graphite-300 dark:hover:text-graphite-100 dark:hover:bg-graphite-800"
                title="Notificações"
              >
                <BellIcon className="h-5 w-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-blue-600 rounded-full dark:bg-cyan-300"></span>
              </button>
              <div className="absolute right-0 mt-2 w-72 rounded-md border border-slate-200 bg-white shadow-sm opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all dark:border-graphite-700 dark:bg-graphite-900">
                <div className="px-3 py-2 text-xs font-medium text-graphite-500 border-b border-slate-200 dark:text-graphite-300 dark:border-graphite-700">
                  Notificações
                </div>
                <div className="px-3 py-3 text-sm text-graphite-700 dark:text-graphite-200">
                  Solicitação de Compras aguardando aprovação
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2.5 pl-3 border-l border-slate-200 dark:border-graphite-700">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-graphite-900 dark:text-graphite-50">
                  {getUserName()}
                </p>
                <p className="text-[11px] tracking-tight text-graphite-500 dark:text-graphite-300">
                  Código: <span className="font-mono font-semibold">{getUserCode()}</span>
                </p>
              </div>
              <div className="w-8 h-8 bg-[#255b9c] rounded-full flex items-center justify-center dark:bg-graphite-200">
                <UserCircleIcon className="h-5 w-5 text-white dark:text-graphite-900" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
