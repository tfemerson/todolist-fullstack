# 智能待办事项清单 - 全栈版本

这是一个使用现代技术栈开发的智能待办事项清单全栈应用，采用 SolidJS + FastAPI + MongoDB 的组合，提供完整的前后端分离解决方案。

## 🌟 功能特性

- 📅 **日历视图**：直观的月份日历显示，支持月份导航
- ✅ **任务管理**：添加、删除、标记完成任务，实时同步到云端
- 📊 **统计信息**：实时显示总任务数、已完成和待完成任务
- 💾 **云端存储**：使用 MongoDB 数据库保存数据，支持多设备同步
- 📱 **响应式设计**：完美适配桌面、平板和手机设备
- 🎨 **现代UI**：美观的渐变背景和动画效果
- 🔄 **实时同步**：任务数据实时同步到服务器
- 🛠️ **错误处理**：完善的错误处理机制和用户反馈
- 📈 **性能优化**：高效的数据获取和缓存机制
- 🐳 **容器化部署**：使用 Docker 实现一键部署

## 🏗️ 技术栈

### 前端
- **SolidJS** - 高性能响应式前端框架
- **TypeScript** - 类型安全的 JavaScript
- **Vite** - 快速的前端构建工具
- **CSS3** - 现代样式和动画

### 后端
- **FastAPI** - 现代高性能 Python Web 框架
- **Motor** - 异步 MongoDB 驱动
- **Pydantic** - 数据验证和序列化
- **Uvicorn** - ASGI 服务器

### 数据库
- **MongoDB** - 面向文档的 NoSQL 数据库

### 部署
- **Docker** - 容器化部署
- **Docker Compose** - 多容器编排

## 🚀 快速开始

### 方式一：使用启动脚本（推荐）

**Linux/macOS:**
```bash
chmod +x start.sh
./start.sh
```

**Windows:**
```batch
start.bat
```

### 方式二：手动启动

#### 1. 环境准备
确保已安装以下软件：
- Docker
- Docker Compose
- Git

#### 2. 克隆项目
```bash
git clone <project-url>
cd todo list solidjs - 全栈-Python+FastApi
```

#### 3. 配置环境变量
```bash
# 复制环境变量模板文件
cp .env.template .env
cp backend/.env.template backend/.env

# 根据需要修改配置
```

