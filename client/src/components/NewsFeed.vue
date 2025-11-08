<template>
  <div class="news-feed">
    <!-- 新闻分类标签 -->
    <div class="flex justify-center space-x-2 mb-8">
      <button
        v-for="category in categories"
        :key="category.key"
        @click="activeCategory = category.key"
        :class="[
          'px-4 py-2 rounded-full text-sm font-light transition-all',
          activeCategory === category.key
            ? 'bg-white/20 border border-white/40 text-white'
            : 'bg-white/10 border border-white/20 text-white/60 hover:bg-white/15'
        ]"
      >
        {{ category.name }}
      </button>
    </div>

    <!-- 新闻列表 -->
    <div class="space-y-4 max-h-96 overflow-y-auto">
      <div v-if="loading" class="text-center text-white/60 py-8">
        加载中...
      </div>

      <div v-else-if="newsItems.length === 0" class="text-center text-white/60 py-8">
        暂无{{ getCurrentCategoryName() }}相关新闻
      </div>

      <div
        v-else
        v-for="item in newsItems"
        :key="item.id"
        class="news-item p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all cursor-pointer"
        @click="openNews(item)"
      >
        <div class="flex justify-between items-start mb-2">
          <h3 class="text-white/80 font-light text-sm flex-1 line-clamp-2">
            {{ item.title }}
          </h3>
          <span class="text-white/40 text-xs ml-2 whitespace-nowrap">
            {{ formatTime(item.publishedAt) }}
          </span>
        </div>

        <div class="flex justify-between items-center">
          <div class="flex items-center space-x-2">
            <span class="text-white/30 text-xs">{{ item.source }}</span>
            <span v-if="item.category" class="text-white/20 text-xs">•</span>
            <span v-if="item.category === 'github' && item.stars" class="text-white/30 text-xs">
              ⭐ {{ item.stars }}
            </span>
            <span v-if="item.category === 'github' && item.language" class="text-white/30 text-xs">
              {{ item.language }}
            </span>
          </div>
          <span class="text-white/20 text-xs">{{ getCategoryBadge(item.category) }}</span>
        </div>
      </div>
    </div>

    <!-- 刷新按钮 -->
    <div class="flex justify-center mt-6">
      <button
        @click="refreshNews"
        :disabled="refreshing"
        class="px-4 py-2 bg-white/10 border border-white/20 rounded-full text-white/60 text-sm font-light hover:bg-white/20 transition-all disabled:opacity-50"
      >
        <span v-if="refreshing">刷新中...</span>
        <span v-else>刷新新闻</span>
      </button>
    </div>

    <!-- 最后更新时间 -->
    <div v-if="lastUpdate" class="text-center text-white/20 text-xs mt-4">
      最后更新: {{ formatTime(lastUpdate) }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import axios from 'axios'

const categories = [
  { key: 'ai', name: 'AI资讯' },
  { key: 'geopolitics', name: '时政要闻' },
  { key: 'fujian', name: '福建发展' },
  { key: 'innerMongolia', name: '内蒙古动态' },
  { key: 'github', name: 'GitHub热门' },
  { key: 'music', name: '音乐新声' }
]

const activeCategory = ref('ai')
const newsItems = ref([])
const loading = ref(false)
const refreshing = ref(false)
const lastUpdate = ref(null)
const allNews = ref({})

// 获取当前分类的新闻
const fetchNews = async (category = activeCategory.value) => {
  loading.value = true
  try {
    const response = await axios.get(`/api/news/${category}`)
    newsItems.value = response.data.items || []
  } catch (error) {
    console.error('获取新闻失败:', error)
    newsItems.value = []
  } finally {
    loading.value = false
  }
}

// 获取所有新闻（用于显示最后更新时间）
const fetchAllNews = async () => {
  try {
    const response = await axios.get('/api/news')
    allNews.value = response.data
    lastUpdate.value = response.data.lastUpdate
  } catch (error) {
    console.error('获取全部新闻失败:', error)
  }
}

// 刷新新闻
const refreshNews = async () => {
  refreshing.value = true
  try {
    // 先刷新服务器缓存
    await axios.post('/api/news/refresh')

    // 重新获取当前分类的新闻
    await fetchNews()

    // 更新最后更新时间
    await fetchAllNews()
  } catch (error) {
    console.error('刷新新闻失败:', error)
  } finally {
    refreshing.value = false
  }
}

// 打开新闻链接
const openNews = (item) => {
  if (item.url) {
    window.open(item.url, '_blank')
  }
}

// 格式化时间
const formatTime = (timestamp) => {
  if (!timestamp) return ''

  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date

  if (diff < 60000) { // 1分钟内
    return '刚刚'
  } else if (diff < 3600000) { // 1小时内
    return `${Math.floor(diff / 60000)}分钟前`
  } else if (diff < 86400000) { // 1天内
    return `${Math.floor(diff / 3600000)}小时前`
  } else if (diff < 604800000) { // 1周内
    return `${Math.floor(diff / 86400000)}天前`
  } else {
    return date.toLocaleDateString('zh-CN')
  }
}

// 获取当前分类名称
const getCurrentCategoryName = () => {
  const category = categories.find(c => c.key === activeCategory.value)
  return category ? category.name : ''
}

// 获取分类徽章
const getCategoryBadge = (category) => {
  const badges = {
    ai: '🤖 AI',
    geopolitics: '🌍 时政',
    github: '💻 代码',
    music: '🎵 音乐',
    fujian: '🏔️ 福建',
    innerMongolia: '🏜️ 内蒙古'
  }
  return badges[category] || category
}

// 监听分类变化
watch(activeCategory, (newCategory) => {
  fetchNews(newCategory)
})

// 组件挂载时获取数据
onMounted(async () => {
  await fetchAllNews()
  await fetchNews()
})
</script>

<style scoped>
.news-feed {
  @apply w-full max-w-2xl mx-auto;
}

.news-item {
  @apply backdrop-blur-sm;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 自定义滚动条样式 */
.max-h-96::-webkit-scrollbar {
  width: 4px;
}

.max-h-96::-webkit-scrollbar-track {
  @apply bg-white/5 rounded-full;
}

.max-h-96::-webkit-scrollbar-thumb {
  @apply bg-white/20 rounded-full;
}

.max-h-96::-webkit-scrollbar-thumb:hover {
  @apply bg-white/30;
}
</style>