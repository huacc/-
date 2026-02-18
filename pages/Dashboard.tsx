import React from 'react';

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-800">欢迎使用心理分析系统</h1>
      <p className="text-gray-500">P0阶段 - 基础设施构建</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: '本体模型', count: '12', color: 'bg-blue-500' },
          { title: '知识节点', count: '1,245', color: 'bg-green-500' },
          { title: '提示词模板', count: '48', color: 'bg-orange-500' },
          { title: '接入模型', count: '6', color: 'bg-purple-500' },
        ].map((item, idx) => (
          <div key={idx} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex flex-col">
            <span className="text-gray-500 text-sm mb-2">{item.title}</span>
            <span className="text-3xl font-bold text-gray-800">{item.count}</span>
            <div className={`h-1 w-full mt-4 rounded-full ${item.color} opacity-20`}>
              <div className={`h-1 w-2/3 rounded-full ${item.color}`}></div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 min-h-[400px] flex items-center justify-center text-gray-400">
        系统概览图表区域 (To Be Implemented)
      </div>
    </div>
  );
};

export default Dashboard;