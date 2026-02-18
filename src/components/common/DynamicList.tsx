
import React, { useRef, useEffect } from 'react';
import { Plus, X, AlertCircle } from 'lucide-react';

interface DynamicListProps {
  items: string[];
  onChange: (newItems: string[]) => void;
  placeholder?: string;
  addButtonText?: string;
  emptyText?: string;
  className?: string;
}

/**
 * 通用动态列表组件
 * 用于管理简单的字符串列表，支持增删改
 */
const DynamicList: React.FC<DynamicListProps> = ({
  items,
  onChange,
  placeholder = '请输入内容...',
  addButtonText = '添加条目',
  emptyText = '暂无条目，请点击下方按钮添加',
  className = ''
}) => {
  const lastInputRef = useRef<HTMLInputElement>(null);
  const isAddingRef = useRef(false);

  // 监听添加操作，自动聚焦到新行
  useEffect(() => {
    if (isAddingRef.current && lastInputRef.current) {
      lastInputRef.current.focus();
      isAddingRef.current = false;
    }
  }, [items.length]);

  const handleAdd = () => {
    onChange([...items, '']);
    isAddingRef.current = true;
  };

  const handleRemove = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    onChange(newItems);
  };

  const handleChange = (index: number, value: string) => {
    const newItems = [...items];
    newItems[index] = value;
    onChange(newItems);
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // 如果当前行不为空，则添加新行
      if (items[index].trim()) {
        handleAdd();
      }
    } else if (e.key === 'Backspace' && items[index] === '' && items.length > 0) {
      // 如果当前行以空且按下删除键，则删除当前行并聚焦上一行（交互优化）
      e.preventDefault();
      handleRemove(index);
      // 聚焦逻辑可进一步优化，此处暂略
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {items.length === 0 && (
        <div className="text-sm text-gray-400 italic py-2 border border-dashed border-gray-200 rounded-md text-center bg-gray-50/50">
          {emptyText}
        </div>
      )}
      
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex items-center group animate-in fade-in slide-in-from-left-2 duration-200">
            <div className="flex-shrink-0 w-6 text-center text-xs text-gray-400 font-mono select-none">
              {index + 1}.
            </div>
            <div className="flex-grow relative">
              <input
                ref={index === items.length - 1 ? lastInputRef : null}
                type="text"
                value={item}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                placeholder={placeholder}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 pr-8"
              />
              {!item.trim() && (
                <div className="absolute right-2 top-2.5 text-amber-400 pointer-events-none opacity-0 group-focus-within:opacity-100 transition-opacity">
                  <AlertCircle size={14} />
                </div>
              )}
            </div>
            <button
              onClick={() => handleRemove(index)}
              className="ml-2 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors opacity-60 group-hover:opacity-100"
              title="删除此行"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={handleAdd}
        className="flex items-center text-sm text-brand-600 hover:text-brand-700 font-medium px-2 py-1 rounded hover:bg-brand-50 transition-colors mt-2"
      >
        <Plus size={16} className="mr-1.5" />
        {addButtonText}
      </button>
    </div>
  );
};

export default DynamicList;
