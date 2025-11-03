<template>
  <div class="min-h-screen flex flex-col">
    <!-- 背景效果 -->
    <div class="fixed inset-0 bg-black"></div>
    <div class="fixed inset-0">
      <div class="absolute top-20 left-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
      <div class="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
      <div class="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl"></div>
    </div>

    <!-- 主内容 -->
    <div class="relative z-10 flex-1 flex items-center justify-center p-8">
      <div class="w-full max-w-4xl">
        <transition name="fade" mode="out-in">
          <!-- 欢迎界面 -->
          <div v-if="!wisdom && !showAskForm" key="welcome" class="text-center">
            <div class="text-white/60 text-2xl font-light tracking-wider mb-12">
              点击获取智慧或提出问题
            </div>
            <div class="flex justify-center space-x-8">
              <button
                @click="getWisdom"
                class="px-8 py-3 bg-white/10 border border-white/20 rounded-full text-white/80 font-light hover:bg-white/20 transition-all"
              >
                随机智慧
              </button>
              <button
                @click="showAskForm = true"
                class="px-8 py-3 bg-white/10 border border-white/20 rounded-full text-white/80 font-light hover:bg-white/20 transition-all"
              >
                请问智慧
              </button>
            </div>
          </div>

          <!-- 问题表单 -->
          <div v-else-if="showAskForm" key="askForm" class="text-center">
            <div class="text-white/60 text-xl font-light tracking-wider mb-8">
              询问你的问题
            </div>
            <div class="max-w-md mx-auto mb-8">
              <textarea
                v-model="question"
                @click.stop
                placeholder="请输入你的问题..."
                class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white/80 placeholder-white/40 font-light resize-none focus:outline-none focus:border-white/40"
                rows="3"
                maxlength="100"
              ></textarea>
              <div class="text-right text-white/40 text-sm mt-2">
                {{ question.length }}/100
              </div>
            </div>
            <div class="flex justify-center space-x-4">
              <button
                @click="showAskForm = false"
                class="px-6 py-2 bg-white/10 border border-white/20 rounded-full text-white/60 font-light hover:bg-white/20 transition-all"
              >
                返回
              </button>
              <button
                @click="askWisdom"
                :disabled="!question.trim() || asking"
                class="px-6 py-2 bg-white/20 border border-white/30 rounded-full text-white font-light hover:bg-white/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span v-if="asking">询问中...</span>
                <span v-else>获得答案</span>
              </button>
            </div>
          </div>

          <!-- 常规智慧展示 -->
          <div v-else-if="wisdom && !wisdom.advice" key="content" class="text-center cursor-pointer" @click="getWisdom">
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

          <!-- AI智慧展示 -->
          <div v-else-if="wisdom && wisdom.advice" key="advice" class="text-center cursor-pointer" @click="showAskForm = true">
            <div class="text-white/60 text-sm uppercase tracking-widest mb-8">
              基于六壬排盘的智慧解答
            </div>

            <!-- 用户问题 -->
            <div class="text-white/80 text-lg md:text-xl font-light mb-8 italic">
              "{{ question }}"
            </div>

            <!-- AI建议 -->
            <h2 class="text-white text-4xl md:text-6xl font-light leading-relaxed mb-16">
              {{ wisdom.advice }}
            </h2>

            <!-- 分割线 -->
            <div class="w-20 h-px bg-white/20 mx-auto mb-16"></div>

            <!-- 标签 -->
            <div class="flex justify-center items-center space-x-4 text-white/40 text-sm uppercase tracking-widest">
              <span class="px-4 py-2 border border-white/20 rounded-full">{{ wisdom.element }}</span>
              <span class="px-4 py-2 border border-white/20 rounded-full">{{ wisdom.category }}</span>
              <span class="px-4 py-2 border border-white/20 rounded-full">{{ wisdom.timeSlot }}时</span>
            </div>

            <div v-if="wisdom.fromCache" class="text-white/30 text-xs mt-4">
              * 缓存结果
            </div>
          </div>

          <!-- 加载状态 -->
          <div v-else-if="loading" key="loading" class="text-center">
            <div class="text-white/60 text-2xl font-light tracking-wider">
              {{ showAskForm ? '询问中...' : '寻找智慧中...' }}
            </div>
          </div>
        </transition>
      </div>
    </div>

    <!-- 底部提示 -->
    <div class="relative z-10 pb-8">
      <div class="text-center">
        <div class="fixed bottom-8 left-1/2 transform -translate-x-1/2 text-white/20 text-xs uppercase tracking-widest animate-pulse">
          {{ showAskForm ? '点击提交问题' : '点击任意位置' }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const wisdom = ref(null)
const loading = ref(false)
const showAskForm = ref(false)
const question = ref('')
const asking = ref(false)

const getWisdom = async () => {
  loading.value = true
  showAskForm.value = false

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

const askWisdom = async () => {
  if (!question.value.trim()) return

  asking.value = true
  loading.value = true

  try {
    const response = await axios.post('/api/ask', {
      question: question.value.trim(),
      timestamp: new Date().toISOString()
    })

    wisdom.value = response.data

    // 清空问题字段
    question.value = ''
    showAskForm.value = false

  } catch (error) {
    console.error('获取AI智慧失败:', error)

    // 显示错误信息
    wisdom.value = {
      advice: '网络异常，请稍后再试',
      category: '未知',
      element: '未知',
      timeSlot: '未知',
      fromCache: false,
      timestamp: new Date().toISOString()
    }
  } finally {
    asking.value = false
    loading.value = false
  }
}

onMounted(() => {
  // 页面加载时不自动获取，让用户选择
})
</script>