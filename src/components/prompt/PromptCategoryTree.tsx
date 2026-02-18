
import React, { useState } from 'react';
import { 
  Folder, 
  FolderOpen, 
  FileText, 
  ChevronRight, 
  ChevronDown, 
  Plus, 
  Trash2, 
  Edit2, // Added Edit icon
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
  onRenameCategory: (id: string, newName: string) => void; // New prop
  onAddTemplate: (categoryId: string) => void;
  onDeleteTemplate: (id: string) => void;
  onRenameTemplate: (id: string, newName: string) => void; // New prop
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
  onRenameCategory,
  onAddTemplate,
  onDeleteTemplate,
  onRenameTemplate,
  level
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  // Filter templates for this category
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
    if (window.confirm(`确定要删除分类 "${category.name}" 及其所有内容吗？`)) {
      onDeleteCategory(category.id);
    }
  };

  const handleRenameClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newName = window.prompt('重命名分类:', category.name);
    if (newName && newName.trim() !== '') {
      onRenameCategory(category.id, newName.trim());
    }
  };

  return (
    <div>
      {/* Category Node */}
      <div
        className={`
          group flex items-center justify-between py-1.5 px-2 cursor-pointer rounded-md transition-colors text-sm mb-0.5
          text-gray-700 hover:bg-gray-100 select-none
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
          
          <span className="truncate font-medium" title={category.name}>{category.name}</span>
          <span className="ml-2 text-xs text-gray-400">({categoryTemplates.length})</span>
        </div>

        {/* Category Actions (Hover) */}
        <div className={`flex items-center space-x-0.5 ${isHovered ? 'opacity-100' : 'opacity-0'} transition-opacity`}>
          <button 
            onClick={handleAddTemplateClick}
            className="p-1 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded"
            title="新建提示词"
          >
            <Plus size={14} />
          </button>
          {level < 2 && ( // Limit nesting depth
             <button 
             onClick={handleAddSubCategoryClick}
             className="p-1 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded"
             title="新建子分类"
           >
             <Folder size={14} />
           </button>
          )}
          <button 
            onClick={handleRenameClick}
            className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
            title="重命名"
          >
            <Edit2 size={14} />
          </button>
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
              onRenameCategory={onRenameCategory}
              onAddTemplate={onAddTemplate}
              onDeleteTemplate={onDeleteTemplate}
              onRenameTemplate={onRenameTemplate}
              level={level + 1}
            />
          ))}

          {/* Templates */}
          {categoryTemplates.map((template) => (
            <div
              key={template.id}
              className={`
                group flex items-center justify-between py-1.5 px-2 cursor-pointer rounded-md transition-colors text-sm mb-0.5
                ${selectedTemplateId === template.id 
                  ? 'bg-brand-50 text-brand-700 border border-brand-100 font-medium' 
                  : 'text-gray-600 hover:bg-gray-50 border border-transparent'}
              `}
              style={{ paddingLeft: `${(level + 1) * 12 + 24}px` }}
              onClick={(e) => {
                e.stopPropagation();
                onSelectTemplate(template.id);
              }}
            >
              <div className="flex items-center overflow-hidden">
                <FileText size={14} className={`mr-2 flex-shrink-0 ${selectedTemplateId === template.id ? 'text-brand-500' : 'text-gray-400'}`} />
                <span className="truncate" title={template.name}>{template.name}</span>
              </div>
              
              <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    const newName = window.prompt('重命名提示词:', template.name);
                    if (newName && newName.trim()) {
                      onRenameTemplate(template.id, newName.trim());
                    }
                  }}
                  className="p-1 text-gray-400 hover:text-blue-600 rounded"
                  title="重命名"
                >
                  <Edit2 size={13} />
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    if(window.confirm(`确定要删除提示词 "${template.name}" 吗？`)) {
                      onDeleteTemplate(template.id);
                    }
                  }}
                  className="p-1 text-gray-400 hover:text-red-600 rounded"
                  title="删除"
                >
                  <Trash2 size={13} />
                </button>
              </div>
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
  onRenameCategory,
  onAddTemplate,
  onDeleteTemplate,
  onRenameTemplate,
  className 
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Recursive filtering for search
  const filterCategory = (category: PromptCategory, term: string): boolean => {
    const nameMatch = category.name.toLowerCase().includes(term);
    const hasMatchingTemplate = templates.some(t => t.categoryId === category.id && t.name.toLowerCase().includes(term));
    const hasMatchingChildren = category.children?.some(child => filterCategory(child, term)) ?? false;
    return nameMatch || hasMatchingTemplate || hasMatchingChildren;
  };

  const filteredCategories = searchTerm 
    ? categories.filter(c => filterCategory(c, searchTerm.toLowerCase()))
    : categories;

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
            placeholder="搜索..."
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
              onRenameCategory={onRenameCategory}
              onAddTemplate={onAddTemplate}
              onDeleteTemplate={onDeleteTemplate}
              onRenameTemplate={onRenameTemplate}
              level={0}
            />
          ))
        ) : (
          <div className="text-center py-8 text-gray-400 text-xs">
            {searchTerm ? '未找到匹配项' : '暂无分类，请点击 + 号添加'}
          </div>
        )}
      </div>
    </div>
  );
};

export default PromptCategoryTree;
