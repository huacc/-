
import React, { useState, useEffect } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';

interface ModelConfigModalProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  initialData?: ModelFormData | null;
  onClose: () => void;
  onSave: (data: ModelFormData) => void;
}

export interface ModelFormData {
  // 基本信息
  name: string;
  provider: string;
  version: string;
  type: 'LLM' | 'VLM';
  // API配置
  apiEndpoint: string;
  apiKey: string;
  organizationId?: string;
  // 默认参数
  timeout: number;
  maxTokens: number;
  temperature: number;
  topP: number;
  // 使用限制
  rpmLimit?: number;
  dailyRequestLimit?: number;
  costBudget?: number;
}

const PROVIDERS = [
  'OpenAI', 'Anthropic', 'Google', 'Alibaba', 'Baidu', 'ByteDance'
];

const INITIAL_DATA: ModelFormData = {
  name: '',
  provider: '',
  version: '',
  type: 'LLM',
  apiEndpoint: '',
  apiKey: '',
  organizationId: '',
  timeout: 60,
  maxTokens: 4096,
  temperature: 0.7,
  topP: 1,
  rpmLimit: 60,
  dailyRequestLimit: 10000,
  costBudget: 0,
};

const ModelConfigModal: React.FC<ModelConfigModalProps> = ({ 
  isOpen, 
  mode, 
  initialData, 
  onClose, 
  onSave 
}) => {
  const [formData, setFormData] = useState<ModelFormData>(INITIAL_DATA);
  const [showApiKey, setShowApiKey] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof ModelFormData, string>>>({});

  // 初始化或重置表单
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && initialData) {
        setFormData({ ...initialData });
      } else {
        setFormData({ ...INITIAL_DATA });
      }
      setErrors({});
      setShowApiKey(false);
    }
  }, [isOpen, mode, initialData]);

  if (!isOpen) return null;

  const handleChange = (field: keyof ModelFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // 清除当前字段的错误
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateField = (field: keyof ModelFormData, value: any): string | undefined => {
    switch (field) {
      case 'name':
        if (!value || !value.trim()) return '模型名称不能为空';
        if (value.length < 2 || value.length > 50) return '名称长度需在 2-50 字符之间';
        break;
      case 'provider':
        if (!value) return '请选择提供商';
        break;
      case 'version':
        if (!value || !value.trim()) return '模型版本不能为空';
        if (value.length < 2 || value.length > 100) return '版本标识长度需在 2-100 字符之间';
        break;
      case 'apiEndpoint':
        if (!value) return 'API 端点不能为空';
        if (!/^https?:\/\/.+/.test(value)) return '请输入有效的 URL (以 http:// 或 https:// 开头)';
        break;
      case 'apiKey':
        if (!value) return 'API Key 不能为空';
        if (value.length < 10) return 'API Key 格式似乎不正确 (过短)';
        break;
      case 'timeout':
        if (!value) return '超时时间必填';
        if (value < 10 || value > 300) return '超时时间需在 10-300 秒之间';
        break;
      case 'maxTokens':
        if (!value) return '最大 Token 数必填';
        if (value < 100 || value > 128000) return 'Token 数需在 100-128000 之间';
        break;
      default:
        break;
    }
    return undefined;
  };

  const handleBlur = (field: keyof ModelFormData) => {
    const error = validateField(field, formData[field]);
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const handleSubmit = () => {
    // 提交前执行全量验证
    const newErrors: Partial<Record<keyof ModelFormData, string>> = {};
    let hasError = false;

    (Object.keys(formData) as Array<keyof ModelFormData>).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) {
        newErrors[key] = error;
        hasError = true;
      }
    });

    setErrors(newErrors);

    if (!hasError) {
      onSave(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-[600px] max-h-[90vh] flex flex-col animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">
            {mode === 'create' ? '新建模型' : '编辑模型'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
          
          {/* Section 1: 基本信息 */}
          <section className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900 border-l-4 border-brand-500 pl-2">基本信息</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  模型名称 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="如：OpenAI GPT-4o"
                  className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  onBlur={() => handleBlur('name')}
                />
                {errors.name && <span className="text-xs text-red-500 mt-1">{errors.name}</span>}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  提供商 <span className="text-red-500">*</span>
                </label>
                <select
                  className={`w-full px-3 py-2 border rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 ${errors.provider ? 'border-red-500' : 'border-gray-300'}`}
                  value={formData.provider}
                  onChange={(e) => handleChange('provider', e.target.value)}
                  onBlur={() => handleBlur('provider')}
                >
                  <option value="">请选择</option>
                  {PROVIDERS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                {errors.provider && <span className="text-xs text-red-500 mt-1">{errors.provider}</span>}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  模型版本 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="如：gpt-4o-2024-05-13"
                  className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 ${errors.version ? 'border-red-500' : 'border-gray-300'}`}
                  value={formData.version}
                  onChange={(e) => handleChange('version', e.target.value)}
                  onBlur={() => handleBlur('version')}
                />
                {errors.version && <span className="text-xs text-red-500 mt-1">{errors.version}</span>}
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  模型类型 <span className="text-red-500">*</span>
                </label>
                <div className="flex space-x-6">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="modelType"
                      value="LLM"
                      checked={formData.type === 'LLM'}
                      onChange={() => handleChange('type', 'LLM')}
                      className="text-brand-600 focus:ring-brand-500"
                    />
                    <span className="text-sm text-gray-700">LLM (大语言模型)</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="modelType"
                      value="VLM"
                      checked={formData.type === 'VLM'}
                      onChange={() => handleChange('type', 'VLM')}
                      className="text-brand-600 focus:ring-brand-500"
                    />
                    <span className="text-sm text-gray-700">VLM (视觉语言模型)</span>
                  </label>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: API配置 */}
          <section className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900 border-l-4 border-brand-500 pl-2">API 配置</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  API 端点 (Base URL) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="https://api.openai.com/v1"
                  className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 font-mono ${errors.apiEndpoint ? 'border-red-500' : 'border-gray-300'}`}
                  value={formData.apiEndpoint}
                  onChange={(e) => handleChange('apiEndpoint', e.target.value)}
                  onBlur={() => handleBlur('apiEndpoint')}
                />
                {errors.apiEndpoint && <span className="text-xs text-red-500 mt-1">{errors.apiEndpoint}</span>}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  API Key <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showApiKey ? "text" : "password"}
                    placeholder="sk-..."
                    className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 font-mono pr-10 ${errors.apiKey ? 'border-red-500' : 'border-gray-300'}`}
                    value={formData.apiKey}
                    onChange={(e) => handleChange('apiKey', e.target.value)}
                    onBlur={() => handleBlur('apiKey')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                  >
                    {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.apiKey && <span className="text-xs text-red-500 mt-1">{errors.apiKey}</span>}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Organization ID <span className="text-gray-400 font-normal">(可选)</span>
                </label>
                <input
                  type="text"
                  placeholder="org-..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 font-mono"
                  value={formData.organizationId || ''}
                  onChange={(e) => handleChange('organizationId', e.target.value)}
                />
              </div>
            </div>
          </section>

          {/* Section 3: 默认参数 */}
          <section className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900 border-l-4 border-brand-500 pl-2">默认参数</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  超时时间 (秒) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 ${errors.timeout ? 'border-red-500' : 'border-gray-300'}`}
                  value={formData.timeout}
                  onChange={(e) => handleChange('timeout', parseInt(e.target.value) || 0)}
                  onBlur={() => handleBlur('timeout')}
                />
                {errors.timeout && <span className="text-xs text-red-500 mt-1">{errors.timeout}</span>}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  最大 Token <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 ${errors.maxTokens ? 'border-red-500' : 'border-gray-300'}`}
                  value={formData.maxTokens}
                  onChange={(e) => handleChange('maxTokens', parseInt(e.target.value) || 0)}
                  onBlur={() => handleBlur('maxTokens')}
                />
                {errors.maxTokens && <span className="text-xs text-red-500 mt-1">{errors.maxTokens}</span>}
              </div>
              <div className="col-span-2 space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <label className="text-xs font-medium text-gray-700">Temperature</label>
                    <span className="text-xs text-gray-500">{formData.temperature}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
                    value={formData.temperature}
                    onChange={(e) => handleChange('temperature', parseFloat(e.target.value))}
                  />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <label className="text-xs font-medium text-gray-700">Top P</label>
                    <span className="text-xs text-gray-500">{formData.topP}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
                    value={formData.topP}
                    onChange={(e) => handleChange('topP', parseFloat(e.target.value))}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Section 4: 使用限制 */}
          <section className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900 border-l-4 border-brand-500 pl-2">使用限制</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  每分钟请求限制 (RPM)
                </label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  value={formData.rpmLimit || 0}
                  onChange={(e) => handleChange('rpmLimit', parseInt(e.target.value) || 0)}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  每日请求限额
                </label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  value={formData.dailyRequestLimit || 0}
                  onChange={(e) => handleChange('dailyRequestLimit', parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  成本预算 (元/天)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500 text-sm">¥</span>
                  <input
                    type="number"
                    className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    value={formData.costBudget || 0}
                    onChange={(e) => handleChange('costBudget', parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end space-x-3 bg-gray-50 rounded-b-lg">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 font-medium transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-md text-sm font-medium transition-colors shadow-sm"
          >
            {mode === 'create' ? '创建' : '保存'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModelConfigModal;
