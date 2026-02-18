import React, { useState, useMemo, useEffect } from 'react';
import { Cpu, Activity, Settings, BarChart2, MoreHorizontal, RefreshCw, Search, X, Filter, Inbox, Plus, Trash2 } from 'lucide-react';
import { MOCK_MODELS } from '../mocks/modelData';
import { Model, ModelStatus } from '../types/model';
import { useDebounce } from '../hooks/useDebounce';
import ModelConfigModal, { ModelFormData } from '../components/ModelConfigModal';
import Toast, { ToastProps } from '../components/Toast';

/**
 * 状态标签组件
 */
const StatusBadge: React.FC<{ status: ModelStatus }> = ({ status }) => {
  const styles = {
    normal: 'bg-green-50 text-green-600 border-green-200',
    error: 'bg-red-50 text-red-600 border-red-200',
    maintenance: 'bg-yellow-50 text-yellow-600 border-yellow-200',
  };

  const labels = {
    normal: '正常',
    error: '异常',
    maintenance: '维护中',
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status]}`}>
      {labels[status]}
    </span>
  );
};

/**
 * 提供商图标占位组件 (首字母)
 */
const ProviderIcon: React.FC<{ provider: string }> = ({ provider }) => {
  // 根据提供商名称生成确定的颜色，提升视觉区分度
  const colors = [
    'bg-blue-100 text-blue-600',
    'bg-purple-100 text-purple-600',
    'bg-green-100 text-green-600',
    'bg-orange-100 text-orange-600',
    'bg-indigo-100 text-indigo-600',
    'bg-pink-100 text-pink-600',
  ];
  const colorIndex = provider.length % colors.length;
  const colorClass = colors[colorIndex];

  return (
    <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg ${colorClass}`}>
      {provider.charAt(0).toUpperCase()}
    </div>
  );
};

