import React from 'react';
import { PromptStructure } from '../../types/prompt';
import DynamicList from '../common/DynamicList';

interface LogicTabProps {
  data: PromptStructure['logic'];
  onChange: (newLogicData: PromptStructure['logic']) => void;
}

/**
 * Tab2: 分析逻辑
 * 包含核心原则、分析方法、约束条件、示例说明
 */
const LogicTab: React.FC<LogicTabProps> = ({ data, onChange }) => {
  
  const handleChange = (field: keyof PromptStructure['logic'], value: any) => {
    onChange({
      ...data,
      [field]: value
    });
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-in fade-in duration-300">
      <div className="bg-orange-50 border border-orange-100 rounded-md p-4">
        <h4 className="text-sm font-semibold text-orange-800 mb-1">逻辑定义指南</h4>
        <p className="text-xs text-orange-600">
          在此定义 AI 的思维方式。明确的分析原则和方法论能显著减少幻觉，确保输出结果符合预期的逻辑结构。
        </p>
      </div>

      {/* 核心原则 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          核心原则 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={data.principles}
          onChange={(e) => handleChange('principles', e.target.value)}
          placeholder="例如：基于证据链推理，避免主观臆断；优先使用原文中的事实..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
        />
        <p className="mt-1 text-xs text-gray-500">
          AI 在整个任务过程中必须始终遵循的最高指导思想。
        </p>
      </div>

      {/* 分析方法 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          分析方法 <span className="text-red-500">*</span>
        </label>
        <textarea
          rows={5}
          value={data.method}
          onChange={(e) => handleChange('method', e.target.value)}
          placeholder="描述具体的分析方法论。例如：&#10;1. 首先识别文本中的所有实体&#10;2. 然后分析实体之间的关系&#10;3. 最后根据本体定义验证属性值的完整性"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 sm:text-sm leading-relaxed"
        />
        <p className="mt-1 text-xs text-gray-500">
          详细描述 AI 应采用的思维链（Chain of Thought）或具体操作步骤。
        </p>
      </div>

      {/* 约束条件 */}
      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50/30">
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700">
            约束条件
          </label>
          <p className="text-xs text-gray-500">
            列出 AI 必须遵守的具体限制，如格式要求、字数限制、禁止事项等。
          </p>
        </div>
        
        <DynamicList
          items={data.constraints}
          onChange={(newItems) => handleChange('constraints', newItems)}
          placeholder="例如：输出必须为严格的 JSON 格式，不包含 Markdown 代码块标记"
          addButtonText="添加约束条件"
          emptyText="暂无约束条件"
        />
      </div>

      {/* 示例说明 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          示例说明 (Few-Shot)
        </label>
        <textarea
          rows={4}
          value={data.example}
          onChange={(e) => handleChange('example', e.target.value)}
          placeholder="输入：...&#10;思维过程：...&#10;输出：..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 sm:text-sm font-mono bg-slate-50"
        />
        <div className="mt-1 flex justify-between">
          <p className="text-xs text-gray-500">
            提供一个标准的输入输出样例（Input-Output Pair），帮助模型理解预期结果。
          </p>
          <span className="text-xs text-gray-400">
            支持 {'{{variable}}'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default LogicTab;