
import React, { useState, useEffect } from 'react';
import { Folder, FileText, Search, Play, Copy, Plus, Loader2, AlertCircle } from 'lucide-react';
import StructuredPromptEditor from '../components/StructuredPromptEditor';
import Toast from '../components/Toast';
import { PromptStructure, PromptTemplate, PromptCategory } from '../types/prompt';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { STORAGE_KEYS } from '../constants/storageKeys';
import { MOCK_PROMPT_CATEGORIES, MOCK_PROMPT_TEMPLATES } from '../mocks/promptData';
import { MOCK_MODELS } from '../mocks/modelData';

const Prompt: React.FC = () => {
  const [templates, setTemplates] = useLocalStorage<PromptTemplate[]>(STORAGE_KEYS.PROMPT_TEMPLATES, MOCK_PROMPT_TEMPLATES);
  const [currentTemplateId, setCurrentTemplateId] = useState<string>(templates[0]?.id || '');
  const [title, setTitle] = useState("实体定义生成器");
  
  const currentTemplate = templates.find(t => t.id === currentTemplateId);
  const [structureData, setStructureData] = useState<PromptStructure | undefined>(currentTemplate?.structure);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  // Test Panel State
  const [selectedModelId, setSelectedModelId] = useState<string>(MOCK_MODELS[0]?.id || '');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  useEffect(() => {
    if (currentTemplate) {
      setTitle(currentTemplate.name);
      setStructureData(currentTemplate.structure);
    }
  }, [currentTemplateId, templates]);

  const handleSaveStructure = (newStructure: PromptStructure) => {
    const updatedTemplates = templates.map(t => 
      t.id === currentTemplateId 
        ? { ...t, structure: newStructure, name: title, updatedAt: new Date().toISOString() } 
        : t
    );
    setTemplates(updatedTemplates);
    setToast({ message: '提示词保存成功', type: 'success' });
  };

  const handleTest = async () => {
    setIsTesting(true);
    setTimeout(() => {
      setTestResult('测试结果：AI 响应内容...');
      setIsTesting(false);
      setToast({ message: '测试完成', type: 'success' });
    }, 1500);
  };

  return (
    <div className="flex h-[calc(100vh-140px)] bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden relative">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Left: Category Tree */}
      <div className="w-1/5 border-r border-gray-200 flex flex-col bg-gray-50/50">
        <div className="p-3 border-b border-gray-200 flex justify-between items-center">
          <span className="font-semibold text-gray-700 text-sm">提示词分类</span>
          <button className="p-1 hover:bg-gray-200 rounded text-gray-500"><Plus size={16} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          <div className="flex items-center px-2 py-1.5 text-sm text-gray-700 font-medium hover:bg-gray-100 rounded cursor-pointer">
            <Folder size={16} className="mr-2 text-brand-500 fill-brand-100" /> 本体构建
          </div>
          <div className="pl-6 space-y-1">
             <div className="flex items-center px-2 py-1.5 text-sm text-brand-600 bg-brand-50 rounded cursor-pointer">
               <FileText size={14} className="mr-2" /> {templates[0]?.name || '实体定义生成器'}
             </div>
          </div>
        </div>
      </div>

      {/* Middle: Structured Editor */}
      <div className="w-1/2 flex flex-col bg-white border-r border-gray-200">
        <div className="h-12 border-b border-gray-200 flex items-center justify-between px-4 bg-white flex-shrink-0">
          <div className="flex items-center space-x-2">
             <input 
               className="text-sm font-semibold text-gray-800 border-none focus:ring-0 p-0 w-48 bg-transparent" 
               value={title}
               onChange={(e) => setTitle(e.target.value)}
             />
             <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded">#结构化</span>
          </div>
          <button className="p-1.5 hover:bg-gray-100 rounded text-gray-500" title="Copy">
             <Copy size={16}/>
          </button>
        </div>

        <div className="flex-1 overflow-hidden relative">
          <StructuredPromptEditor 
            initialData={structureData}
            onSave={handleSaveStructure}
          />
        </div>
      </div>

      {/* Right: Test Panel */}
      <div className="w-[30%] flex flex-col bg-white">
        <div className="p-4 border-b border-gray-200">
           <h3 className="font-semibold text-gray-700 text-sm mb-3">提示词测试</h3>
           <div className="space-y-4">
             <select 
               className="w-full border border-gray-300 rounded text-sm p-1.5"
               value={selectedModelId}
               onChange={(e) => setSelectedModelId(e.target.value)}
             >
               {MOCK_MODELS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
             </select>
             <button 
               onClick={handleTest}
               disabled={isTesting}
               className="w-full py-2 bg-green-600 text-white rounded text-sm flex items-center justify-center hover:bg-green-700 disabled:bg-gray-400"
             >
                {isTesting ? <Loader2 size={16} className="animate-spin mr-2"/> : <Play size={16} className="mr-2"/>}
                执行测试
             </button>
           </div>
        </div>
        <div className="flex-1 p-4 bg-gray-50 overflow-y-auto">
           <div className="p-3 bg-white border border-gray-200 rounded text-xs font-mono text-gray-700 min-h-[100px]">
             {testResult || <span className="text-gray-300 flex items-center justify-center h-full"><AlertCircle size={16} className="mr-2"/>准备就绪</span>}
           </div>
        </div>
      </div>
    </div>
  );
};

export default Prompt;
