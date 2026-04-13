# Ian's Personal Portfolio Website

A modern, bilingual personal portfolio website for a frontend engineer, built with Vue 3 + TypeScript (frontend) and Node + Koa + Sequelize + SQLite + TypeScript (backend). This project demonstrates full-stack development from scratch with Docker containerization, showcasing the practical impact of AI toolchains (bolt.new, cursor) on development efficiency.

## Features

- **Bilingual Support**: Chinese/English language switching
- **Automatic Theme Switching**: Day/Night theme based on device time (6 AM - 6 PM)
  - Day theme: Blue-purple gradient
  - Night theme: Dark theme
- **Modern UI**: Minimalist design with responsive layout
- **Project Showcase**: Dynamic project display from backend API
- **Contact Form**: Functional contact form with backend storage

## Tech Stack

### Frontend
- Vue 3 (Composition API)
- TypeScript
- Vue Router
- Pinia (state management)
- Vue I18n (internationalization)
- TailwindCSS (styling)
- Axios (HTTP client)
- Vite (build tool)

### Backend
- Node.js
- Koa (web framework)
- Sequelize (ORM)
- SQLite (database)
- TypeScript

## Prerequisites

- Node.js 24.11.1 or higher
- npm or yarn

## Installation

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Start the backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:3001`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the frontend development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## Project Structure

```
ian-personal-portfolio/
├── backend/
│   ├── src/
│   │   ├── database/
│   │   │   └── index.ts          # Database configuration
│   │   ├── models/
│   │   │   ├── Project.ts        # Project model
│   │   │   └── Contact.ts        # Contact model
│   │   ├── routes/
│   │   │   ├── projects.ts       # Project routes
│   │   │   └── contact.ts        # Contact routes
│   │   └── index.ts              # Main entry point
│   ├── package.json
│   └── tsconfig.json
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.vue        # Navigation bar
    │   │   └── Footer.vue        # Footer
    │   ├── views/
    │   │   ├── Home.vue          # Home page
    │   │   ├── Projects.vue      # Projects page
    │   │   ├── About.vue         # About page
    │   │   └── Contact.vue       # Contact page
    │   ├── stores/
    │   │   ├── theme.ts          # Theme store
    │   │   └── language.ts       # Language store
    │   ├── router/
    │   │   └── index.ts          # Router configuration
    │   ├── i18n/
    │   │   └── index.ts          # Internationalization
    │   ├── App.vue
    │   ├── main.ts
    │   └── style.css
    ├── package.json
    ├── vite.config.ts
    ├── tailwind.config.js
    └── tsconfig.json
```

## API Endpoints

### Projects
- `GET /api/projects` - Get all projects
- `GET /api/projects/:id` - Get a single project
- `POST /api/projects` - Create a new project
- `PUT /api/projects/:id` - Update a project
- `DELETE /api/projects/:id` - Delete a project

### Contact
- `POST /api/contact` - Submit contact form
- `GET /api/contact` - Get all contact submissions (admin)

## Theme System

The theme automatically switches based on device time:
- **Day Mode**: 6:00 AM - 5:59 PM (Blue-purple theme)
- **Night Mode**: 6:00 PM - 5:59 AM (Dark theme)

Users can also manually toggle the theme using the button in the navigation bar.

## Language Switching

The website supports English and Chinese. Users can switch languages using the language toggle button in the navigation bar.

## Building for Production

### Backend
```bash
cd backend
npm run build
npm start
```

### Frontend
```bash
cd frontend
npm run build
```

The built files will be in the `dist` directory.

## Environment Variables

### Backend
```
PORT=3001
```

## License

ISC

---

# Ian 个人作品集网站

一个现代化的双语个人作品集网站，专为前端工程师打造，使用 Vue 3 + TypeScript（前端）和 Node + Koa + Sequelize + SQLite + TypeScript（后端）构建。本作品集项目从0到1完整覆盖前后端全栈部署，使用Docker容器化部署，展现AI工具链（bolt.new、cursor）在提升开发效率方面的实践成果。

## 功能特性

- **双语支持**：中英文语言切换
- **自动主题切换**：根据设备时间自动切换日间/夜间主题（早上6点 - 晚上6点）
  - 日间主题：蓝紫色渐变
  - 夜间主题：深色主题
- **现代化 UI**：极简设计，响应式布局
- **项目展示**：从后端 API 动态获取项目数据
- **联系表单**：功能完整的联系表单，支持后端存储

## 技术栈

### 前端
- Vue 3（组合式 API）
- TypeScript
- Vue Router
- Pinia（状态管理）
- Vue I18n（国际化）
- TailwindCSS（样式）
- Axios（HTTP 客户端）
- Vite（构建工具）

### 后端
- Node.js
- Koa（Web 框架）
- Sequelize（ORM）
- SQLite（数据库）
- TypeScript

## 前置要求

- Node.js 24.11.1 或更高版本
- npm 或 yarn

## 安装

### 后端设置

1. 进入后端目录：
```bash
cd backend
```

2. 安装依赖：
```bash
npm install
```

3. 启动后端服务器：
```bash
npm run dev
```

后端将运行在 `http://localhost:3001`

