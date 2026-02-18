import React, { useState, useRef, useMemo } from 'react';
import { Plus, Upload, Search, Network, Table, MousePointer, Hand, ZoomIn, ZoomOut, Maximize, X, Edit, Trash2 } from 'lucide-react';
import GraphCanvas, { GraphCanvasRef } from '../components/GraphCanvas';
import CategoryTree from '../components/CategoryTree';
import OntologyForm from '../components/OntologyForm';
import { OntologyNode } from '../mocks/ontologyGraphData';
import { MOCK_ONTOLOGY_CATEGORIES, MOCK_ONTOLOGIES } from '../mocks/ontologyData';
import { OntologyType, OntologyCategory, Ontology } from '../types/ontology';
import Toast from '../components/Toast';
import { transformToGraphData } from '../utils/ontologyGraphAdapter';

const OntologyPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'definition' | 'graph'>('definition');
  
  // Definition Tab State
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Mock Data State (in-memory persistence for demo)
  const [ontologies, setOntologies] = useState<Ontology[]>(MOCK_ONTOLOGIES);
  
  // Form State
  const [viewMode, setViewMode] = useState<'list' | 'form'>('list');
  const [editingOntology, setEditingOntology] = useState<Ontology | null>(null);
  
  // Graph Tab State
  const graphRef = useRef<GraphCanvasRef>(null);
  const [graphMode, setGraphMode] = useState<'default' | 'pan'>('default');
  const [selectedNode, setSelectedNode] = useState<OntologyNode | null>(null);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // --- Logic for Definition Tab ---
  
  const getCategoryIdsInSubtree = (categories: OntologyCategory[], rootId: string): string[] => {
    let ids: string[] = [];
    const find = (cats: OntologyCategory[], targetFound: boolean) => {
      for (const cat of cats) {
        if (cat.id === rootId || targetFound) {
          ids.push(cat.id);
          if (cat.children) find(cat.children, true);
        } else {
          if (cat.children) find(cat.children, false);
        }
      }
    };
    if (rootId === 'all') {
      const collectAll = (cats: OntologyCategory[]) => {
        for (const cat of cats) {
          ids.push(cat.id);
          if (cat.children) collectAll(cat.children);
        }
      };
      collectAll(categories);
      return ids;
    }
    const findAndCollect = (cats: OntologyCategory[]): boolean => {
      for (const cat of cats) {
        if (cat.id === rootId) {
          ids.push(cat.id);
          const collect = (subCats: OntologyCategory[]) => {
            for(const c of subCats) {
              ids.push(c.id);
              if(c.children) collect(c.children);
            }
          }
          if(cat.children) collect(cat.children);
          return true;
        }
        if (cat.children) {
          if (findAndCollect(cat.children)) return true;
        }
      }
      return false;
    };
    findAndCollect(categories);
    return ids;
  };

  const filteredOntologies = useMemo(() => {
    let categoryIds = getCategoryIdsInSubtree(MOCK_ONTOLOGY_CATEGORIES, selectedCategoryId);
    let result = ontologies.filter(ont => categoryIds.includes(ont.categoryId));

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(ont => 
        ont.name.toLowerCase().includes(query) || 
        ont.label.includes(query) ||
        (ont.description && ont.description.includes(query))
      );
    }
    return result;
  }, [selectedCategoryId, searchQuery, ontologies]);

  const getTypeColor = (type: OntologyType) => {
    switch (type) {
      case 'Entity': return 'bg-blue-100 text-blue-800';
      case 'Event': return 'bg-green-100 text-green-800';
      case 'State': return 'bg-orange-100 text-orange-800';
      case 'Attribute': return 'bg-purple-100 text-purple-800';
      case 'Observable': return 'bg-cyan-100 text-cyan-800';
      case 'Rule': return 'bg-red-100 text-red-800';
      case 'ModelConcept': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCreateClick = () => {
    setEditingOntology(null);
    setViewMode('form');
  };

  const handleEditClick = (ontology: Ontology) => {
    setEditingOntology(ontology);
    setViewMode('form');
  };

  const handleDeleteClick = (id: string) => {
    if(window.confirm('确定要删除这个本体吗？')) {
      setOntologies(prev => prev.filter(o => o.id !== id));
      setToast({ message: '本体已删除', type: 'success' });
    }
  };

  const handleFormSave = (data: Ontology) => {
    if (editingOntology) {
      // Update
      setOntologies(prev => prev.map(o => o.id === data.id ? data : o));
      setToast({ message: '本体更新成功', type: 'success' });
    } else {
      // Create
      setOntologies(prev => [...prev, data]);
      setToast({ message: '本体创建成功', type: 'success' });
    }
    setViewMode('list');
  };

  // --- Logic for Graph Tab ---

  // Dynamic Graph Data derived from the ontology list
  const graphData = useMemo(() => transformToGraphData(ontologies), [ontologies]);

  const handleZoomIn = () => graphRef.current?.zoomIn();
  const handleZoomOut = () => graphRef.current?.zoomOut();
  const handleFitView = () => graphRef.current?.fitView();
  
  const handleModeChange = (mode: 'default' | 'pan') => {
    setGraphMode(mode);
    graphRef.current?.setMode(mode);
  };

  const handleNodeDoubleClick = (node: OntologyNode) => {
    setSelectedNode(node);
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header Actions */}
      <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <Network size={20} />
          </div>
          <span className="font-semibold text-gray-800 text-lg">元本体管理</span>
        </div>
        <div className="flex space-x-3">
          <button className="px-4 py-2 bg-white border border-gray-300 text-gray-600 rounded hover:bg-gray-50 flex items-center text-sm transition-colors">
            <Upload size={16} className="mr-2" /> 导入
          </button>
          <button 
            onClick={handleCreateClick}
            className="px-4 py-2 bg-brand-600 text-white rounded hover:bg-brand-700 flex items-center text-sm shadow-sm transition-colors"
          >
            <Plus size={16} className="mr-2" /> 新建本体
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-t-lg border-b border-gray-200 px-4 pt-2">
        <div className="flex space-x-6">
          <button
            onClick={() => setActiveTab('definition')}
            className={`pb-3 px-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'definition' 
                ? 'border-brand-600 text-brand-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <span className="flex items-center"><Table size={16} className="mr-2"/> 本体定义</span>
          </button>
          <button
            onClick={() => setActiveTab('graph')}
            className={`pb-3 px-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'graph' 
                ? 'border-brand-600 text-brand-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <span className="flex items-center"><Network size={16} className="mr-2"/> 本体关系图</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-white rounded-b-lg shadow-sm p-0 overflow-hidden flex relative">
        {activeTab === 'definition' ? (
          /* Tab 1: Definition View */
          <div className="flex w-full h-full">
            {/* Left Tree */}
            <div className="w-[280px] border-r border-gray-200 flex flex-col bg-gray-50/30">
              <div className="p-4 border-b border-gray-100">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="搜索本体..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-2">
                <CategoryTree 
                  categories={MOCK_ONTOLOGY_CATEGORIES} 
                  selectedId={selectedCategoryId}
                  onSelect={(id) => {
                    setSelectedCategoryId(id);
                    if (viewMode === 'form') setViewMode('list'); // Switch back to list on category change if desired
                  }}
                />
              </div>
            </div>
            
            {/* Right Details (Ontology List OR Form) */}
            <div className="flex-1 overflow-y-auto bg-white relative">
              {viewMode === 'list' ? (
                <div className="p-6">
                  <div className="mb-4 flex justify-between items-center">
                    <h2 className="text-base font-semibold text-gray-800">
                      {selectedCategoryId === 'all' ? '全部本体' : MOCK_ONTOLOGY_CATEGORIES.flatMap(c => [c, ...(c.children||[]).flatMap(cc => [cc, ...(cc.children||[])])]).find(c => c.id === selectedCategoryId)?.name || '本体列表'}
                      <span className="ml-2 text-xs font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{filteredOntologies.length}</span>
                    </h2>
                  </div>

                  {filteredOntologies.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                      {filteredOntologies.map((ontology) => (
                        <div key={ontology.id} className="group border border-gray-200 rounded-lg p-4 hover:border-brand-300 hover:shadow-sm transition-all bg-white">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h3 className="text-sm font-bold text-gray-900">{ontology.label}</h3>
                                <span className="text-xs text-gray-400 font-mono">{ontology.name}</span>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${getTypeColor(ontology.type)}`}>
                                  {ontology.type}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 line-clamp-2">{ontology.description || '暂无描述'}</p>
                              
                              {/* Properties & Relations Preview */}
                              <div className="mt-3 flex space-x-4 text-xs">
                                <span className="bg-gray-50 px-2 py-1 rounded text-gray-500 border border-gray-100">
                                  属性: <span className="font-medium text-gray-700">{ontology.properties?.length || 0}</span>
                                </span>
                                <span className="bg-gray-50 px-2 py-1 rounded text-gray-500 border border-gray-100">
                                  关系: <span className="font-medium text-gray-700">{ontology.relations?.length || 0}</span>
                                </span>
                              </div>

                              <div className="mt-3 flex items-center space-x-4 text-xs text-gray-400">
                                <span>更新: {new Date(ontology.updatedAt).toLocaleDateString()}</span>
                                <span>ID: {ontology.id}</span>
                              </div>
                            </div>
                            <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={() => handleEditClick(ontology)}
                                className="p-2 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded transition-colors" 
                                title="编辑"
                              >
                                <Edit size={16} />
                              </button>
                              <button 
                                onClick={() => handleDeleteClick(ontology.id)}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" 
                                title="删除"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-400 border-2 border-dashed border-gray-100 rounded-lg">
                      <Network size={48} className="mb-4 text-gray-200" />
                      <p>该分类下暂无本体定义</p>
                      <button 
                        onClick={handleCreateClick}
                        className="mt-4 text-brand-600 hover:text-brand-700 text-sm font-medium"
                      >
                        + 新建本体
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* Form Mode */
                <OntologyForm 
                  initialData={editingOntology}
                  categories={MOCK_ONTOLOGY_CATEGORIES}
                  ontologyList={ontologies}
                  onSave={handleFormSave}
                  onCancel={() => setViewMode('list')}
                />
              )}
            </div>
          </div>
        ) : (
          /* Tab 2: Graph View */
          <div className="w-full h-full relative flex">
             {/* Toolbar Overlay */}
             <div className="absolute top-4 left-4 bg-white p-1.5 rounded-lg shadow-md border border-gray-200 flex space-x-1 z-10">
                <button 
                  onClick={() => handleModeChange('default')}
                  className={`p-2 rounded text-gray-600 hover:bg-gray-100 transition-colors ${graphMode === 'default' ? 'bg-blue-50 text-blue-600' : ''}`} 
                  title="选择模式"
                >
                  <MousePointer size={18} />
                </button>
                <button 
                  onClick={() => handleModeChange('pan')}
                  className={`p-2 rounded text-gray-600 hover:bg-gray-100 transition-colors ${graphMode === 'pan' ? 'bg-blue-50 text-blue-600' : ''}`}
                  title="拖拽模式"
                >
                  <Hand size={18} />
                </button>
                <div className="w-px bg-gray-200 mx-1 h-6 self-center"></div>
                <button onClick={handleZoomIn} className="p-2 rounded text-gray-600 hover:bg-gray-100 transition-colors" title="放大">
                  <ZoomIn size={18} />
                </button>
                <button onClick={handleZoomOut} className="p-2 rounded text-gray-600 hover:bg-gray-100 transition-colors" title="缩小">
                  <ZoomOut size={18} />
                </button>
                <button onClick={handleFitView} className="p-2 rounded text-gray-600 hover:bg-gray-100 transition-colors" title="适应画布">
                  <Maximize size={18} />
                </button>
             </div>
             
             {/* G6 Graph Canvas (Use Dynamic Graph Data) */}
             <div className="flex-1 relative">
                <GraphCanvas 
                  ref={graphRef} 
                  data={graphData} 
                  onNodeDoubleClick={handleNodeDoubleClick}
                />
             </div>

             {/* Right Details Drawer */}
             {selectedNode && (
               <div className="w-[300px] border-l border-gray-200 bg-white flex flex-col shadow-xl z-20 absolute right-0 top-0 bottom-0 animate-in slide-in-from-right duration-200">
                 <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                   <h3 className="font-semibold text-gray-800">节点详情</h3>
                   <button onClick={() => setSelectedNode(null)} className="text-gray-400 hover:text-gray-600">
                     <X size={18} />
                   </button>
                 </div>
                 <div className="p-4 space-y-4 flex-1 overflow-y-auto">
                   <div>
                     <label className="block text-xs text-gray-500 mb-1 uppercase">ID</label>
                     <div className="text-sm font-mono bg-gray-100 p-2 rounded text-gray-700">{selectedNode.id}</div>
                   </div>
                   <div>
                     <label className="block text-xs text-gray-500 mb-1 uppercase">Label</label>
                     <div className="text-sm font-medium text-gray-800">{selectedNode.label}</div>
                   </div>
                   <div>
                     <label className="block text-xs text-gray-500 mb-1 uppercase">Type</label>
                     <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                       {selectedNode.type}
                     </span>
                   </div>
                   <div>
                     <label className="block text-xs text-gray-500 mb-1 uppercase">Description</label>
                     <div className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-3 rounded border border-gray-100">
                       {selectedNode.description || '暂无描述'}
                     </div>
                   </div>
                 </div>
               </div>
             )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OntologyPage;
