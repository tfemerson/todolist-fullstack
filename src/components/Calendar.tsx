import { Component, createSignal, createMemo, Accessor } from 'solid-js';
import { TaskStore } from '../store/TaskStore';

interface CalendarProps {
  taskStore: TaskStore;
  selectedDate: Accessor<Date | null>;
  onDateSelect: (date: Date) => void;
}

// 日历组件
const Calendar: Component<CalendarProps> = (props) => {
  // 当前显示的月份
  const [currentDate, setCurrentDate] = createSignal(new Date());
  
  // 月份名称数组
  const monthNames = [
    '1月', '2月', '3月', '4月', '5月', '6月',
    '7月', '8月', '9月', '10月', '11月', '12月'
  ];

  // 星期标题
  const weekdays = ['日', '一', '二', '三', '四', '五', '六'];

  // 计算当前月份显示的所有日期
  const calendarDates = createMemo(() => {
 //2025-07-30
    const current = currentDate();
    const firstDay = new Date(current.getFullYear(), current.getMonth(), 1);
    const lastDay = new Date(current.getFullYear(), current.getMonth() + 1, 0);
    
    // 计算日历网格的起始日期（包含上月末尾几天）
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    // 生成42个日期（6周 × 7天）
    const dates: Date[] = [];
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      dates.push(date);
    }
    
    return dates;
  });
//2025-08-01
  // 获取统计信息
  const stats = createMemo(() => props.taskStore.getStats());

  // 上一月
  const prevMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };

  // 下一月
  const nextMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };

  // 选择日期
  const selectDate = (date: Date) => {
    props.onDateSelect(date);
  };

  // 判断是否为同一天
  const isSameDate = (date1: Date, date2: Date) => {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  };

  // 获取日期单元格的CSS类名
  const getDayCellClass = (date: Date) => {
    const classes = ['day-cell'];
    const current = currentDate();
    const selected = props.selectedDate();
    const today = new Date();
    
    // 判断是否为当前月份
    if (date.getMonth() === current.getMonth()) {
      classes.push('current-month');
    } else {
      classes.push('other-month');
    }
    
    // 判断是否为今天
    if (isSameDate(date, today)) {
      classes.push('today');
    }
    
    // 判断是否为选中日期
    if (selected && isSameDate(date, selected)) {
      classes.push('selected');
    }
    
    // 判断是否有任务
    if (props.taskStore.hasTasksForDate(date)) {
      classes.push('has-tasks');
    }
    
    return classes.join(' ');
  };

  return (
    <div class="calendar-section">
      {/* 日历头部 - 月份导航 */}
      <div class="calendar-header">
        <button class="nav-btn" onClick={prevMonth}>‹</button>
        <h2>
          {currentDate().getFullYear()}年{monthNames[currentDate().getMonth()]}
        </h2>
        <button class="nav-btn" onClick={nextMonth}>›</button>
      </div>

      {/* 星期标题行 */}
      <div class="calendar-grid">
        {weekdays.map(day => (
          <div class="day-header">{day}</div>
        ))}
      </div>

      {/* 日历主体 */}
      <div class="calendar-grid">
        {calendarDates().map(date => (
          <div 
            class={getDayCellClass(date)}
            onClick={() => selectDate(date)}
          >
            {date.getDate()}
          </div>
        ))}
      </div>

      {/* 统计信息显示 */}
      <div class="stats">
        <div class="stat-item">
          <div class="stat-number">{stats().total}</div>
          <div class="stat-label">总任务</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">{stats().completed}</div>
          <div class="stat-label">已完成</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">{stats().pending}</div>
          <div class="stat-label">待完成</div>
        </div>
      </div>
    </div>
  );
};

export default Calendar; 