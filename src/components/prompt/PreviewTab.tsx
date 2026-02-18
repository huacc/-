
import React, { useMemo, useState } from 'react';
import { Copy, AlertCircle, Check } from 'lucide-react';
import { PromptStructure } from '../../types/prompt';
import { compilePrompt } from '../../utils/promptCompiler';
import MonacoEditor from '../MonacoEditor';

interface PreviewTabProps {
  data: PromptStructure;
}

/**
 * Tab6: 原始预览
 * 实时展示编译后的 Prompt 文本，支持一键复制
 */
const PreviewTab: React.FC<PreviewTabProps> = ({ data }) => {
  const compiledContent = useMemo(() => compilePrompt(data), [data]);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(compiledContent).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="flex flex-col h-full space-y-4 animate-in fade-in duration-300">
      {/* Header Info Bar */}
      <div className="flex justify-between items-center bg-gray-50 p-3 rounded-md border border-gray-200">
        <div className="flex items-center text-gray-500 text-sm">
          <AlertCircle size={16} className="mr-2 text-blue-500" />
          <span>此视图为只读预览，展示最终发送给模型的 Prompt。如需修改内容，请前往对应 Tab。</span>
        </div>
        <button
          onClick={handleCopy}
          className={`flex items-center px-3 py-1.5 text-xs font-medium rounded transition-all duration-200 ${
            copied
              ? 'bg-green-100 text-green-700 border border-green-200'
              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400'
          }`}
        >
          {copied ? <Check size={14} className="mr-1.5" /> : <Copy size={14} className="mr-1.5" />}
          {copied ? '已复制' : '复制全文'}
        </button>
      </div>

      {/* Read-only Editor */}
      <div className="flex-1 border border-gray-200 rounded-md overflow-hidden bg-white shadow-sm min-h-[500px]">
        <MonacoEditor
          value={compiledContent}
          language="markdown"
          readOnly={true}
          theme="vs" // 浅色主题，适合阅读
          height="100%"
        />
      </div>
    </div>
  );
};

export default PreviewTab;
