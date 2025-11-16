// MongoDB初始化脚本
// 创建数据库和集合，设置初始索引

// 切换到todolist_db数据库
db = db.getSiblingDB('todolist_db');

// 创建tasks集合
db.createCollection('tasks');

// 创建索引
db.tasks.createIndex({ "date": 1 });
db.tasks.createIndex({ "created_at": -1 });

// 插入一些示例数据
db.tasks.insertMany([
  {
    text: "欢迎使用智能待办清单！",
    completed: false,
    date: new Date().toISOString().split('T')[0],
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    text: "这是一个已完成的示例任务",
    completed: true,
    date: new Date().toISOString().split('T')[0],
    created_at: new Date(),
    updated_at: new Date()
  }
]);

print('✅ MongoDB初始化完成！');
print('📝 创建了tasks集合并插入了示例数据');
print('🔍 创建了必要的索引以提高查询性能');
