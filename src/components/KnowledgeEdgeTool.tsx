
import React, { useState, useEffect, useMemo } from 'react';
import { ArrowRight, Plus, X, ArrowLeftRight, Save } from 'lucide-react';
import { Ontology } from '../types/ontology';
import { KnowledgeNode } from '../mocks/knowledgeGraphData';

interface KnowledgeEdgeToolProps {
  sourceNode: KnowledgeNode;
  targetNode: KnowledgeNode;
  ontologies: Ontology[];
  onCreate?: (edgeData: any) => void; // 创建模式回调
  onSave?: (edgeData: any) => void;   // 编辑模式回调
  onCancel: () => void;
  onSwapNodes: () => void;
  initialData?: any;                  // 编辑时的初始数据
  mode?: 'create' | 'edit';
}

const KnowledgeEdgeTool: React.FC<KnowledgeEdgeToolProps> = ({ 
  sourceNode, 
  targetNode, 
  ontologies, 
  onCreate, 
  onSave,
  onCancel,
  onSwapNodes,
  initialData,
  mode = 'create'
}) => {
  const [relationType, setRelationType] = useState<string>('');
  const [properties, setProperties] = useState<{ key: string; value: string }[]>([]);
  const [error, setError] = useState<string>('');

  // 初始化编辑数据
  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setRelationType(initialData.label);
      if (initialData.properties) {
        const propsArray = Object.entries(initialData.properties).map(([key, value]) => ({
          key,
          value: String(value)
        }));
        setProperties(propsArray);
      }
    }
  }, [mode, initialData]);

  // 根据源节点本体类型查找允许的关系
  const allowedRelations = useMemo(() => {
    const sourceOntology = ontologies.find(o => o.name === sourceNode.ontologyType);
    
    if (!sourceOntology || !sourceOntology.relations) {
      return [];
    }
    
    return sourceOntology.relations.filter(rel => {
      const targetOntologyDef = ontologies.find(o => o.id === rel.targetId);
      return targetOntologyDef && targetOntologyDef.name === targetNode.ontologyType;
    });
  }, [sourceNode, targetNode, ontologies]);

  const handleAddProperty = () => {
    setProperties([...properties, { key: '', value: '' }]);
  };

  const handlePropertyChange = (index: number, field: 'key' | 'value', val: string) => {
    const newProps = [...properties];
    newProps[index][field] = val;
    setProperties(newProps);
  };

  const handleRemoveProperty = (index: number) => {
    setProperties(properties.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!relationType) {
      setError('请选择关系类型');
      return;
    }
    
    const propsObj: Record<string, string> = {};
    properties.forEach(p => {
      if (p.key) propsObj[p.key] = p.value;
    });

    const edgeData = {
      id: initialData?.id, // 编辑时保留ID
      source: sourceNode.id,
      target: targetNode.id,
      label: relationType,
      relationType: allowedRelations.find(r => r.name === relationType)?.type || '1:1',
      properties: propsObj
    };

    if (mode === 'create' && onCreate) {
      onCreate(edgeData);
    } else if (mode === 'edit' && onSave) {
      onSave(edgeData);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-gray-100 pb-3">
        <h3 className="text-sm font-bold text-gray-800">{mode === 'create' ? '创建关系' : '编辑关系'}</h3>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
          <X size={16} />
        </button>
      </div>

      {/* Nodes Visual */}
      <div className="bg-gray-50 rounded-lg p-4 border border-dashed border-gray-200 flex flex-col items-center space-y-2">
        <div className="w-full flex items-center justify-between">
          <div className="flex-1 bg-white border border-blue-200 rounded p-2 text-center shadow-sm min-w-0">
            <div className="text-[10px] text-gray-400 uppercase">Source</div>
            <div className="text-sm font-semibold text-gray-800 truncate" title={sourceNode.label}>{sourceNode.label}</div>
            <div className="text-xs text-blue-600 bg-blue-50 inline-block px-1.5 rounded mt-1 truncate max-w-full">{sourceNode.ontologyType}</div>
          </div>
          
          <div className="px-2 text-gray-400 flex-shrink-0">
            <ArrowRight size={16} />
          </div>

          <div className="flex-1 bg-white border border-green-200 rounded p-2 text-center shadow-sm min-w-0">
            <div className="text-[10px] text-gray-400 uppercase">Target</div>
            <div className="text-sm font-semibold text-gray-800 truncate" title={targetNode.label}>{targetNode.label}</div>
            <div className="text-xs text-green-600 bg-green-50 inline-block px-1.5 rounded mt-1 truncate max-w-full">{targetNode.ontologyType}</div>
          </div>
        </div>
        
        {/* 编辑模式下隐藏交换按钮，避免ID混乱 */}
        {mode === 'create' && (
          <button 
            onClick={onSwapNodes}
            className="flex items-center text-xs text-gray-500 hover:text-brand-600 transition-colors"
          >
            <ArrowLeftRight size={12} className="mr-1" /> 交换方向
          </button>
        )}
      </div>

      {/* Form */}
      <div className="space-y-4">
        <div>
          <label className="block text-xs text-gray-500 mb-1">关系类型 <span className="text-red-500">*</span></label>
          <select 
            className={`w-full border rounded px-3 py-2 text-sm bg-white focus:outline-none focus:border-brand-500 ${error ? 'border-red-500' : 'border-gray-300'}`}
            value={relationType}
            onChange={(e) => {
              setRelationType(e.target.value);
              setError('');
            }}
          >
            <option value="">请选择关系类型</option>
            {allowedRelations.length > 0 ? (
              allowedRelations.map(rel => (
                <option key={rel.id} value={rel.name}>{rel.name} ({rel.description || rel.type})</option>
              ))
            ) : (
              <option disabled>无预定义关系 (Source -> Target)</option>
            )}
            <option value="RELATED_TO">RELATED_TO (通用)</option>
          </select>
          {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-xs text-gray-500">关系属性</label>
            <button onClick={handleAddProperty} className="text-xs text-brand-600 hover:text-brand-700 flex items-center">
              <Plus size={12} className="mr-0.5" /> 添加
            </button>
          </div>
          
          <div className="space-y-2">
            {properties.map((prop, index) => (
              <div key={index} className="flex space-x-2">
                <input 
                  type="text" 
                  placeholder="属性名" 
                  className="flex-1 w-0 border border-gray-300 rounded px-2 py-1 text-xs"
                  value={prop.key}
                  onChange={(e) => handlePropertyChange(index, 'key', e.target.value)}
                />
                <input 
                  type="text" 
                  placeholder="值" 
                  className="flex-1 w-0 border border-gray-300 rounded px-2 py-1 text-xs"
                  value={prop.value}
                  onChange={(e) => handlePropertyChange(index, 'value', e.target.value)}
                />
                <button onClick={() => handleRemoveProperty(index)} className="text-gray-400 hover:text-red-500">
                  <X size={14} />
                </button>
              </div>
            ))}
            {properties.length === 0 && (
              <div className="text-xs text-gray-400 text-center py-2 border border-dashed rounded bg-gray-50">
                暂无属性
              </div>
            )}
          </div>
        </div>

        <button 
          onClick={handleSubmit}
          className="w-full bg-brand-600 text-white py-2 rounded text-sm hover:bg-brand-700 transition-colors shadow-sm mt-2 flex items-center justify-center"
        >
          {mode === 'create' ? <><Plus size={16} className="mr-1" /> 创建关系</> : <><Save size={16} className="mr-1" /> 保存修改</>}
        </button>
      </div>
    </div>
  );
};

export default KnowledgeEdgeTool;
