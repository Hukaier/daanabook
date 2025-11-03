const http = require('http');
const TimeCalculator = require('./server/utils/timeCalculator');
const DeepSeekService = require('./server/utils/deepseekService');
const { getRandomContent } = require('./server/data/wisdomContent');

// 创建一个简单的演示服务器
const demoServer = http.createServer((req, res) => {
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.url === '/api/wisdom') {
    try {
      // 创建时间计算器（强制随机以获得不同内容）
      const calculator = new TimeCalculator();
      const wisdomData = calculator.calculateWisdomData(new Date(), true);

      // 获取内容
      const content = getRandomContent(wisdomData.category, wisdomData.numbers.timeSeed);

      if (!content) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: '无法获取内容' }));
        return;
      }

      const response = {
        philosophy: content.philosophy,
        suggestion: content.suggestion,
        category: wisdomData.category,
        element: wisdomData.element,
        timeSlot: wisdomData.timeSlot,
        sessionId: wisdomData.sessionId,
        timestamp: wisdomData.timestamp
      };

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(response, null, 2));

    } catch (error) {
      console.error('获取智慧内容时出错:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: '服务器内部错误' }));
    }
  } else if (req.url === '/api/ask' && req.method === 'POST') {
    // 问题咨询接口
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const { question } = JSON.parse(body);

        if (!question || !question.trim()) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: '请提供有效的问题' }));
          return;
        }

        // 创建时间计算器和DeepSeek服务
        const calculator = new TimeCalculator();
        const wisdomData = calculator.calculateWisdomData(new Date(), true);
        const deepSeekService = new DeepSeekService();

        // 尝试调用DeepSeek API
        deepSeekService.getWisdomAdvice(wisdomData, question.trim())
          .then(advice => {
            const response = {
              advice: advice,
              category: wisdomData.category,
              element: wisdomData.element,
              timeSlot: wisdomData.timeSlot,
              fromCache: false,
              timestamp: wisdomData.timestamp
            };

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(response, null, 2));
          })
          .catch(error => {
            console.log('DeepSeek API调用失败，使用备用建议:', error.message);
            // 获取"当下接受"类别的建议作为备用
            const content = getRandomContent('当下接受', wisdomData.numbers.timeSeed);

            const response = {
              advice: content ? content.suggestion : '静心感受当下，答案就在心中',
              category: wisdomData.category,
              element: wisdomData.element,
              timeSlot: wisdomData.timeSlot,
              fromCache: false,
              timestamp: wisdomData.timestamp
            };

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(response, null, 2));
          });

      } catch (error) {
        console.error('处理问题咨询时出错:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: '服务器内部错误' }));
      }
    });
  } else if (req.url === '/') {
    // 简单的HTML页面
    const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>答案之书演示</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
            background: #0a0a0a;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            overflow: hidden;
        }

        body::before {
            content: '';
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background:
                radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
                radial-gradient(circle at 40% 80%, rgba(120, 219, 255, 0.3) 0%, transparent 50%);
            z-index: -1;
        }

        .container {
            width: 90vw;
            max-width: 800px;
            min-height: 60vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem;
            position: relative;
        }

        #wisdom-container {
            width: 100%;
            text-align: center;
            position: relative;
        }

        .wisdom {
            opacity: 0;
            animation: fadeIn 1.2s ease-out forwards;
        }

        .philosophy {
            font-size: clamp(1.5rem, 4vw, 2.5rem);
            color: #ffffff;
            font-weight: 300;
            line-height: 1.4;
            margin-bottom: 3rem;
            letter-spacing: 0.02em;
            position: relative;
        }

        .philosophy::before,
        .philosophy::after {
            content: '"';
            font-size: 1.2em;
            color: rgba(255, 255, 255, 0.3);
            position: absolute;
        }

        .philosophy::before {
            top: -0.5rem;
            left: -1rem;
        }

        .philosophy::after {
            bottom: -0.5rem;
            right: -1rem;
        }

        .suggestion {
            font-size: clamp(1.1rem, 2.5vw, 1.3rem);
            color: rgba(255, 255, 255, 0.7);
            line-height: 1.6;
            font-weight: 300;
            margin-bottom: 2rem;
        }

        .divider {
            width: 60px;
            height: 1px;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
            margin: 2rem auto;
        }

        .meta {
            font-size: 0.9rem;
            color: rgba(255, 255, 255, 0.4);
            letter-spacing: 0.1em;
            text-transform: uppercase;
            position: relative;
        }

        .element {
            display: inline-block;
            padding: 0.3rem 0.8rem;
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 20px;
            margin: 0 0.5rem;
            font-size: 0.8rem;
            color: rgba(255, 255, 255, 0.6);
            background: rgba(255, 255, 255, 0.05);
        }

        .controls {
            position: fixed;
            top: 2rem;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            gap: 1rem;
            z-index: 20;
        }

        .btn-random, .btn-ask {
            padding: 0.75rem 1.5rem;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 2rem;
            color: rgba(255, 255, 255, 0.8);
            font-size: 0.9rem;
            font-weight: 300;
            cursor: pointer;
            transition: all 0.3s ease;
            backdrop-filter: blur(10px);
        }

        .btn-random:hover, .btn-ask:hover {
            background: rgba(255, 255, 255, 0.2);
            border-color: rgba(255, 255, 255, 0.4);
            transform: translateY(-2px);
        }

        .ask-form {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.9);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 1rem;
            padding: 2rem;
            width: 90%;
            max-width: 500px;
            z-index: 30;
            backdrop-filter: blur(20px);
        }

        .form-content {
            text-align: center;
        }

        .form-content h3 {
            color: rgba(255, 255, 255, 0.8);
            font-size: 1.2rem;
            font-weight: 300;
            margin-bottom: 1.5rem;
        }

        .form-content textarea {
            width: 100%;
            min-height: 100px;
            padding: 1rem;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 0.5rem;
            color: rgba(255, 255, 255, 0.9);
            font-size: 1rem;
            resize: none;
            outline: none;
            font-family: inherit;
        }

        .form-content textarea:focus {
            border-color: rgba(255, 255, 255, 0.4);
        }

        .form-content textarea::placeholder {
            color: rgba(255, 255, 255, 0.4);
        }

        .form-actions {
            display: flex;
            justify-content: center;
            gap: 1rem;
            margin-top: 1.5rem;
        }

        .btn-cancel, .btn-submit {
            padding: 0.5rem 1.5rem;
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 1.5rem;
            color: rgba(255, 255, 255, 0.8);
            font-size: 0.9rem;
            font-weight: 300;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .btn-cancel {
            background: transparent;
        }

        .btn-submit {
            background: rgba(255, 255, 255, 0.1);
        }

        .btn-cancel:hover {
            background: rgba(255, 255, 255, 0.05);
        }

        .btn-submit:hover {
            background: rgba(255, 255, 255, 0.2);
        }

        .btn-submit:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        .char-count {
            color: rgba(255, 255, 255, 0.4);
            font-size: 0.8rem;
            text-align: right;
        }

        .loading {
            color: rgba(255, 255, 255, 0.5);
            font-size: 1.2rem;
            font-weight: 300;
            letter-spacing: 0.1em;
            opacity: 0;
            animation: fadeIn 1s ease-out forwards;
        }

        .loading::after {
            content: '...';
            animation: dots 1.5s infinite;
        }

        .wisdom.advice-mode {
            max-width: 600px;
        }

        .question-label {
            color: rgba(255, 255, 255, 0.4);
            font-size: 0.8rem;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            margin-bottom: 1rem;
        }

        .user-question {
            color: rgba(255, 255, 255, 0.7);
            font-size: 1.2rem;
            font-style: italic;
            margin-bottom: 2rem;
            padding: 1rem;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 0.5rem;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .ai-advice {
            font-size: 2.5rem;
            line-height: 1.4;
            margin-bottom: 2rem;
            font-weight: 300;
            color: #ffffff;
        }

        .cache-note {
            color: rgba(255, 255, 255, 0.3);
            font-size: 0.7rem;
            font-style: italic;
            margin-top: 1rem;
        }

        @keyframes fadeIn {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        @keyframes dots {
            0%, 20% { content: '.'; }
            40% { content: '..'; }
            60%, 100% { content: '...'; }
        }

        .hint {
            position: fixed;
            bottom: 2rem;
            left: 50%;
            transform: translateX(-50%);
            color: rgba(255, 255, 255, 0.3);
            font-size: 0.8rem;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            animation: pulse 2s infinite;
        }

        @keyframes pulse {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 0.6; }
        }

        /* 响应式设计 */
        @media (max-width: 768px) {
            .controls {
                flex-direction: column;
                gap: 0.5rem;
                top: 1rem;
            }

            .btn-random, .btn-ask {
                width: 100%;
                max-width: 200px;
            }

            .ask-form {
                width: 95%;
                padding: 1.5rem;
            }

            .wisdom .philosophy {
                font-size: 1.8rem;
            }

            .ai-advice {
                font-size: 2rem;
            }

            .user-question {
                font-size: 1rem;
            }
        }

        /* 响应式设计 */
        @media (max-width: 768px) {
            .container {
                padding: 1.5rem;
            }

            .philosophy {
                margin-bottom: 2rem;
            }

            .philosophy::before,
            .philosophy::after {
                font-size: 1em;
            }

            .philosophy::before {
                left: -0.5rem;
            }

            .philosophy::after {
                right: -0.5rem;
            }
        }
    </style>
</head>
<body>
    <div class="container" onclick="handleContainerClick()">
        <div id="wisdom-container">
            <div class="loading">点击获取智慧或提出问题</div>
        </div>
    </div>

    <div class="controls">
        <button onclick="event.stopPropagation(); showRandomWisdom()" class="btn-random">
            请说
        </button>
        <button onclick="event.stopPropagation(); showAskForm()" class="btn-ask">
            请问
        </button>
    </div>

    <!-- 问题表单 -->
    <div id="ask-form" class="ask-form" style="display: none;">
        <div class="form-content">
            <h3>询问你的问题</h3>
            <textarea id="question-input" placeholder="请输入你的问题..." maxlength="100"></textarea>
            <div class="form-actions">
                <button onclick="hideAskForm()" class="btn-cancel">返回</button>
                <button onclick="submitQuestion()" class="btn-submit">获得答案</button>
            </div>
            <div class="char-count">
                <span id="char-count">0</span>/100
            </div>
        </div>
    </div>

    <div class="hint">点击任意位置</div>

    <script>
        let currentQuestion = '';
        let clickCount = 0;
        let lastClickTime = 0;
        const CLICK_LIMIT = 5; // 点击限制
        const TIME_WINDOW = 10000; // 10秒时间窗口

        // 处理容器点击
        function handleContainerClick() {
            if (document.getElementById('ask-form').style.display !== 'block') {
                const now = Date.now();

                // 如果距离上次点击超过时间窗口，重置计数
                if (now - lastClickTime > TIME_WINDOW) {
                    clickCount = 0;
                }

                clickCount++;
                lastClickTime = now;

                // 检查是否超过点击限制
                if (clickCount >= CLICK_LIMIT) {
                    showAcceptanceReminder();
                    return;
                }

                showRandomWisdom();
            }
        }

        // 显示随机智慧
        async function showRandomWisdom() {
            hideAskForm();
            await getWisdom();
        }

        // 获取常规智慧
        async function getWisdom() {
            const container = document.getElementById('wisdom-container');
            container.innerHTML = '<div class="loading">寻找智慧中</div>';

            try {
                const response = await fetch('/api/wisdom');
                const data = await response.json();

                container.innerHTML =
                    '<div class="wisdom">' +
                        '<div class="philosophy">' + data.philosophy + '</div>' +
                        '<div class="divider"></div>' +
                        '<div class="suggestion">' + data.suggestion + '</div>' +
                        '<div class="meta">' +
                            '<span class="element">' + data.element + '</span>' +
                            '<span class="element">' + data.category + '</span>' +
                            '<span class="element">' + data.timeSlot + '时</span>' +
                        '</div>' +
                    '</div>';
            } catch (error) {
                container.innerHTML = '<div class="loading">请重试</div>';
            }
        }

        // 显示问题表单
        function showAskForm() {
            const form = document.getElementById('ask-form');
            const container = document.getElementById('wisdom-container');
            const controls = document.querySelector('.controls');
            const hint = document.querySelector('.hint');

            form.style.display = 'block';
            container.style.display = 'none';
            controls.style.display = 'none';
            hint.textContent = '点击提交问题';

            // 自动聚焦到输入框
            setTimeout(() => {
                document.getElementById('question-input').focus();
            }, 100);
        }

        // 隐藏问题表单
        function hideAskForm() {
            const form = document.getElementById('ask-form');
            const controls = document.querySelector('.controls');
            const hint = document.querySelector('.hint');

            form.style.display = 'none';
            controls.style.display = 'flex';
            hint.textContent = '点击任意位置';

            // 清空输入框
            document.getElementById('question-input').value = '';
            updateCharCount();
        }

        // 提交问题
        async function submitQuestion() {
            const input = document.getElementById('question-input');
            const question = input.value.trim();

            if (!question) {
                alert('请输入问题');
                return;
            }

            if (question.length > 100) {
                alert('问题过长，请控制在100字以内');
                return;
            }

            currentQuestion = question;
            const container = document.getElementById('wisdom-container');
            const form = document.getElementById('ask-form');

            form.style.display = 'none';
            container.innerHTML = '<div class="loading">询问中...</div>';

            try {
                const response = await fetch('/api/ask', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        question: question,
                        timestamp: new Date().toISOString()
                    })
                });

                const data = await response.json();

                // 调试信息
                console.log('API响应:', data);

                // 确保数据完整性
                if (!data.advice) {
                    data.advice = '静心感受当下，答案就在心中';
                }
                if (!data.element) {
                    data.element = '未知';
                }
                if (!data.category) {
                    data.category = '当下接受';
                }
                if (!data.timeSlot) {
                    data.timeSlot = '未知';
                }

                // 调试DOM操作
                console.log('开始更新DOM...');
                console.log('容器元素:', container);
                console.log('数据对象:', data);
                console.log('问题:', question);

                const htmlContent =
                    '<div class="wisdom advice-mode">' +
                        '<div class="question-label">您的问题</div>' +
                        '<div class="user-question">"' + question + '"</div>' +
                        '<div class="divider"></div>' +
                        '<div class="ai-advice">' + data.advice + '</div>' +
                        '<div class="divider"></div>' +
                        '<div class="meta">' +
                            '<span class="element">' + data.element + '</span>' +
                            '<span class="element">' + data.category + '</span>' +
                            '<span class="element">' + data.timeSlot + '时</span>' +
                        '</div>' +
                        (data.fromCache ? '<div class="cache-note">* 缓存结果</div>' : '') +
                    '</div>';

                console.log('生成的HTML长度:', htmlContent.length);
                console.log('HTML预览:', htmlContent.substring(0, 100) + '...');

                container.innerHTML = htmlContent;

                // 验证DOM更新 - 延迟检查确保渲染完成
                setTimeout(() => {
                    console.log('DOM更新后容器内容长度:', container.innerHTML.length);
                    console.log('DOM更新后容器预览:', container.innerHTML.substring(0, 100) + '...');
                    console.log('DOM更新完成');

                    // 强制触发重排以确保显示
                    container.style.display = 'none';
                    container.offsetHeight; // 强制重排
                    container.style.display = 'block';
                    console.log('强制重排完成');
                }, 10);

                // 清空问题
                currentQuestion = '';

            } catch (error) {
                console.error('获取AI智慧失败:', error);
                container.innerHTML = '<div class="loading">网络异常，请稍后再试</div>';
            }
        }

        // 显示当下接受提醒
        function showAcceptanceReminder() {
            const container = document.getElementById('wisdom-container');
            const acceptanceMessages = [
                { philosophy: "宇宙给你的，正是你此刻需要的", suggestion: "每一次刷新，都是对当下指导的不信任" },
                { philosophy: "静心感受，答案就在心中", suggestion: "真正的智慧不需要频繁寻找" },
                { philosophy: "当下即是最好的安排", suggestion: "相信此刻的指引，内心自然平静" },
                { philosophy: "答案之书从不重复给出相同的智慧", suggestion: "但重复的寻找会掩盖真正的声音" },
                { philosophy: "你需要的不是更多建议，而是静心体会", suggestion: "停止寻找，开始感受" }
            ];

            const message = acceptanceMessages[Math.floor(Math.random() * acceptanceMessages.length)];

            container.innerHTML =
                '<div class="wisdom acceptance-reminder">' +
                    '<div class="philosophy" style="color: #ffd700;">' + message.philosophy + '</div>' +
                    '<div class="divider"></div>' +
                    '<div class="suggestion" style="color: rgba(255, 255, 255, 0.8);">' + message.suggestion + '</div>' +
                    '<div class="divider"></div>' +
                    '<div style="text-align: center; margin-top: 2rem;">' +
                        '<button onclick="resetClickCount()" style="padding: 0.8rem 2rem; background: rgba(255, 215, 0, 0.2); border: 1px solid rgba(255, 215, 0, 0.4); border-radius: 2rem; color: #ffd700; font-size: 0.9rem; cursor: pointer; transition: all 0.3s ease;">' +
                            '我已领悟，重新开始' +
                        '</button>' +
                    '</div>' +
                '</div>';

            // 重置提示
            const hint = document.querySelector('.hint');
            if (hint) {
                hint.textContent = '静心体会当下';
                hint.style.opacity = '1';
            }
        }

        // 重置点击计数
        function resetClickCount() {
            clickCount = 0;
            lastClickTime = 0;
            showRandomWisdom();

            const hint = document.querySelector('.hint');
            if (hint) {
                hint.textContent = '点击任意位置';
            }
        }

        // 更新字符计数
        function updateCharCount() {
            const input = document.getElementById('question-input');
            const count = document.getElementById('char-count');
            count.textContent = input.value.length;
        }

        // 字符计数监听
        document.addEventListener('DOMContentLoaded', function() {
            const input = document.getElementById('question-input');
            if (input) {
                input.addEventListener('input', updateCharCount);
            }
        });

        // 隐藏提示文本
        setTimeout(() => {
            const hint = document.querySelector('.hint');
            if (hint) {
                hint.style.opacity = '0';
            }
        }, 5000);
    </script>
</body>
</html>`;

    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);

  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

const PORT = 3007;
demoServer.listen(PORT, () => {
  console.log(`🎉 答案之书演示服务器启动成功!`);
  console.log(`📱 请在浏览器中访问: http://localhost:${PORT}`);
  console.log(`🔮 API接口: http://localhost:${PORT}/api/wisdom`);
  console.log('');
  console.log('功能特点:');
  console.log('✨ 基于时间的动态内容生成');
  console.log('🎯 富有哲理的句子和建设性建议');
  console.log('🎨 简洁美观的界面设计');
  console.log('📱 完全响应式布局');
  console.log('');
  console.log('按 Ctrl+C 停止服务器');
});