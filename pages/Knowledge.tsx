import React, { useState, useRef } from 'react';
import { Database, Search, ZoomIn, ZoomOut, Maximize, MousePointer, Hand, X, Share2, Info, Edit, Trash2 } from 'lucide-react';
import GraphCanvas, { GraphCanvasRef } from '../components/GraphCanvas';
import KnowledgeNodeTool from '../components/KnowledgeNodeTool';
import KnowledgeEdgeTool from '../components/KnowledgeEdgeTool';
import Toast from '../components/Toast';
import { MOCK_KNOWLEDGE_GRAPH_DATA, KnowledgeNode } from '../mocks/knowledgeGraphData';
import { MOCK_ONTOLOGIES } from '../mocks/ontologyData';
import { OntologyEdge, OntologyNode } from '../mocks/ontologyGraphData';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { STORAGE_KEYS } from '../constants/storageKeys';
import { Ontology } from '../types/ontology';

const Knowledge: React.FC = () => {
  const [activeToolTab, setActiveToolTab] = useState<'node' | 'relation' | 'ai' | 'query'>('node');
  const graphRef = useRef<GraphCanvasRef>(null);
  const [graphMode, setGraphMode] = useState<'default' | 'pan'>('default');
  
  const [graphData, setGraphData] = useLocalStorage(STORAGE_KEYS.KNOWLEDGE_GRAPH, MOCK_KNOWLEDGE_GRAPH_DATA);
  const [ontologies] = useLocalStorage<Ontology[]>(STORAGE_KEYS.ONTOLOGIES, MOCK_ONTOLOGIES);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedItem, setSelectedItem] = useState<{ type: 'node' | 'edge'; data: any } | null>(null);
  const [selectedNodes, setSelectedNodes] = useState<KnowledgeNode[]>([]);

  const [isEditing, setIsEditing] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const handleZoomIn = () => graphRef.current?.zoomIn();
  const handleZoomOut = () => graphRef.current?.zoomOut();
  const handleFitView = () => graphRef.current?.fitView();
  
  const handleModeChange = (mode: 'default' | 'pan') => {
    setGraphMode(mode);
    graphRef.current?.setMode(mode);
  };

  const handleSearchToggle = () => {
    if (isSearchOpen) {
      setIsSearchOpen(false);
      setSearchQuery('');
      graphRef.current?.searchNodes('');
    } else {
      setIsSearchOpen(true);
    }
  };

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    graphRef.current?.searchNodes(val);
  };

  const handleSelectionChange = (nodes: OntologyNode[], edges: OntologyEdge[]) => {
    const kNodes = nodes as KnowledgeNode[];
    setSelectedNodes(kNodes);
    setIsEditing(false);

    if (kNodes.length === 1) {
      setSelectedItem({ type: 'node', data: kNodes[0] });
      setActiveToolTab('node');
    } else if (kNodes.length === 2) {
      setSelectedItem(null); 
      setActiveToolTab('relation');
    } else if (edges.length === 1) {
      setSelectedItem({ type: 'edge', data: edges[0] });
      setActiveToolTab('relation');
    } else {
      setSelectedItem(null);
    }
  };

  const handleCreateNode = (nodeData: any) => {
    const newNode: KnowledgeNode = {
      id: nodeData.id || `node_${Date.now()}`,
      label: nodeData.label,
      type: nodeData.type,
      ontologyType: nodeData.ontologyType,
      description: Object.entries(nodeData.properties || {})
        .map(([k, v]) => `${k}: ${v}`)
        .join(', '),
      properties: nodeData.properties 
    };

    if (isEditing) {
      setGraphData(prev => ({
        ...prev,
        nodes: prev.nodes.map(n => n.id === newNode.id ? newNode : n)
      }));
      setToast({ message: '节点更新成功', type: 'success' });
      setIsEditing(false);
      setSelectedItem({ type: 'node', data: newNode });
    } else {
      setGraphData(prev => ({
        ...prev,
        nodes: [...prev.nodes, newNode]
      }));
      setToast({ message: `节点 "${newNode.label}" 创建成功`, type: 'success' });
    }
  };

  const handleDeleteNode = () => {
    if (!selectedItem || selectedItem.type !== 'node') return;
    if (window.confirm('确定要删除这个节点吗？所有连接的关系也将被删除。')) {
      const nodeId = selectedItem.data.id;
      setGraphData(prev => ({
        nodes: prev.nodes.filter(n => n.id !== nodeId),
        edges: prev.edges.filter(e => e.source !== nodeId && e.target !== nodeId) 
      }));
      setSelectedItem(null);
      setSelectedNodes([]);
      setToast({ message: '节点及关联关系已删除', type: 'success' });
    }
  };

  const handleCreateEdge = (edgeData: any) => {
    const newEdge: OntologyEdge = {
      id: edgeData.id, 
      source: edgeData.source,
      target: edgeData.target,
      label: edgeData.label,
      properties: edgeData.properties
    };

    if (isEditing) {
      setGraphData(prev => ({
        ...prev,
        edges: prev.edges.map(e => (e.id === newEdge.id || (e.source === newEdge.source && e.target === newEdge.target && e.label === newEdge.label)) ? newEdge : e)
      }));
      setToast({ message: '关系更新成功', type: 'success' });
      setIsEditing(false);
      setSelectedItem({ type: 'edge', data: newEdge });
    } else {
      setGraphData(prev => ({
        ...prev,
        edges: [...prev.edges, newEdge]
      }));
      setToast({ message: `关系 "${edgeData.label}" 创建成功`, type: 'success' });
      setSelectedNodes([]);
    }
  };

  const handleDeleteEdge = () => {
    if (!selectedItem || selectedItem.type !== 'edge') return;
    if (window.confirm('确定要删除这条关系吗？')) {
      const edge = selectedItem.data;
      setGraphData(prev => ({
        ...prev,
        edges: prev.edges.filter(e => e !== edge) 
      }));
      setSelectedItem(null);
      setToast({ message: '关系已删除', type: 'success' });
    }
  };

  const handleSwapNodes = () => {
    if (selectedNodes.length === 2) {
      setSelectedNodes([selectedNodes[1], selectedNodes[0]]);
    }
  };

  const getNodesForEdge = (edge: OntologyEdge) => {
    const source = graphData.nodes.find(n => n.id === edge.source);
    const target = graphData.nodes.find(n => n.id === edge.target);
    return { source, target };
  };

  return (
    <div className="flex h-[calc(100vh-140px)] bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden relative">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="flex-1 relative bg-[#f9fafb]">
        <div className="absolute top-4 left-4 flex bg-white rounded-md shadow border border-gray-200 p-1 space-x-1 z-10">
           <button 
             onClick={() => handleModeChange('default')}
             className={`p-2 rounded text-gray-600 hover:bg-gray-100 transition-colors ${graphMode === 'default' ? 'bg-blue-50 text-blue-600' : ''}`}
             title="选择模式 (Ctrl+点击多选)"
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
           
           {isSearchOpen ? (
             <div className="flex items-center bg-gray-100 rounded px-2 py-1 transition-all animate-in fade-in slide-in-from-left-2 duration-200">
               <Search size={14} className="text-gray-500 mr-1" />
               <input 
                 autoFocus
                 type="text" 
                 value={searchQuery}
                 onChange={handleSearchInput}
                 className="bg-transparent border-none focus:ring-0 text-sm w-32 text-gray-700 placeholder-gray-400 outline-none"
                 placeholder="搜索节点..."
               />
               <button onClick={handleSearchToggle} className="ml-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-200 p-0.5">
                 <X size={14} />
               </button>
             </div>
           ) : (
             <button onClick={handleSearchToggle} className="p-2 hover:bg-gray-100 rounded text-gray-600 transition-colors" title="搜索节点">
               <Search size={18} />
             </button>
           )}

           <div className="w-px bg-gray-200 mx-1 h-6 self-center"></div>
           
           <button onClick={handleZoomIn} className="p-2 hover:bg-gray-100 rounded text-gray-600 transition-colors" title="放大"><ZoomIn size={18} /></button>
           <button onClick={handleZoomOut} className="p-2 hover:bg-gray-100 rounded text-gray-600 transition-colors" title="缩小"><ZoomOut size={18} /></button>
           <button onClick={handleFitView} className="p-2 hover:bg-gray-100 rounded text-gray-600 transition-colors" title="适应画布"><Maximize size={18} /></button>
        </div>

        {selectedNodes.length > 0 && (
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur border border-brand-100 text-brand-700 px-3 py-1.5 rounded-full shadow-sm text-xs font-medium z-10 animate-in fade-in slide-in-from-top-2">
            已选中 {selectedNodes.length} 个节点 {selectedNodes.length === 2 && '(可创建关系)'}
          </div>
        )}

        <div className="w-full h-full">
            <GraphCanvas 
              ref={graphRef}
              data={graphData}
              nodeShape="rect"
              className="bg-[#f9fafb]"
              onSelectionChange={handleSelectionChange}
            />
        </div>
      </div>

      <div className="w-[320px] bg-white border-l border-gray-200 flex flex-col">
        <div className="flex border-b border-gray-200">
          {['node', 'relation', 'ai', 'query'].map((id) => (
            <button
              key={id}
              onClick={() => {
                setActiveToolTab(id as any);
                setIsEditing(false); 
              }}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                activeToolTab === id
                  ? 'text-brand-600 border-b-2 border-brand-600 bg-brand-50/50' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {id === 'node' ? '节点' : id === 'relation' ? '关系' : id === 'ai' ? 'AI助手' : '查询'}
            </button>
          ))}
        </div>

        <div className="flex-1 p-4 overflow-y-auto">
           {activeToolTab === 'node' && (
             <div className="space-y-6">
               {selectedItem?.type === 'node' ? (
                 isEditing ? (
                   <KnowledgeNodeTool 
                     ontologies={ontologies}
                     onCreate={handleCreateNode}
                     initialData={selectedItem.data}
                     mode="edit"
                     onCancel={() => setIsEditing(false)}
                   />
                 ) : (
                   <div className="pb-4 border-b border-gray-100">
                     <div className="flex justify-between items-center mb-3">
                       <h3 className="text-sm font-bold text-gray-800 flex items-center">
                         <Info size={16} className="mr-2 text-brand-600"/> 
                         节点详情
                       </h3>
                       <button onClick={() => setSelectedItem(null)} className="text-gray-400 hover:text-gray-600">
                         <X size={14} />
                       </button>
                     </div>
                     <div className="space-y-3 animate-in fade-in slide-in-from-right-4 duration-200">
                       <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                         <label className="block text-xs text-gray-500 mb-1">名称 (Label)</label>
                         <div className="text-sm font-semibold text-gray-900">{selectedItem.data.label}</div>
                       </div>
                       <div>
                         <label className="block text-xs text-gray-500 mb-1">本体类型</label>
                         <div className="flex items-center space-x-2">
                           <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full font-medium">
                             {selectedItem.data.ontologyType || selectedItem.data.type}
                           </span>
                           <span className="text-xs text-gray-400 font-mono truncate max-w-[120px]">{selectedItem.data.id}</span>
                         </div>
                       </div>
                       <div className="pt-2 flex space-x-2">
                          <button onClick={() => setIsEditing(true)} className="flex-1 bg-white border border-gray-300 text-gray-700 py-1.5 rounded text-xs hover:bg-gray-50 flex items-center justify-center">
                            <Edit size={12} className="mr-1"/> 编辑属性
                          </button>
                          <button onClick={handleDeleteNode} className="flex-1 bg-white border border-red-200 text-red-600 py-1.5 rounded text-xs hover:bg-red-50 flex items-center justify-center">
                            <Trash2 size={12} className="mr-1"/> 删除节点
                          </button>
                       </div>
                     </div>
                   </div>
                 )
               ) : (
                 <KnowledgeNodeTool ontologies={ontologies} onCreate={handleCreateNode} />
               )}
             </div>
           )}
           {activeToolTab === 'relation' && (
             <div className="space-y-6">
                <div className="pb-4 border-b border-gray-100">
                 {selectedNodes.length === 2 ? (
                   <KnowledgeEdgeTool 
                     sourceNode={selectedNodes[0]}
                     targetNode={selectedNodes[1]}
                     ontologies={ontologies}
                     onCreate={handleCreateEdge}
                     onCancel={() => setSelectedNodes([])}
                     onSwapNodes={handleSwapNodes}
                   />
                 ) : selectedItem?.type === 'edge' ? (
                   isEditing ? (
                     (() => {
                       const { source, target } = getNodesForEdge(selectedItem.data);
                       if (!source || !target) return <div>节点数据丢失</div>;
                       return (
                         <KnowledgeEdgeTool
                           mode="edit"
                           initialData={selectedItem.data}
                           sourceNode={source}
                           targetNode={target}
                           ontologies={ontologies}
                           onSave={handleCreateEdge}
                           onCancel={() => setIsEditing(false)}
                           onSwapNodes={() => {}}
                         />
                       );
                     })()
                   ) : (
                     <div>
                       <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center">
                         <Share2 size={16} className="mr-2 text-brand-600"/> 
                         关系详情
                       </h3>
                       <div className="space-y-3 animate-in fade-in slide-in-from-right-4 duration-200">
                         <div className="bg-brand-50 p-3 rounded-md border border-brand-100">
                           <label className="block text-xs text-brand-600 mb-1 font-medium">关系类型</label>
                           <div className="text-sm font-bold text-brand-900">{selectedItem.data.label}</div>
                         </div>
                         <div className="pt-2 flex space-x-2">
                            <button onClick={() => setIsEditing(true)} className="flex-1 bg-white border border-gray-300 text-gray-700 py-1.5 rounded text-xs hover:bg-gray-50 flex items-center justify-center">
                              <Edit size={12} className="mr-1"/> 编辑关系
                            </button>
                            <button onClick={handleDeleteEdge} className="flex-1 bg-white border border-red-200 text-red-600 py-1.5 rounded text-xs hover:bg-red-50 flex items-center justify-center">
                              <Trash2 size={12} className="mr-1"/> 删除关系
                            </button>
                         </div>
                       </div>
                     </div>
                   )
                 ) : (
                   <div className="bg-gray-50 rounded p-6 text-center border border-dashed border-gray-200">
                     <Share2 size={32} className="mx-auto text-gray-300 mb-2" />
                     <p className="text-sm text-gray-500 mb-2">未选择关系</p>
                   </div>
                 )}
               </div>
             </div>
           )}
           {(activeToolTab === 'ai' || activeToolTab === 'query') && (
             <div className="flex flex-col items-center justify-center h-64 text-gray-400">
               <Database size={32} className="mb-2 opacity-20" />
               <p className="text-sm">功能开发中...</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default Knowledge;