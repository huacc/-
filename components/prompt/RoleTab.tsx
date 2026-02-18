
import React from 'react';
import { PromptStructure } from '../../types/prompt';
import TagInput from '../common/TagInput';

interface RoleTabProps {
  data: PromptStructure['role'];
  onChange: (newRoleData: PromptStructure['role']) => void;
}

/**
 * Tab1: 角色定义
 * 包含角色身份、专业领域、核心能力、示例说明
 */
const RoleTab: React.FC<RoleTabProps> = ({ data, onChange }) => {
  
  const handleChange = (field: keyof PromptStructure['role'], value: any) => {
    onChange({
      ...data,
      [field]: value
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
      <div className="bg-blue-50 border border-blue-100 rounded-md p-4 mb-6">
        <h4 className="text-sm font-semibold text-blue-800 mb-1">角色定义指南</h4>
        <p className="text-xs text-blue-600">
          清晰的角色定义是高质量提示词的基础。请明确 AI 的身份、所属领域及核心能力，这有助于模型调取特定的领域知识库。
        </p>
      </div>

      {/* 角色身份 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          角色身份 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={data.identity}
          onChange={(e) => handleChange('identity', e.target.value)}
          placeholder="例如：你是一位专业的司法心理学分析专家，擅长微表情分析..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
        />
        <p className="mt-1 text-xs text-gray-500">
          定义 AI 在对话中应扮演的 Persona，建议包含职业头衔和主要职责。
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 专业领域 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            专业领域
          </label>
          <TagInput
            tags={data.expertise}
            onChange={(newTags) => handleChange('expertise', newTags)}
            placeholder="输入领域后回车 (如: 临床心理学)"
          />
          <p className="mt-1 text-xs text-gray-500">
            AI 应当具备的背景知识领域。
          </p>
        </div>

        {/* 核心能力 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            核心能力
          </label>
          <TagInput
            tags={data.capabilities}
            onChange={(newTags) => handleChange('capabilities', newTags)}
            placeholder="输入能力后回车 (如: 风险评估)"
          />
          <p className="mt-1 text-xs text-gray-500">
            AI 在执行任务时主要运用的技能。
          </p>
        </div>
      </div>

      {/* 示例说明 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          示例说明
        </label>
        <textarea
          rows={4}
          value={data.example}
          onChange={(e) => handleChange('example', e.target.value)}
          placeholder="在此处提供 Few-Shot 示例，或对角色的特殊语气、风格进行补充说明。支持使用 {{variable}} 变量。"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 sm:text-sm font-mono"
        />
        <div className="mt-1 flex justify-between">
          <p className="text-xs text-gray-500">
            可选。提供具体的对话示例有助于模型更好地理解角色设定。
          </p>
          <span className="text-xs text-gray-400">
            支持 Markdown 语法
          </span>
        </div>
      </div>
    </div>
  );
};

export default RoleTab;
