# 投票项目

一个基于 Vue 3 + Vite + Express 的投票系统，支持前后端分离开发，适合用于课程作业、演示项目或简单的在线投票场景。

## 项目特点

- 前后端分离架构
- 前端使用 Vue 3、Vite、Element Plus、Pinia、Vue Router
- 后端使用 Express 提供接口服务
- 支持通过 `concurrently` 一键启动前后端开发环境
- 前端可视化库使用 ECharts 展示数据

## 技术栈

### 前端
- Vue 3
- Vite
- Vue Router
- Pinia
- Element Plus
- Axios
- ECharts

### 后端
- Node.js
- Express
- CORS
- UUID

## 目录结构

```bash
投票/
├─ client/        # 前端项目
├─ server/        # 后端项目
├─ package.json   # 根目录脚本
└─ README.md
```

## 环境要求

- Node.js 18+（建议）
- npm 9+

## 安装依赖

在项目根目录执行：

```bash
npm run install:all
```

该命令会分别安装 `server` 和 `client` 的依赖。

## 启动项目

### 同时启动前后端

```bash
npm run dev
```

启动后：
- 前端开发服务通常运行在 `http://localhost:5173`
- 后端服务由 `server/index.js` 启动，具体端口以代码配置为准

### 仅启动前端

```bash
npm run dev --prefix client
```

### 仅启动后端

```bash
npm run dev --prefix server
```

## 打包构建

仅构建前端：

```bash
npm run build
```

## 使用说明

1. 先安装依赖
2. 启动前后端服务
3. 打开前端页面进行投票操作
4. 使用图表查看投票结果与统计信息

## 常见问题

### 依赖安装失败

请确认网络正常，并检查 Node.js / npm 版本是否满足要求。

### 接口请求失败

确认后端服务已启动，并检查前端请求地址是否与后端端口一致。

## 后续可扩展功能

- 用户登录与权限管理
- 投票主题分类
- 投票记录与历史统计
- 数据持久化存储
- 管理员后台

## 许可证

本项目当前未声明许可证，可根据需要补充。
