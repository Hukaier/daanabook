<template>
  <div class="min-h-screen flex items-center justify-center cursor-pointer" @click="getWisdom">
    <!-- 背景效果 -->
    <div class="fixed inset-0 bg-black"></div>
    <div class="fixed inset-0">
      <div class="absolute top-20 left-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
      <div class="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
      <div class="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl"></div>
    </div>

    <!-- 主内容 -->
    <div class="relative z-10 w-full max-w-4xl mx-auto p-8">
      <transition name="fade" mode="out-in">
        <div v-if="loading" key="loading" class="text-center">
          <div class="text-white/60 text-2xl font-light tracking-wider">寻找智慧中</div>
        </div>

        <div v-else-if="wisdom" key="content" class="text-center">
          <!-- 哲理句子 -->
          <h2 class="text-white text-3xl md:text-5xl font-light leading-relaxed mb-16 relative">
            <span class="absolute text-white/20 text-4xl md:text-6xl -left-8 -top-4">"</span>
            {{ wisdom.philosophy }}
            <span class="absolute text-white/20 text-4xl md:text-6xl -right-8 -bottom-4">"</span>
          </h2>

          <!-- 分割线 -->
          <div class="w-20 h-px bg-white/20 mx-auto mb-16"></div>

          <!-- 建议内容 -->
          <p class="text-white/70 text-xl md:text-2xl font-light leading-relaxed mb-16">
            {{ wisdom.suggestion }}
          </p>

          <!-- 标签 -->
          <div class="flex justify-center items-center space-x-4 text-white/40 text-sm uppercase tracking-widest">
            <span class="px-4 py-2 border border-white/20 rounded-full">{{ wisdom.element }}</span>
            <span class="px-4 py-2 border border-white/20 rounded-full">{{ wisdom.category }}</span>
            <span class="px-4 py-2 border border-white/20 rounded-full">{{ wisdom.timeSlot }}时</span>
          </div>
        </div>

        <div v-else key="welcome" class="text-center">
          <div class="text-white/60 text-2xl font-light tracking-wider">点击获取智慧</div>
        </div>
      </transition>
    </div>

    <!-- 底部提示 -->
    <div class="fixed bottom-8 left-1/2 transform -translate-x-1/2 text-white/20 text-xs uppercase tracking-widest animate-pulse">
      点击任意位置
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const wisdom = ref(null)
const loading = ref(false)

const getWisdom = async () => {
  loading.value = true

  try {
    // 可以传递自定义时间戳，这里使用当前时间
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
  } catch (error) {
    console.error('获取智慧内容失败:', error)

    // 如果请求失败，尝试使用缓存的内容
    if (typeof window !== 'undefined') {
      const cachedWisdom = localStorage.getItem('lastWisdom')
      if (cachedWisdom) {
        wisdom.value = JSON.parse(cachedWisdom)
      }
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  // 页面加载时自动获取一次智慧内容
  getWisdom()
})
</script>