const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

class NewsCollector {
  constructor() {
    this.cacheFile = path.join(__dirname, '../../data/newsCache.json');
    this.cache = {
      aiNews: [],
      geopolitics: [],
      regionalNews: {
        fujian: [],
        innerMongolia: []
      },
      githubTrending: [],
      music: [],
      lastUpdate: null
    };
    this.updateInterval = 30 * 60 * 1000; // 30分钟更新一次
    this.init();
  }

  async init() {
    await this.ensureDataDirectory();
    await this.loadCache();
    this.startPeriodicUpdate();
  }

  async ensureDataDirectory() {
    try {
      const dataDir = path.dirname(this.cacheFile);
      await fs.mkdir(dataDir, { recursive: true });
    } catch (error) {
      console.log('创建数据目录失败:', error);
    }
  }

  async loadCache() {
    try {
      const data = await fs.readFile(this.cacheFile, 'utf8');
      const loadedCache = JSON.parse(data);

      // 确保缓存有正确的结构
      this.cache = {
        aiNews: loadedCache.aiNews || [],
        geopolitics: loadedCache.geopolitics || [],
        regionalNews: loadedCache.regionalNews || {
          fujian: [],
          innerMongolia: []
        },
        githubTrending: loadedCache.githubTrending || [],
        music: loadedCache.music || [],
        lastUpdate: loadedCache.lastUpdate || null
      };
    } catch (error) {
      console.log('缓存文件不存在或格式错误，将创建新的缓存');
      await this.saveCache();
    }
  }

  async saveCache() {
    try {
      await fs.writeFile(this.cacheFile, JSON.stringify(this.cache, null, 2));
    } catch (error) {
      console.error('保存缓存失败:', error);
    }
  }

  startPeriodicUpdate() {
    this.updateAllNews(); // 立即更新一次
    setInterval(() => {
      this.updateAllNews();
    }, this.updateInterval);
  }

  async updateAllNews() {
    console.log('开始更新新闻缓存...');

    try {
      await Promise.all([
        this.updateAINews(),
        this.updateGeopoliticsNews(),
        this.updateRegionalNews(),
        this.updateGithubTrending(),
        this.updateMusicNews()
      ]);

      this.cache.lastUpdate = new Date().toISOString();
      await this.saveCache();
      console.log('新闻缓存更新完成');
    } catch (error) {
      console.error('更新新闻缓存时出错:', error);
    }
  }

  // AI新闻收集
  async updateAINews() {
    try {
      const aiNews = [];

      // 1. Hacker News AI相关新闻
      const hnStories = await this.getHackerNewsAI();
      aiNews.push(...hnStories);

      // 2. arXiv 最新AI论文
      const arxivPapers = await this.getArxivAIPapers();
      aiNews.push(...arxivPapers);

      this.cache.aiNews = aiNews.slice(0, 20); // 保留最新20条
    } catch (error) {
      console.error('更新AI新闻失败:', error);
    }
  }

