class TimeCalculator {
  constructor() {
    // 简化的时辰映射
    this.timeZones = {
      '子': [23, 1],   // 23:00-01:00
      '丑': [1, 3],    // 01:00-03:00
      '寅': [3, 5],    // 03:00-05:00
      '卯': [5, 7],    // 05:00-07:00
      '辰': [7, 9],    // 07:00-09:00
      '巳': [9, 11],   // 09:00-11:00
      '午': [11, 13],  // 11:00-13:00
      '未': [13, 15],  // 13:00-15:00
      '申': [15, 17],  // 15:00-17:00
      '酉': [17, 19],  // 17:00-19:00
      '戌': [19, 21],  // 19:00-21:00
      '亥': [21, 23]   // 21:00-23:00
    };

    // 五行属性
    this.elements = ['木', '火', '土', '金', '水'];

    // 哲理类别
    this.categories = [
      '成长启发', '转化积淀', '孕育收获', '净化流动', '滋养生长',
      '突破变革', '稳固引导', '冷静调和', '重塑锤炼', '修剪聚焦'
    ];
  }

  // 获取当前时辰
  getCurrentTimeSlot(date) {
    const hour = date.getHours();

    for (const [timeSlot, [start, end]] of Object.entries(this.timeZones)) {
      if (hour >= start && hour < end) {
        return timeSlot;
      }
      // 处理跨天情况
      if (start > end && (hour >= start || hour < end)) {
        return timeSlot;
      }
    }

    return '子'; // 默认返回子时
  }

  // 计算日期相关的数字
  calculateDateNumbers(date, customSeed = null) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = date.getHours();
    const minute = date.getMinutes();
    const second = date.getSeconds();

    // 创建基于时间和随机数的种子
    const baseSeed = year + month + day + hour + minute;
    const timeSeed = customSeed || (baseSeed + second + Math.floor(Math.random() * 1000));

    return {
      yearNumber: year % 10,
      monthNumber: month % 10,
      dayNumber: day % 10,
      hourNumber: hour % 10,
      timeSeed: timeSeed
    };
  }

  // 基于时间计算五行属性
  calculateElement(date, numbers = null) {
    const dateNumbers = numbers || this.calculateDateNumbers(date);
    const elementIndex = Math.floor(dateNumbers.timeSeed) % 5;
    return this.elements[elementIndex];
  }

  // 计算哲理类别
  calculateCategory(date, numbers = null) {
    const dateNumbers = numbers || this.calculateDateNumbers(date);
    const categoryIndex = (dateNumbers.yearNumber + dateNumbers.monthNumber + dateNumbers.dayNumber) % 10;
    return this.categories[categoryIndex];
  }

  // 生成会话ID
  generateSessionId(date, numbers = null) {
    const dateNumbers = numbers || this.calculateDateNumbers(date);
    const sessionId = `wisdom_${dateNumbers.timeSeed}_${Math.random().toString(36).substr(2, 9)}`;
    return sessionId;
  }

  // 完整的计算结果
  calculateWisdomData(date = new Date(), forceRandom = false) {
    const timeSlot = this.getCurrentTimeSlot(date);

    // 如果强制随机，则生成随机种子
    const customSeed = forceRandom ? Date.now() + Math.random() * 10000 : null;
    const numbers = this.calculateDateNumbers(date, customSeed);

    const element = this.calculateElement(date, numbers);
    const category = this.calculateCategory(date, numbers);
    const sessionId = this.generateSessionId(date, numbers);

    return {
      timestamp: date.toISOString(),
      timeSlot: timeSlot,
      element: element,
      category: category,
      sessionId: sessionId,
      numbers: numbers
    };
  }

  // 生成一致的随机数（基于时间）
  seededRandom(seed) {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  }
}

module.exports = TimeCalculator;