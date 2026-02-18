
import { PromptStructure } from '../types/prompt';

interface ExtractedVariable {
  name: string;
  locations: string[];
}

/**
 * 从文本中提取变量名
 * 匹配 {{variable}} 格式
 */
const extractFromText = (text: string): string[] => {
  if (!text) return [];
  // 匹配 {{var}} 或 {{ var }}，允许字母、数字、下划线
  const regex = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g;
  const matches = [...text.matchAll(regex)];
  return matches.map(m => m[1]);
};

/**
 * 扫描提示词结构，提取所有变量及其出现位置
 */
export const scanVariables = (data: PromptStructure): Map<string, string[]> => {
  const variableMap = new Map<string, string[]>();

  const addVariable = (text: string, location: string) => {
    const vars = extractFromText(text);
    vars.forEach(v => {
      const currentLocs = variableMap.get(v) || [];
      if (!currentLocs.includes(location)) {
        currentLocs.push(location);
      }
      variableMap.set(v, currentLocs);
    });
  };

  // 1. Role Tab
  addVariable(data.role.identity, '角色定义-身份');
  addVariable(data.role.example, '角色定义-示例');

  // 2. Logic Tab
  addVariable(data.logic.principles, '分析逻辑-原则');
  addVariable(data.logic.method, '分析逻辑-方法');
  data.logic.constraints.forEach((c, i) => addVariable(c, `分析逻辑-约束${i + 1}`));
  addVariable(data.logic.example, '分析逻辑-示例');

  // 3. Workflow Tab
  data.workflow.forEach((step, i) => {
    addVariable(step.logic, `工作流程-步骤${i + 1}`);
    if (step.example) addVariable(step.example, `工作流程-步骤${i + 1}示例`);
  });

  // 4. Quality Tab
  data.quality.checkpoints.forEach((c, i) => addVariable(c, `质量控制-检查点${i + 1}`));
  data.quality.avoidance.forEach((c, i) => addVariable(c, `质量控制-避免${i + 1}`));

  return variableMap;
};
