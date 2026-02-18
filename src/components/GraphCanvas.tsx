
import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import G6, { Graph, INode, IEdge } from '@antv/g6';
import { OntologyGraphData, OntologyNode, OntologyEdge } from '../mocks/ontologyGraphData';

// 允许传入更通用的数据结构
interface GraphCanvasProps {
  data: OntologyGraphData | { nodes: any[], edges: any[] };
  className?: string;
  onNodeDoubleClick?: (node: OntologyNode) => void;
  onNodeClick?: (node: OntologyNode) => void;
  onEdgeClick?: (edge: OntologyEdge) => void;
  onCanvasClick?: () => void;
  // 新增：选中状态变化回调，支持多选
  onSelectionChange?: (nodes: OntologyNode[], edges: OntologyEdge[]) => void;
  // 新增配置项
  nodeShape?: 'circle' | 'rect';
  layoutConfig?: any;
}

export interface GraphCanvasRef {
  zoomIn: () => void;
  zoomOut: () => void;
  fitView: () => void;
  setMode: (mode: string) => void;
  searchNodes: (query: string) => void;
}

const TYPE_COLORS: Record<string, string> = {
  Entity: '#1890ff',       // 蓝色
  Event: '#52c41a',        // 绿色
  State: '#faad14',        // 橙色
  Attribute: '#722ed1',    // 紫色
  ModelConcept: '#722ed1', // 紫色
  Observable: '#13c2c2',   // 青色
  Rule: '#f5222d',         // 红色
  Default: '#999999'       // 灰色
};

