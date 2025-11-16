# FastAPI应用主入口文件
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os
from dotenv import load_dotenv

from database import connect_to_mongo, close_mongo_connection
from routes import task_routes

# 加载环境变量
load_dotenv()

# 应用生命周期管理
@asynccontextmanager
async def lifespan(app: FastAPI):
    # 应用启动时连接数据库
    await connect_to_mongo()
    yield
    # 应用关闭时断开数据库连接
    await close_mongo_connection()

# 创建FastAPI应用实例
app = FastAPI(
    title="智能待办清单 API",
    description="SolidJS + FastAPI + MongoDB 全栈应用后端接口",
    version="1.0.0",
    lifespan=lifespan
)

# 配置CORS（跨源资源共享）
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # 原始前端端口
        "http://localhost:3100",  # 新的前端端口
        "http://127.0.0.1:3100",  # 备用地址
        "https://task.tudou168.com",  # ← 添加你的生产域名
        "http://task.tudou168.com",   # ← HTTP 访问
    ],
    allow_credentials=True,
    allow_methods=["*"],  # 允许所有HTTP方法
    allow_headers=["*"],  # 允许所有请求头
)

# 注册路由
app.include_router(task_routes.router, prefix="/api", tags=["任务管理"])

# 根路径端点
@app.get("/")
async def read_root():
    """
    API根路径
    返回API基本信息
    """
    return {
        "message": "智能待办清单 API",
        "version": "1.0.0",
        "status": "运行中"
    }

# 健康检查端点
@app.get("/health")
async def health_check():
    """
    健康检查端点
    用于监控应用状态
    """
    return {"status": "healthy", "message": "服务运行正常"}
