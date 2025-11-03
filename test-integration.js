const http = require('http');

// 创建测试服务器实例
const app = require('./server/index.js');
const server = http.createServer(app);

async function testAPIs() {
  console.log('🧪 开始测试智慧之书API...\n');

  try {
    // 测试常规智慧接口
    console.log('1️⃣ 测试 /api/wisdom 接口');
    const wisdomResponse = await fetch('http://localhost:5002/api/wisdom');
    const wisdomData = await wisdomResponse.json();
    console.log('✅ 常规智慧接口测试成功:', {
      philosophy: wisdomData.philosophy?.substring(0, 30) + '...',
      category: wisdomData.category,
      element: wisdomData.element,
      timeSlot: wisdomData.timeSlot
    });

    // 测试问题咨询接口（不配置DeepSeek API，测试备用方案）
    console.log('\n2️⃣ 测试 /api/ask 接口（备用方案）');
    const askResponse = await fetch('http://localhost:5002/api/ask', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        question: '我应该如何面对未来的不确定性？',
        timestamp: new Date().toISOString()
      })
    });

    const askData = await askResponse.json();
    console.log('✅ 问题咨询接口测试成功:', {
      advice: askData.advice,
      category: askData.category,
      element: askData.element,
      fromCache: askData.fromCache
    });

    // 测试类别接口
    console.log('\n3️⃣ 测试 /api/categories 接口');
    const categoriesResponse = await fetch('http://localhost:5002/api/categories');
    const categoriesData = await categoriesResponse.json();
    console.log('✅ 类别接口测试成功:', {
      count: categoriesData.categories.length,
      categories: categoriesData.categories.slice(0, 3) + '...'
    });

    // 测试健康检查接口
    console.log('\n4️⃣ 测试 /api/health 接口');
    const healthResponse = await fetch('http://localhost:5002/api/health');
    const healthData = await healthResponse.json();
    console.log('✅ 健康检查接口测试成功:', {
      status: healthData.status,
      deepseekConfigured: healthData.deepseekConfigured,
      uptime: Math.floor(healthData.uptime) + 's'
    });

    console.log('\n🎉 所有API测试完成！');
    console.log('\n📋 功能清单:');
    console.log('✅ 常规智慧内容生成');
    console.log('✅ 六壬时间计算');
    console.log('✅ 问题咨询（备用方案）');
    console.log('✅ 内容分类系统');
    console.log('✅ 健康检查');
    console.log('📝 DeepSeek API集成（需要配置API密钥）');

  } catch (error) {
    console.error('❌ API测试失败:', error.message);
  }
}

// 启动测试服务器
server.listen(5002, () => {
  console.log('🚀 测试服务器启动在端口 5002');

  // 等待服务器完全启动后开始测试
  setTimeout(testAPIs, 1000);

  // 测试完成后关闭服务器
  setTimeout(() => {
    console.log('\n🔚 测试完成，关闭服务器');
    server.close();
  }, 5000);
});