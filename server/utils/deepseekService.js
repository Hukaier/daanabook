const axios = require('axios');

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
        timeout: 10000
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