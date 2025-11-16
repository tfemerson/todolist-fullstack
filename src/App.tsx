import { Component, createSignal, createEffect, onMount } from 'solid-js';
import Calendar from './components/Calendar';
import TaskSection from './components/TaskSection';
import { TaskStore } from './store/TaskStore';

// 主应用组件
const App: Component = () => {
  // 创建任务存储实例
  const taskStore = new TaskStore();
  
  // 当前选中的日期信号
  const [selectedDate, setSelectedDate] = createSignal<Date | null>(null);
  
  // 组件挂载时选择今天
  onMount(() => {
    const today = new Date();
    setSelectedDate(today);
  });

  return (
    <div class="container">
      {/* 页面头部 */}
      <div class="header">
        <h1>📅 智能待办清单</h1>
        <p>高效管理您的每日任务，让生活更有条理</p>
      </div>

      {/* 主要内容区域 */}
      <div class="main-content">
        {/* 日历区域 */}
        <Calendar 
          taskStore={taskStore}
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
        />

        {/* 任务管理区域 */}
        <TaskSection 
          taskStore={taskStore}
          selectedDate={selectedDate}
        />
      </div>
    </div>
  );
};

export default App; 