const http = require('http');

// 测试问题咨询API
const testData = {
    question: '我应该如何面对未来的不确定性？',
    timestamp: new Date().toISOString()
};

const postData = JSON.stringify(testData);

const options = {
    hostname: 'localhost',
    port: 3006,
    path: '/api/ask',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
    }
};

console.log('🧪 测试问题咨询API...');
console.log('📤 发送问题:', testData.question);

const req = http.request(options, (res) => {
    console.log('📥 响应状态:', res.statusCode);
    console.log('📥 响应头:', res.headers);

    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        console.log('📥 响应数据:', data);
        try {
            const parsedData = JSON.parse(data);
            console.log('✅ API测试成功!');
            console.log('💡 建议:', parsedData.advice);
            console.log('🏷️ 类别:', parsedData.category);
        } catch (error) {
            console.log('❌ JSON解析失败:', error.message);
        }
    });
});

req.on('error', (error) => {
    console.log('❌ 请求失败:', error.message);
});

req.write(postData);
req.end();