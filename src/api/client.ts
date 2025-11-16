// API客户端 - 处理与后端的HTTP通信
import { Task } from '../store/TaskStore';

// 从环境变量获取API基础URL，开发环境默认使用localhost
const API_BASE_URL = import.meta.env.VITE_API_URL ||(import.meta.env.PROD ? '/api' : 'http://localhost:8000');

// API响应类型定义
export interface TaskResponse {
  id: string;
  text: string;
  completed: boolean;
  date: string;
  created_at: string;
  updated_at: string;
}

export interface TasksResponse {
  date: string;
  tasks: TaskResponse[];
}

export interface StatsResponse {
  total: number;
  completed: number;
  pending: number;
}

// API错误处理类
export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

// HTTP请求工具类
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  // 通用请求方法
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      // 检查HTTP状态码
      if (!response.ok) {
        const errorText = await response.text();
        throw new ApiError(response.status, errorText || response.statusText);
      }

      // 对于204状态码（No Content），直接返回空响应
      if (response.status === 204) {
        return {} as T;
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      // 网络错误或其他错误
      throw new ApiError(0, `网络错误: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  // GET请求
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  // POST请求
  async post<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // PUT请求
  async put<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // DELETE请求
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // 任务相关API方法

  // 创建任务
  async createTask(taskData: { text: string; date: string; completed?: boolean }): Promise<TaskResponse> {
    return this.post<TaskResponse>('/api/tasks', taskData);
  }

  // 获取所有任务
  async getAllTasks(): Promise<TasksResponse[]> {
    return this.get<TasksResponse[]>('/api/tasks');
  }

  // 获取指定日期的任务
  async getTasksByDate(date: string): Promise<TaskResponse[]> {
    return this.get<TaskResponse[]>(`/api/tasks/${date}`);
  }

  // 更新任务
  async updateTask(taskId: string, updateData: { text?: string; completed?: boolean }): Promise<TaskResponse> {
    return this.put<TaskResponse>(`/api/tasks/${taskId}`, updateData);
  }

  // 删除任务
  async deleteTask(taskId: string): Promise<void> {
    return this.delete<void>(`/api/tasks/${taskId}`);
  }

  // 获取统计信息
  async getStats(): Promise<StatsResponse> {
    return this.get<StatsResponse>('/api/stats');
  }

  // 切换任务完成状态
  async toggleTask(taskId: string, completed: boolean): Promise<TaskResponse> {
    return this.updateTask(taskId, { completed });
  }
}

// 创建并导出API客户端实例
export const apiClient = new ApiClient(API_BASE_URL);

// 工具函数：将API响应转换为本地Task格式
export function apiTaskToLocal(apiTask: TaskResponse): Task {
  return {
    id: apiTask.id, // 直接使用API返回的ID
    text: apiTask.text,
    completed: apiTask.completed,
    createdAt: apiTask.created_at,
  };
}

// 工具函数：将本地Task格式转换为API请求格式
export function localTaskToApi(task: Partial<Task>, date: string) {
  return {
    text: task.text || '',
    completed: task.completed || false,
    date,
  };
}
