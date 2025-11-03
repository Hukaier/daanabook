# 答案之书 (Wisdom Book)

一个基于时间的哲理指导网站，每次访问都会提供不同的智慧建议。

## 功能特色

- 🎯 **个性化内容**: 基于访问时间生成独特的哲理句子和建议
- 💡 **积极向上**: 所有建议都具有建设性，简单易行
- 🎨 **美观界面**: 简洁优雅的设计，支持响应式布局
- 🔄 **动态更新**: 每次访问都有新的体验
- 📱 **移动友好**: 完美适配各种设备

## 技术栈

- **前端**: Vue 3 + Tailwind CSS + Vite
- **后端**: Node.js + Express
- **算法**: 基于传统时间智慧的现代化算法

## 快速开始

### 1. 安装依赖

```bash
# 安装根目录依赖
npm install

# 安装前端依赖
cd client && npm install
```

### 2. 启动开发服务器

```bash
# 从根目录运行（同时启动前后端）
npm run dev
```

或者分别启动：

```bash
# 启动后端服务器 (端口 5000)
npm run server

# 启动前端开发服务器 (端口 3000)
npm run client
```

### 3. 访问应用

打开浏览器访问 `http://localhost:3000`

## 项目结构

```
wisdom-book/
├── server/                 # 后端代码
│   ├── utils/             # 工具函数
│   │   ├── timeCalculator.js  # 时间计算逻辑
│   │   └── seedrandom.js       # 种子随机数生成器
│   ├── data/              # 数据文件
│   │   └── wisdomContent.js    # 哲理内容数据库
│   └── index.js           # 服务器入口
├── client/                # 前端代码
│   ├── src/
│   │   ├── App.vue        # 主应用组件
│   │   ├── main.js        # 应用入口
│   │   └── style.css      # 样式文件
│   └── package.json       # 前端依赖配置
└── package.json           # 根目录配置
```

## API 接口

### GET /api/wisdom
获取智慧答案

**参数:**
- `timestamp` (可选): 自定义时间戳

**响应:**
```json
{
  "philosophy": "哲理句子",
  "suggestion": "行动建议",
  "category": "类别",
  "element": "五行属性",
  "timeSlot": "时辰",
  "sessionId": "会话ID",
  "timestamp": "时间戳"
}
```

### GET /api/categories
获取所有可用类别

### GET /api/health
健康检查

## 内容分类

系统包含10个哲理类别：

1. **成长启发** - 学习和成长相关
2. **转化积淀** - 经验和智慧积累
3. **孕育收获** - 耐心和回报
4. **净化流动** - 清理和适应
5. **滋养生长** - 内在修养
6. **突破变革** - 创新和改变
7. **稳固引导** - 计划和方向
8. **冷静调和** - 平衡和理性
9. **重塑锤炼** - 锻炼和改进
10. **修剪聚焦** - 简化和专注

## 部署

### 生产环境部署

1. 构建前端：
```bash
npm run build
```

2. 启动生产服务器：
```bash
npm start
```

### 环境变量

- `PORT`: 服务器端口 (默认: 5000)

## 贡献指南

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License

---

**注意**: 本项目旨在提供积极的人生建议和哲学思考，所有内容都经过精心设计，确保健康向上。