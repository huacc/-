
import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Folder, FolderOpen } from 'lucide-react';
import { OntologyCategory } from '../types/ontology';

interface CategoryTreeProps {
  categories: OntologyCategory[];
  selectedId: string;
  onSelect: (id: string, category: OntologyCategory) => void;
  className?: string;
}

const TreeNode: React.FC<{
  category: OntologyCategory;
  level: number;
  selectedId: string;
  onSelect: (id: string, category: OntologyCategory) => void;
  defaultExpanded?: boolean;
}> = ({ category, level, selectedId, onSelect, defaultExpanded = true }) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const hasChildren = category.children && category.children.length > 0;
  const isSelected = selectedId === category.id;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(category.id, category);
  };

  return (
    <div>
      <div
        className={`
          flex items-center py-1.5 px-2 cursor-pointer rounded-md transition-colors text-sm
          ${isSelected 
            ? 'bg-brand-50 text-brand-700 font-medium' 
            : 'text-gray-700 hover:bg-gray-100'}
        `}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={handleSelect}
      >
        <button
          onClick={handleToggle}
          className={`p-0.5 rounded hover:bg-black/5 mr-1 ${!hasChildren ? 'invisible' : ''}`}
        >
          {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
        
        <span className={`mr-2 ${isSelected ? 'text-brand-600' : 'text-gray-400'}`}>
          {isExpanded || isSelected ? <FolderOpen size={16} /> : <Folder size={16} />}
        </span>
        
        <span className="truncate">{category.name}</span>
      </div>

      {hasChildren && isExpanded && (
        <div>
          {category.children!.map((child) => (
            <TreeNode
              key={child.id}
              category={child}
              level={level + 1}
              selectedId={selectedId}
              onSelect={onSelect}
              defaultExpanded={false}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const CategoryTree: React.FC<CategoryTreeProps> = ({ categories, selectedId, onSelect, className }) => {
  return (
    <div className={`overflow-y-auto ${className}`}>
      {categories.map((category) => (
        <TreeNode
          key={category.id}
          category={category}
          level={0}
          selectedId={selectedId}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
};

export default CategoryTree;
