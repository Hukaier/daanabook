const express = require('express');
const cors = require('cors');
const path = require('path');
const TimeCalculator = require('./utils/timeCalculator');
const DeepSeekService = require('./utils/deepseekService');
const NewsCollector = require('./services/newsCollector');
const { getRandomContent } = require('./data/wisdomContent');

const app = express();
const PORT = process.env.PORT || 33333;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 初始化服务
const timeCalculator = new TimeCalculator();
const deepSeekService = new DeepSeekService();
const newsCollector = new NewsCollector();

// 用户的访问记录（简单的内存存储，生产环境应使用数据库）
const userSessions = new Map();
const questionCache = new Map(); // 问题缓存，避免频繁调用API

// API路由

// 获取智慧答案的主要接口
app.get('/api/wisdom', (req, res) => {
  try {
    const timestamp = req.query.timestamp ? new Date(req.query.timestamp) : new Date();

    // 计算基础数据（强制随机以获得不同内容）
    const wisdomData = timeCalculator.calculateWisdomData(timestamp, true);

    // 生成随机种子
    const randomSeed = wisdomData.numbers.timeSeed;

    // 获取内容
    const content = getRandomContent(wisdomData.category, randomSeed);

    if (!content) {
      return res.status(500).json({ error: '无法获取内容' });
    }

    // 检查用户最近是否看到过相同内容
    const clientIp = req.ip || req.connection.remoteAddress;
    const userKey = `${clientIp}_${wisdomData.sessionId}`;

    // 简单的防重复机制
    if (userSessions.has(userKey)) {
      const lastContent = userSessions.get(userKey);
      if (lastContent && lastContent.philosophy === content.philosophy) {
        // 如果内容相同，使用下一个内容
        const nextContent = getRandomContent(wisdomData.category, randomSeed + 1);
        if (nextContent) {
          Object.assign(content, nextContent);
        }
      }
    }

    // 记录用户的访问
    userSessions.set(userKey, content);

    // 定期清理旧的记录（保留最近1000条）
    if (userSessions.size > 1000) {
      const keysToDelete = Array.from(userSessions.keys()).slice(0, 100);
      keysToDelete.forEach(key => userSessions.delete(key));
    }

    // 返回结果
    const response = {
      philosophy: content.philosophy,
      suggestion: content.suggestion,
      category: wisdomData.category,
      element: wisdomData.element,
      timeSlot: wisdomData.timeSlot,
      sessionId: wisdomData.sessionId,
      timestamp: wisdomData.timestamp
    };

    res.json(response);

  } catch (error) {
    console.error('获取智慧内容时出错:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

// 获取特定时间的计算结果
app.post('/api/calculate-time', (req, res) => {
  try {
    const { timestamp } = req.body;
    const date = timestamp ? new Date(timestamp) : new Date();

    const result = timeCalculator.calculateWisdomData(date);
    res.json(result);

  } catch (error) {
    console.error('时间计算错误:', error);
    res.status(500).json({ error: '计算时间时出错' });
  }
});

// 获取所有可用类别
app.get('/api/categories', (req, res) => {
  try {
    const { wisdomContent } = require('./data/wisdomContent');
    const categories = Object.keys(wisdomContent);
    res.json({ categories });
  } catch (error) {
    console.error('获取类别错误:', error);
    res.status(500).json({ error: '获取类别时出错' });
  }
});

// 问题咨询接口
app.post('/api/ask', async (req, res) => {
  try {
    const { question, timestamp } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({ error: '请提供有效的问题' });
    }

    // 验证问题长度
    if (question.length > 100) {
      return res.status(400).json({ error: '问题过长，请精简在100字以内' });
    }

    // 计算六壬数据
    const questionTime = timestamp ? new Date(timestamp) : new Date();
    const wisdomData = timeCalculator.calculateWisdomData(questionTime, true);

    // 检查缓存
    const cacheKey = `${question.trim()}_${wisdomData.category}`;
    if (questionCache.has(cacheKey)) {
      const cachedAdvice = questionCache.get(cacheKey);
      return res.json({
        advice: cachedAdvice,
        category: wisdomData.category,
        element: wisdomData.element,
        timeSlot: wisdomData.timeSlot,
        fromCache: true,
        timestamp: wisdomData.timestamp
      });
    }

    // 调用DeepSeek API
    const advice = await deepSeekService.getWisdomAdvice(wisdomData, question);

    // 缓存结果（缓存5分钟）
    questionCache.set(cacheKey, advice);
    setTimeout(() => {
      questionCache.delete(cacheKey);
    }, 5 * 60 * 1000);

    res.json({
      advice: advice,
      category: wisdomData.category,
      element: wisdomData.element,
      timeSlot: wisdomData.timeSlot,
      fromCache: false,
      timestamp: wisdomData.timestamp
    });

  } catch (error) {
    console.error('处理问题咨询时出错:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

// 实时新闻相关API

// 统一的新闻API接口
app.get('/api/news', (req, res) => {
  try {
    const { category } = req.query;

    if (category) {
      // 返回特定类别的新闻
      const news = newsCollector.getNewsByCategory(category);
      res.json({
        success: true,
        data: {
          category,
          items: news,
          total: news.length
        },
        timestamp: new Date().toISOString()
      });
    } else {
      // 返回所有新闻
      const allNews = newsCollector.getAllNews();
      res.json({
        success: true,
        data: allNews,
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('获取新闻时出错:', error);
    res.status(500).json({
      success: false,
      error: '获取新闻失败',
      message: error.message
    });
  }
});

// 新闻分类列表API
app.get('/api/news/categories', (req, res) => {
  try {
    const categories = [
      { key: 'ai', name: 'AI资讯', description: '人工智能和机器学习相关新闻' },
      { key: 'geopolitics', name: '地缘政治', description: '全球政治经济动态' },
      { key: 'fujian', name: '福建新闻', description: '福建省地方新闻' },
      { key: 'innerMongolia', name: '内蒙古新闻', description: '内蒙古自治区地方新闻' },
      { key: 'github', name: 'GitHub热门', description: 'GitHub热门项目和开源动态' },
      { key: 'music', name: '音乐资讯', description: '音乐和娱乐相关新闻' }
    ];

    res.json({
      success: true,
      data: categories,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('获取新闻分类时出错:', error);
    res.status(500).json({
      success: false,
      error: '获取新闻分类失败',
      message: error.message
    });
  }
});

// 手动刷新新闻缓存
app.post('/api/news/refresh', async (req, res) => {
  try {
    await newsCollector.updateAllNews();
    res.json({
      message: '新闻缓存已刷新',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('刷新新闻缓存时出错:', error);
    res.status(500).json({ error: '刷新新闻缓存时出错' });
  }
});

// 健康检查接口
app.get('/api/health', (req, res) => {
  try {
    const newsStatus = newsCollector.getLastUpdate();
    res.json({
      success: true,
      data: {
        status: 'healthy',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        services: {
          deepseek: deepSeekService.isConfigured(),
          newsCollector: !!newsStatus,
          lastNewsUpdate: newsStatus
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '健康检查失败',
      message: error.message
    });
  }
});

// 静态文件服务（如果需要部署前端）
app.use(express.static(path.join(__dirname, '../client/dist')));

// 处理前端路由
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// 错误处理中间件
app.use((error, req, res, next) => {
  console.error('未处理的错误:', error);
  res.status(500).json({ error: '服务器内部错误' });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`智慧之书服务器运行在端口 ${PORT}`);
  console.log(`访问 http://localhost:${PORT} 查看应用`);
});

module.exports = app;