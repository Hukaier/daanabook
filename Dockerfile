# 使用官方Node.js运行时作为基础镜像
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 复制package.json文件
COPY package*.json ./

# 安装依赖
RUN npm install

# 复制服务器代码
COPY server/ ./server/
COPY demo.js .

# 创建非root用户
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# 更改文件所有权
RUN chown -R nodejs:nodejs /app
USER nodejs

# 暴露端口
EXPOSE 3000

# 启动应用
CMD ["node", "demo.js"]