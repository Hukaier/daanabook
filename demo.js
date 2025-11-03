const http = require('http');
const TimeCalculator = require('./server/utils/timeCalculator');
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
    <div class="container" onclick="getWisdom()">
        <div id="wisdom-container">
            <div class="loading">点击获取智慧</div>
        </div>
    </div>

    <div class="hint">点击任意位置</div>

    <script>
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

        // 页面加载时自动获取一次
        window.onload = getWisdom;

        // 隐藏提示文本
        setTimeout(() => {
            document.querySelector('.hint').style.opacity = '0';
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

const PORT = 3004;
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