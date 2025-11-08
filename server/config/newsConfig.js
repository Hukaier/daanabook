// 新闻收集配置文件
const config = {
  // 更新间隔配置（毫秒）
  updateInterval: {
    ai: 15 * 60 * 1000,        // AI新闻 - 15分钟
    geopolitics: 30 * 60 * 1000, // 地缘政治 - 30分钟
    regional: 60 * 60 * 1000,     // 地方新闻 - 1小时
    github: 20 * 60 * 1000,      // GitHub - 20分钟
    music: 60 * 60 * 1000        // 音乐 - 1小时
  },

  // API配置
  apis: {
    // Hacker News API
    hackerNews: {
      baseUrl: 'https://hacker-news.firebaseio.com/v0',
      endpoints: {
        newStories: '/newstories.json',
        topStories: '/topstories.json',
        bestStories: '/beststories.json',
        item: '/item/{id}.json'
      }
    },

    // arXiv API
    arxiv: {
      baseUrl: 'http://export.arxiv.org/api/query',
      searchParams: {
        maxResults: 10,
        sortBy: 'submittedDate',
        sortOrder: 'descending'
      },
      keywords: [
        'artificial intelligence',
        'machine learning',
        'deep learning',
        'neural networks',
        'LLM',
        'GPT',
        'Claude',
        'transformer',
        'diffusion model',
        'computer vision',
        'natural language processing'
      ]
    },

    // GitHub API
    github: {
      baseUrl: 'https://api.github.com',
      search: {
        trending: '/search/repositories',
        trendingParams: {
          sort: 'stars',
          order: 'desc',
          per_page: 20
        }
      },
      // GitHub搜索关键词
      trendingKeywords: [
        'ai', 'machine learning', 'react', 'vue', 'python',
        'javascript', 'typescript', 'rust', 'go', 'blockchain'
      ]
    },

    // 新闻源配置（RSS或API）
    newsSources: {
      // 地缘政治新闻源
      geopolitics: [
        {
          name: 'Reuters World',
          type: 'rss',
          url: 'https://www.reuters.com/world/rss.xml',
          category: 'geopolitics'
        },
        {
          name: 'BBC World',
          type: 'rss',
          url: 'http://feeds.bbci.co.uk/news/world/rss.xml',
          category: 'geopolitics'
        }
      ],

      // 地方新闻源 - 福建
      fujian: [
        {
          name: '福建日报',
          type: 'web-scraping',
          url: 'https://www.fjsen.com',
          selectors: {
            headlines: '.headline',
            links: 'a',
            time: '.time'
          },
          category: 'regional',
          region: 'fujian'
        }
      ],

      // 地方新闻源 - 内蒙古
      innerMongolia: [
        {
          name: '内蒙古日报',
          type: 'web-scraping',
          url: 'https://www.nmgnews.com.cn',
          selectors: {
            headlines: '.headline',
            links: 'a',
            time: '.time'
          },
          category: 'regional',
          region: 'innerMongolia'
        }
      ],

      // 音乐新闻源
      music: [
        {
          name: 'Spotify New Releases',
          type: 'api',
          url: 'https://api.spotify.com/v1/browse/new-releases',
          category: 'music'
        }
      ]
    }
  },

  // 内容过滤配置
  filters: {
    // AI新闻关键词过滤
    aiKeywords: [
      'openai', 'anthropic', 'google ai', 'microsoft ai',
      'claude', 'chatgpt', 'gpt-4', 'gemini', 'bard',
      'llama', 'mistral', 'hugging face', 'transformer',
      'diffusion', 'stable diffusion', 'midjourney'
    ],

    // 地缘政治关键词
    geopoliticsKeywords: [
      'geopolitics', 'international relations', 'diplomacy',
      'trade war', 'sanctions', 'treaty', 'summit',
      'conflict', 'alliance', 'foreign policy'
    ],

    // 地方发展关键词
    fujianKeywords: [
      '福建', '福州', '厦门', '泉州', '莆田',
      '三明', '漳州', '南平', '龙岩', '宁德',
      '数字经济', '智能制造', '新能源', '半导体'
    ],

    innerMongoliaKeywords: [
      '内蒙古', '呼和浩特', '包头', '乌海', '赤峰',
      '通辽', '鄂尔多斯', '呼伦贝尔', '巴彦淖尔', '乌兰察布',
      '能源', '稀土', '畜牧业', '生态', '新能源'
    ],

    // 创业新模式关键词
    startupKeywords: [
      'startup', 'entrepreneurship', 'innovation',
      'business model', 'venture capital', 'funding',
      'unicorn', 'ipo', 'acquisition', 'pivot'
    ]
  },

  // 缓存配置
  cache: {
    enabled: true,
    ttl: 30 * 60 * 1000, // 30分钟
    maxSize: 1000,        // 最大缓存条目数
    filePath: './data/newsCache.json'
  },

  // 日志配置
  logging: {
    level: 'info',
    enabled: true,
    logFile: './logs/newsCollector.log'
  }
};

module.exports = config;