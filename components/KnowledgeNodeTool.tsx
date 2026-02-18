import React, { useState, useEffect } from 'react';
import { Ontology, OntologyProperty } from '../types/ontology';
import { Plus, Save, X } from 'lucide-react';

interface KnowledgeNodeToolProps {
  ontologies: Ontology[];
  initialData?: any;
  mode?: 'create' | 'edit';
  onCreate: (nodeData: any) => void;
  onCancel?: () => void;
}

const KnowledgeNodeTool: React.FC<KnowledgeNodeToolProps> = ({ 
  ontologies, 
  onCreate, 
  initialData, 
  mode = 'create',
  onCancel 
}) => {
  const [selectedOntologyId, setSelectedOntologyId] = useState<string>('');
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedOntology = ontologies.find(o => o.id === selectedOntologyId);

  // 初始化数据回显
  useEffect(() => {
    if (mode === 'edit' && initialData) {
      // 1. 找到对应的本体定义
      const ontology = ontologies.find(o => o.name === initialData.ontologyType);
      if (ontology) {
        setSelectedOntologyId(ontology.id);
        // 2. 填充表单数据
        setFormData({
          label: initialData.label,
          ...initialData.properties
        });
      }
    }
  }, [mode, initialData, ontologies]);

  // 当切换本体类型时（仅在创建模式有效），重置表单并设置默认值
  useEffect(() => {
    if (mode === 'create') {
      if (selectedOntology) {
        const initialData: Record<string, any> = { label: '' };
        selectedOntology.properties?.forEach(prop => {
          if (prop.defaultValue !== undefined) {
            initialData[prop.name] = prop.defaultValue;
          }
        });
        setFormData(initialData);
        setErrors({});
      } else {
        setFormData({});
      }
    }
  }, [selectedOntologyId, mode]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!selectedOntologyId) {
      newErrors.ontology = '请选择本体类型';
    }
    if (!formData.label?.trim()) {
      newErrors.label = '节点名称不能为空';
    }

    selectedOntology?.properties?.forEach(prop => {
      if (prop.required && (formData[prop.name] === undefined || formData[prop.name] === '')) {
        newErrors[prop.name] = `${prop.label}不能为空`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate() && selectedOntology) {
      const nodeData = {
        id: initialData?.id, // 编辑模式保留ID
        label: formData.label,
        type: selectedOntology.type, 
        ontologyType: selectedOntology.name,
        ontologyId: selectedOntology.id,
        properties: { ...formData }
      };
      // 移除通用字段，保留纯属性
      delete nodeData.properties.label;
      
      onCreate(nodeData);
      
      if (mode === 'create') {
        setFormData(prev => ({ ...prev, label: '' })); 
      }
    }
  };

  const renderInput = (prop: OntologyProperty) => {
    const isError = !!errors[prop.name];
    
    switch (prop.type) {
      case 'enum':
        return (
           <select
            className={`w-full border rounded px-3 py-2 text-sm bg-white focus:outline-none focus:border-brand-500 ${isError ? 'border-red-500' : 'border-gray-300'}`}
            value={formData[prop.name] || ''}
            onChange={(e) => handleInputChange(prop.name, e.target.value)}
          >
            <option value="">请选择</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="unknown">Unknown</option>
          </select>
        );
      case 'boolean':
        return (
          <div className="flex items-center">
            <input
              type="checkbox"
              id={`prop-${prop.id}`}
              className="mr-2 h-4 w-4 text-brand-600 focus:ring-brand-500 border-gray-300 rounded"
              checked={formData[prop.name] || false}
              onChange={(e) => handleInputChange(prop.name, e.target.checked)}
            />
            <label htmlFor={`prop-${prop.id}`} className="text-sm text-gray-700">{prop.label}</label>
          </div>
        );
      case 'integer':
      case 'float':
        return (
          <input
            type="number"
            className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:border-brand-500 ${isError ? 'border-red-500' : 'border-gray-300'}`}
            value={formData[prop.name] || ''}
            onChange={(e) => handleInputChange(prop.name, e.target.value)}
            placeholder={`输入${prop.label}`}
            step={prop.type === 'float' ? '0.1' : '1'}
          />
        );
      default: // string and others
        return (
          <input
            type="text"
            className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:border-brand-500 ${isError ? 'border-red-500' : 'border-gray-300'}`}
            value={formData[prop.name] || ''}
            onChange={(e) => handleInputChange(prop.name, e.target.value)}
            placeholder={`输入${prop.label}`}
          />
        );
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-bold text-gray-800">{mode === 'create' ? '创建节点' : '编辑节点'}</h3>
          {mode === 'edit' && onCancel && (
            <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
              <X size={16} />
            </button>
          )}
        </div>
        
        <div className="space-y-4">
          {/* 本体类型选择 */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">本体类型 <span className="text-red-500">*</span></label>
            <select
              className={`w-full border rounded px-3 py-2 text-sm bg-white focus:outline-none focus:border-brand-500 ${errors.ontology ? 'border-red-500' : 'border-gray-300'} ${mode === 'edit' ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
              value={selectedOntologyId}
              onChange={(e) => setSelectedOntologyId(e.target.value)}
              disabled={mode === 'edit'}
            >
              <option value="">请选择本体类型</option>
              {ontologies.map(ont => (
                <option key={ont.id} value={ont.id}>{ont.label} ({ont.name})</option>
              ))}
            </select>
            {errors.ontology && <p className="text-xs text-red-500 mt-1">{errors.ontology}</p>}
          </div>

          {selectedOntology && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-200 space-y-3">
              {/* 通用必填：名称 */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">节点名称 (Label) <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:border-brand-500 ${errors.label ? 'border-red-500' : 'border-gray-300'}`}
                  value={formData.label || ''}
                  onChange={(e) => handleInputChange('label', e.target.value)}
                  placeholder="输入节点显示名称"
                />
                {errors.label && <p className="text-xs text-red-500 mt-1">{errors.label}</p>}
              </div>

              {/* 动态属性 */}
              {selectedOntology.properties?.map(prop => (
                <div key={prop.id}>
                  <label className="block text-xs text-gray-500 mb-1">
                    {prop.label} ({prop.name})
                    {prop.required && <span className="text-red-500"> *</span>}
                  </label>
                  {renderInput(prop)}
                  {errors[prop.name] && <p className="text-xs text-red-500 mt-1">{errors[prop.name]}</p>}
                </div>
              ))}

              <div className="pt-2 flex space-x-2">
                {mode === 'edit' && onCancel && (
                  <button
                    onClick={onCancel}
                    className="flex-1 border border-gray-300 text-gray-700 py-2 rounded text-sm hover:bg-gray-50 transition-colors"
                  >
                    取消
                  </button>
                )}
                <button
                  onClick={handleSubmit}
                  className={`flex-1 bg-brand-600 text-white py-2 rounded text-sm hover:bg-brand-700 transition-colors flex items-center justify-center shadow-sm ${mode === 'create' ? 'w-full' : ''}`}
                >
                  {mode === 'create' ? <><Plus size={16} className="mr-1" /> 添加新节点</> : <><Save size={16} className="mr-1" /> 保存修改</>}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KnowledgeNodeTool;
