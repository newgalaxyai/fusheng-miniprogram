# 富盛获客 - 微信小程序

本项目是“富盛获客”微信小程序的前端工程代码，基于 [Taro](https://taro.zone/) 框架和 React 构建。项目集成了企业信息查询、AI 智能问答、线索管理等功能，为用户提供智能化的商业信息服务。

## 🛠 技术栈

- **核心框架**: [Taro](https://taro.zone/) v3.6 + [React](https://reactjs.org/) v18
- **开发语言**: TypeScript
- **状态管理**: Redux Toolkit (`@reduxjs/toolkit`) + React Redux
- **UI 组件库**: [NutUI React Taro](https://nutui.jd.com/#/react/intro) + Taro UI
- **样式预处理器**: SCSS (Sass)
- **其他依赖**: 
  - `dayjs` (日期时间处理)
  - `echarts` (图表数据可视化)
  - `marked` / `towxml` (Markdown 渲染 / 微信小程序富文本解析)

## 📁 目录结构

```text
├── config/                 # Taro 编译配置 (dev, prod 等)
├── src/                    # 源码目录
│   ├── api/                # API 接口定义 (axios/Taro.request 封装)
│   ├── assets/             # 静态资源 (图片、ECharts 等 js 库)
│   ├── components/         # 全局公共组件 (AiMessage, ContactPopup, Markdown 等)
│   ├── constants/          # 常量定义 (路由、事件名、图片占位符等)
│   ├── hooks/              # 自定义 Hooks (useAppStore, useDebounce 等)
│   ├── pages/              # 主包页面 (首页、AI 聊天、登录等)
│   ├── redux/              # Redux 状态管理模块
│   ├── service/            # 网络请求服务配置与拦截器
│   ├── subpackages/        # 分包目录 (减小主包体积)
│   │   ├── cluePage/       # 线索管理分包
│   │   ├── company/        # 企业查询分包 (工商信息、法律诉讼、知识产权等)
│   │   ├── login/          # 登录及企业认证分包
│   │   └── setting/        # 设置及个人中心分包
│   ├── utils/              # 工具函数 (正则、防抖、过滤等)
│   ├── app.config.ts       # 小程序全局配置 (pages, subPackages, window 等)
│   ├── app.tsx             # 小程序入口文件
│   └── index.html          # H5 模板
├── .env.*                  # 环境变量配置
├── package.json            # 项目依赖
├── project.config.json     # 微信开发者工具配置 (包含 AppID: wxcedf17b0f82b2f23)
└── tsconfig.json           # TypeScript 配置
```

## 🚀 快速开始

### 1. 环境准备

确保已安装 [Node.js](https://nodejs.org/) 和包管理工具 [pnpm](https://pnpm.io/)（本项目使用 `pnpm-lock.yaml` 进行依赖版本锁定）。

### 2. 安装依赖

```bash
pnpm install
```

### 3. 本地开发

运行以下命令启动微信小程序本地开发服务：

```bash
# 启动微信小程序编译（带监听）
pnpm dev:weapp
```

编译完成后，打开 **微信开发者工具**，导入本项目的根目录。开发者工具会自动识别 `project.config.json` 并加载 `dist/` 目录中的产物。

### 4. 项目构建

打包生产环境代码：

```bash
# 构建微信小程序生产环境
pnpm build:weapp
```

## 📦 分包策略

为解决微信小程序主包 2MB 的体积限制，本项目采用了分包加载策略：
- **主包**：包含应用入口、底部 TabBar 页面（首页等）、全局状态以及核心公共组件。
- **线索分包 (`cluePage`)**：线索详情、跟进记录等。
- **企业分包 (`company`)**：企业查询核心业务，包含各类工商详情、图谱、研报等深度信息。
- **登录分包 (`login`)**：授权登录、企业档案等。
- **设置分包 (`setting`)**：个人中心、反馈、用户协议等辅助页面。

## 📜 编码规范

- 使用 TypeScript 进行类型约束。
- React 组件推荐使用函数式组件 (Functional Components) + Hooks。
- 全局状态统一放在 `src/redux/modules` 下进行管理。
- 代码提交前请确保通过 `eslint` 检查。
