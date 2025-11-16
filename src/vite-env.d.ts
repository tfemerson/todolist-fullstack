/// <reference types="vite/client" />

// Vite 环境变量类型声明
// 这个文件为 import.meta.env 提供 TypeScript 类型支持
interface ImportMetaEnv {
  // API 基础 URL - 用于配置后端服务器地址
  readonly VITE_API_URL?: string;
  
  // Vite 内置环境变量
  readonly MODE: string;
  readonly BASE_URL: string;
  readonly PROD: boolean;
  readonly DEV: boolean;
  readonly SSR: boolean;
}

// 扩展 ImportMeta 接口以包含 env 属性
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
