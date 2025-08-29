// @ts-nocheck
"use client";
import React, { useState, useEffect } from 'react';
import { 
  Home, 
  User, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  ChevronLeft, 
  ChevronRight,
  BarChart3,
  FileText,
  Bell,
  Search,
  HelpCircle
} from 'lucide-react';

interface NavigationItem {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  badge?: string;
}

interface SidebarProps {
  className?: string;
}

// Updated navigation items - remove logout from here
const navigationItems: NavigationItem[] = [
  { id: "dashboard", name: "Dashboard", icon: Home, href: "/dashboard" },

  { id: "documents", name: "Documents", icon: FileText, href: "/documents", badge: "3" },
  { id: "notifications", name: "Notifications", icon: Bell, href: "/notifications", badge: "12" },
  { id: "profile", name: "Profile", icon: User, href: "/profile" },
  { id: "settings", name: "Settings", icon: Settings, href: "/settings" },
  { id: "help", name: "Help & Support", icon: HelpCircle, href: "/help" },
];

export function Sidebar({ className = "" }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState("dashboard");

  // Auto-open sidebar on desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => setIsOpen(!isOpen);
  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  const handleItemClick = (itemId: string) => {
    setActiveItem(itemId);
    if (window.innerWidth < 768) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={toggleSidebar}
        className="fixed top-6 left-6 z-50 p-3 rounded-lg bg-sidebar shadow-md border border-sidebar-border md:hidden hover:bg-sidebar-accent transition-all duration-200"
        aria-label="Toggle sidebar"
      >
        {isOpen ?
          <X className="h-5 w-5 text-sidebar-foreground" /> :
          <Menu className="h-5 w-5 text-sidebar-foreground" />
        }
      </button>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 md:hidden transition-opacity duration-300"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed top-0 left-0 h-full bg-sidebar border-r border-sidebar-border z-40 transition-all duration-300 ease-in-out flex flex-col invisible-scrollbar overflow-y-auto
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          ${isCollapsed ? "w-28" : "w-78"}
          md:translate-x-0 md:static md:z-auto
          ${className}
        `}
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
          touchAction: 'pan-y',
        }}
      >
        {/* Header with logo and collapse button */}
        <div className="flex items-center justify-between p-5 border-b border-sidebar-border bg-sidebar-accent/60">
          {!isCollapsed && (
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 bg-sidebar-primary rounded-lg flex items-center justify-center shadow-sm">
                <span className="text-sidebar-primary-foreground font-bold text-base">A</span>
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-sidebar-foreground text-base">Acme Corp</span>
                <span className="text-xs text-muted-foreground">Enterprise Dashboard</span>
              </div>
            </div>
          )}

          {isCollapsed && (
            <div className="w-9 h-9 bg-sidebar-primary rounded-lg flex items-center justify-center mx-auto shadow-sm">
              <span className="text-sidebar-primary-foreground font-bold text-base">A</span>
            </div>
          )}

          {/* Desktop collapse button */}
          <button
            onClick={toggleCollapse}
            className="hidden md:flex p-1.5 rounded-md hover:bg-sidebar-accent transition-all duration-200"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronLeft className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        </div>

        {/* Search Bar */}
        {!isCollapsed && (
          <div className="px-4 py-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-9 pr-4 py-2 bg-input border border-border rounded-md text-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav
          className="flex-1 px-3 py-2 overflow-y-auto invisible-scrollbar modern-sidebar-nav"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch',
            touchAction: 'pan-y',
          }}
        >
          <ul className="space-y-0.5">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeItem === item.id;

              return (
                <li key={item.id}>
                  <button
                    onClick={() => handleItemClick(item.id)}
                    className={`
                      w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-md text-left transition-all duration-200 group
                      ${isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      }
                      ${isCollapsed ? "justify-center px-2" : ""}
                    `}
                    title={isCollapsed ? item.name : undefined}
                  >
                    <div className="flex items-center justify-center min-w-[24px]">
                      <Icon
                        className={`
                          h-4.5 w-4.5 flex-shrink-0
                          ${isActive
                            ? "text-primary-foreground"
                            : "text-muted-foreground group-hover:text-sidebar-accent-foreground"
                          }
                        `}
                      />
                    </div>

                    {!isCollapsed && (
                      <div className="flex items-center justify-between w-full">
                        <span className={`text-sm ${isActive ? "font-medium" : "font-normal"}`}>{item.name}</span>
                        {item.badge && (
                          <span className={`
                            px-1.5 py-0.5 text-xs font-medium rounded-full
                            ${isActive
                              ? "bg-primary-foreground/20 text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                            }
                          `}>
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Badge for collapsed state */}
                    {isCollapsed && item.badge && (
                      <div className={`absolute top-1 right-1 w-4 h-4 flex items-center justify-center rounded-full border ${isActive ? 'bg-primary-foreground/20 border-primary-foreground/30' : 'bg-primary/20 border-sidebar'}`}>
                        <span className={`text-[10px] font-medium ${isActive ? 'text-primary-foreground' : 'text-primary'}`}>
                          {parseInt(item.badge) > 9 ? '9+' : item.badge}
                        </span>
                      </div>
                    )}

                    {/* Tooltip for collapsed state */}
                    {isCollapsed && (
                      <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 border border-border shadow-md">
                        {item.name}
                        {item.badge && (
                          <span className="ml-1.5 px-1 py-0.5 bg-muted rounded-full text-[10px]">
                            {item.badge}
                          </span>
                        )}
                        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-1.5 h-1.5 bg-popover rotate-45 border-l border-b border-border" />
                      </div>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom section with profile and logout */}
        <div className="mt-auto border-t border-sidebar-border">
          {/* Profile Section */}
          <div className={`border-b border-sidebar-border bg-sidebar-accent/30 ${isCollapsed ? 'py-3 px-2' : 'p-3'}`}>
            {!isCollapsed ? (
              <div className="flex items-center px-3 py-2 rounded-md bg-sidebar hover:bg-sidebar-accent transition-colors duration-200">
                <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                  <span className="text-muted-foreground font-medium text-sm">JD</span>
                </div>
                <div className="flex-1 min-w-0 ml-2.5">
                  <p className="text-sm font-medium text-sidebar-foreground truncate">John Doe</p>
                  <p className="text-xs text-muted-foreground truncate">Senior Administrator</p>
                </div>
                <div className="w-2 h-2 bg-green-500 rounded-full ml-2" title="Online" />
              </div>
            ) : (
              <div className="flex justify-center">
                <div className="relative">
                  <div className="w-9 h-9 bg-muted rounded-full flex items-center justify-center">
                    <span className="text-muted-foreground font-medium text-sm">JD</span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-sidebar" />
                </div>
              </div>
            )}
          </div>

          {/* Logout Button */}
          <div className="p-3">
            <button
              onClick={() => handleItemClick("logout")}
              className={`
                w-full flex items-center rounded-md text-left transition-all duration-200 group
                text-destructive hover:bg-destructive/10 hover:text-destructive
                ${isCollapsed ? "justify-center p-2.5" : "space-x-2.5 px-3 py-2.5"}
              `}
              title={isCollapsed ? "Logout" : undefined}
            >
              <div className="flex items-center justify-center min-w-[24px]">
                <LogOut className="h-4.5 w-4.5 flex-shrink-0 text-destructive group-hover:text-destructive" />
              </div>

              {!isCollapsed && (
                <span className="text-sm">Logout</span>
              )}

              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 border border-border shadow-md">
                  Logout
                  <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-1.5 h-1.5 bg-popover rotate-45 border-l border-b border-border" />
                </div>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div
        className={`
          transition-all duration-300 ease-in-out w-full
          ${isCollapsed ? "md:ml-20" : "md:ml-72"}
        `}
      >
        {/* Your content remains the same */}
        
      </div>
    </>
  );
}