import React, { useState, useEffect } from 'react';
import { Save, X, Plus, Trash2, HelpCircle } from 'lucide-react';
import { Ontology, OntologyProperty, OntologyRelation, OntologyCategory, OntologyType } from '../types/ontology';

interface OntologyFormProps {
  initialData?: Ontology | null;
  categories: OntologyCategory[]; // Pass root categories
  ontologyList: Ontology[]; // For relation target selection
  onSave: (data: Ontology) => void;
  onCancel: () => void;
}

// Helper to flatten categories for the select dropdown
const flattenCategories = (categories: OntologyCategory[], level = 0): { id: string, name: string, level: number }[] => {
  let flat: { id: string, name: string, level: number }[] = [];
  categories.forEach(cat => {
    flat.push({ id: cat.id, name: cat.name, level });
    if (cat.children) {
      flat = flat.concat(flattenCategories(cat.children, level + 1));
    }
  });
  return flat;
};

const OntologyForm: React.FC<OntologyFormProps> = ({ initialData, categories, ontologyList, onSave, onCancel }) => {
  // Form State
  const [basicInfo, setBasicInfo] = useState<{
    name: string;
    label: string;
    type: OntologyType;
    categoryId: string;
    description: string;
  }>({
    name: '',
    label: '',
    type: 'Entity',
    categoryId: '',
    description: ''
  });

  const [properties, setProperties] = useState<OntologyProperty[]>([]);
  const [relations, setRelations] = useState<OntologyRelation[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const flatCategories = flattenCategories(categories);

  // Load initial data
  useEffect(() => {
    if (initialData) {
      setBasicInfo({
        name: initialData.name,
        label: initialData.label,
        type: initialData.type,
        categoryId: initialData.categoryId,
        description: initialData.description || ''
      });
      setProperties(initialData.properties || []);
      setRelations(initialData.relations || []);
    }
  }, [initialData]);

  // Handlers
  const handleBasicChange = (field: string, value: string) => {
    setBasicInfo(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const addProperty = () => {
    const newProp: OntologyProperty = {
      id: Date.now().toString(),
      name: '',
      label: '',
      type: 'string',
      required: false,
      description: ''
    };
    setProperties([...properties, newProp]);
  };

  const updateProperty = (id: string, field: keyof OntologyProperty, value: any) => {
    setProperties(properties.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const removeProperty = (id: string) => {
    setProperties(properties.filter(p => p.id !== id));
  };

  const addRelation = () => {
    const newRel: OntologyRelation = {
      id: Date.now().toString(),
      name: '',
      targetId: '',
      type: '1:1',
      description: ''
    };
    setRelations([...relations, newRel]);
  };

  const updateRelation = (id: string, field: keyof OntologyRelation, value: any) => {
    setRelations(relations.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const removeRelation = (id: string) => {
    setRelations(relations.filter(r => r.id !== id));
  };

  const handleSubmit = () => {
    // Validation
    const newErrors: Record<string, string> = {};
    if (!basicInfo.name.trim()) newErrors.name = '英文标识不能为空';
    if (!basicInfo.label.trim()) newErrors.label = '显示名称不能为空';
    if (!basicInfo.categoryId) newErrors.categoryId = '请选择所属分类';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const finalData: Ontology = {
      id: initialData?.id || Date.now().toString(),
      ...basicInfo,
      properties,
      relations,
      createdAt: initialData?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSave(finalData);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">
          {initialData ? '编辑本体' : '新建本体'}
        </h2>
        <div className="flex space-x-3">
          <button onClick={onCancel} className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 text-sm">
            取消
          </button>
          <button onClick={handleSubmit} className="px-4 py-2 bg-brand-600 text-white rounded hover:bg-brand-700 text-sm flex items-center shadow-sm">
            <Save size={16} className="mr-2" /> 保存
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        
        {/* Section 1: Basic Info */}
        <section>
          <h3 className="text-sm font-bold text-gray-800 mb-4 border-l-4 border-brand-500 pl-2">基本信息</h3>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-gray-600 mb-1">英文标识 (Name) <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                value={basicInfo.name}
                onChange={(e) => handleBasicChange('name', e.target.value)}
                placeholder="如: Person"
                className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:border-brand-500 ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">显示名称 (Label) <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                value={basicInfo.label}
                onChange={(e) => handleBasicChange('label', e.target.value)}
                placeholder="如: 人物"
                className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:border-brand-500 ${errors.label ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.label && <p className="text-xs text-red-500 mt-1">{errors.label}</p>}
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">本体类型</label>
              <select 
                value={basicInfo.type}
                onChange={(e) => handleBasicChange('type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-brand-500"
              >
                <option value="Entity">Entity (实体)</option>
                <option value="Event">Event (事件)</option>
                <option value="State">State (状态)</option>
                <option value="Attribute">Attribute (属性)</option>
                <option value="Observable">Observable (可观察)</option>
                <option value="ModelConcept">ModelConcept (概念)</option>
                <option value="Rule">Rule (规则)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">所属分类 <span className="text-red-500">*</span></label>
              <select 
                value={basicInfo.categoryId}
                onChange={(e) => handleBasicChange('categoryId', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:border-brand-500 ${errors.categoryId ? 'border-red-500' : 'border-gray-300'}`}
              >
                <option value="">请选择分类</option>
                {flatCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {'\u00A0'.repeat(cat.level * 4)}{cat.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && <p className="text-xs text-red-500 mt-1">{errors.categoryId}</p>}
            </div>
            <div className="col-span-2">
              <label className="block text-sm text-gray-600 mb-1">描述</label>
              <textarea 
                value={basicInfo.description}
                onChange={(e) => handleBasicChange('description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>
        </section>

        {/* Section 2: Properties */}
        <section>
          <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-2">
            <h3 className="text-sm font-bold text-gray-800 border-l-4 border-brand-500 pl-2">属性定义</h3>
            <button onClick={addProperty} className="text-brand-600 hover:text-brand-700 text-sm font-medium flex items-center">
              <Plus size={16} className="mr-1" /> 添加属性
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 bg-gray-50 uppercase">
                <tr>
                  <th className="px-4 py-3 rounded-l-md w-1/5">属性标识 (Name)</th>
                  <th className="px-4 py-3 w-1/5">显示名 (Label)</th>
                  <th className="px-4 py-3 w-1/6">类型</th>
                  <th className="px-4 py-3 w-20 text-center">必填</th>
                  <th className="px-4 py-3 w-1/5">默认值</th>
                  <th className="px-4 py-3 rounded-r-md w-16 text-center">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {properties.map((prop) => (
                  <tr key={prop.id} className="hover:bg-gray-50 group">
                    <td className="px-2 py-2">
                      <input 
                        type="text" 
                        value={prop.name}
                        onChange={(e) => updateProperty(prop.id, 'name', e.target.value)}
                        placeholder="age"
                        className="w-full px-2 py-1.5 border border-gray-200 rounded focus:border-brand-500 focus:outline-none"
                      />
                    </td>
                    <td className="px-2 py-2">
                      <input 
                        type="text" 
                        value={prop.label}
                        onChange={(e) => updateProperty(prop.id, 'label', e.target.value)}
                        placeholder="年龄"
                        className="w-full px-2 py-1.5 border border-gray-200 rounded focus:border-brand-500 focus:outline-none"
                      />
                    </td>
                    <td className="px-2 py-2">
                      <select 
                        value={prop.type}
                        onChange={(e) => updateProperty(prop.id, 'type', e.target.value)}
                        className="w-full px-2 py-1.5 border border-gray-200 rounded focus:border-brand-500 focus:outline-none"
                      >
                        <option value="string">String</option>
                        <option value="integer">Integer</option>
                        <option value="float">Float</option>
                        <option value="boolean">Boolean</option>
                        <option value="date">Date</option>
                        <option value="datetime">DateTime</option>
                        <option value="enum">Enum</option>
                        <option value="array">Array</option>
                      </select>
                    </td>
                    <td className="px-2 py-2 text-center">
                      <input 
                        type="checkbox" 
                        checked={prop.required}
                        onChange={(e) => updateProperty(prop.id, 'required', e.target.checked)}
                        className="rounded text-brand-600 focus:ring-brand-500"
                      />
                    </td>
                    <td className="px-2 py-2">
                      <input 
                        type="text" 
                        value={prop.defaultValue || ''}
                        onChange={(e) => updateProperty(prop.id, 'defaultValue', e.target.value)}
                        className="w-full px-2 py-1.5 border border-gray-200 rounded focus:border-brand-500 focus:outline-none"
                      />
                    </td>
                    <td className="px-2 py-2 text-center">
                      <button onClick={() => removeProperty(prop.id)} className="text-gray-400 hover:text-red-500 p-1">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                {properties.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-400 text-sm border-dashed border border-gray-200 rounded-md mt-2">
                      暂无属性定义，点击上方按钮添加
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 3: Relations */}
        <section>
          <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-2">
            <h3 className="text-sm font-bold text-gray-800 border-l-4 border-brand-500 pl-2">关系定义</h3>
            <button onClick={addRelation} className="text-brand-600 hover:text-brand-700 text-sm font-medium flex items-center">
              <Plus size={16} className="mr-1" /> 添加关系
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 bg-gray-50 uppercase">
                <tr>
                  <th className="px-4 py-3 rounded-l-md w-1/4">关系标识 (Name)</th>
                  <th className="px-4 py-3 w-1/4">目标本体 (Target)</th>
                  <th className="px-4 py-3 w-1/6">基数 (Type)</th>
                  <th className="px-4 py-3 w-1/4">描述</th>
                  <th className="px-4 py-3 rounded-r-md w-16 text-center">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {relations.map((rel) => (
                  <tr key={rel.id} className="hover:bg-gray-50 group">
                    <td className="px-2 py-2">
                      <input 
                        type="text" 
                        value={rel.name}
                        onChange={(e) => updateRelation(rel.id, 'name', e.target.value)}
                        placeholder="has_part"
                        className="w-full px-2 py-1.5 border border-gray-200 rounded focus:border-brand-500 focus:outline-none"
                      />
                    </td>
                    <td className="px-2 py-2">
                      <select 
                        value={rel.targetId}
                        onChange={(e) => updateRelation(rel.id, 'targetId', e.target.value)}
                        className="w-full px-2 py-1.5 border border-gray-200 rounded focus:border-brand-500 focus:outline-none"
                      >
                        <option value="">选择目标本体</option>
                        {ontologyList.map(opt => (
                          <option key={opt.id} value={opt.id}>{opt.label} ({opt.name})</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-2 py-2">
                      <select 
                        value={rel.type}
                        onChange={(e) => updateRelation(rel.id, 'type', e.target.value)}
                        className="w-full px-2 py-1.5 border border-gray-200 rounded focus:border-brand-500 focus:outline-none"
                      >
                        <option value="1:1">1:1</option>
                        <option value="1:N">1:N</option>
                        <option value="N:1">N:1</option>
                        <option value="N:M">N:M</option>
                      </select>
                    </td>
                    <td className="px-2 py-2">
                      <input 
                        type="text" 
                        value={rel.description || ''}
                        onChange={(e) => updateRelation(rel.id, 'description', e.target.value)}
                        className="w-full px-2 py-1.5 border border-gray-200 rounded focus:border-brand-500 focus:outline-none"
                      />
                    </td>
                    <td className="px-2 py-2 text-center">
                      <button onClick={() => removeRelation(rel.id)} className="text-gray-400 hover:text-red-500 p-1">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                {relations.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-400 text-sm border-dashed border border-gray-200 rounded-md mt-2">
                      暂无关系定义
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </div>
  );
};

export default OntologyForm;
