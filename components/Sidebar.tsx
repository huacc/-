import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Network, 
  Database, 
  FileText, 
  Cpu, 
  Settings
} from 'lucide-react';
import { NavItem } from '../types/common';

const NAV_ITEMS: NavItem[] = [
  { label: '仪表盘', path: '/', icon: LayoutDashboard },
  { label: '元本体管理', path: '/ontology', icon: Network },
  { label: '知识图谱构建', path: '/knowledge', icon: Database },
  { label: '提示词管理', path: '/prompt', icon: FileText },
  { label: '模型管理', path: '/model', icon: Cpu },
];

const Sidebar: React.FC = () => {
  const location = useLocation();

  return (
    <div className="w-[240px] h-screen bg-sidebar text-white flex flex-col fixed left-0 top-0 z-50 shadow-xl">
      {/* Logo Area */}
      <div className="h-16 flex items-center px-6 border-b border-gray-700/50">
        <div className="w-8 h-8 bg-brand-600 rounded-md flex items-center justify-center mr-3">
          <span className="font-bold text-lg">P</span>
        </div>
        <span className="font-semibold text-lg tracking-wide">心理分析系统</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex items-center px-6 py-3 text-sm transition-colors duration-200 group relative
                ${isActive 
                  ? 'bg-brand-600 text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
                }
              `}
            >
              <item.icon size={18} className={`mr-3 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />
              <span>{item.label}</span>
              {isActive && (
                <div className="absolute right-0 top-0 bottom-0 w-1 bg-brand-400" />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer / Settings */}
      <div className="p-4 border-t border-gray-700/50">
        <button className="flex items-center w-full px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors">
          <Settings size={18} className="mr-3" />
          系统设置
        </button>
      </div>
    </div>
  );
};

export default Sidebar;