### 前端设置

1. 进入前端目录：
```bash
cd frontend
```

2. 安装依赖：
```bash
npm install
```

3. 启动前端开发服务器：
```bash
npm run dev
```

前端将运行在 `http://localhost:3000`

## 项目结构

```
ian-personal-portfolio/
├── backend/
│   ├── src/
│   │   ├── database/
│   │   │   └── index.ts          # 数据库配置
│   │   ├── models/
│   │   │   ├── Project.ts        # 项目模型
│   │   │   └── Contact.ts        # 联系表单模型
│   │   ├── routes/
│   │   │   ├── projects.ts       # 项目路由
│   │   │   └── contact.ts        # 联系表单路由
│   │   └── index.ts              # 主入口文件
│   ├── package.json
│   └── tsconfig.json
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.vue        # 导航栏
    │   │   └── Footer.vue        # 页脚
    │   ├── views/
    │   │   ├── Home.vue          # 首页
    │   │   ├── Projects.vue      # 项目页面
    │   │   ├── About.vue         # 关于页面
    │   │   └── Contact.vue       # 联系页面
    │   ├── stores/
    │   │   ├── theme.ts          # 主题状态管理
    │   │   └── language.ts       # 语言状态管理
    │   ├── router/
    │   │   └── index.ts          # 路由配置
    │   ├── i18n/
    │   │   └── index.ts          # 国际化配置
    │   ├── App.vue
    │   ├── main.ts
    │   └── style.css
    ├── package.json
    ├── vite.config.ts
    ├── tailwind.config.js
    └── tsconfig.json
```

## API 接口

### 项目
- `GET /api/projects` - 获取所有项目
- `GET /api/projects/:id` - 获取单个项目
- `POST /api/projects` - 创建新项目
- `PUT /api/projects/:id` - 更新项目
- `DELETE /api/projects/:id` - 删除项目

### 联系表单
- `POST /api/contact` - 提交联系表单
- `GET /api/contact` - 获取所有联系表单提交（管理员）

## 主题系统

主题根据设备时间自动切换：
- **日间模式**：上午 6:00 - 下午 5:59（蓝紫色主题）
- **夜间模式**：下午 6:00 - 上午 5:59（深色主题）

用户也可以使用导航栏中的按钮手动切换主题。

## 语言切换

网站支持英文和中文。用户可以使用导航栏中的语言切换按钮切换语言。

## 生产环境构建

### 后端
```bash
cd backend
npm run build
npm start
```

### 前端
```bash
cd frontend
npm run build
```

构建后的文件将位于 `dist` 目录中。

## 环境变量

### 后端
```
PORT=3001
```

## 许可证

ISC
