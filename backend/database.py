# MongoDB数据库连接配置
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
import logging

# 加载环境变量
load_dotenv()

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 全局数据库连接对象
database = None
client = None

async def connect_to_mongo():
    """
    连接到MongoDB数据库
    使用Motor异步驱动程序
    """
    global database, client
    
    try:
        # 从环境变量获取MongoDB连接字符串
        mongodb_url = os.getenv("MONGODB_URL", "mongodb://mongo:27017")
        db_name = os.getenv("DATABASE_NAME", "todolist_db")
        
        # 创建异步MongoDB客户端
        client = AsyncIOMotorClient(mongodb_url)
        
        # 测试连接
        await client.admin.command('ping')
        logger.info("✅ 成功连接到MongoDB数据库")
        
        # 获取数据库实例
        database = client[db_name]
        
        # 创建索引以提高查询性能
        await create_indexes()
        
    except Exception as e:
        logger.error(f"❌ 连接MongoDB失败: {e}")
        raise e

async def close_mongo_connection():
    """
    关闭MongoDB连接
    """
    global client
    if client:
        client.close()
        logger.info("🔌 MongoDB连接已关闭")

async def create_indexes():
    """
    创建数据库索引
    为常用查询字段创建索引以提高性能
    """
    if database is not None:
        # 为日期字段创建索引
        await database.tasks.create_index("date")
        # 为创建时间创建索引
        await database.tasks.create_index("created_at")
        logger.info("📝 数据库索引创建完成")

def get_database():
    """
    获取数据库实例
    供其他模块使用
    """
    return database
