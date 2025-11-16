import { createSignal, createEffect } from 'solid-js';
import { apiClient, apiTaskToLocal, TaskResponse } from '../api/client';

// 任务接口定义
export interface Task {
  id: string; // 改为字符串，直接使用API返回的ID
  text: string;
  completed: boolean;
  createdAt: string;
}

// 任务存储类 - 现在使用FastAPI后端
export class TaskStore {
  // 存储所有任务的信号，键为日期字符串，值为任务数组
  private tasks: () => Record<string, Task[]>;
  private setTasks: (value: Record<string, Task[]>) => void;
  // 加载状态信号
  private loading: () => boolean;
  private setLoading: (value: boolean) => void;
  // 错误状态信号
  private error: () => string | null;
  private setError: (value: string | null) => void;

  constructor() {
    // 创建信号
    const [tasks, setTasks] = createSignal<Record<string, Task[]>>({});
    const [loading, setLoading] = createSignal<boolean>(false);
    const [error, setError] = createSignal<string | null>(null);
    
    this.tasks = tasks;
    this.setTasks = setTasks;
    this.loading = loading;
    this.setLoading = setLoading;
    this.error = error;
    this.setError = setError;
    
    // 初始化时从服务器加载任务数据
    this.loadTasksFromServer();
  }

  // 获取所有任务
  getTasks() {
    return this.tasks();
  }

  // 获取加载状态
  isLoading() {
    return this.loading();
  }

  // 获取错误信息
  getError() {
    return this.error();
  }

  // 获取指定日期的任务
  getTasksForDate(date: Date): Task[] {
    const dateKey = this.formatDateKey(date);
    return this.tasks()[dateKey] || [];
  }

  // 添加任务 - 异步调用API
  async addTask(date: Date, taskText: string): Promise<void> {
    try {
      this.setError(null);
      this.setLoading(true);
      
      const dateKey = this.formatDateKey(date);
      
      // 调用API创建任务
      const apiTask = await apiClient.createTask({
        text: taskText,
        date: dateKey,
        completed: false
      });
      
      // 转换为本地格式
      const newTask = apiTaskToLocal(apiTask);
      
      // 更新本地状态
      const currentTasks = this.tasks();
      const dayTasks = currentTasks[dateKey] || [];
      
      this.setTasks({
        ...currentTasks,
        [dateKey]: [newTask, ...dayTasks]
      });
      
      // 保存到本地存储作为备份
      this.saveTasksToLocalStorage();
      
    } catch (error) {
      console.error('添加任务失败:', error);
      this.setError(error instanceof Error ? error.message : '添加任务失败');
    } finally {
      this.setLoading(false);
    }
  }

  // 切换任务完成状态 - 异步调用API
  async toggleTask(date: Date, taskId: string): Promise<void> {
    try {
      this.setError(null);
      
      const dateKey = this.formatDateKey(date);
      const currentTasks = this.tasks();
      const dayTasks = currentTasks[dateKey] || [];
      const task = dayTasks.find(t => t.id === taskId);
      
      if (!task) {
        throw new Error('任务不存在');
      }
      
      // 直接使用任务ID调用API
      await apiClient.toggleTask(taskId, !task.completed);
      
      // 更新本地状态
      const updatedTasks = dayTasks.map(t => 
        t.id === taskId ? { ...t, completed: !t.completed } : t
      );

      this.setTasks({
        ...currentTasks,
        [dateKey]: updatedTasks
      });
      
      // 保存到本地存储作为备份
      this.saveTasksToLocalStorage();
      
    } catch (error) {
      console.error('切换任务状态失败:', error);
      this.setError(error instanceof Error ? error.message : '更新任务失败');
    }
  }

  // 删除任务 - 异步调用API
  async deleteTask(date: Date, taskId: string): Promise<void> {
    try {
      this.setError(null);
      
      const dateKey = this.formatDateKey(date);
      const currentTasks = this.tasks();
      const dayTasks = currentTasks[dateKey] || [];
      const task = dayTasks.find(t => t.id === taskId);
      
      if (!task) {
        throw new Error('任务不存在');
      }
      
      // 直接使用任务ID调用API删除任务
      await apiClient.deleteTask(taskId);
      
      // 更新本地状态
      const updatedTasks = dayTasks.filter(task => task.id !== taskId);
      
      if (updatedTasks.length === 0) {
        // 如果没有任务了，删除该日期的键
        const newTasks = { ...currentTasks };
        delete newTasks[dateKey];
        this.setTasks(newTasks);
      } else {
        this.setTasks({
          ...currentTasks,
          [dateKey]: updatedTasks
        });
      }
      
      // 保存到本地存储作为备份
      this.saveTasksToLocalStorage();
      
    } catch (error) {
      console.error('删除任务失败:', error);
      this.setError(error instanceof Error ? error.message : '删除任务失败');
    }
  }

  // 检查指定日期是否有任务
  hasTasksForDate(date: Date): boolean {
    const dateKey = this.formatDateKey(date);
    const dayTasks = this.tasks()[dateKey];
    return dayTasks && dayTasks.length > 0;
  }

  // 获取统计信息
  getStats() {
    const allTasks = this.tasks();
    let total = 0;
    let completed = 0;

    Object.values(allTasks).forEach(dayTasks => {
      total += dayTasks.length;
      completed += dayTasks.filter(task => task.completed).length;
    });

    return {
      total,
      completed,
      pending: total - completed
    };
  }

  // 刷新任务数据
  async refreshTasks(): Promise<void> {
    await this.loadTasksFromServer();
  }

  // 格式化日期为存储键（YYYY-MM-DD格式）
  private formatDateKey(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // 从服务器加载任务数据
  private async loadTasksFromServer(): Promise<void> {
    try {
      this.setError(null);
      this.setLoading(true);
      
      // 调用API获取所有任务
      const tasksResponse = await apiClient.getAllTasks();
      
      // 转换API响应为本地格式
      const tasksRecord: Record<string, Task[]> = {};
      
      tasksResponse.forEach(dateGroup => {
        tasksRecord[dateGroup.date] = dateGroup.tasks.map(apiTaskToLocal);
      });
      
      this.setTasks(tasksRecord);
      
      // 保存到本地存储作为备份
      this.saveTasksToLocalStorage();
      
    } catch (error) {
      console.error('从服务器加载任务失败:', error);
      this.setError(error instanceof Error ? error.message : '加载任务数据失败');
      
      // 如果服务器连接失败，尝试从本地存储加载
      this.loadTasksFromLocalStorage();
    } finally {
      this.setLoading(false);
    }
  }

  // 从本地存储加载任务（降级方案）
  private loadTasksFromLocalStorage(): void {
    try {
      const savedTasks = localStorage.getItem('todoTasks');
      if (savedTasks) {
        this.setTasks(JSON.parse(savedTasks));
        console.log('已从本地存储加载任务数据');
      }
    } catch (error) {
      console.error('从本地存储加载任务失败:', error);
      this.setTasks({});
    }
  }

  // 保存任务到本地存储（作为备份）
  private saveTasksToLocalStorage(): void {
    try {
      localStorage.setItem('todoTasks', JSON.stringify(this.tasks()));
    } catch (error) {
      console.error('保存任务到本地存储失败:', error);
    }
  }
} 