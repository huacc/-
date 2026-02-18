
import React from 'react';
import Editor, { OnMount, OnChange } from '@monaco-editor/react';

export interface MonacoEditorProps {
  /** 编辑器内容 */
  value: string;
  /** 内容变更回调 */
  onChange?: (value: string) => void;
  /** 语言模式 */
  language?: 'markdown' | 'cypher' | 'json' | 'python' | 'prompt-template';
  /** 是否只读 */
  readOnly?: boolean;
  /** 高度 */
  height?: string | number;
  /** 主题 */
  theme?: 'vs' | 'vs-dark' | 'prompt-theme';
  /** 自定义类名 */
  className?: string;
}

/**
 * Monaco Editor 封装组件
 * 集成了基础配置，适配 Markdown 和代码编辑场景
 */
const MonacoEditor: React.FC<MonacoEditorProps> = ({
  value,
  onChange,
  language = 'markdown',
  readOnly = false,
  height = '100%',
  theme = 'vs',
  className
}) => {
  
  const handleEditorChange: OnChange = (value, event) => {
    if (onChange) {
      onChange(value || '');
    }
  };

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    // 注册自定义提示词语言 'prompt-template'
    // 避免重复注册
    if (!monaco.languages.getLanguages().some(l => l.id === 'prompt-template')) {
      monaco.languages.register({ id: 'prompt-template' });

      // 配置语法高亮规则
      monaco.languages.setMonarchTokensProvider('prompt-template', {
        tokenizer: {
          root: [
            // 变量高亮规则: {{variable}}
            [/\{\{[a-zA-Z_][a-zA-Z0-9_]*\}\}/, 'variable'],
            // 尝试继承 markdown 规则 (如果 markdown 已加载)
            // 注意: 在某些构建环境下 include 可能无法完全生效，但变量高亮优先
            // { include: '@markdown' } 
          ]
        }
      });

      // 定义自定义主题
      monaco.editor.defineTheme('prompt-theme', {
        base: 'vs', // 继承自浅色主题
        inherit: true,
        rules: [
          // 变量样式: 品牌蓝，加粗
          { token: 'variable', foreground: '3b82f6', fontStyle: 'bold' }
        ],
        colors: {
          // 可以在这里覆盖编辑器颜色
        }
      });
    }

    // 如果使用了自定义主题，确保在定义后立即应用
    if (theme === 'prompt-theme') {
      monaco.editor.setTheme('prompt-theme');
    }

    // 可以在这里进行额外的编辑器配置，例如注册快捷键
    // editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
    //   console.log('Save triggered');
    // });
  };

  return (
    <div className={`w-full h-full border border-gray-200 rounded-md overflow-hidden ${className}`}>
      <Editor
        height={height}
        language={language}
        theme={theme}
        value={value}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        options={{
          readOnly,
          minimap: { enabled: false }, // 关闭缩略图节省空间
          lineNumbers: 'on',
          wordWrap: 'on', // 自动换行
          scrollBeyondLastLine: false,
          fontSize: 14,
          tabSize: 2,
          automaticLayout: true, // 自动适应容器大小
          padding: { top: 16, bottom: 16 },
          fontFamily: "'Consolas', 'Monaco', 'Courier New', monospace",
        }}
      />
    </div>
  );
};

export default MonacoEditor;
