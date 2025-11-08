const axios = require('axios');
const https = require('https');

class DeepSeekService {
  constructor(apiKey = null) {
    this.apiKey = apiKey || process.env.DEEPSEEK_API_KEY;
    this.baseURL = 'https://api.deepseek.com/v1/chat/completions';
  }

  /**
   * 根据六壬排盘和用户问题获取智慧建议
   * @param {Object} wisdomData - 六壬排盘数据
   * @param {string} question - 用户问题
   * @returns {Promise<string>} 智慧建议
   */
  async getWisdomAdvice(wisdomData, question) {
    try {
      // 构建系统提示词
      const systemPrompt = this.buildSystemPrompt(wisdomData);

      // 构建用户消息
      const userMessage = this.buildUserMessage(question, wisdomData);

      // 创建自定义https代理
      const httpsAgent = new https.Agent({
        keepAlive: true,
        secureProtocol: 'TLSv1_2_method'
      });

      const response = await axios.post(this.baseURL, {
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        max_tokens: 100,
        temperature: 0.7,
        stream: false
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 15000,
        httpsAgent: httpsAgent,
        proxy: false
      });

      const advice = response.data.choices[0].message.content.trim();
      return this.formatAdvice(advice);

    } catch (error) {
      console.error('DeepSeek API调用失败:', error.message);
      // 如果API失败，返回本地建议
      return this.getFallbackAdvice(wisdomData, question);
    }
  }

  /**
   * 获取碎片化智慧建议
   * @param {Object} wisdomData - 六壬排盘数据
   * @param {string} question - 用户问题
   * @returns {Promise<string>} 碎片化智慧建议
   */
  async getFragmentWisdom(wisdomData, question) {
    try {
      // 构建碎片化系统提示词
      const systemPrompt = this.buildFragmentSystemPrompt(wisdomData);

      // 构建碎片化用户消息
      const userMessage = this.buildFragmentUserMessage(question, wisdomData);

      // 创建自定义https代理
      const httpsAgent = new https.Agent({
        keepAlive: true,
        secureProtocol: 'TLSv1_2_method'
      });

      const response = await axios.post(this.baseURL, {
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        max_tokens: 150,
        temperature: 0.8,
        stream: false
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 15000,
        httpsAgent: httpsAgent,
        proxy: false
      });

      const advice = response.data.choices[0].message.content.trim();
      return this.formatFragmentAdvice(advice);

    } catch (error) {
      console.error('DeepSeek碎片化API调用失败:', error.message);
      // 如果API失败，返回本地碎片化建议
      return this.getFragmentFallbackAdvice(wisdomData, question);
    }
  }

  /**
   * 构建碎片化系统提示词
   */
  buildFragmentSystemPrompt(wisdomData) {
    return `你是一位充满智慧和正能量的数字诗人，擅长运用碎片化的语言为人们提供深层的心灵启迪和积极引导。

当前六壬排盘信息：
- 时辰：${wisdomData.timeSlot}
- 五行：${wisdomData.element}
- 类别：${wisdomData.category}

请根据这些信息，为用户的提问提供充满正能量的碎片化智慧词汇。

回答要求：
1. 返回4-6个积极向上的中文词汇
2. 每个词汇2-4个字
3. 词汇之间用空格分隔
4. 词汇要充满希望、光明、温暖和力量
5. 避免任何消极、负面或中性的表达
6. 传递积极乐观的人生态度
7. 让用户感受到内心的光明和前行的勇气
8. 充满诗意美感，给人以美的享受

示例：
- "光明 希望 温暖 前行"
- "绽放 飞翔 璀璨 梦想"
- "宁静 喜悦 感恩 成长"

请给出一组充满正能量、温暖人心的碎片化词汇：`;
  }

  /**
   * 构建碎片化用户消息
   */
  buildFragmentUserMessage(question, wisdomData) {
    return `用户问题：${question}

基于当前的${wisdomData.element}元素和${wisdomData.timeSlot}时辰的积极能量，
请为用户提供一组充满希望、温暖和力量的正能量碎片化词汇，
帮助用户看到生活中的光明面，感受到内心的力量和前行的勇气。`;
  }

  /**
   * 格式化碎片化建议
   */
  formatFragmentAdvice(advice) {
    // 先尝试按空格分割，如果没有空格则尝试按其他符号分割
    let fragments = advice.split(/\s+/).filter(word => word.length > 0);

    // 如果分割结果太少，尝试按标点符号分割
    if (fragments.length < 2) {
      fragments = advice.split(/[，。！？、；：]/).filter(word => word.length > 0);
    }

    // 如果还是不够，尝试按常见汉字分割
    if (fragments.length < 2) {
      // 尝试按常见分隔符或2-4字词语分割
      const words = advice.match(/[\u4e00-\u9fa5]{2,4}/g) || [];
      fragments = words.slice(0, 5);
    }

    // 确保是碎片化词汇而不是完整句子
    return fragments
      .map(word => word.replace(/[。！？，、；：]/g, '').trim())
      .filter(word => word.length >= 2 && word.length <= 4)
      .slice(0, 6)
      .join(' ');
  }