  async getHackerNewsAI() {
    try {
      const response = await axios.get('https://hacker-news.firebaseio.com/v0/newstories.json');
      const storyIds = response.data.slice(0, 30);

      const stories = await Promise.all(
        storyIds.map(async (id) => {
          try {
            const storyResponse = await axios.get(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
            const story = storyResponse.data;

            if (this.isAIRelated(story.title)) {
              return {
                id: story.id,
                title: story.title,
                url: story.url || `https://news.ycombinator.com/item?id=${story.id}`,
                source: 'Hacker News',
                publishedAt: new Date(story.time * 1000).toISOString(),
                category: 'ai'
              };
            }
          } catch (error) {
            console.error(`获取HN故事 ${id} 失败:`, error);
          }
        })
      );

      return stories.filter(Boolean);
    } catch (error) {
      console.error('获取Hacker News失败:', error);
      return [];
    }
  }

  async getArxivAIPapers() {
    try {
      const keywords = ['artificial intelligence', 'machine learning', 'deep learning', 'neural networks', 'LLM', 'GPT', 'Claude'];
      const query = keywords.join(' OR ');
      const url = `http://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(query)}&start=0&max_results=10&sortBy=submittedDate&sortOrder=descending`;

      const response = await axios.get(url);
      const papers = this.parseArxivXML(response.data);

      return papers.map(paper => ({
        id: paper.id,
        title: paper.title,
        url: paper.url,
        source: 'arXiv',
        publishedAt: paper.publishedAt,
        category: 'ai',
        authors: paper.authors
      }));
    } catch (error) {
      console.error('获取arXiv论文失败:', error);
      return [];
    }
  }

  // GitHub热门项目
  async updateGithubTrending() {
    try {
      // GitHub没有官方的trending API，这里使用替代方案
      const repos = await this.getGithubTrendingRepos();
      this.cache.githubTrending = repos.slice(0, 15);
    } catch (error) {
      console.error('更新GitHub热门项目失败:', error);
    }
  }

  async getGithubTrendingRepos() {
    try {
      // 使用GitHub搜索API查找最近一周热门项目
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const query = `created:>${oneWeekAgo.toISOString().split('T')[0]} stars:>100`;
      const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=20`;

      const response = await axios.get(url, {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Wisdom-Book-News-Collector'
        }
      });

      return response.data.items.map(repo => ({
        id: repo.id,
        name: repo.full_name,
        description: repo.description,
        url: repo.html_url,
        stars: repo.stargazers_count,
        language: repo.language,
        publishedAt: repo.created_at,
        category: 'github'
      }));
    } catch (error) {
      console.error('获取GitHub热门项目失败:', error);
      return [];
    }
  }

  // 地缘政治新闻（这里需要根据实际可用的API来实现）
  async updateGeopoliticsNews() {
    try {
      // 这里可以集成新闻API或RSS源
      // 示例：使用NewsAPI或其他免费新闻源
      const geopoliticsNews = await this.getGeopoliticsFromRSS();
      this.cache.geopolitics = geopoliticsNews.slice(0, 15);
    } catch (error) {
      console.error('更新地缘政治新闻失败:', error);
    }
  }

  async getGeopoliticsFromRSS() {
    // 这里应该实现RSS解析逻辑
    // 返回示例数据
    return [
      {
        id: 'geo_1',
        title: '示例地缘政治新闻标题',
        url: 'https://example.com/news1',
        source: '示例新闻源',
        publishedAt: new Date().toISOString(),
        category: 'geopolitics'
      }
    ];
  }

  // 地方新闻
  async updateRegionalNews() {
    try {
      // 确保 regionalNews 对象存在
      if (!this.cache.regionalNews) {
        this.cache.regionalNews = {
          fujian: [],
          innerMongolia: []
        };
      }

      const fujianNews = await this.getRegionalNews('福建', ['福州', '厦门', '泉州']);
      const innerMongoliaNews = await this.getRegionalNews('内蒙古', ['呼和浩特', '包头', '鄂尔多斯']);

      this.cache.regionalNews.fujian = fujianNews.slice(0, 10);
      this.cache.regionalNews.innerMongolia = innerMongoliaNews.slice(0, 10);
    } catch (error) {
      console.error('更新地方新闻失败:', error);
      // 确保即使出错也有默认数据
      if (!this.cache.regionalNews) {
        this.cache.regionalNews = {
          fujian: [],
          innerMongolia: []
        };
      }
    }
  }

  async getRegionalNews(region, cities) {
    // 这里应该实现针对特定地区的新闻收集
    // 可以通过网页监控或特定API实现
    return [
      {
        id: `${region}_1`,
        title: `${region}最新发展动态`,
        url: 'https://example.com/regional-news',
        source: '地方媒体',
        publishedAt: new Date().toISOString(),
        category: 'regional',
        region: region
      }
    ];
  }

  // 音乐新闻
  async updateMusicNews() {
    try {
      const musicNews = await this.getNewReleases();
      this.cache.music = musicNews.slice(0, 10);
    } catch (error) {
      console.error('更新音乐新闻失败:', error);
    }
  }

  async getNewReleases() {
    // 这里可以集成Spotify API或其他音乐API
    return [
      {
        id: 'music_1',
        title: '本周热门新歌发布',
        artist: '知名艺术家',
        url: 'https://example.com/music',
        source: '音乐平台',
        publishedAt: new Date().toISOString(),
        category: 'music'
      }
    ];
  }

  // 辅助方法
  isAIRelated(title) {
    const aiKeywords = [
      'AI', 'artificial intelligence', 'machine learning', 'deep learning',
      'neural network', 'GPT', 'Claude', 'ChatGPT', 'LLM', 'openai',
      'anthropic', 'google AI', 'transformer', 'diffusion', 'stable diffusion'
    ];

    const lowerTitle = title.toLowerCase();
    return aiKeywords.some(keyword =>
      lowerTitle.includes(keyword.toLowerCase())
    );
  }

  parseArxivXML(xmlData) {
    // 简化的XML解析，实际项目中应该使用xml2js等库
    const papers = [];
    const items = xmlData.split('<entry>').slice(1);

    items.forEach(item => {
      const titleMatch = item.match(/<title>(.*?)<\/title>/);
      const idMatch = item.match(/<id>(.*?)<\/id>/);
      const publishedMatch = item.match(/<published>(.*?)<\/published>/);
      const authorMatch = item.match(/<name>(.*?)<\/name>/);

      if (titleMatch && idMatch) {
        papers.push({
          id: idMatch[1].split('/').pop(),
          title: titleMatch[1].replace(/\s+/g, ' ').trim(),
          url: idMatch[1],
          publishedAt: publishedMatch ? publishedMatch[1] : new Date().toISOString(),
          authors: authorMatch ? [authorMatch[1]] : []
        });
      }
    });

    return papers;
  }

  // 获取所有新闻的统一接口
  getAllNews() {
    return {
      ...this.cache,
      lastUpdate: this.cache.lastUpdate
    };
  }

  // 获取特定类别的新闻
  getNewsByCategory(category) {
    switch (category) {
      case 'ai':
        return this.cache.aiNews;
      case 'geopolitics':
        return this.cache.geopolitics;
      case 'github':
        return this.cache.githubTrending;
      case 'music':
        return this.cache.music;
      case 'fujian':
        return this.cache.regionalNews.fujian;
      case 'innerMongolia':
        return this.cache.regionalNews.innerMongolia;
      default:
        return [];
    }
  }

  // 检查缓存是否需要更新
  needsUpdate() {
    if (!this.cache.lastUpdate) return true;

    const lastUpdate = new Date(this.cache.lastUpdate);
    const now = new Date();
    return (now - lastUpdate) > this.updateInterval;
  }

  // 获取最后更新时间
  getLastUpdate() {
    return this.cache.lastUpdate;
  }
}

module.exports = NewsCollector;