
import { PromptStructure } from '../types/prompt';

/**
 * 将结构化提示词数据编译为 Markdown 格式字符串
 * 用于预览和最终发送给模型
 */
export const compilePrompt = (data: PromptStructure): string => {
  const parts: string[] = [];

  // 1. Role Definition (角色定义)
  if (data.role.identity) {
    parts.push(`# Role: ${data.role.identity}`);
  }
  
  if (data.role.expertise && data.role.expertise.length > 0) {
    parts.push(`\n## Expertise\n- ${data.role.expertise.join('\n- ')}`);
  }
  
  if (data.role.capabilities && data.role.capabilities.length > 0) {
    parts.push(`\n## Capabilities\n- ${data.role.capabilities.join('\n- ')}`);
  }
  
  if (data.role.example) {
    parts.push(`\n## Role Context & Style\n${data.role.example}`);
  }

  // 2. Analysis Logic (分析逻辑)
  if (data.logic.principles || data.logic.method || data.logic.constraints.length > 0) {
    parts.push(`\n# Analysis Logic`);
    
    if (data.logic.principles) {
      parts.push(`\n## Core Principles\n${data.logic.principles}`);
    }
    
    if (data.logic.method) {
      parts.push(`\n## Methodology\n${data.logic.method}`);
    }
    
    if (data.logic.constraints.length > 0) {
      parts.push(`\n## Constraints\n- ${data.logic.constraints.join('\n- ')}`);
    }
    
    if (data.logic.example) {
      parts.push(`\n## Few-Shot Example\n${data.logic.example}`);
    }
  }

  // 3. Workflow (工作流程)
  if (data.workflow.length > 0) {
    parts.push(`\n# Workflow`);
    data.workflow.forEach((step, index) => {
      parts.push(`\n## Step ${index + 1}: ${step.id}`);
      parts.push(`${step.logic}`);
      if (step.example) {
        parts.push(`> Example: ${step.example}`);
      }
    });
  }

  // 4. Quality Control (质量控制)
  if (data.quality.checkpoints.length > 0 || data.quality.avoidance.length > 0) {
    parts.push(`\n# Quality Control`);
    
    if (data.quality.checkpoints.length > 0) {
      parts.push(`\n## Output Checkpoints (Must Have)\n- [ ] ${data.quality.checkpoints.join('\n- [ ] ')}`);
    }
    
    if (data.quality.avoidance.length > 0) {
      parts.push(`\n## Negative Constraints (Avoid)\n- [x] ${data.quality.avoidance.join('\n- [x] ')}`);
    }
  }

  return parts.join('\n');
};