  /**
   * 碎片化备用建议（当API失败时）
   */
  getFragmentFallbackAdvice(wisdomData, question) {
    const fragmentAdvices = {
      'metal': [
        '光明 希望 璀璨 飞翔',
        '锐利 突破 清晰 决断',
        '锋芒 结构 革新 新生'
      ],
      'wood': [
        '生长 发芽 绽放 梦想',
        '创造 希望 繁荣 成长',
        '伸展 向上 新生 繁荣'
      ],
      'water': [
        '流动 温暖 包容 滋润',
        '智慧 净化 适应 柔软',
        '洗涤 沉淀 融化 深度'
      ],
      'fire': [
        '热情 温暖 光芒 璀璨',
        '创造 活力 绽放 梦想',
        '照亮 升华 温暖 希望'
      ],
      'earth': [
        '稳定 滋养 感恩 成长',
        '耐心 收获 扎根 包容',
        '承载 孕育 积累 希望'
      ]
    };

    const element = wisdomData.element;
    const advices = fragmentAdvices[element] || fragmentAdvices['earth'];

    return advices[Math.floor(Math.random() * advices.length)];
  }

  /**
   * 构建系统提示词
   */
  buildSystemPrompt(wisdomData) {
    return `你是一位充满智慧的导师，擅长运用六壬等传统文化智慧为人们提供指导。

当前六壬排盘信息：
- 时辰：${wisdomData.timeSlot}
- 五行：${wisdomData.element}
- 类别：${wisdomData.category}

请根据这些信息，为用户的提问提供简短而深刻的建议。

回答要求：
1. 长度控制在15-30字之间
2. 语言要有哲理，富有诗意
3. 给出方向性指引，不要具体建议
4. 充满正能量和智慧
5. 不要提及六壬、五行等术语，只用自然智慧的语言
6. 回答要模糊但有深意，让人有所感悟

回答示例：
- "静心等待，时机自会显现"
- "顺势而为，不强求结果"
- "内心平静，自然见明路"`;
  }

  /**
   * 构建用户消息
   */
  buildUserMessage(question, wisdomData) {
    return `用户问题：${question}

请基于当前的时间和能量状态，给出一个简短而深刻的智慧建议。`;
  }

  /**
   * 格式化建议
   */
  formatAdvice(advice) {
    // 去除多余的符号和格式
    return advice
      .replace(/[。！？]/g, '')
      .replace(/[，、；：]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 30);
  }

  /**
   * 备用建议（当API失败时）
   */
  getFallbackAdvice(wisdomData, question) {
    const fallbackAdvices = {
      '成长启发': [
        '静心等待，智慧自然显现',
        '时机未到，耐心是金',
        '内心成长，胜过外在变化'
      ],
      '转化积淀': [
        '沉淀下来，方能见真',
        '时间会给出最好答案',
        '经历是财富，珍惜当下'
      ],
      '孕育收获': [
        '耐心耕耘，必有收获',
        '种子需要时间发芽',
        '相信过程，结果自然来'
      ],
      '净化流动': [
        '清空心灵，方能容纳',
        '顺其自然，不争不抢',
        '放下执着，内心自在'
      ],
      '滋养生长': [
        '滋养内心，成长自然',
        '照顾好自己，其他随缘',
        '内在丰盛，外在自然'
      ],
      '突破变革': [
        '破茧成蝶，需要时间',
        '勇敢一点，新的开始',
        '变化是永恒的礼物'
      ],
      '稳固引导': [
        '稳扎稳打，行稳致远',
        '方向对了，慢也是快',
        '内心坚定，外境随缘'
      ],
      '冷静调和': [
        '心静如水，映照真实',
        '平衡之道，中和之美',
        '冷静思考，温暖行动'
      ],
      '重塑锤炼': [
        '千锤百炼，方成大器',
        '挫折是成长的阶梯',
        '在磨砺中遇见更好的自己'
      ],
      '修剪聚焦': [
        '少即是多，专注当下',
        '去除繁杂，回归本真',
        '简单生活，深刻思考'
      ],
      '当下接受': [
        '当下即是最好的安排',
        '接受现实，内心自在',
        '珍惜此刻，感恩所有'
      ]
    };

    const category = wisdomData.category;
    const advices = fallbackAdvices[category] || fallbackAdvices['当下接受'];

    return advices[Math.floor(Math.random() * advices.length)];
  }

  /**
   * 检查API是否可用
   */
  isConfigured() {
    return !!this.apiKey;
  }
}

module.exports = DeepSeekService;