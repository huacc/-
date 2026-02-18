
import React, { useState, KeyboardEvent } from 'react';
import { X, Plus } from 'lucide-react';

interface TagInputProps {
  tags: string[];
  onChange: (newTags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
  className?: string;
}

/**
 * 通用标签输入组件
 * 支持输入文本后按回车添加标签，点击标签上的 X 删除
 */
const TagInput: React.FC<TagInputProps> = ({ 
  tags, 
  onChange, 
  placeholder = '输入后按回车添加...', 
  maxTags = 20,
  className = ''
}) => {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const addTag = () => {
    const trimmed = inputValue.trim();
    if (trimmed && !tags.includes(trimmed)) {
      if (tags.length >= maxTags) {
        // 可选：添加最大数量提示
        return;
      }
      onChange([...tags, trimmed]);
      setInputValue('');
    }
  };

  const removeTag = (indexToRemove: number) => {
    onChange(tags.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag, index) => (
          <span 
            key={`${tag}-${index}`} 
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-50 text-brand-700 border border-brand-100"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(index)}
              className="flex-shrink-0 ml-1.5 h-4 w-4 rounded-full inline-flex items-center justify-center text-brand-400 hover:bg-brand-200 hover:text-brand-500 focus:outline-none"
            >
              <span className="sr-only">Remove tag</span>
              <X size={12} />
            </button>
          </span>
        ))}
      </div>
      
      <div className="relative rounded-md shadow-sm">
        <input
          type="text"
          className="focus:ring-brand-500 focus:border-brand-500 block w-full sm:text-sm border-gray-300 rounded-md px-3 py-2 border"
          placeholder={tags.length >= maxTags ? `最多添加 ${maxTags} 个标签` : placeholder}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={addTag} // 失去焦点时也尝试添加
          disabled={tags.length >= maxTags}
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-2">
          <button
            type="button"
            onClick={addTag}
            disabled={!inputValue.trim() || tags.length >= maxTags}
            className="p-1 text-gray-400 hover:text-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TagInput;

// 示例用法：
// <TagInput tags={expertise} onChange={setExpertise} placeholder="添加专业领域..." />
