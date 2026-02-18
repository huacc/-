import React, { useState, useRef } from 'react';
import { Database, Search, ZoomIn, ZoomOut, Maximize, Play, MousePointer, Hand, X, Share2, Info, Edit, Trash2 } from 'lucide-react';
import GraphCanvas, { GraphCanvasRef } from '../components/GraphCanvas';
import KnowledgeNodeTool from '../components/KnowledgeNodeTool';
import KnowledgeEdgeTool from '../components/KnowledgeEdgeTool';
import Toast from '../components/Toast';
import { MOCK_KNOWLEDGE_GRAPH_DATA, KnowledgeNode } from '../mocks/knowledgeGraphData';
import { MOCK_ONTOLOGIES } from '../mocks/ontologyData';
import { OntologyEdge, OntologyNode } from '../mocks/ontologyGraphData';

const Knowledge: React.FC = () => {
  const [activeToolTab, setActiveToolTab] = useState<'node' | 'relation' | 'ai' | 'query'>('node');
  const graphRef = useRef<GraphCanvasRef>(null);
  const [graphMode, setGraphMode] = useState<'default' | 'pan'>('default');
  
  // Graph Data State
  const [graphData, setGraphData] = useState(MOCK_KNOWLEDGE_GRAPH_DATA);

  // Search State
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Selection State
  const [selectedItem, setSelectedItem] = useState<{ type: 'node' | 'edge'; data: any } | null>(null);
  const [selectedNodes, setSelectedNodes] = useState<KnowledgeNode[]>([]);

  // Editing State
  const [isEditing, setIsEditing] = useState(false);

  // Toast State
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

  // Selection Handling
  const handleSelectionChange = (nodes: OntologyNode[], edges: OntologyEdge[]) => {
    const kNodes = nodes as KnowledgeNode[];
    setSelectedNodes(kNodes);
    setIsEditing(false); // 切换选中时退出编辑模式

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

  // CRUD Handlers
  const handleCreateNode = (nodeData: any) => {
    const newNode: KnowledgeNode = {
      id: nodeData.id || `node_${Date.now()}`,
      label: nodeData.label,
      type: nodeData.type,
      ontologyType: nodeData.ontologyType,
      description: Object.entries(nodeData.properties)
        .map(([k, v]) => `${k}: ${v}`)
        .join(', '),
      properties: nodeData.properties // 存储原始属性以便编辑
    };

    if (isEditing) {
      // Update existing node
      setGraphData(prev => ({
        ...prev,
        nodes: prev.nodes.map(n => n.id === newNode.id ? newNode : n)
      }));
      setToast({ message: '节点更新成功', type: 'success' });
      setIsEditing(false);
      setSelectedItem({ type: 'node', data: newNode });
    } else {
      // Create new node
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
        edges: prev.edges.filter(e => e.source !== nodeId && e.target !== nodeId) // 级联删除边
      }));
      setSelectedItem(null);
      setSelectedNodes([]);
      setToast({ message: '节点及关联关系已删除', type: 'success' });
    }
  };

  const handleCreateEdge = (edgeData: any) => {
    const newEdge: OntologyEdge = {
      id: edgeData.id, // 编辑时保留ID
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
        edges: prev.edges.filter(e => e !== edge) // 简单引用比较，实际可能需要唯一ID
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

  // Helper to find nodes for edge editing
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

      {/* LEFT: Canvas Area (75%) */}
      <div className="flex-1 relative bg-[#f9fafb]">
        {/* Canvas Toolbar */}
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

        {/* Info Hint */}
        {selectedNodes.length > 0 && (
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur border border-brand-100 text-brand-700 px-3 py-1.5 rounded-full shadow-sm text-xs font-medium z-10 animate-in fade-in slide-in-from-top-2">
            已选中 {selectedNodes.length} 个节点 {selectedNodes.length === 2 && '(可创建关系)'}
          </div>
        )}

        {/* G6 Graph Canvas */}
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

      {/* RIGHT: Toolbar Area (25%) */}
      <div className="w-[320px] bg-white border-l border-gray-200 flex flex-col">
        {/* Tool Tabs */}
        <div className="flex border-b border-gray-200">
          {[
            { id: 'node', label: '节点' },
            { id: 'relation', label: '关系' },
            { id: 'ai', label: 'AI助手' },
            { id: 'query', label: '查询' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveToolTab(tab.id as any);
                setIsEditing(false); // 切换Tab时取消编辑
              }}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                activeToolTab === tab.id
                  ? 'text-brand-600 border-b-2 border-brand-600 bg-brand-50/50' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tool Content */}
        <div className="flex-1 p-4 overflow-y-auto">
           {activeToolTab === 'node' && (
             <div className="space-y-6">
               {/* 节点详情（当选中单节点时显示） */}
               {selectedItem?.type === 'node' ? (
                 isEditing ? (
                   // 编辑模式
                   <KnowledgeNodeTool 
                     ontologies={MOCK_ONTOLOGIES}
                     onCreate={handleCreateNode}
                     initialData={selectedItem.data}
                     mode="edit"
                     onCancel={() => setIsEditing(false)}
                   />
                 ) : (
                   // 详情模式
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
                             {(selectedItem.data as KnowledgeNode).ontologyType || selectedItem.data.type}
                           </span>
                           <span className="text-xs text-gray-400 font-mono truncate max-w-[120px]">{selectedItem.data.id}</span>
                         </div>
                       </div>

                       <div>
                         <label className="block text-xs text-gray-500 mb-1">描述</label>
                         <p className="text-xs text-gray-600 leading-relaxed bg-white border border-gray-200 p-2 rounded">
                           {selectedItem.data.description || '暂无描述'}
                         </p>
                       </div>
                       
                       <div className="pt-2 flex space-x-2">
                          <button 
                            onClick={() => setIsEditing(true)}
                            className="flex-1 bg-white border border-gray-300 text-gray-700 py-1.5 rounded text-xs hover:bg-gray-50 flex items-center justify-center"
                          >
                            <Edit size={12} className="mr-1"/> 编辑属性
                          </button>
                          <button 
                            onClick={handleDeleteNode}
                            className="flex-1 bg-white border border-red-200 text-red-600 py-1.5 rounded text-xs hover:bg-red-50 flex items-center justify-center"
                          >
                            <Trash2 size={12} className="mr-1"/> 删除节点
                          </button>
                       </div>
                     </div>
                   </div>
                 )
               ) : (
                 // 节点创建工具（未选中节点时显示）
                 <KnowledgeNodeTool 
                   ontologies={MOCK_ONTOLOGIES}
                   onCreate={handleCreateNode}
                 />
               )}

               {!selectedItem && (
                 <div className="pt-4 border-t border-gray-100">
                   <h3 className="text-xs font-bold text-gray-500 mb-2 uppercase">提示</h3>
                   <p className="text-xs text-gray-400">
                     选择本体类型并填写属性，点击"添加新节点"即可在画布中创建知识节点。
                   </p>
                 </div>
               )}
             </div>
           )}

           {activeToolTab === 'relation' && (
             <div className="space-y-6">
                <div className="pb-4 border-b border-gray-100">
                 {selectedNodes.length === 2 ? (
                   // 关系创建工具
                   <div className="animate-in fade-in slide-in-from-right-4 duration-200">
                     <KnowledgeEdgeTool 
                       sourceNode={selectedNodes[0]}
                       targetNode={selectedNodes[1]}
                       ontologies={MOCK_ONTOLOGIES}
                       onCreate={handleCreateEdge}
                       onCancel={() => setSelectedNodes([])}
                       onSwapNodes={handleSwapNodes}
                     />
                   </div>
                 ) : selectedItem?.type === 'edge' ? (
                   isEditing ? (
                     // 关系编辑模式
                     (() => {
                       const { source, target } = getNodesForEdge(selectedItem.data);
                       if (!source || !target) return <div>节点数据丢失</div>;
                       return (
                         <KnowledgeEdgeTool
                           mode="edit"
                           initialData={selectedItem.data}
                           sourceNode={source}
                           targetNode={target}
                           ontologies={MOCK_ONTOLOGIES}
                           onSave={handleCreateEdge} // 复用 create 逻辑处理更新
                           onCancel={() => setIsEditing(false)}
                           onSwapNodes={() => {}} // 编辑时不交换
                         />
                       );
                     })()
                   ) : (
                     // 关系详情
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
                         
                         <div className="grid grid-cols-2 gap-2">
                           <div className="p-2 bg-gray-50 rounded border border-gray-200">
                             <label className="block text-[10px] text-gray-500 uppercase">Source</label>
                             <div className="text-xs font-mono truncate" title={selectedItem.data.source}>{selectedItem.data.source}</div>
                           </div>
                           <div className="p-2 bg-gray-50 rounded border border-gray-200">
                             <label className="block text-[10px] text-gray-500 uppercase">Target</label>
                             <div className="text-xs font-mono truncate" title={selectedItem.data.target}>{selectedItem.data.target}</div>
                           </div>
                         </div>

                         <div className="pt-2 flex space-x-2">
                            <button 
                              onClick={() => setIsEditing(true)}
                              className="flex-1 bg-white border border-gray-300 text-gray-700 py-1.5 rounded text-xs hover:bg-gray-50 flex items-center justify-center"
                            >
                              <Edit size={12} className="mr-1"/> 编辑关系
                            </button>
                            <button 
                              onClick={handleDeleteEdge}
                              className="flex-1 bg-white border border-red-200 text-red-600 py-1.5 rounded text-xs hover:bg-red-50 flex items-center justify-center"
                            >
                              <Trash2 size={12} className="mr-1"/> 删除关系
                            </button>
                         </div>
                       </div>
                     </div>
                   )
                 ) : (
                   // 空状态提示
                   <div className="bg-gray-50 rounded p-6 text-center border border-dashed border-gray-200">
                     <Share2 size={32} className="mx-auto text-gray-300 mb-2" />
                     <p className="text-sm text-gray-500 mb-2">未选择关系</p>
                     <p className="text-xs text-gray-400 leading-relaxed">
                       在画布中点击连线查看详情<br/>
                       或按住 <kbd className="font-sans border border-gray-300 rounded px-1 text-[10px]">Ctrl</kbd> 依次点击两个节点以创建关系
                     </p>
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
