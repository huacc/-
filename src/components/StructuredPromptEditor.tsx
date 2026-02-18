
import React, { useState, useEffect } from 'react';
import { Save, ChevronDown } from 'lucide-react';
import { PromptStructure, PromptType } from '../types/prompt';
import RoleTab from './prompt/RoleTab';
import LogicTab from './prompt/LogicTab';

interface StructuredPromptEditorProps {
  initialData?: PromptStructure;
  onSave: (data: PromptStructure) => void;
  isDirty?: boolean;
}

const TABS = [
  { id: 'role', label: '角色定义' },
  { id: 'logic', label: '分析逻辑' },
  { id: 'workflow', label: '工作流程' },
  { id: 'quality', label: '质量控制' },
  { id: 'variables', label: '变量定义' },
  { id: 'preview', label: '原始预览' },
];

const PROMPT_TYPES: { value: PromptType; label: string }[] = [
  { value: 'knowledge_extraction', label: '知识提取型' },
  { value: 'ontology_modeling', label: '本体建模型' },
  { value: 'query_analysis', label: '查询分析型' },
  { value: 'custom', label: '通用自定义' },
];

/**
 * 结构化提示词编辑器
 * 包含：顶部类型选择、中间 Tab 切换区域、底部保存栏
 */
const StructuredPromptEditor: React.FC<StructuredPromptEditorProps> = ({ 
  initialData, 
  onSave,
  isDirty: externalIsDirty = false
}) => {
  const [activeTab, setActiveTab] = useState('role');
  
  // 默认空数据结构
  const defaultData: PromptStructure = {
    type: 'knowledge_extraction',
    role: { identity: '', expertise: [], capabilities: [], example: '' },
    logic: { principles: '', method: '', constraints: [], example: '' },
    workflow: [],
    quality: { checkpoints: [], avoidance: [] },
    variables: []
  };

  const [data, setData] = useState<PromptStructure>(initialData || defaultData);
  const [internalIsDirty, setInternalIsDirty] = useState(false);
  
  const isDirty = externalIsDirty || internalIsDirty;

  useEffect(() => {
    if (initialData) {
      setData(initialData);
      setInternalIsDirty(false);
    }
  }, [initialData]);

  const handleTypeChange = (type: PromptType) => {
    setData(prev => ({ ...prev, type }));
    setInternalIsDirty(true);
  };

  const handleRoleChange = (newRoleData: PromptStructure['role']) => {
    setData(prev => ({ ...prev, role: newRoleData }));
    setInternalIsDirty(true);
  };

  const handleLogicChange = (newLogicData: PromptStructure['logic']) => {
    setData(prev => ({ ...prev, logic: newLogicData }));
    setInternalIsDirty(true);
  };

  const handleSave = () => {
    onSave(data);
    setInternalIsDirty(false);
  };

  // Ctrl+S 快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [data]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'role':
        return <RoleTab data={data.role} onChange={handleRoleChange} />;
      case 'logic':
        return <LogicTab data={data.logic} onChange={handleLogicChange} />;
      default:
        return (
          <div className="p-8 border-2 border-dashed border-gray-200 rounded-lg text-center h-full flex flex-col justify-center items-center">
            <p className="text-lg font-medium text-gray-500 mb-2">Tab: {TABS.find(t => t.id === activeTab)?.label}</p>
            <p className="text-sm text-gray-400">此区域将在后续任务中实现具体表单控件</p>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* 顶部：类型选择器 */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">提示词类型</label>
          <div className="relative inline-block w-48">
            <select
              value={data.type}
              onChange={(e) => handleTypeChange(e.target.value as PromptType)}
              className="block w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 cursor-pointer"
            >
              {PROMPT_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <ChevronDown size={14} className="text-gray-500" />
            </div>
          </div>
          <span className="text-xs text-gray-400">
            * 不同类型将提供不同的默认结构和优化策略
          </span>
        </div>
      </div>

      {/* 中间：Tab 导航 */}
      <div className="flex border-b border-gray-200 px-6">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              px-4 py-3 text-sm font-medium border-b-2 transition-colors
              ${activeTab === tab.id 
                ? 'border-brand-600 text-brand-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 中间：内容区域 */}
      <div className="flex-1 overflow-y-auto p-6 bg-gray-50/30">
        {renderTabContent()}
      </div>

      {/* 底部：保存栏 */}
      <div className="px-6 py-3 border-t border-gray-200 bg-white flex justify-between items-center">
        <div className="flex items-center space-x-2">
          {isDirty ? (
            <>
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
              <span className="text-sm text-gray-600">未保存*</span>
            </>
          ) : (
            <>
              <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
              <span className="text-sm text-gray-600">已保存</span>
            </>
          )}
        </div>
        <button
          onClick={handleSave}
          className="flex items-center px-4 py-2 bg-brand-600 text-white rounded-md hover:bg-brand-700 transition-colors shadow-sm text-sm font-medium"
        >
          <Save size={16} className="mr-2" />
          保存 (Ctrl+S)
        </button>
      </div>
    </div>
  );
};

export default StructuredPromptEditor;
