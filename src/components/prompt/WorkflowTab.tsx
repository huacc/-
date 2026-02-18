
import React, { useState } from 'react';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, Trash2, GripVertical, ChevronDown, ChevronRight } from 'lucide-react';
import { PromptStructure, WorkflowStep } from '../../types/prompt';

interface WorkflowTabProps {
  data: PromptStructure['workflow'];
  onChange: (newWorkflow: PromptStructure['workflow']) => void;
}

/**
 * 可排序的步骤项组件
 */
const SortableStepItem = ({
  step,
  index,
  isActive,
  onToggle,
  onChange,
  onDelete
}: {
  step: WorkflowStep;
  index: number;
  isActive: boolean;
  onToggle: () => void;
  onChange: (id: string, field: keyof WorkflowStep, value: string) => void;
  onDelete: (id: string) => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: step.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1000 : 'auto',
    position: 'relative' as const,
  };

  return (
    <div ref={setNodeRef} style={style} className={`mb-4 bg-white border rounded-lg shadow-sm transition-shadow ${isDragging ? 'shadow-lg ring-2 ring-brand-200' : 'border-gray-200'}`}>
      {/* 卡片头部 */}
      <div 
        className={`flex items-center p-3 bg-gray-50 border-b border-gray-100 rounded-t-lg select-none ${!isActive ? 'rounded-b-lg border-b-0' : ''}`}
      >
        {/* 拖拽手柄 */}
        <div 
          {...attributes} 
          {...listeners} 
          className="mr-2 text-gray-400 cursor-grab hover:text-gray-600 active:cursor-grabbing p-1"
        >
          <GripVertical size={16} />
        </div>

        {/* 折叠/展开按钮 */}
        <button onClick={onToggle} className="mr-2 text-gray-500 hover:text-gray-700 p-1 rounded hover:bg-gray-200/50">
          {isActive ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>

        {/* 标题 */}
        <div className="flex-1 font-medium text-sm text-gray-700">
          <span className="text-gray-400 mr-2 font-mono">#{index + 1}</span>
          {step.id}
        </div>

        {/* 删除按钮 */}
        <button 
          onClick={() => {
            if (window.confirm('确定要删除这个步骤吗？')) {
              onDelete(step.id);
            }
          }}
          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
          title="删除步骤"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* 卡片内容区域 */}
      {isActive && (
        <div className="p-4 space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">
          {/* 步骤标识 */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              步骤标识 (ID) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={step.id}
              onChange={(e) => onChange(step.id, 'id', e.target.value)}
              placeholder="例如: STEP_ANALYSIS_01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-brand-500 font-mono"
            />
          </div>

          {/* 执行逻辑 */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              执行逻辑 <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              value={step.logic}
              onChange={(e) => onChange(step.id, 'logic', e.target.value)}
              placeholder="详细描述该步骤 AI 需要执行的操作。支持 {{variable}}。"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          {/* 步骤示例 */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              步骤示例
            </label>
            <textarea
              rows={2}
              value={step.example || ''}
              onChange={(e) => onChange(step.id, 'example', e.target.value)}
              placeholder="Input: ... Output: ..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-brand-500 bg-slate-50 font-mono"
            />
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Tab3: 工作流程
 * 支持步骤的增删改及拖拽排序
 */
const WorkflowTab: React.FC<WorkflowTabProps> = ({ data, onChange }) => {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // 添加新步骤
  const handleAdd = () => {
    const newId = `STEP_${String(Date.now()).slice(-4)}`;
    const newStep: WorkflowStep = {
      id: newId,
      logic: '',
      example: ''
    };
    onChange([...data, newStep]);
    setActiveId(newId); // 自动展开新步骤
  };

  // 删除步骤
  const handleDelete = (id: string) => {
    onChange(data.filter(item => item.id !== id));
  };

  // 更新步骤字段
  // 注意：如果是更新ID，需要处理数据源中的ID替换，但这里为了简化，假设ID仅作为标识字段，
  // 实际排序和key使用原始生成的ID可能更稳健，但为了符合 interface WorkflowStep { id: string }，我们直接修改
  // 在拖拽场景下，修改ID可能会导致key变化导致组件重绘，最好使用内部唯一key，但受限于 PromptStructure 定义，
  // 我们这里直接更新对象。
  const handleChange = (oldId: string, field: keyof WorkflowStep, value: string) => {
    const newData = data.map(item => {
      if (item.id === oldId) {
        return { ...item, [field]: value };
      }
      return item;
    });
    onChange(newData);
    
    // 如果修改的是 ID，且当前是展开状态，需要更新 activeId 保持展开
    if (field === 'id' && activeId === oldId) {
      setActiveId(value);
    }
  };

  // 拖拽结束处理
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = data.findIndex(item => item.id === active.id);
      const newIndex = data.findIndex(item => item.id === over.id);
      onChange(arrayMove(data, oldIndex, newIndex));
    }
  };

  const toggleExpand = (id: string) => {
    setActiveId(activeId === id ? null : id);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
      <div className="bg-indigo-50 border border-indigo-100 rounded-md p-4">
        <h4 className="text-sm font-semibold text-indigo-800 mb-1">工作流程定义指南</h4>
        <p className="text-xs text-indigo-600">
          将复杂的分析任务拆解为线性的执行步骤。通过拖拽调整步骤顺序，清晰的流程有助于 AI 保持逻辑连贯性（Chain-of-Thought）。
        </p>
      </div>

      <div className="space-y-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext 
            items={data.map(d => d.id)}
            strategy={verticalListSortingStrategy}
          >
            {data.map((step, index) => (
              <SortableStepItem
                key={step.id}
                index={index}
                step={step}
                isActive={activeId === step.id}
                onToggle={() => toggleExpand(step.id)}
                onChange={handleChange}
                onDelete={handleDelete}
              />
            ))}
          </SortableContext>
        </DndContext>

        {data.length === 0 && (
          <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50/50">
            <p className="text-sm text-gray-400 mb-2">暂无工作流程步骤</p>
            <p className="text-xs text-gray-300">点击下方按钮添加第一个步骤</p>
          </div>
        )}

        <button
          onClick={handleAdd}
          className="w-full py-3 border-2 border-dashed border-gray-300 text-gray-500 rounded-lg hover:border-brand-400 hover:text-brand-600 hover:bg-brand-50 transition-all flex items-center justify-center font-medium"
        >
          <Plus size={18} className="mr-2" />
          添加步骤
        </button>
      </div>
    </div>
  );
};

export default WorkflowTab;
