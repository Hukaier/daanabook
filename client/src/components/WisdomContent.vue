<template>
  <div class="wisdom-content">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading">
      <div class="loading-spinner"></div>
      <p>正在寻找今日智慧...</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error">
      <div class="error-icon">🤔</div>
      <h3>今日无智慧</h3>
      <p>{{ error }}</p>
      <button @click="getWisdom" class="retry-btn">重新获取</button>
    </div>

    <!-- 智慧内容 -->
    <div v-else-if="wisdom" class="wisdom-container">
      <div class="wisdom-card">
        <!-- 哲理句子 -->
        <div class="philosophy">
          <span class="quote-mark">"</span>
          <h2>{{ wisdom.philosophy }}</h2>
          <span class="quote-mark">"</span>
        </div>

        <!-- 建议内容 -->
        <div class="divider"></div>
        <p class="suggestion">{{ wisdom.suggestion }}</p>

        <!-- 标签 -->
        <div class="tags">
          <span class="tag">{{ wisdom.element }}</span>
          <span class="tag">{{ wisdom.category }}</span>
          <span class="tag">{{ wisdom.timeSlot }}时</span>
        </div>

        <!-- 时间戳 -->
        <div class="timestamp">
          {{ formatTime(wisdom.timestamp) }}
        </div>
      </div>

      <!-- 获取新智慧按钮 -->
      <div class="actions">
        <button @click="getWisdom" :disabled="loading" class="new-wisdom-btn">
          🎲 获取新智慧
        </button>
      </div>
    </div>

    <!-- 初始状态 -->
    <div v-else class="welcome">
      <button @click="getWisdom" :disabled="loading" class="start-btn">
        给我答案
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'

const loading = ref(false)
const error = ref('')
const wisdom = ref(null)

const getWisdom = async () => {
  loading.value = true
  error.value = ''

  try {
    const response = await axios.get('/api/wisdom', {
      params: {
        timestamp: new Date().toISOString()
      }
    })

    wisdom.value = response.data

    // 保存到本地存储
    if (typeof window !== 'undefined') {
      localStorage.setItem('lastWisdom', JSON.stringify(wisdom.value))
      localStorage.setItem('lastWisdomTime', new Date().toISOString())
    }
  } catch (err) {
    console.error('获取智慧失败:', err)

    // 尝试使用缓存
    if (typeof window !== 'undefined') {
      const cachedWisdom = localStorage.getItem('lastWisdom')
      if (cachedWisdom) {
        wisdom.value = JSON.parse(cachedWisdom)
      } else {
        error.value = '获取智慧失败，请稍后重试'
      }
    } else {
      error.value = '获取智慧失败，请稍后重试'
    }
  } finally {
    loading.value = false
  }
}

const formatTime = (timestamp) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 组件挂载时不自动获取，让用户主动点击
</script>

<style scoped>
.wisdom-content {
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
}

.loading {
  padding: 4rem 2rem;
  color: #ffffff80;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top: 3px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error {
  padding: 4rem 2rem;
  color: #ff6b6b;
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.retry-btn {
  margin-top: 1rem;
  padding: 0.5rem 1.5rem;
  background: #ff6b6b;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.retry-btn:hover {
  background: #ff5252;
}

.welcome {
  padding: 8rem 2rem;
  color: #ffffff;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
}

.welcome-icon {
  font-size: 4rem;
  margin-bottom: 2rem;
}

.welcome h2 {
  font-size: 2rem;
  font-weight: 300;
  margin-bottom: 1rem;
  background: linear-gradient(45deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.welcome p {
  color: #ffffff80;
  margin-bottom: 2rem;
  font-size: 1.1rem;
}

.start-btn {
  padding: 1rem 2rem;
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 30px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
}

.start-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(102, 126, 234, 0.4);
}

.start-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.wisdom-container {
  padding: 2rem;
}

.wisdom-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 3rem;
  margin-bottom: 2rem;
  transition: all 0.3s ease;
}

.wisdom-card:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.philosophy {
  position: relative;
  margin-bottom: 2rem;
}

.quote-mark {
  font-size: 3rem;
  color: rgba(255, 255, 255, 0.1);
  position: absolute;
}

.quote-mark:first-child {
  top: -2rem;
  left: -1rem;
}

.quote-mark:last-child {
  bottom: -2rem;
  right: -1rem;
}

.philosophy h2 {
  font-size: 1.8rem;
  font-weight: 300;
  line-height: 1.6;
  color: #ffffff;
  margin: 0;
  padding: 0 2rem;
}

.divider {
  width: 100px;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  margin: 2rem auto;
}

.suggestion {
  font-size: 1.2rem;
  line-height: 1.6;
  color: #ffffffc0;
  margin-bottom: 2rem;
}

.tags {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.tag {
  padding: 0.5rem 1rem;
  background: rgba(102, 126, 234, 0.2);
  border: 1px solid rgba(102, 126, 234, 0.3);
  border-radius: 20px;
  font-size: 0.9rem;
  color: #ffffff;
}

.timestamp {
  color: #ffffff40;
  font-size: 0.9rem;
}

.actions {
  text-align: center;
}

.new-wisdom-btn {
  padding: 0.8rem 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #ffffff;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.new-wisdom-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
}

.new-wisdom-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .wisdom-card {
    padding: 2rem 1.5rem;
  }

  .philosophy h2 {
    font-size: 1.5rem;
    padding: 0 1rem;
  }

  .quote-mark {
    font-size: 2rem;
  }

  .quote-mark:first-child {
    top: -1rem;
    left: -0.5rem;
  }

  .quote-mark:last-child {
    bottom: -1rem;
    right: -0.5rem;
  }

  .suggestion {
    font-size: 1.1rem;
  }

  .welcome h2 {
    font-size: 1.5rem;
  }
}
</style>