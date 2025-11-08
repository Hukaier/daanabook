<template>
  <div class="app">
    <!-- 导航栏 -->
    <header class="header">
      <div class="container">
        <h1 class="title">智慧之书</h1>
        <nav class="nav">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            :class="['nav-btn', { active: currentTab === tab.key }]"
            @click="currentTab = tab.key"
          >
            {{ tab.name }}
          </button>
        </nav>
      </div>
    </header>

    <!-- 主内容区 -->
    <main class="main">
      <div class="container">
        <!-- 智慧主页 -->
        <div v-if="currentTab === 'wisdom'" class="content">
          <WisdomContent />
        </div>

        <!-- 智慧问答 -->
        <div v-else-if="currentTab === 'ask'" class="content">
          <AskWisdom />
        </div>

        <!-- 实时资讯 -->
        <div v-else-if="currentTab === 'news'" class="content">
          <NewsContent />
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import WisdomContent from './components/WisdomContent.vue'
import AskWisdom from './components/AskWisdom.vue'
import NewsContent from './components/NewsContent.vue'

const currentTab = ref('wisdom')

const tabs = [
  { key: 'wisdom', name: '答案' },
  { key: 'ask', name: '问答' },
  { key: 'news', name: '资讯' }
]
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: linear-gradient(135deg, #1e1e2e 0%, #2d2d44 100%);
  color: #ffffff;
  min-height: 100vh;
}

.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.header {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 1rem 0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header .container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  font-size: 1.5rem;
  font-weight: 600;
  background: linear-gradient(45deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.nav {
  display: flex;
  gap: 1rem;
}

.nav-btn {
  padding: 0.5rem 1rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.05);
  color: #ffffff;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.nav-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
}

.nav-btn.active {
  background: linear-gradient(45deg, #667eea, #764ba2);
  border-color: transparent;
}

.main {
  flex: 1;
  padding: 2rem 0;
}

.content {
  min-height: 60vh;
}

@media (max-width: 768px) {
  .header .container {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .nav {
    flex-wrap: wrap;
    justify-content: center;
  }

  .title {
    font-size: 1.2rem;
  }
}
</style>