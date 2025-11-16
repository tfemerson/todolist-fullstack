# Pydantic数据模型定义
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime, timezone
from bson import ObjectId

class PyObjectId(ObjectId):
    """
    自定义ObjectId类型
    用于处理MongoDB的ObjectId - Pydantic v2兼容版本
    """
    @classmethod
    def __get_pydantic_core_schema__(cls, _source_type, _handler):
        from pydantic_core import core_schema
        return core_schema.json_or_python_schema(
            json_schema=core_schema.str_schema(),
            python_schema=core_schema.union_schema([
                core_schema.is_instance_schema(ObjectId),
                core_schema.chain_schema([
                    core_schema.str_schema(),
                    core_schema.no_info_plain_validator_function(cls.validate),
                ])
            ]),
            serialization=core_schema.plain_serializer_function_ser_schema(
                lambda x: str(x)
            ),
        )
    
    @classmethod
    def validate(cls, v):
        if isinstance(v, ObjectId):
            return v
        if isinstance(v, str):
            if ObjectId.is_valid(v):
                return ObjectId(v)
        raise ValueError('Invalid ObjectId')

    def __str__(self):
        return str(self)

class TaskBase(BaseModel):
    """
    任务基础模型
    包含任务的核心属性
    """
    text: str = Field(..., min_length=1, max_length=100, description="任务内容")
    completed: bool = Field(default=False, description="是否已完成")
    date: str = Field(..., description="任务日期 (YYYY-MM-DD格式)")

class TaskCreate(TaskBase):
    """
    创建任务时的请求模型
    继承自TaskBase，用于接收前端创建任务的请求
    """
    pass

class TaskUpdate(BaseModel):
    """
    更新任务时的请求模型
    所有字段都是可选的，支持部分更新
    """
    text: Optional[str] = Field(None, min_length=1, max_length=100, description="任务内容")
    completed: Optional[bool] = Field(None, description="是否已完成")

class Task(TaskBase):
    """
    任务完整模型
    包含数据库中的所有字段
    """
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    # 使用现代化的时区感知UTC时间获取方式，避免弃用警告
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), description="创建时间")
    # 使用现代化的时区感知UTC时间获取方式，避免弃用警告  
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), description="更新时间")

    class Config:
        # 允许使用ObjectId
        arbitrary_types_allowed = True
        # JSON编码器配置
        json_encoders = {ObjectId: str}
        # 字段别名配置
        populate_by_name = True

class TaskResponse(BaseModel):
    """
    任务响应模型
    用于返回给前端的数据格式
    """
    id: str = Field(description="任务ID")
    text: str = Field(description="任务内容")
    completed: bool = Field(description="是否已完成")
    date: str = Field(description="任务日期")
    created_at: datetime = Field(description="创建时间")
    updated_at: datetime = Field(description="更新时间")

class TasksResponse(BaseModel):
    """
    任务列表响应模型
    按日期分组的任务数据
    """
    date: str = Field(description="日期 (YYYY-MM-DD)")
    tasks: List[TaskResponse] = Field(description="该日期的任务列表")

class StatsResponse(BaseModel):
    """
    统计信息响应模型
    返回任务统计数据
    """
    total: int = Field(description="总任务数")
    completed: int = Field(description="已完成任务数")
    pending: int = Field(description="待完成任务数")
