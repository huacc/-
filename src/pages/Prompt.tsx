
import React, { useState, useEffect } from 'react';
import { Copy, Loader2, AlertCircle, Save, FileText, Play } from 'lucide-react';
import StructuredPromptEditor from '../components/StructuredPromptEditor';
import PromptCategoryTree from '../components/prompt/PromptCategoryTree';
import Toast from '../components/Toast';
import { PromptStructure, PromptTemplate, PromptCategory } from '../types/prompt';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { STORAGE_KEYS } from '../constants/storageKeys';
import { MOCK_PROMPT_CATEGORIES, MOCK_PROMPT_TEMPLATES } from '../mocks/promptData';
import { MOCK_MODELS } from '../mocks/modelData';

const Prompt: React.FC = () => {
  // --- Data Persistence ---
  const [templates, setTemplates] = useLocalStorage<PromptTemplate[]>(STORAGE_KEYS.PROMPT_TEMPLATES, MOCK_PROMPT_TEMPLATES);
  const [categories, setCategories] = useLocalStorage<PromptCategory[]>(STORAGE_KEYS.PROMPT_CATEGORIES, MOCK_PROMPT_CATEGORIES);
  
  // --- UI State ---
  const [currentTemplateId, setCurrentTemplateId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  // Initialize selection if needed
  useEffect(() => {
    if (!currentTemplateId && templates.length > 0) {
      setCurrentTemplateId(templates[0].id);
    }
  }, [templates.length]); // Only run if templates array length changes from 0 to 1

  // Derived Data
  const currentTemplate = templates.find(t => t.id === currentTemplateId);
  const [editingTitle, setEditingTitle] = useState('');

  // --- Test Panel State ---
  const [selectedModelId, setSelectedModelId] = useState<string>(MOCK_MODELS[0]?.id || '');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  // Sync title when template changes
  useEffect(() => {
    if (currentTemplate) {
      setEditingTitle(currentTemplate.name);
    } else {
      setEditingTitle('');
    }
  }, [currentTemplateId, templates]);

  // --- CRUD Handlers ---

  // 1. Save Structure (from Editor)
  const handleSaveStructure = (newStructure: PromptStructure) => {
    if (!currentTemplateId) return;

    const updatedTemplates = templates.map(t => 
      t.id === currentTemplateId 
        ? { 
            ...t, 
            structure: newStructure, 
            name: editingTitle, // Also save title if changed in header
            updatedAt: new Date().toISOString() 
          } 
        : t
    );
    setTemplates(updatedTemplates);
    setToast({ message: '提示词保存成功', type: 'success' });
  };

  // 2. Rename Template
  const handleRenameTemplate = (id: string, newName: string) => {
    const updatedTemplates = templates.map(t => 
      t.id === id ? { ...t, name: newName, updatedAt: new Date().toISOString() } : t
    );
    setTemplates(updatedTemplates);
    setToast({ message: '提示词重命名成功', type: 'success' });
  };

  // 3. Rename Category
  const handleRenameCategory = (id: string, newName: string) => {
    const updateCat = (cats: PromptCategory[]): PromptCategory[] => {
      return cats.map(cat => {
        if (cat.id === id) {
          return { ...cat, name: newName };
        }
        if (cat.children) {
          return { ...cat, children: updateCat(cat.children) };
        }
        return cat;
      });
    };
    setCategories(updateCat(categories));
    setToast({ message: '分类重命名成功', type: 'success' });
  };

  // 4. Add Category
  const handleAddCategory = (parentId?: string) => {
    const name = window.prompt('请输入分类名称:', '新分类');
    if (!name) return;

    const newCategory: PromptCategory = {
      id: `cat_${Date.now()}`,
      name,
      children: []
    };

    if (!parentId) {
      setCategories([...categories, newCategory]);
    } else {
      const addSubCat = (cats: PromptCategory[]): PromptCategory[] => {
        return cats.map(cat => {
          if (cat.id === parentId) {
            return { ...cat, children: [...(cat.children || []), newCategory] };
          }
          if (cat.children) {
            return { ...cat, children: addSubCat(cat.children) };
          }
          return cat;
        });
      };
      setCategories(addSubCat(categories));
    }
    setToast({ message: '分类创建成功', type: 'success' });
  };

  // 5. Delete Category
  const handleDeleteCategory = (id: string) => {
    const deleteCat = (cats: PromptCategory[]): PromptCategory[] => {
      return cats.filter(c => c.id !== id).map(c => ({
        ...c,
        children: c.children ? deleteCat(c.children) : []
      }));
    };
    // WARNING: This assumes templates are filtered by categoryId in the UI. 
    // Real app might need to check for orphaned templates.
    setCategories(deleteCat(categories));
    setToast({ message: '分类已删除', type: 'success' });
  };

  // 6. Add Template
  const handleAddTemplate = (categoryId: string) => {
    const name = window.prompt('请输入提示词名称:', '新提示词');
    if (!name) return;

    const newTemplate: PromptTemplate = {
      id: `tpl_${Date.now()}`,
      name,
      categoryId,
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      structure: { 
        type: 'knowledge_extraction', // Default type
        role: { identity: '', expertise: [], capabilities: [], example: '' },
        logic: { principles: '', method: '', constraints: [], example: '' },
        workflow: [],
        quality: { checkpoints: [], avoidance: [] },
        variables: []
      }
    };

    setTemplates([...templates, newTemplate]);
    setCurrentTemplateId(newTemplate.id);
    setToast({ message: '提示词创建成功', type: 'success' });
  };

  // 7. Delete Template
  const handleDeleteTemplate = (id: string) => {
    setTemplates(templates.filter(t => t.id !== id));
    if (currentTemplateId === id) {
      setCurrentTemplateId(null);
    }
    setToast({ message: '提示词已删除', type: 'success' });
  };

  const handleTest = async () => {
    setIsTesting(true);
    setTimeout(() => {
      setTestResult('测试结果：AI 响应内容...\n\n(此处为 Mock 数据，Phase 4 将接入真实 LLM)');
      setIsTesting(false);
      setToast({ message: '测试完成', type: 'success' });
    }, 1500);
  };

  return (
    <div className="flex h-[calc(100vh-140px)] bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden relative">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Left: Category Tree */}
      <div className="w-1/5 min-w-[240px] border-r border-gray-200 flex flex-col bg-gray-50/50">
        <PromptCategoryTree
          categories={categories}
          templates={templates}
          selectedTemplateId={currentTemplateId}
          onSelectTemplate={setCurrentTemplateId}
          onAddCategory={handleAddCategory}
          onDeleteCategory={handleDeleteCategory}
          onRenameCategory={handleRenameCategory}
          onAddTemplate={handleAddTemplate}
          onDeleteTemplate={handleDeleteTemplate}
          onRenameTemplate={handleRenameTemplate}
        />
      </div>

      {/* Middle: Structured Editor */}
      <div className="flex-1 flex flex-col bg-white border-r border-gray-200 min-w-[500px]">
        {currentTemplate ? (
          <>
            <div className="h-14 border-b border-gray-200 flex items-center justify-between px-6 bg-white flex-shrink-0">
              <div className="flex items-center space-x-2 flex-1">
                 <input 
                   className="text-lg font-bold text-gray-800 border-none focus:ring-0 p-0 bg-transparent w-full focus:outline-none placeholder-gray-400" 
                   value={editingTitle}
                   onChange={(e) => setEditingTitle(e.target.value)}
                   onBlur={() => {
                     // Auto-save title on blur if changed
                     if (editingTitle !== currentTemplate.name) {
                       handleRenameTemplate(currentTemplate.id, editingTitle);
                     }
                   }}
                   placeholder="请输入提示词名称"
                 />
              </div>
              <div className="flex space-x-2">
                <span className="bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded-md font-mono">
                  ID: {currentTemplate.id.slice(-6)}
                </span>
              </div>
            </div>

            <div className="flex-1 overflow-hidden relative">
              <StructuredPromptEditor 
                key={currentTemplate.id} // Important: Force remount when switching templates
                initialData={currentTemplate.structure}
                onSave={handleSaveStructure}
              />
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <FileText size={48} className="mb-4 opacity-20" />
            <p>请在左侧选择或创建一个提示词</p>
          </div>
        )}
      </div>

      {/* Right: Test Panel */}
      <div className="w-[30%] min-w-[300px] flex flex-col bg-white">
        <div className="p-4 border-b border-gray-200">
           <h3 className="font-semibold text-gray-700 text-sm mb-3">提示词测试</h3>
           <div className="space-y-4">
             <div>
               <label className="block text-xs font-medium text-gray-500 mb-1">选择模型</label>
               <select 
                 className="w-full border border-gray-300 rounded-md text-sm p-2 focus:ring-brand-500 focus:border-brand-500"
                 value={selectedModelId}
                 onChange={(e) => setSelectedModelId(e.target.value)}
               >
                 {MOCK_MODELS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
               </select>
             </div>
             
             <button 
               onClick={handleTest}
               disabled={isTesting || !currentTemplate}
               className="w-full py-2 bg-green-600 text-white rounded-md text-sm flex items-center justify-center hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-sm"
             >
                {isTesting ? <Loader2 size={16} className="animate-spin mr-2"/> : <Play size={16} className="mr-2"/>}
                执行测试
             </button>
           </div>
        </div>
        <div className="flex-1 p-4 bg-gray-50 overflow-y-auto">
           <div className="p-4 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 min-h-[200px] shadow-sm whitespace-pre-wrap font-mono leading-relaxed">
             {testResult || <span className="text-gray-400 flex flex-col items-center justify-center h-32"><AlertCircle size={24} className="mb-2 opacity-50"/>准备就绪</span>}
           </div>
        </div>
      </div>
    </div>
  );
};

export default Prompt;
