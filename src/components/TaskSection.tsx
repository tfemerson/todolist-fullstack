import { Component, createSignal, createMemo, Show, For, Accessor } from 'solid-js';
import { TaskStore } from '../store/TaskStore';

interface TaskSectionProps {
  taskStore: TaskStore;
  selectedDate: Accessor<Date | null>;
}

// 任务区域组件
const TaskSection: Component<TaskSectionProps> = (props) => {
  // 任务输入框的值
  const [taskInput, setTaskInput] = createSignal('');

  // 获取选中日期的任务列表
  const dayTasks = createMemo(() => {
    const date = props.selectedDate();
    return date ? props.taskStore.getTasksForDate(date) : [];
  });

  // 格式化日期显示
  const formatDateDisplay = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    const weekday = weekdays[date.getDay()];
    
    return `${year}年${month}月${day}日 ${weekday}`;
  };

  // 添加任务 - 现在是异步操作
  const addTask = async () => {
    const text = taskInput().trim();
    const date = props.selectedDate();
    
    if (!text) {
      alert('请输入任务内容！');
      return;
    }
    
    if (!date) {
      alert('请先选择一个日期！');
      return;
    }
    
    try {
      await props.taskStore.addTask(date, text);
      setTaskInput(''); // 清空输入框
    } catch (error) {
      console.error('添加任务失败:', error);
      alert('添加任务失败，请稍后重试');
    }
  };

  // 处理回车键
  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      addTask();
    }
  };

  // 切换任务完成状态 - 现在是异步操作
  const toggleTask = async (taskId: string) => {
    const date = props.selectedDate();
    if (date) {
      try {
        await props.taskStore.toggleTask(date, taskId);
      } catch (error) {
        console.error('更新任务状态失败:', error);
        alert('更新任务状态失败，请稍后重试');
      }
    }
  };

  // 删除任务 - 现在是异步操作
  const deleteTask = async (taskId: string) => {
    if (!confirm('确定要删除这个任务吗？')) {
      return;
    }
    
    const date = props.selectedDate();
    if (date) {
      try {
        await props.taskStore.deleteTask(date, taskId);
      } catch (error) {
        console.error('删除任务失败:', error);
        alert('删除任务失败，请稍后重试');
      }
    }
  };

  // HTML转义函数
  const escapeHtml = (text: string) => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  };

  return (
    <div class="tasks-section">
      {/* 任务区域头部 */}
      <div class="tasks-header">
        <h2>📝 今日任务</h2>
        <div class="selected-date">
          <Show when={props.selectedDate()} fallback="请选择日期">
            {formatDateDisplay(props.selectedDate()!)}
          </Show>
        </div>
        {/* 加载状态指示器 */}
        <Show when={props.taskStore.isLoading()}>
          <div class="loading-indicator">🔄 加载中...</div>
        </Show>
        {/* 错误信息显示 */}
        <Show when={props.taskStore.getError()}>
          <div class="error-message">
            ❌ {props.taskStore.getError()}
            <button 
              class="retry-btn" 
              onClick={() => props.taskStore.refreshTasks()}
            >
              重试
            </button>
          </div>
        </Show>
      </div>

      {/* 添加任务表单 */}
      <div class="add-task-form">
        <input 
          type="text" 
          class="task-input" 
          placeholder="输入您的新任务..." 
          maxlength="100"
          value={taskInput()}
          onInput={(e) => setTaskInput(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button class="add-btn" onClick={addTask}>
          添加任务
        </button>
      </div>

      {/* 任务列表容器 */}
      <div class="tasks-list">
        <Show 
          when={dayTasks().length > 0} 
          fallback={
            <div class="empty-state">
              🌟 暂无任务，点击上方添加新任务开始规划您的一天！
            </div>
          }
        >
          <For each={dayTasks()}>
            {(task) => (
              <div class={`task-item ${task.completed ? 'completed' : ''}`}>
                <div class="task-content">
                  <input 
                    type="checkbox" 
                    class="task-checkbox"
                    checked={task.completed}
                    onChange={() => toggleTask(task.id)}
                  />
                  <span class="task-text" innerHTML={escapeHtml(task.text)} />
                </div>
                <div class="task-actions">
                  <button 
                    class="delete-btn" 
                    onClick={() => deleteTask(task.id)}
                  >
                    删除
                  </button>
                </div>
              </div>
            )}
          </For>
        </Show>
      </div>
    </div>
  );
};

export default TaskSection; 