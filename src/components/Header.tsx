
import React from 'react';
import { Bell, ChevronRight } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const Header: React.FC = () => {
  const location = useLocation();

  const getBreadcrumb = () => {
    const path = location.pathname;
    if (path === '/') return '仪表盘';
    if (path.includes('ontology')) return '元本体管理';
    if (path.includes('knowledge')) return '知识图谱构建';
    if (path.includes('prompt')) return '提示词管理';
    if (path.includes('model')) return '模型管理';
    return 'Unknown';
  };

  return (
    <header className="h-16 bg-white shadow-sm flex items-center justify-between px-6 sticky top-0 z-40">
      <div className="flex items-center text-sm text-gray-500">
        <span className="hover:text-brand-600 cursor-pointer transition-colors">首页</span>
        <ChevronRight size={14} className="mx-2" />
        <span className="font-medium text-gray-800">{getBreadcrumb()}</span>
      </div>

      <div className="flex items-center space-x-4">
        <button className="p-2 text-gray-400 hover:text-brand-600 transition-colors relative">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
        </button>
        
        <div className="h-6 w-px bg-gray-200 mx-2"></div>
        
        <div className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
          <div className="w-8 h-8 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center font-medium mr-3">
            A
          </div>
          <span className="text-sm font-medium text-gray-700">Admin</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