#### 4. 启动服务
```bash
# 构建并启动所有服务
docker-compose up --build -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

#### 5. 访问应用
- **前端界面**: http://localhost:3000
- **后端API**: http://localhost:8000
- **API文档**: http://localhost:8000/docs
- **MongoDB**: mongodb://localhost:27017

## 📁 项目结构

```
todo-list-fullstack/
├── frontend/                    # 前端代码
│   ├── src/
│   │   ├── components/          # 组件目录
│   │   │   ├── Calendar.tsx     # 日历组件
│   │   │   └── TaskSection.tsx  # 任务区域组件
│   │   ├── store/               # 状态管理
│   │   │   └── TaskStore.ts     # 任务存储类
│   │   ├── api/                 # API客户端
│   │   │   └── client.ts        # HTTP客户端
│   │   ├── App.tsx              # 主应用组件
│   │   ├── index.tsx            # 应用入口
│   │   └── styles.css           # 全局样式
│   ├── package.json             # 前端依赖
│   └── Dockerfile.frontend      # 前端Docker配置
├── backend/                     # 后端代码
│   ├── routes/                  # API路由
│   │   └── task_routes.py       # 任务管理路由
│   ├── models.py                # 数据模型
│   ├── database.py              # 数据库连接
│   ├── main.py                  # 应用入口
│   ├── requirements.txt         # Python依赖
│   └── Dockerfile               # 后端Docker配置
├── docker-compose.yml           # Docker编排配置
├── init-mongo.js               # MongoDB初始化脚本
├── start.sh                    # Linux/Mac启动脚本
├── start.bat                   # Windows启动脚本
└── README.md                   # 项目文档
```

## 📖 使用说明

### 基本操作
1. **选择日期**：点击日历中的任意日期
2. **添加任务**：在输入框中输入任务内容，点击"添加任务"按钮或按回车键
3. **完成任务**：点击任务前的复选框标记任务为完成
4. **删除任务**：点击任务右侧的"删除"按钮
5. **查看统计**：在日历下方查看任务统计信息
6. **切换月份**：使用日历头部的左右箭头切换月份

### 云端功能
- **自动同步**：所有操作都会自动同步到云端数据库
- **多设备访问**：可以在不同设备上访问同一份数据
- **离线支持**：网络不佳时会显示缓存数据
- **错误处理**：操作失败时会显示错误信息并提供重试选项

## ✨ 特色功能

- **任务标记**：有任务的日期会显示小红点标记
- **今日高亮**：当前日期用蓝色背景高亮显示
- **选中状态**：选中的日期用紫色背景显示
- **动画效果**：悬停和点击时的平滑动画效果
- **云端持久化**：数据保存在 MongoDB 云数据库中
- **实时反馈**：操作状态实时显示（加载中、成功、失败）
- **容错机制**：网络错误时自动降级到本地缓存
- **性能优化**：智能缓存和批量操作优化

## 🛠️ 开发说明

### 架构设计
本项目采用现代全栈架构：

**前端架构：**
- **组件化设计**：可重用的 React 风格组件
- **状态管理**：使用 TaskStore 类统一管理应用状态
- **响应式系统**：利用 SolidJS 的 Signal 实现高效更新
- **API 集成**：RESTful API 客户端封装
- **类型安全**：全面的 TypeScript 类型定义

**后端架构：**
- **FastAPI框架**：现代 Python Web 框架，支持异步操作
- **RESTful API**：符合 REST 规范的 API 设计
- **数据验证**：使用 Pydantic 进行数据验证和序列化
- **异步操作**：全面支持异步数据库操作
- **文档自动生成**：自动生成 OpenAPI 文档

**数据库设计：**
- **文档存储**：使用 MongoDB 存储任务数据
- **索引优化**：为常用查询字段创建索引
- **数据模型**：清晰的数据结构定义

### 本地开发

#### 前端开发
```bash
# 安装前端依赖
npm install

# 启动前端开发服务器
npm run dev

# 前端将在 http://localhost:3000 启动
```

#### 后端开发
```bash
# 进入后端目录
cd backend

# 创建虚拟环境
python -m venv venv

# 激活虚拟环境
# Windows: venv\Scripts\activate
# Linux/Mac: source venv/bin/activate

# 安装依赖
pip install -r requirements.txt

# 启动后端服务器
uvicorn main:app --reload --port 8000

# 后端将在 http://localhost:8000 启动
# API 文档在 http://localhost:8000/docs
```

#### 数据库开发
```bash
# 启动 MongoDB 容器
docker run -d -p 27017:27017 --name mongo mongo:7.0

# 或者使用 MongoDB Atlas 云数据库
# 在 backend/.env 中配置连接字符串
```

## 🔧 常用命令

```bash
# 启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 停止所有服务
docker-compose down

# 重新构建并启动
docker-compose up --build -d

# 清理所有容器和数据
docker-compose down -v --rmi all

# 进入容器
docker exec -it todolist_backend bash
docker exec -it todolist_mongo mongosh
```

## 🌐 API 文档

启动后端服务后，访问 http://localhost:8000/docs 查看完整的 API 文档。

主要 API 端点：
- `GET /api/tasks` - 获取所有任务
- `POST /api/tasks` - 创建新任务
- `PUT /api/tasks/{id}` - 更新任务
- `DELETE /api/tasks/{id}` - 删除任务
- `GET /api/stats` - 获取统计信息

## 🔒 环境变量配置

### 前端环境变量 (.env)
```env
VITE_API_URL=http://localhost:8000
VITE_DEV_MODE=true
```

### 后端环境变量 (backend/.env)
```env
MONGODB_URL=mongodb://mongo:27017
DATABASE_NAME=todolist_db
API_HOST=0.0.0.0
API_PORT=8000
```

## 🌐 浏览器支持

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 🤝 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 📞 支持

如果您遇到任何问题或有建议，请：
1. 查看 [Issues](../../issues) 页面
2. 创建新的 Issue
3. 联系维护者

---

**享受使用智能待办清单吧！** 🎉 