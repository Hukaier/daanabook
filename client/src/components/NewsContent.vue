<template>
  <div class="news-content">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading">
      <div class="loading-spinner"></div>
      <p>正在加载实时资讯...</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error">
      <div class="error-icon">⚠️</div>
      <h3>加载失败</h3>
      <p>{{ error }}</p>
      <button @click="loadNews" class="retry-btn">重试</button>
    </div>

    <!-- 新闻内容 -->
    <div v-else class="news-container">
      <!-- 分类标签 -->
      <div class="category-tabs">
        <button
          v-for="category in categories"
          :key="category.key"
          :class="['category-tab', { active: activeCategory === category.key }]"
          @click="switchCategory(category.key)"
        >
          {{ category.name }}
          <span class="count" v-if="getCategoryCount(category.key) > 0">
            {{ getCategoryCount(category.key) }}
          </span>
        </button>
      </div>

      <!-- 刷新按钮 -->
      <div class="actions">
        <button @click="refreshNews" :disabled="refreshing" class="refresh-btn">
          <span v-if="!refreshing">🔄 刷新</span>
          <span v-else>刷新中...</span>
        </button>
        <span class="last-update" v-if="lastUpdate">
          最后更新: {{ formatTime(lastUpdate) }}
        </span>
      </div>

      <!-- 新闻列表 -->
      <div class="news-list">
        <div
          v-for="item in currentNews"
          :key="item.id || item.title"
          class="news-item"
        >
          <div class="news-header">
            <span class="news-source">{{ item.source }}</span>
            <span class="news-time">{{ formatTime(item.publishedAt) }}</span>
          </div>
          <h3 class="news-title">
            <a :href="item.url" target="_blank" rel="noopener noreferrer">
              {{ item.title }}
            </a>
          </h3>
          <div v-if="item.authors" class="news-authors">
            作者: {{ item.authors.join(', ') }}
          </div>
          <div v-if="item.artist" class="news-artist">
            艺术家: {{ item.artist }}
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="currentNews.length === 0" class="empty-state">
          <div class="empty-icon">📰</div>
          <p>暂无{{ getCurrentCategoryName() }}资讯</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'

const loading = ref(true)
const error = ref('')
const refreshing = ref(false)
const newsData = ref({})
const categories = ref([])
const activeCategory = ref('ai')
const lastUpdate = ref('')

const currentNews = computed(() => {
  if (activeCategory.value === 'ai') {
    return newsData.value.aiNews || []
  } else if (activeCategory.value === 'geopolitics') {
    return newsData.value.geopolitics || []
  } else if (activeCategory.value === 'fujian') {
    return newsData.value.regionalNews?.fujian || []
  } else if (activeCategory.value === 'innerMongolia') {
    return newsData.value.regionalNews?.innerMongolia || []
  } else if (activeCategory.value === 'github') {
    return newsData.value.githubTrending || []
  } else if (activeCategory.value === 'music') {
    return newsData.value.music || []
  }
  return []
})

const getCategoryCount = (category) => {
  if (category === 'ai') return newsData.value.aiNews?.length || 0
  if (category === 'geopolitics') return newsData.value.geopolitics?.length || 0
  if (category === 'fujian') return newsData.value.regionalNews?.fujian?.length || 0
  if (category === 'innerMongolia') return newsData.value.regionalNews?.innerMongolia?.length || 0
  if (category === 'github') return newsData.value.githubTrending?.length || 0
  if (category === 'music') return newsData.value.music?.length || 0
  return 0
}

const getCurrentCategoryName = () => {
  const category = categories.value.find(c => c.key === activeCategory.value)
  return category ? category.name : ''
}

const formatTime = (timeString) => {
  if (!timeString) return ''
  const date = new Date(timeString)
  const now = new Date()
  const diff = now - date

  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  return date.toLocaleDateString('zh-CN')
}

const loadCategories = async () => {
  try {
    const response = await axios.get('/api/news/categories')
    if (response.data.success) {
      categories.value = response.data.data
    }
  } catch (err) {
    console.error('加载分类失败:', err)
  }
}

const loadNews = async () => {
  loading.value = true
  error.value = ''

  try {
    const response = await axios.get('/api/news')
    if (response.data.success) {
      newsData.value = response.data.data
      lastUpdate.value = response.data.timestamp
    } else {
      error.value = response.data.error || '加载失败'
    }
  } catch (err) {
    console.error('加载新闻失败:', err)
    error.value = '网络错误，请检查连接'
  } finally {
    loading.value = false
  }
}

const refreshNews = async () => {
  refreshing.value = true
  try {
    await axios.post('/api/news/refresh')
    await loadNews()
  } catch (err) {
    console.error('刷新失败:', err)
  } finally {
    refreshing.value = false
  }
}

const switchCategory = (category) => {
  activeCategory.value = category
}

onMounted(async () => {
  await Promise.all([loadCategories(), loadNews()])
})
</script>

<style scoped>
.news-content {
  max-width: 1000px;
  margin: 0 auto;
}

.loading {
  text-align: center;
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
  text-align: center;
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

.category-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.category-tab {
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #ffffff;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.category-tab:hover {
  background: rgba(255, 255, 255, 0.1);
}

.category-tab.active {
  background: linear-gradient(45deg, #667eea, #764ba2);
  border-color: transparent;
}

.count {
  background: rgba(255, 255, 255, 0.2);
  padding: 0.2rem 0.5rem;
  border-radius: 10px;
  font-size: 0.8rem;
  min-width: 20px;
  text-align: center;
}

.actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.refresh-btn {
  padding: 0.5rem 1rem;
  background: rgba(102, 126, 234, 0.2);
  border: 1px solid rgba(102, 126, 234, 0.3);
  color: #ffffff;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.refresh-btn:hover:not(:disabled) {
  background: rgba(102, 126, 234, 0.3);
}

.refresh-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.last-update {
  color: #ffffff60;
  font-size: 0.9rem;
}

.news-list {
  display: grid;
  gap: 1.5rem;
}

.news-item {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s ease;
}

.news-item:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.news-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: #ffffff60;
}

.news-source {
  background: rgba(102, 126, 234, 0.2);
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
}

.news-title {
  margin: 0.5rem 0;
  font-size: 1.1rem;
  font-weight: 500;
  line-height: 1.4;
}

.news-title a {
  color: #ffffff;
  text-decoration: none;
  transition: color 0.3s ease;
}

.news-title a:hover {
  color: #667eea;
}

.news-authors,
.news-artist {
  margin-top: 0.5rem;
  font-size: 0.9rem;
  color: #ffffff60;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #ffffff60;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

@media (max-width: 768px) {
  .category-tabs {
    justify-content: center;
  }

  .actions {
    justify-content: center;
    text-align: center;
  }

  .news-header {
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-start;
  }
}
</style>