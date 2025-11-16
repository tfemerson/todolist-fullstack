# 任务管理路由
from fastapi import APIRouter, HTTPException, status, Query
from typing import List, Dict, Any
from datetime import datetime, timezone
from bson import ObjectId
import logging

from models import TaskCreate, TaskUpdate, TaskResponse, TasksResponse, StatsResponse
from database import get_database

# 配置日志
logger = logging.getLogger(__name__)

# 创建路由器实例
router = APIRouter()

@router.post("/tasks", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(task: TaskCreate):
    """
    创建新任务
    
    参数:
        task: 任务创建数据
    
    返回:
        TaskResponse: 创建的任务信息
    """
    try:
        database = get_database()
        
        # 准备要插入的任务数据
        task_data = {
            "text": task.text,
            "completed": task.completed,
            "date": task.date,
            "created_at": datetime.now(timezone.utc),  # 使用timezone.utc替代utcnow()
            "updated_at": datetime.now(timezone.utc)   # 使用timezone.utc替代utcnow()
        }
        
        # 插入任务到数据库
        result = await database.tasks.insert_one(task_data)
        
        # 获取插入的任务数据
        created_task = await database.tasks.find_one({"_id": result.inserted_id})
        
        if not created_task:
            raise HTTPException(status_code=500, detail="创建任务失败")
        
        # 转换为响应格式
        return TaskResponse(
            id=str(created_task["_id"]),
            text=created_task["text"],
            completed=created_task["completed"],
            date=created_task["date"],
            created_at=created_task["created_at"],
            updated_at=created_task["updated_at"]
        )
        
    except Exception as e:
        logger.error(f"创建任务失败: {e}")
        raise HTTPException(status_code=500, detail="创建任务时发生错误")

@router.get("/tasks", response_model=List[TasksResponse])
async def get_all_tasks():
    """
    获取所有任务
    按日期分组返回
    
    返回:
        List[TasksResponse]: 按日期分组的任务列表
    """
    try:
        database = get_database()
        
        # 获取所有任务，按日期和创建时间排序
        cursor = database.tasks.find().sort([("date", 1), ("created_at", -1)])
        tasks = await cursor.to_list(length=None)
        
        # 按日期分组任务
        tasks_by_date: Dict[str, List[TaskResponse]] = {}
        
        for task in tasks:
            date = task["date"]
            task_response = TaskResponse(
                id=str(task["_id"]),
                text=task["text"],
                completed=task["completed"],
                date=task["date"],
                created_at=task["created_at"],
                updated_at=task["updated_at"]
            )
            
            if date not in tasks_by_date:
                tasks_by_date[date] = []
            tasks_by_date[date].append(task_response)
        
        # 转换为响应格式
        result = [
            TasksResponse(date=date, tasks=task_list)
            for date, task_list in tasks_by_date.items()
        ]
        
        return result
        
    except Exception as e:
        logger.error(f"获取任务失败: {e}")
        raise HTTPException(status_code=500, detail="获取任务时发生错误")

@router.get("/tasks/{date}", response_model=List[TaskResponse])
async def get_tasks_by_date(date: str):
    """
    获取指定日期的任务
    
    参数:
        date: 日期字符串 (YYYY-MM-DD格式)
    
    返回:
        List[TaskResponse]: 该日期的任务列表
    """
    try:
        database = get_database()
        
        # 查询指定日期的任务，按创建时间倒序排列
        cursor = database.tasks.find({"date": date}).sort("created_at", -1)
        tasks = await cursor.to_list(length=None)
        
        # 转换为响应格式
        result = [
            TaskResponse(
                id=str(task["_id"]),
                text=task["text"],
                completed=task["completed"],
                date=task["date"],
                created_at=task["created_at"],
                updated_at=task["updated_at"]
            )
            for task in tasks
        ]
        
        return result
        
    except Exception as e:
        logger.error(f"获取日期任务失败: {e}")
        raise HTTPException(status_code=500, detail="获取指定日期任务时发生错误")

@router.put("/tasks/{task_id}", response_model=TaskResponse)
async def update_task(task_id: str, task_update: TaskUpdate):
    """
    更新任务
    
    参数:
        task_id: 任务ID
        task_update: 任务更新数据
    
    返回:
        TaskResponse: 更新后的任务信息
    """
    try:
        # 验证ObjectId格式
        if not ObjectId.is_valid(task_id):
            raise HTTPException(status_code=400, detail="无效的任务ID格式")
        
        database = get_database()
        
        # 构建更新数据（只更新提供的字段）
        update_data = {"updated_at": datetime.now(timezone.utc)}
        
        if task_update.text is not None:
            update_data["text"] = task_update.text
        if task_update.completed is not None:
            update_data["completed"] = task_update.completed
        
        # 更新任务
        result = await database.tasks.update_one(
            {"_id": ObjectId(task_id)},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="任务不存在")
        
        # 获取更新后的任务
        updated_task = await database.tasks.find_one({"_id": ObjectId(task_id)})
        
        return TaskResponse(
            id=str(updated_task["_id"]),
            text=updated_task["text"],
            completed=updated_task["completed"],
            date=updated_task["date"],
            created_at=updated_task["created_at"],
            updated_at=updated_task["updated_at"]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"更新任务失败: {e}")
        raise HTTPException(status_code=500, detail="更新任务时发生错误")

@router.delete("/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(task_id: str):
    """
    删除任务
    
    参数:
        task_id: 任务ID
    """
    try:
        # 验证ObjectId格式
        if not ObjectId.is_valid(task_id):
            raise HTTPException(status_code=400, detail="无效的任务ID格式")
        
        database = get_database()
        
        # 删除任务
        result = await database.tasks.delete_one({"_id": ObjectId(task_id)})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="任务不存在")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"删除任务失败: {e}")
        raise HTTPException(status_code=500, detail="删除任务时发生错误")

@router.get("/stats", response_model=StatsResponse)
async def get_task_stats():
    """
    获取任务统计信息
    
    返回:
        StatsResponse: 统计信息（总数、已完成、待完成）
    """
    try:
        database = get_database()
        
        # 使用聚合管道计算统计信息
        pipeline = [
            {
                "$group": {
                    "_id": None,
                    "total": {"$sum": 1},
                    "completed": {
                        "$sum": {
                            "$cond": [{"$eq": ["$completed", True]}, 1, 0]
                        }
                    }
                }
            }
        ]
        
        cursor = database.tasks.aggregate(pipeline)
        result = await cursor.to_list(length=1)
        
        if result:
            stats = result[0]
            return StatsResponse(
                total=stats["total"],
                completed=stats["completed"],
                pending=stats["total"] - stats["completed"]
            )
        else:
            # 没有任务时返回零值
            return StatsResponse(total=0, completed=0, pending=0)
            
    except Exception as e:
        logger.error(f"获取统计信息失败: {e}")
        raise HTTPException(status_code=500, detail="获取统计信息时发生错误")
