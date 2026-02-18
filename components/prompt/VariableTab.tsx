import React, { useState, useEffect } from 'react';
import { RefreshCw, Info, Braces } from 'lucide-react';
import { PromptStructure } from '../../types/prompt';
import { scanVariables } from '../../utils/variableScanner';

interface VariableTabProps {
  data: PromptStructure['variables'];
  fullStructure: PromptStructure; // 需要完整结构来扫描变量
  onChange: (newVariables: PromptStructure['variables']) => void;
}

/**
 * Tab5: 变量定义
 * 自动提取 {{variable}} 并允许配置说明和默认值
 */
const VariableTab: React.FC<VariableTabProps> = ({ data, fullStructure, onChange }) => {
  const [scannedMap, setScannedMap] = useState<Map<string, string[]>>(new Map());
  const [lastScanned, setLastScanned] = useState<Date | null>(null);

  // 执行扫描
  const handleScan = () => {
    const map = scanVariables(fullStructure);
    setScannedMap(map);
    setLastScanned(new Date());

    // 同步到数据结构：保留现有配置，添加新变量，移除不存在的变量
    const currentVars = [...data];
    const newVars: PromptStructure['variables'] = [];
    const scannedNames = Array.from(map.keys());

    // 1. 处理扫描到的变量
    scannedNames.forEach(name => {
      const existing = currentVars.find(v => v.name === name);
      if (existing) {
        newVars.push(existing);
      } else {
        newVars.push({
          name,
          description: '',
          defaultValue: ''
        });
      }
    });

    onChange(newVars);
  };

  // 初始加载时自动扫描一次（如果列表为空）
  useEffect(() => {
    if (data.length === 0) {
      handleScan();
    } else {
      // 仅更新位置映射，不改变数据
      setScannedMap(scanVariables(fullStructure));
    }
  }, []);

  const handleUpdate = (index: number, field: 'description' | 'defaultValue', value: string) => {
    const newVars = [...data];
    newVars[index] = { ...newVars[index], [field]: value };
    onChange(newVars);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-300">
      {/* 顶部提示栏 */}
      <div className="bg-purple-50 border border-purple-100 rounded-md p-4 flex justify-between items-start">
        <div className="flex space-x-3">
          <Braces className="text-purple-600 mt-0.5 flex-shrink-0" size={18} />
          <div>
            <h4 className="text-sm font-semibold text-purple-800 mb-1">变量自动管理</h4>
            <p className="text-xs text-purple-600">
              系统会自动扫描前序 Tab 内容中的 <span className="font-mono bg-purple-100 px-1 rounded">{"{{variable}}"}</span> 占位符。
              <br/>
              请在此处为提取到的变量配置说明和默认值，这将在提示词测试和应用时作为输入项。
            </p>
          </div>
        </div>
        <button
          onClick={handleScan}
          className="flex items-center px-3 py-1.5 bg-white border border-purple-200 text-purple-700 text-xs font-medium rounded hover:bg-purple-100 transition-colors shadow-sm"
        >
          <RefreshCw size={14} className="mr-1.5" />
          刷新变量列表
        </button>
      </div>

      {/* 变量列表表格 */}
      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                变量名
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                出现位置
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                变量说明
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">
                默认值
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                  <div className="flex flex-col items-center">
                    <Info size={32} className="mb-2 text-gray-300" />
                    <p className="text-sm">暂无变量</p>
                    <p className="text-xs mt-1">在其他 Tab 输入 {"{{variable}}"} 格式后点击上方刷新按钮</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((variable, index) => (
                <tr key={variable.name} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap align-top">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded font-mono text-sm font-medium bg-gray-100 text-gray-800 border border-gray-200">
                      {variable.name}
                    </span>
                  </td>
                  <td className="px-6 py-4 align-top">
                    <div className="flex flex-wrap gap-1.5">
                      {scannedMap.get(variable.name)?.map((loc, i) => (
                        <span key={i} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">
                          {loc}
                        </span>
                      )) || <span className="text-xs text-gray-400 italic">未在文本中检测到 (建议刷新)</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 align-top">
                    <input
                      type="text"
                      value={variable.description || ''}
                      onChange={(e) => handleUpdate(index, 'description', e.target.value)}
                      placeholder="描述该变量的用途..."
                      className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </td>
                  <td className="px-6 py-4 align-top">
                    <textarea
                      rows={1}
                      value={variable.defaultValue || ''}
                      onChange={(e) => handleUpdate(index, 'defaultValue', e.target.value)}
                      placeholder="可选默认值..."
                      className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-purple-500 focus:border-purple-500 min-h-[34px] resize-y"
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {lastScanned && (
        <div className="text-right text-xs text-gray-400">
          上次刷新时间: {lastScanned.toLocaleTimeString()}
        </div>
      )}
    </div>
  );
};

export default VariableTab;