const Model: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'list' | 'policy' | 'monitor'>('list');
  
  // 初始化模型数据：优先从 localStorage 读取，否则使用 Mock 数据
  const [models, setModels] = useState<Model[]>(() => {
    const saved = localStorage.getItem('models');
    if (saved) {
      return JSON.parse(saved);
    }
    // 首次加载，写入 Mock 数据到 localStorage
    localStorage.setItem('models', JSON.stringify(MOCK_MODELS));
    return MOCK_MODELS;
  });

  // 搜索和过滤状态
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ModelStatus>('all');
  
  // Modal 状态
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  
  // Toast 状态
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  // 防抖搜索词 (300ms)
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // 监听模型数据变化，持久化到 localStorage
  useEffect(() => {
    localStorage.setItem('models', JSON.stringify(models));
  }, [models]);

  // 计算各状态的数量 (用于过滤器显示)
  const statusCounts = useMemo(() => {
    const counts = {
      all: models.length,
      normal: 0,
      error: 0,
      maintenance: 0,
    };
    models.forEach((model) => {
      if (counts[model.status] !== undefined) {
        counts[model.status]++;
      }
    });
    return counts;
  }, [models]);

  // 计算过滤后的模型列表
  const filteredModels = useMemo(() => {
    return models.filter((model) => {
      // 1. 状态过滤
      if (statusFilter !== 'all' && model.status !== statusFilter) {
        return false;
      }

      // 2. 关键词搜索 (名称 或 提供商)
      if (debouncedSearchQuery) {
        const query = debouncedSearchQuery.toLowerCase();
        const matchName = model.name.toLowerCase().includes(query);
        const matchProvider = model.provider.toLowerCase().includes(query);
        return matchName || matchProvider;
      }

      return true;
    });
  }, [models, statusFilter, debouncedSearchQuery]);

  // 打开创建 Modal
  const openCreateModal = () => {
    setModalMode('create');
    setSelectedModel(null);
    setIsConfigModalOpen(true);
  };

  // 打开编辑 Modal
  const openEditModal = (model: Model) => {
    setModalMode('edit');
    setSelectedModel(model);
    setIsConfigModalOpen(true);
  };

  // 处理删除模型
  const handleDeleteModel = (modelId: string, modelName: string) => {
    if (window.confirm(`确定要删除模型 "${modelName}" 吗？此操作不可恢复。`)) {
      setModels(prev => prev.filter(m => m.id !== modelId));
      setToast({ message: '模型已删除', type: 'success' });
    }
  };

  // 处理保存（创建或更新）
  const handleSaveModel = (data: ModelFormData) => {
    if (modalMode === 'create') {
      const newModel: Model = {
        id: Date.now().toString(), // 简单生成唯一ID
        name: data.name,
        provider: data.provider,
        version: data.version,
        type: data.type,
        status: 'normal', // 默认为正常状态
        successRate: 0,   // 新模型初始数据
        avgLatency: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        // 存储详细配置
        ...data
      };
      setModels(prev => [newModel, ...prev]);
      setToast({ message: '模型创建成功', type: 'success' });
    } else if (modalMode === 'edit' && selectedModel) {
      setModels(prev => prev.map(m => {
        if (m.id === selectedModel.id) {
          return {
            ...m,
            ...data, // 更新表单数据
            updatedAt: new Date().toISOString()
          };
        }
        return m;
      }));
      setToast({ message: '模型更新成功', type: 'success' });
    }
    
    setIsConfigModalOpen(false);
  };

  // 将 Model 对象转换为 Form 数据
  const getInitialFormData = (): ModelFormData | null => {
    if (!selectedModel) return null;
    return {
      name: selectedModel.name,
      provider: selectedModel.provider,
      version: selectedModel.version,
      type: selectedModel.type,
      apiEndpoint: selectedModel.apiEndpoint || '',
      apiKey: selectedModel.apiKey || '',
      organizationId: selectedModel.organizationId,
      timeout: selectedModel.timeout || 60,
      maxTokens: selectedModel.maxTokens || 4096,
      temperature: selectedModel.temperature || 0.7,
      topP: selectedModel.topP || 1,
      rpmLimit: selectedModel.rpmLimit,
      dailyRequestLimit: selectedModel.dailyRequestLimit,
      costBudget: selectedModel.costBudget,
    };
  };

  return (
    <div className="flex flex-col space-y-6 h-full relative">
      {/* Toast 提示 */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* 顶部操作区 & Tab 导航 */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-4 rounded-lg shadow-sm border border-gray-200 gap-4">
        {/* 左侧 Tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-md">
          <button
            onClick={() => setActiveTab('list')}
            className={`px-4 py-2 rounded-md text-sm font-medium flex items-center transition-all ${
              activeTab === 'list' ? 'bg-white text-brand-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Cpu size={16} className="mr-2" /> 模型列表
          </button>
          <button
            onClick={() => setActiveTab('policy')}
            className={`px-4 py-2 rounded-md text-sm font-medium flex items-center transition-all ${
              activeTab === 'policy' ? 'bg-white text-brand-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Settings size={16} className="mr-2" /> 调度策略
          </button>
          <button
            onClick={() => setActiveTab('monitor')}
            className={`px-4 py-2 rounded-md text-sm font-medium flex items-center transition-all ${
              activeTab === 'monitor' ? 'bg-white text-brand-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Activity size={16} className="mr-2" /> 性能监控
          </button>
        </div>
        
        {/* 右侧搜索和过滤工具栏 */}
        {activeTab === 'list' && (
          <div className="flex items-center space-x-3 w-full md:w-auto">
            {/* 状态过滤器 */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Filter size={14} />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | ModelStatus)}
                className="pl-9 pr-8 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white appearance-none hover:border-gray-400 transition-colors cursor-pointer min-w-[140px]"
              >
                <option value="all">全部状态 ({statusCounts.all})</option>
                <option value="normal">正常 ({statusCounts.normal})</option>
                <option value="error">异常 ({statusCounts.error})</option>
                <option value="maintenance">维护中 ({statusCounts.maintenance})</option>
              </select>
              {/* 自定义下拉箭头 */}
              <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none text-gray-400">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* 搜索框 */}
            <div className="relative flex-1 md:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Search size={16} />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索模型或提供商..."
                className="w-full pl-10 pr-8 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent placeholder-gray-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-2 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* 新建模型按钮 */}
            <button
              onClick={openCreateModal}
              className="flex items-center px-4 py-2 bg-brand-600 text-white rounded-md text-sm font-medium hover:bg-brand-700 transition-colors shadow-sm whitespace-nowrap"
            >
              <Plus size={16} className="mr-2" /> 新建模型
            </button>
          </div>
        )}
      </div>

      {/* 内容区域 */}
      <div className="flex-1">
        {activeTab === 'list' && (
          <>
            {filteredModels.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredModels.map((model) => (
                  <div key={model.id} className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col justify-between h-48 group">
                    {/* 卡片头部 */}
                    <div className="flex justify-between items-start">
                      <div className="flex items-start space-x-3">
                        <ProviderIcon provider={model.provider} />
                        <div>
                          <h3 className="font-semibold text-gray-800 text-base leading-tight">{model.name}</h3>
                          <p className="text-xs text-gray-500 mt-1">{model.provider}</p>
                        </div>
                      </div>
                      <StatusBadge status={model.status} />
                    </div>

                    {/* 卡片中间信息 */}
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">版本</span>
                        <span className="text-gray-700 font-mono bg-gray-50 px-2 py-0.5 rounded text-xs truncate max-w-[140px]" title={model.version}>{model.version}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">类型</span>
                        <span className="text-gray-700 bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs">{model.type}</span>
                      </div>
                    </div>

                    {/* 卡片底部指标与操作 */}
                    <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
                      <div className="flex space-x-4 text-xs">
                        <div className="flex flex-col">
                          <span className="text-gray-400 scale-90 origin-left">成功率</span>
                          <span className={`font-medium ${model.successRate > 98 ? 'text-green-600' : 'text-yellow-600'}`}>
                            {model.successRate}%
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-gray-400 scale-90 origin-left">平均响应</span>
                          <span className="text-gray-700 font-medium">{model.avgLatency}s</span>
                        </div>
                      </div>
                      
                      <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          className="p-1.5 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded transition-colors" 
                          title="测试连接"
                        >
                          <RefreshCw size={14} />
                        </button>
                        <button 
                          onClick={() => openEditModal(model)}
                          className="p-1.5 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded transition-colors" 
                          title="配置"
                        >
                          <Settings size={14} />
                        </button>
                        <button 
                          onClick={() => handleDeleteModel(model.id, model.name)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" 
                          title="删除"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // 空状态展示
              <div className="flex flex-col items-center justify-center h-64 bg-white rounded-lg border border-gray-200 border-dashed">
                <div className="p-4 bg-gray-50 rounded-full mb-3">
                  <Inbox size={32} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">未找到匹配的模型</h3>
                <p className="text-gray-500 mt-1">尝试调整搜索关键词或过滤器</p>
                <button 
                  onClick={() => { setSearchQuery(''); setStatusFilter('all'); }}
                  className="mt-4 text-brand-600 hover:text-brand-700 font-medium text-sm"
                >
                  清除所有筛选
                </button>
              </div>
            )}
          </>
        )}

        {activeTab === 'monitor' && (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 flex flex-col items-center justify-center h-96">
            <BarChart2 size={48} className="text-gray-300 mb-4" />
            <p className="text-gray-400">性能监控图表区域 (ECharts/Recharts)</p>
          </div>
        )}
        
        {activeTab === 'policy' && (
           <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 flex flex-col items-center justify-center h-96">
             <Settings size={48} className="text-gray-300 mb-4" />
             <p className="text-gray-400">调度策略配置区域</p>
           </div>
        )}
      </div>

      {/* 模型配置 Modal */}
      <ModelConfigModal 
        isOpen={isConfigModalOpen} 
        mode={modalMode}
        initialData={getInitialFormData()}
        onClose={() => setIsConfigModalOpen(false)} 
        onSave={handleSaveModel} 
      />
    </div>
  );
};

export default Model;
