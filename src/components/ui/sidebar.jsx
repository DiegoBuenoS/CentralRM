import * as React from "react";

import { cn } from "@/lib/utils";

const SidebarContext = React.createContext(null);

function SidebarProvider({
  defaultCollapsed = false,
  collapsed: controlledCollapsed,
  onCollapsedChange,
  children,
}) {
  const [uncontrolledCollapsed, setUncontrolledCollapsed] = React.useState(defaultCollapsed);
  const collapsed = controlledCollapsed ?? uncontrolledCollapsed;

  const setCollapsed = React.useCallback(
    (value) => {
      if (controlledCollapsed === undefined) {
        setUncontrolledCollapsed(value);
      }
      onCollapsedChange?.(value);
    },
    [controlledCollapsed, onCollapsedChange]
  );

  const toggle = React.useCallback(() => {
    setCollapsed(!collapsed);
  }, [collapsed, setCollapsed]);

  const contextValue = React.useMemo(
    () => ({
      collapsed,
      setCollapsed,
      toggle,
    }),
    [collapsed, setCollapsed, toggle]
  );

  return (
    <SidebarContext.Provider value={contextValue}>
      {children}
    </SidebarContext.Provider>
  );
}

function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.");
  }
  return context;
}

const Sidebar = React.forwardRef(({ className, ...props }, ref) => {
  const { collapsed } = useSidebar();
  return (
    <aside
      ref={ref}
      className={cn(
        "flex h-screen flex-col border-r border-graphite-200 bg-white text-graphite-900 transition-all duration-300 dark:border-graphite-800 dark:bg-black dark:text-graphite-100",
        collapsed ? "w-20" : "w-64",
        className
      )}
      {...props}
    />
  );
});
Sidebar.displayName = "Sidebar";

const SidebarHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "sticky top-0 z-10 border-b border-graphite-200 bg-white dark:border-graphite-700 dark:bg-black",
      className
    )}
    {...props}
  />
));
SidebarHeader.displayName = "SidebarHeader";

const SidebarFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "sticky bottom-0 z-10 border-t border-graphite-200 bg-white dark:border-graphite-700 dark:bg-black",
      className
    )}
    {...props}
  />
));
SidebarFooter.displayName = "SidebarFooter";

const SidebarContent = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex-1 overflow-y-auto", className)}
    {...props}
  />
));
SidebarContent.displayName = "SidebarContent";

const SidebarGroup = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("space-y-2", className)} {...props} />
));
SidebarGroup.displayName = "SidebarGroup";

const SidebarTrigger = React.forwardRef(
  ({ className, onClick, children, ...props }, ref) => {
    const { collapsed, toggle } = useSidebar();
    return (
      <button
        ref={ref}
        type="button"
        aria-pressed={collapsed}
        onClick={(event) => {
          onClick?.(event);
          if (!event.defaultPrevented) {
            toggle();
          }
        }}
        className={cn(
          "inline-flex h-9 w-9 items-center justify-center rounded-md text-graphite-600 transition-colors hover:bg-graphite-100 dark:text-graphite-300 dark:hover:bg-graphite-800",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
SidebarTrigger.displayName = "SidebarTrigger";

export {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarFooter,
  SidebarContent,
  SidebarGroup,
  SidebarTrigger,
  useSidebar,
};
