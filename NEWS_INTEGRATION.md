# Wisdom Book 实时新闻集成指南

本文档介绍了为 Wisdom Book 项目添加的实时新闻收集功能。

## 功能概述

实时新闻收集系统能够从多个来源收集和聚合信息，包括：

1. **AI技术新闻** - 来自 Hacker News 和 arXiv 的最新AI动态
2. **地缘政治新闻** - 全球重要时政消息
3. **地方发展动态** - 福建和内蒙古各行业新闻
4. **GitHub热门项目** - 近一周的热门开源项目
5. **音乐新发布** - 最新音乐作品
6. **创业资讯** - 个人创业新模式相关新闻

## 系统架构

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   前端 Vue.js   │────│  Express Server  │────│  NewsCollector  │
│                 │    │                  │    │                 │
│ • NewsFeed.vue  │    │ • /api/news      │    │ • 多源数据收集  │
│ • 分类展示      │    │ • /api/news/:cat │    │ • 智能缓存      │
│ • 实时更新      │    │ • /api/refresh   │    │ • 定时任务      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 安装和配置

### 1. 安装依赖

```bash
# 安装服务端依赖
npm install axios xml2js node-cron cheerio

# 或使用
npm run install-all
```

### 2. 配置新闻源

编辑 `server/config/newsConfig.js` 文件：

```javascript
// 修改更新间隔
updateInterval: {
  ai: 15 * 60 * 1000,        // 15分钟更新一次
  // ...
}

// 配置API密钥（如果需要）
apis: {
  spotify: {
    clientId: 'your-spotify-client-id',
    clientSecret: 'your-spotify-client-secret'
  }
}
```

### 3. 启动服务

```bash
# 开发模式
npm run dev

# 生产模式
npm start
```

## API接口

### 获取所有新闻
```
GET /api/news
```

响应格式：
```json
{
  "aiNews": [...],
  "geopolitics": [...],
  "regionalNews": {
    "fujian": [...],
    "innerMongolia": [...]
  },
  "githubTrending": [...],
  "music": [...],
  "lastUpdate": "2024-01-01T00:00:00.000Z"
}
```

### 获取特定分类新闻
```
GET /api/news/:category
```

参数：
- `category`: ai, geopolitics, fujian, innerMongolia, github, music

### 手动刷新新闻缓存
```
POST /api/news/refresh
```

## 前端组件使用

### NewsFeed 组件

在 Vue 组件中使用：

```vue
<template>
  <NewsFeed />
</template>

<script>
import NewsFeed from './components/NewsFeed.vue'

export default {
  components: {
    NewsFeed
  }
}
</script>
```

### 功能特性

- **分类浏览**: 支持多种新闻分类切换
- **实时更新**: 自动定期更新新闻内容
- **响应式设计**: 适配移动端和桌面端
- **智能缓存**: 减少API调用，提高性能
- **时间显示**: 智能显示发布时间（刚刚、几分钟前等）

## 数据源配置

### 添加新的新闻源

在 `server/config/newsConfig.js` 中添加：

```javascript
newsSources: {
  customCategory: [
    {
      name: '新闻源名称',
      type: 'rss', // 或 'api', 'web-scraping'
      url: 'https://example.com/rss.xml',
      category: 'custom',
      // 其他配置...
    }
  ]
}
```

### 支持的数据源类型

1. **RSS源** - 标准RSS/Atom订阅
2. **API源** - REST API接口
3. **网页抓取** - 使用Cheerio解析HTML

## 自定义过滤器

在配置文件中可以设置关键词过滤：

```javascript
filters: {
  aiKeywords: ['openai', 'anthropic', 'google ai'],
  // 自定义过滤逻辑
}
```

## 缓存机制

- **内存缓存**: 服务器内存中缓存数据
- **文件缓存**: JSON文件持久化存储
- **TTL设置**: 可配置过期时间
- **自动清理**: 超过最大数量时自动清理旧数据

## 性能优化建议

1. **调整更新间隔**: 根据数据更新频率调整
2. **使用CDN**: 为静态资源配置CDN
3. **启用Gzip**: 服务器端启用压缩
4. **数据库存储**: 生产环境建议使用数据库替代文件缓存

## 故障排除

### 常见问题

1. **API限制**: 某些API有调用频率限制
2. **CORS问题**: 确保API支持跨域访问
3. **数据解析错误**: 检查数据源格式是否变化
4. **内存不足**: 调整缓存大小和更新间隔

### 日志查看

```bash
# 查看服务器日志
tail -f logs/newsCollector.log

# 查看错误日志
grep ERROR logs/newsCollector.log
```

## 扩展开发

### 添加新的新闻收集器

1. 在 `server/services/` 目录创建新的收集器类
2. 实现 `update()` 方法
3. 在 `NewsCollector` 中注册新的收集器
4. 添加对应的API路由

### 自定义前端展示

1. 修改 `NewsFeed.vue` 组件
2. 添加新的分类和展示样式
3. 实现自定义交互逻辑

## 部署建议

### Docker 部署

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

### 环境变量

```bash
PORT=5000
NODE_ENV=production
LOG_LEVEL=info
```

## 贡献指南

欢迎提交 Issue 和 Pull Request 来改进新闻收集功能。

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 发起 Pull Request

## 许可证

MIT License - 详见 LICENSE 文件