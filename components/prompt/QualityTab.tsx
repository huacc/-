
import React from 'react';
import { CheckCircle2, XCircle, ShieldAlert } from 'lucide-react';
import { PromptStructure } from '../../types/prompt';
import DynamicList from '../common/DynamicList';

interface QualityTabProps {
  data: PromptStructure['quality'];
  onChange: (newQuality: PromptStructure['quality']) => void;
}

/**
 * Tab4: 质量控制
 * 包含输出检查点（必须做的事）和避免事项（禁止做的事）
 */
const QualityTab: React.FC<QualityTabProps> = ({ data, onChange }) => {
  
  const handleChange = (field: keyof PromptStructure['quality'], value: string[]) => {
    onChange({
      ...data,
      [field]: value
    });
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-in fade-in duration-300">
      <div className="bg-teal-50 border border-teal-100 rounded-md p-4 flex items-start space-x-3">
        <ShieldAlert className="text-teal-600 mt-0.5 flex-shrink-0" size={18} />
        <div>
          <h4 className="text-sm font-semibold text-teal-800 mb-1">质量控制指南</h4>
          <p className="text-xs text-teal-600">
            在此定义 AI 输出的最后一道防线。明确的"必须做"和"禁止做"清单能显著提升结果的可用性和安全性，防止常见的幻觉或格式错误。
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 输出检查点 (Positive Constraints) */}
        <div className="border border-green-200 rounded-lg bg-green-50/30 overflow-hidden">
          <div className="bg-green-100/50 px-4 py-3 border-b border-green-200 flex items-center">
            <CheckCircle2 className="text-green-600 mr-2" size={18} />
            <div>
              <h3 className="text-sm font-semibold text-green-900">输出检查点</h3>
              <p className="text-xs text-green-700">AI 必须满足的要求 (Do's)</p>
            </div>
          </div>
          <div className="p-4">
            <DynamicList
              items={data.checkpoints}
              onChange={(newItems) => handleChange('checkpoints', newItems)}
              placeholder="例如：必须输出置信度评分..."
              addButtonText="添加检查点"
              emptyText="暂无检查点，建议添加以确保质量"
            />
          </div>
        </div>

        {/* 避免事项 (Negative Constraints) */}
        <div className="border border-red-200 rounded-lg bg-red-50/30 overflow-hidden">
          <div className="bg-red-100/50 px-4 py-3 border-b border-red-200 flex items-center">
            <XCircle className="text-red-600 mr-2" size={18} />
            <div>
              <h3 className="text-sm font-semibold text-red-900">避免事项</h3>
              <p className="text-xs text-red-700">AI 严禁出现的行为 (Don'ts)</p>
            </div>
          </div>
          <div className="p-4">
            <DynamicList
              items={data.avoidance}
              onChange={(newItems) => handleChange('avoidance', newItems)}
              placeholder="例如：不得臆造原文不存在的细节..."
              addButtonText="添加避免事项"
              emptyText="暂无避免事项"
            />
          </div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 text-xs text-gray-500 border border-gray-100">
        <h5 className="font-medium text-gray-700 mb-2">最佳实践提示：</h5>
        <ul className="list-disc list-inside space-y-1 ml-1">
          <li>检查点应包含具体的格式要求（如 JSON 结构的完整性）。</li>
          <li>避免事项应包含对幻觉的抑制（如"如果不确定，请回答不知道"）。</li>
          <li>针对特定领域的伦理或安全要求也应在此处列出。</li>
        </ul>
      </div>
    </div>
  );
};

export default QualityTab;