const GraphCanvas = forwardRef<GraphCanvasRef, GraphCanvasProps>(({ 
  data, 
  className, 
  onNodeDoubleClick, 
  onNodeClick,
  onEdgeClick,
  onCanvasClick,
  onSelectionChange,
  nodeShape = 'circle', // 默认圆形 (本体图)
  layoutConfig 
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<Graph | null>(null);

  useImperativeHandle(ref, () => ({
    zoomIn: () => graphRef.current?.zoom(1.2),
    zoomOut: () => graphRef.current?.zoom(0.8),
    fitView: () => graphRef.current?.fitView(),
    setMode: (mode: string) => graphRef.current?.setMode(mode),
    searchNodes: (query: string) => {
      const graph = graphRef.current;
      if (!graph) return;

      const nodes = graph.getNodes();
      
      // 如果查询为空，清除所有选中状态
      if (!query.trim()) {
        nodes.forEach((node) => {
           graph.clearItemStates(node, 'selected');
        });
        // 触发清空选择
        if (onSelectionChange) onSelectionChange([], []);
        return;
      }

      const lowerQuery = query.toLowerCase();
      let firstMatch: INode | null = null;
      
      // 搜索通常是单选逻辑，先清除所有
      nodes.forEach((node) => graph.clearItemStates(node, 'selected'));

      nodes.forEach((node) => {
        const model = node.getModel();
        const label = (model.label as string) || ''; 
        const match = label.toLowerCase().includes(lowerQuery);
        
        if (match) {
           graph.setItemState(node, 'selected', true);
           if (!firstMatch) {
             firstMatch = node;
           }
        }
      });

      // 聚焦到第一个匹配的节点
      if (firstMatch) {
        graph.focusItem(firstMatch, true, { easing: 'easeCubic', duration: 500 });
      }
      
      // 触发选择回调
      if (onSelectionChange) {
         const selectedNodes = graph.findAllByState('node', 'selected').map(n => n.getModel() as unknown as OntologyNode);
         onSelectionChange(selectedNodes, []);
      }
    }
  }));

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight || 600;

    // 根据形状配置默认节点样式
    const defaultNodeConfig = nodeShape === 'rect' ? {
      type: 'rect',
      size: [100, 40], // 宽矩形
      style: {
        radius: 6,
        lineWidth: 2,
        fill: '#fff',
        cursor: 'pointer',
      },
      labelCfg: {
        position: 'center', // 矩形内居中
        style: {
          fontSize: 12,
          fill: '#000',
        },
      }
    } : {
      type: 'circle',
      size: 50,
      style: {
        lineWidth: 2,
        fill: '#fff',
        cursor: 'pointer',
      },
      labelCfg: {
        position: 'bottom',
        offset: 8,
        style: {
          fontSize: 11,
          fill: '#000',
        },
      }
    };

    const graph = new G6.Graph({
      container: containerRef.current,
      width,
      height,
      modes: {
        default: ['drag-canvas', 'zoom-canvas', 'drag-node', 'click-select'],
        pan: ['drag-canvas', 'zoom-canvas'],
      },
      layout: layoutConfig || {
        type: 'force',
        preventOverlap: true,
        nodeSpacing: nodeShape === 'rect' ? 60 : 80, // 矩形可能需要不同间距
        linkDistance: 150,
        alphaDecay: 0.05,
      },
      defaultNode: defaultNodeConfig,
      nodeStateStyles: {
        selected: {
          stroke: '#000',
          lineWidth: 3,
          shadowColor: 'rgba(0,0,0,0.3)',
          shadowBlur: 10,
        },
      },
      defaultEdge: {
        type: 'quadratic',
        style: {
          stroke: '#bfbfbf',
          lineWidth: 1.5,
          endArrow: {
            path: G6.Arrow.triangle(8, 10, 0),
            fill: '#bfbfbf',
          },
          cursor: 'pointer',
        },
        labelCfg: {
          autoRotate: true,
          style: {
            fontSize: 9,
            fill: '#666',
            background: {
              fill: '#fff',
              padding: [2, 2, 2, 2],
              radius: 2,
            },
          },
        },
      },
      edgeStateStyles: {
        selected: {
          stroke: '#1890ff',
          lineWidth: 2.5,
          shadowColor: 'rgba(24, 144, 255, 0.5)',
          shadowBlur: 5,
        },
      },
    });

    graphRef.current = graph;

    // 事件监听
    graph.on('node:dblclick', (evt) => {
      const { item } = evt;
      const model = item?.getModel() as unknown as OntologyNode;
      if (onNodeDoubleClick && model) {
        onNodeDoubleClick(model);
      }
    });

    graph.on('node:click', (evt) => {
      const { item, originalEvent } = evt;
      const model = item?.getModel() as unknown as OntologyNode;
      
      // 检测 Ctrl / Cmd / Shift 键以支持多选
      const isMultiSelect = originalEvent.ctrlKey || originalEvent.metaKey || originalEvent.shiftKey;

      if (isMultiSelect) {
        // 多选逻辑：切换当前节点状态
        const isSelected = item?.hasState('selected');
        graph.setItemState(item!, 'selected', !isSelected);
      } else {
        // 单选逻辑：清除其他，选中当前
        graph.getNodes().forEach(n => graph.clearItemStates(n, 'selected'));
        graph.getEdges().forEach(e => graph.clearItemStates(e, 'selected'));
        if (item) {
          graph.setItemState(item, 'selected', true);
        }
      }

      // 触发传统单击回调 (如果是单选)
      if (onNodeClick && model && !isMultiSelect) {
        onNodeClick(model);
      }

      // 触发通用选择回调
      if (onSelectionChange) {
        const selectedNodes = graph.findAllByState('node', 'selected').map(n => n.getModel() as unknown as OntologyNode);
        const selectedEdges = graph.findAllByState('edge', 'selected').map(e => e.getModel() as unknown as OntologyEdge);
        onSelectionChange(selectedNodes, selectedEdges);
      }
    });

    graph.on('edge:click', (evt) => {
      const { item } = evt;
      const model = item?.getModel() as unknown as OntologyEdge;

      // 边通常暂不支持多选创建，保持单选逻辑
      graph.getNodes().forEach(n => graph.clearItemStates(n, 'selected'));
      graph.getEdges().forEach(e => graph.clearItemStates(e, 'selected'));

      if (item) {
        graph.setItemState(item, 'selected', true);
      }

      if (onEdgeClick && model) {
        onEdgeClick(model);
      }

      // 触发通用选择回调
      if (onSelectionChange) {
        const selectedNodes = graph.findAllByState('node', 'selected').map(n => n.getModel() as unknown as OntologyNode);
        const selectedEdges = graph.findAllByState('edge', 'selected').map(e => e.getModel() as unknown as OntologyEdge);
        onSelectionChange(selectedNodes, selectedEdges);
      }
    });

    graph.on('canvas:click', () => {
      // 清除所有选中状态
      graph.getNodes().forEach(n => graph.clearItemStates(n, 'selected'));
      graph.getEdges().forEach(e => graph.clearItemStates(e, 'selected'));
      
      if (onCanvasClick) {
        onCanvasClick();
      }

      // 触发通用选择回调
      if (onSelectionChange) {
        onSelectionChange([], []);
      }
    });

    // 数据处理与渲染
    const renderGraph = (graphData: any) => {
      const processedData = {
        nodes: graphData.nodes.map((node: any) => ({
          ...node,
          // 如果是矩形，标签显示在中间，可能需要截断
          label: node.label.length > 6 && nodeShape === 'rect' ? node.label.substring(0, 5) + '...' : node.label,
          style: {
            ...graph.get('defaultNode').style,
            stroke: TYPE_COLORS[node.type] || TYPE_COLORS.Default,
            fill: '#fff',
            lineWidth: nodeShape === 'rect' ? 2 : 3,
          },
        })),
        edges: graphData.edges.map((edge: any) => ({
          ...edge,
          id: `${edge.source}-${edge.target}-${edge.label}`,
        })),
      };
      graph.data(processedData);
      graph.render();
    };

    renderGraph(data);

    const resizeObserver = new ResizeObserver((entries) => {
      if (!graph || graph.get('destroyed')) return;
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        graph.changeSize(width, height);
      }
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      if (graphRef.current) {
        graphRef.current.destroy();
        graphRef.current = null;
      }
    };
  }, []); // 初始化一次

  // 数据更新
  useEffect(() => {
    const graph = graphRef.current;
    if (graph && !graph.get('destroyed')) {
       const processedData = {
        nodes: data.nodes.map((node: any) => ({
          ...node,
          label: node.label.length > 6 && nodeShape === 'rect' ? node.label.substring(0, 5) + '...' : node.label,
          style: {
            stroke: TYPE_COLORS[node.type] || TYPE_COLORS.Default,
            fill: '#fff',
            lineWidth: nodeShape === 'rect' ? 2 : 3,
          }
        })),
        edges: data.edges.map((edge: any) => ({
          ...edge,
          id: `${edge.source}-${edge.target}-${edge.label}`
        }))
      };
      graph.changeData(processedData);
    }
  }, [data, nodeShape]);

  return (
    <div ref={containerRef} className={`w-full h-full bg-gray-50 ${className}`} />
  );
});

GraphCanvas.displayName = 'GraphCanvas';

export default GraphCanvas;
