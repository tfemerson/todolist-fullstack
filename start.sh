#!/bin/bash
# 全栈应用启动脚本

echo "🚀 启动智能待办清单全栈应用..."

# 检查Docker和Docker Compose是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ Docker 未安装，请先安装 Docker"
    exit 1
fi

if ! command -v docker-compose &> /dev/null && ! command -v docker compose &> /dev/null; then
    echo "❌ Docker Compose 未安装，请先安装 Docker Compose"
    exit 1
fi

# 创建环境变量文件（如果不存在）
if [ ! -f backend/.env ]; then
    echo "📝 创建后端环境变量文件..."
    cp backend/.env.template backend/.env
    echo "✅ 已创建 backend/.env，请根据需要修改配置"
fi

if [ ! -f .env ]; then
    echo "📝 创建前端环境变量文件..."
    cp .env.template .env
    echo "✅ 已创建 .env，请根据需要修改配置"
fi

# 停止现有容器（如果有）
echo "🛑 停止现有容器..."
docker-compose down

# 构建并启动服务
echo "🔨 构建并启动服务..."
docker-compose up --build -d

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 10

# 检查服务状态
echo "🔍 检查服务状态..."
docker-compose ps

echo ""
echo "✅ 应用启动完成！"
echo "🌐 前端访问地址: http://localhost:3000"
echo "📡 后端API地址: http://localhost:8000"
echo "🎯 API文档地址: http://localhost:8000/docs"
echo "📊 数据库连接: mongodb://localhost:27017"
echo ""
echo "📋 常用命令:"
echo "  查看日志: docker-compose logs -f"
echo "  停止服务: docker-compose down"
echo "  重启服务: docker-compose restart"
echo ""
