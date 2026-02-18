
import React, { useState } from 'react';
import { 
  Folder, 
  FolderOpen, 
  FileText, 
  ChevronRight, 
  ChevronDown, 
  Plus, 
  Trash2, 
  MoreHorizontal,
  Search
} from 'lucide-react';
import { PromptCategory, PromptTemplate } from '../../types/prompt';

interface PromptCategoryTreeProps {
  categories: PromptCategory[];
  templates: PromptTemplate[];
  selectedTemplateId: string | null;
  onSelectTemplate: (id: string) => void;
  onAddCategory: (parentId?: string) => void;
  onDeleteCategory: (id: string) => void;
  onAddTemplate: (categoryId: string) => void;
  onDeleteTemplate: (id: string) => void;
  className?: string;
}

interface TreeNodeProps extends Omit<PromptCategoryTreeProps, 'className' | 'categories'> {
  category: PromptCategory;
  level: number;
}

const TreeNode: React.FC<TreeNodeProps> = ({
  category,
  templates,
  selectedTemplateId,
  onSelectTemplate,
  onAddCategory,
  onDeleteCategory,
  onAddTemplate,
  onDeleteTemplate,
  level
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  // 获取当前分类下的模板
  const categoryTemplates = templates.filter(t => t.categoryId === category.id);
  const hasChildren = (category.children && category.children.length > 0) || categoryTemplates.length > 0;

  const handleAddTemplateClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddTemplate(category.id);
    setIsExpanded(true);
  };

  const handleAddSubCategoryClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddCategory(category.id);
    setIsExpanded(true);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`确定要删除分类 "${category.name}" 吗？该操作不可恢复。`)) {
      onDeleteCategory(category.id);
    }
  };

  return (
    <div>
      {/* Category Row */}
      <div
        className={`
          group flex items-center justify-between py-1.5 px-2 cursor-pointer rounded-md transition-colors text-sm mb-0.5
          text-gray-700 hover:bg-gray-100
        `}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        onClick={() => setIsExpanded(!isExpanded)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex items-center overflow-hidden">
          <button
            className={`p-0.5 rounded hover:bg-black/5 mr-1 text-gray-400 ${!hasChildren ? 'invisible' : ''}`}
          >
            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
          
          <span className="mr-2 text-yellow-500 fill-yellow-500">
            {isExpanded ? <FolderOpen size={16} /> : <Folder size={16} />}
          </span>
          
          <span className="truncate font-medium">{category.name}</span>
          <span className="ml-2 text-xs text-gray-400">({categoryTemplates.length})</span>
        </div>

        {/* Category Actions (Hover) */}
        <div className={`flex items-center space-x-1 ${isHovered ? 'opacity-100' : 'opacity-0'} transition-opacity`}>
          <button 
            onClick={handleAddTemplateClick}
            className="p-1 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded"
            title="在此分类下新建提示词"
          >
            <Plus size={14} />
          </button>
          {/* 暂时只支持一级分类添加子分类，避免层级过深 */}
          {level < 1 && (
             <button 
             onClick={handleAddSubCategoryClick}
             className="p-1 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded"
             title="新建子分类"
           >
             <Folder size={14} />
           </button>
          )}
          <button 
            onClick={handleDeleteClick}
            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
            title="删除分类"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Children */}
      {isExpanded && (
        <div>
          {/* Sub Categories */}
          {category.children?.map((child) => (
            <TreeNode
              key={child.id}
              category={child}
              templates={templates}
              selectedTemplateId={selectedTemplateId}
              onSelectTemplate={onSelectTemplate}
              onAddCategory={onAddCategory}
              onDeleteCategory={onDeleteCategory}
              onAddTemplate={onAddTemplate}
              onDeleteTemplate={onDeleteTemplate}
              level={level + 1}
            />
          ))}

          {/* Templates in this category */}
          {categoryTemplates.map((template) => (
            <div
              key={template.id}
              className={`
                group flex items-center justify-between py-1.5 px-2 cursor-pointer rounded-md transition-colors text-sm mb-0.5
                ${selectedTemplateId === template.id 
                  ? 'bg-brand-50 text-brand-700 border border-brand-100' 
                  : 'text-gray-600 hover:bg-gray-50 border border-transparent'}
              `}
              style={{ paddingLeft: `${(level + 1) * 12 + 24}px` }}
              onClick={() => onSelectTemplate(template.id)}
            >
              <div className="flex items-center overflow-hidden">
                <FileText size={14} className={`mr-2 flex-shrink-0 ${selectedTemplateId === template.id ? 'text-brand-500' : 'text-gray-400'}`} />
                <span className="truncate">{template.name}</span>
              </div>
              
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  if(confirm(`确定要删除提示词 "${template.name}" 吗？`)) {
                    onDeleteTemplate(template.id);
                  }
                }}
                className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-600 rounded transition-opacity"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const PromptCategoryTree: React.FC<PromptCategoryTreeProps> = ({ 
  categories, 
  templates,
  selectedTemplateId,
  onSelectTemplate,
  onAddCategory,
  onDeleteCategory,
  onAddTemplate,
  onDeleteTemplate,
  className 
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // 简单的搜索过滤逻辑
  const filterCategories = (cats: PromptCategory[]): PromptCategory[] => {
    if (!searchTerm) return cats;
    // 这里仅做简单的顶层过滤展示，实际应用可能需要更复杂的树形搜索
    return cats.filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (c.children && c.children.some(child => child.name.toLowerCase().includes(searchTerm.toLowerCase())))
    );
  };

  const filteredCategories = filterCategories(categories);

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Toolbar */}
      <div className="p-3 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
        <span className="font-semibold text-gray-700 text-sm">提示词库</span>
        <button 
          onClick={() => onAddCategory()}
          className="p-1 hover:bg-gray-200 rounded text-gray-500 hover:text-brand-600 transition-colors"
          title="新建根分类"
        >
          <Plus size={18} />
        </button>
      </div>

      {/* Search */}
      <div className="p-3 border-b border-gray-100">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
          <input 
            type="text"
            placeholder="搜索分类..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-brand-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-y-auto p-2">
        {filteredCategories.length > 0 ? (
          filteredCategories.map((category) => (
            <TreeNode
              key={category.id}
              category={category}
              templates={templates}
              selectedTemplateId={selectedTemplateId}
              onSelectTemplate={onSelectTemplate}
              onAddCategory={onAddCategory}
              onDeleteCategory={onDeleteCategory}
              onAddTemplate={onAddTemplate}
              onDeleteTemplate={onDeleteTemplate}
              level={0}
            />
          ))
        ) : (
          <div className="text-center py-8 text-gray-400 text-xs">
            {searchTerm ? '未找到匹配的分类' : '暂无分类，请点击上方 + 号添加'}
          </div>
        )}
      </div>
    </div>
  );
};

export default PromptCategoryTree;
