<template>
  <div class="ask-wisdom">
    <!-- 问题输入区 -->
    <div class="question-section">
      <div class="input-area">
        <textarea
          v-model="question"
          placeholder="请输入你的问题..."
          :maxlength="100"
          rows="4"
          class="question-input"
          :disabled="asking"
        ></textarea>

        <div class="input-footer">
          <span class="char-count">{{ question.length }}/100</span>
          <button
            @click="askWisdom"
            :disabled="!question.trim() || asking"
            class="ask-btn"
          >
            <span v-if="!asking">🔮 获得解答</span>
            <span v-else>占卜中...</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 回答显示区 -->
    <div v-if="advice || error" class="answer-section">
      <!-- 错误状态 -->
      <div v-if="error" class="error-answer">
        <div class="error-icon">⚠️</div>
        <h3>占卜失败</h3>
        <p>{{ error }}</p>
        <button @click="askWisdom" :disabled="!question.trim() || asking" class="retry-btn">
          重新占卜
        </button>
      </div>

      <!-- 回答内容 -->
      <div v-else-if="advice" class="advice-answer">
        <div class="advice-header">
          <span class="question-text">"{{ originalQuestion }}"</span>
        </div>

        <div class="advice-content">
          <h2>{{ advice }}</h2>
        </div>

        <div class="advice-meta">
          <span class="tag">{{ element }}</span>
          <span class="tag">{{ category }}</span>
          <span class="tag">{{ timeSlot }}时</span>
          <span v-if="fromCache" class="cache-indicator">缓存结果</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'

const question = ref('')
const asking = ref(false)
const advice = ref('')
const error = ref('')
const originalQuestion = ref('')
const element = ref('')
const category = ref('')
const timeSlot = ref('')
const fromCache = ref(false)

const askWisdom = async () => {
  if (!question.value.trim()) return

  asking.value = true
  error.value = ''
  advice.value = ''
  originalQuestion.value = question.value.trim()

  try {
    const response = await axios.post('/api/ask', {
      question: originalQuestion.value,
      timestamp: new Date().toISOString()
    })

    const data = response.data
    advice.value = data.advice
    element.value = data.element
    category.value = data.category
    timeSlot.value = data.timeSlot
    fromCache.value = data.fromCache || false

    // 清空问题
    question.value = ''
  } catch (err) {
    console.error('询问智慧失败:', err)
    error.value = '网络异常，请稍后再试'
  } finally {
    asking.value = false
  }
}
</script>

<style scoped>
.ask-wisdom {
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
}

.question-section {
  margin-bottom: 3rem;
}

.input-area {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 2rem;
}

.question-input {
  width: 100%;
  background: transparent;
  border: none;
  color: #ffffff;
  font-size: 1.1rem;
  line-height: 1.6;
  resize: none;
  outline: none;
  font-family: inherit;
  margin-bottom: 1rem;
}

.question-input::placeholder {
  color: #ffffff40;
}

.question-input:disabled {
  opacity: 0.5;
}

.input-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.char-count {
  color: #ffffff60;
  font-size: 0.9rem;
}

.ask-btn {
  padding: 0.8rem 1.5rem;
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
}

.ask-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(102, 126, 234, 0.4);
}

.ask-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.answer-section {
  margin-bottom: 2rem;
}

.error-answer {
  background: rgba(255, 107, 107, 0.1);
  border: 1px solid rgba(255, 107, 107, 0.2);
  border-radius: 16px;
  padding: 3rem 2rem;
  color: #ff6b6b;
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.error-answer h3 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.retry-btn {
  margin-top: 1.5rem;
  padding: 0.6rem 1.5rem;
  background: rgba(255, 107, 107, 0.2);
  border: 1px solid rgba(255, 107, 107, 0.3);
  color: #ffffff;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.retry-btn:hover:not(:disabled) {
  background: rgba(255, 107, 107, 0.3);
}

.advice-answer {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 3rem 2rem;
  transition: all 0.3s ease;
}

.advice-answer:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.advice-header {
  margin-bottom: 2rem;
  color: #ffffff60;
  font-style: italic;
  font-size: 1.1rem;
}

.question-text {
  display: block;
  max-width: 600px;
  margin: 0 auto;
}

.advice-content {
  margin-bottom: 2rem;
}

.advice-content h2 {
  font-size: 1.8rem;
  font-weight: 300;
  line-height: 1.6;
  color: #ffffff;
  margin: 0;
}

.advice-meta {
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: center;
}

.tag {
  padding: 0.5rem 1rem;
  background: rgba(102, 126, 234, 0.2);
  border: 1px solid rgba(102, 126, 234, 0.3);
  border-radius: 20px;
  font-size: 0.9rem;
  color: #ffffff;
}

.cache-indicator {
  padding: 0.3rem 0.8rem;
  background: rgba(255, 193, 7, 0.2);
  border: 1px solid rgba(255, 193, 7, 0.3);
  border-radius: 12px;
  font-size: 0.8rem;
  color: #ffc107;
}

@media (max-width: 768px) {
  .question-section,
  .answer-section {
    padding: 2rem 1rem;
  }
}
</style>
