import { createI18n } from 'vue-i18n'

const messages = {
  en: {
    nav: {
      home: 'Home',
      projects: 'Projects',
      about: 'About',
      contact: 'Contact'
    },
    home: {
      greeting: 'Hi, I\'m',
      name: 'Ian Zhang',
      title: 'Frontend Engineer',
      subtitle: 'Building beautiful and functional web experiences',
      cta: 'View My Work',
      learnMore: 'Learn More'
    },
    about: {
      title: 'About Me',
      description: 'I\'m a frontend engineer specializing in building modern web applications. I specialize in Vue 2/3, React 18, and cross-platform development with a strong focus on performance optimization and architectural design.',
      skills: 'Professional Skills',
      experience: 'Work Experience',
      projects: 'Project Experience',
      education: 'Education',
      skillsList: {
        frontend: 'Frontend Fundamentals: Proficient in HTML5/CSS3, responsive layout with rem/flex, mobile adaptation, and cross-browser compatibility.',
        javascript: 'JavaScript: Master of native JavaScript and ES6+, familiar with TypeScript, skilled in jQuery and Lodash.',
        frameworks: 'Frontend Frameworks: Skilled in Vue 2/3 ecosystem (Vuex, Pinia, Vue-Router), experienced in Vue 2 to Vue 3 + Quasar migration. Familiar with React 18 ecosystem, pioneered Redux Toolkit + RTK Query adoption.',
        engineering: 'Engineering & Build: Proficient in Webpack, Vite, Gulp with custom configuration and performance optimization. Familiar with ESLint, Prettier, Husky, and CI/CD automation.',
        nodejs: 'Node.js & Backend: Familiar with Node.js, Express, and Koa for mock services and middleware. Master of Sequelize ORM with database design and API development capabilities.',
        git: 'Version Control: Proficient in Git and Git Flow workflow for team collaboration.',
        visualization: 'Visualization & UI: Skilled in ECharts and AntV for complex data visualization (radar charts, heatmaps). Proficient in ElementUI, Quasar, and Ant Design.',
        crossPlatform: 'Cross-Platform: Experienced in Quasar-based cross-platform development (PC, mobile, iOS).',
        special: 'Special Skills: Canvas for electronic signatures and image processing, OCR integration, PDF generation and preview optimization.'
      },
      workExp1: {
        company: 'GFT - Wistron',
        role: 'Frontend Engineer',
        period: '2020.10 – 2026.01',
        desc1: 'Led frontend architecture design and iteration for insurance business system Ipos, responsible for technology selection and smooth migration from Vue 2 + Quasar V1 to Vue 3 + Quasar V2. Launched in April 2025, build efficiency improved by 25%, runtime performance improved by 30%.',
        desc2: 'Developed core features including Canvas-based electronic signature component, file upload, and OCR intelligent recognition integration, optimizing user insurance process and reducing manual input errors.',
        desc3: 'Deeply involved in cross-platform (PC, mobile, iOS) consistent experience design, solving compatibility issues in hybrid development.',
        desc4: 'Built local mock services with Node.js (Express), assisted backend in defining API specifications, improving frontend-backend collaboration efficiency.',
        desc5: 'Responsible for production environment issue localization and fixes, ensuring high system availability.',
        desc6: 'Technical Impact: Pioneered React 18 + Redux Toolkit + RTK Query in DS-portal recruitment system, organized technical sharing internally, promoted the tech stack across multiple teams, unified frontend state management standards, improved development efficiency by ~30%, and established reusable project templates.'
      },
      workExp2: {
        company: 'Tongdao Weiye',
        role: 'Frontend Engineer',
        period: '2020.06 – 2020.10',
        desc1: 'Responsible for frontend development and maintenance of "Tongdao Intelligent Cloud Platform", "Tongdao Big Data Entry", and "Yunnan Football Association" projects.',
        desc2: 'In the intelligent cloud platform, maintained legacy code with native JavaScript + jQuery while introducing modular thinking for refactoring. Used ECharts for player/referee capability radar charts, comparison heatmaps, and video capture playback.',
        desc3: 'Developed complex interactive components similar to transfer boxes for big data backend, supporting paginated loading and search, improving interaction smoothness under large data volumes.',
        desc4: 'Integrated QR code payment with polling for real-time payment status feedback.',
        desc5: 'In Yunnan Football Association official website (Vue project), responsible for page construction and youth training system module, using Vant for pull-to-refresh and load-more, optimizing mobile experience.'
      },
      workExp3: {
        company: 'Tengxin Ruanchuang',
        role: 'Frontend Engineer',
        period: '2019.10 – 2020.05',
        desc1: 'Participated in frontend development of "Shougang Park Property Management Platform", responsible for equipment management and user management modules.',
        desc2: 'Based on Vue + Vuex + Vue Router, combined with ElementUI and moment.js for attachment upload, remote search, and date processing. Encapsulated axios interceptors for unified error and loading state handling.',
        desc3: 'Participated in project iteration and code review, optimized component performance, and improved page loading speed.'
      },
      project1: {
        name: 'Ipos Cross-Platform Insurance System',
        period: '2020.11 – 2025.04',
        desc: 'A hybrid development insurance business system covering PC, mobile, and iOS platforms, implementing complete insurance workflow including user information management, ID OCR recognition, policy PDF generation/preview/download, and electronic signatures.',
        tech: 'Vue 2/3, Quasar, Node.js (Express), Java, Canvas, OCR SDK',
        challenge1: 'Technology Upgrade: Led smooth migration from Vue 2 + Quasar V1 to Vue 3 + Quasar V2, resolving dependency conflicts and API changes while ensuring business continuity.',
        challenge2: 'Performance Optimization: Optimized PDF generation logic, changing from Base64 encoding to Blob streaming, reducing memory usage and improving generation speed by ~30%.',
        challenge3: 'User Experience: Optimized electronic signature component through Canvas drawing optimization and debouncing, improving signature drawing smoothness and save efficiency.',
        challenge4: 'Intelligent Integration: Integrated OCR technology for automatic ID recognition, reducing user input with 95%+ accuracy.'
      },
      project2: {
        name: 'DS-portal Recruitment Website',
        period: '2023.06 – 2023.11',
        desc: 'A cross-platform recruitment system covering PC, mobile, and iOS, implementing multi-role login, candidate information management, meeting booking, and conference room management.',
        tech: 'React 18 (RTK Query, Redux Toolkit), Ant Design, Node.js + Sequelize',
        highlight1: 'Architectural Innovation: Adopted React 18 features, using Redux Toolkit and RTK Query to replace traditional Redux + manual request state management. Solved pain points of boilerplate code, manual loading/error handling, and lack of request caching. Reduced code by ~40%, improved development efficiency by ~30%.',
        highlight2: 'Technology Promotion: Organized technical sharing internally, systematically explaining React 18 + RTKQ practices and advantages, promoted the tech stack across multiple frontend teams, unified state management standards, and established reusable project templates.',
        highlight3: 'Engineering Practice: Encapsulated reusable layout and form components based on Ant Design for multi-platform adaptation. Collaborated with backend to define API specifications, assisted in data layer debugging with Sequelize.'
      },
      project3: {
        name: 'Tongdao Intelligent Cloud Platform & Big Data Backend',
        period: '2019.10 – 2020.10',
        desc: 'Intelligent cloud platform provides team/player data visualization analysis; big data backend manages partners, product packages, and personnel information; Yunnan Football Association official website introduces clubs and youth training.',
        tech: 'Native JavaScript, jQuery, ECharts, Vue, Vant',
        achievement1: 'In intelligent cloud platform, maintained and optimized existing features with native JS + jQuery, encapsulated reusable chart components, implemented dynamic rendering of player capability radar charts and heatmaps.',
        achievement2: 'Developed complex components similar to transfer boxes for big data backend, supporting paginated loading and search to improve interaction smoothness under large data volumes.',
        achievement3: 'Integrated QR code payment with polling for real-time payment status feedback.',
        achievement4: 'In Yunnan Football Association official website, built responsive pages with Vue + Vant, implemented youth training news display and data fetching, optimized mobile loading speed.'
      },
      project4: {
        name: 'Shougang Park Property Management Platform',
        period: '2020.01 – 2020.05',
        desc: 'Equipment management backend for Shougang Park, implementing dynamic equipment information management and user permission control.',
        tech: 'Vue, Vuex, Vue Router, ElementUI, axios',
        achievement1: 'Responsible for frontend page layout, managed equipment state with Vuex, implemented module routing with Vue Router.',
        achievement2: 'Used ElementUI components to quickly build pages, implemented equipment CRUD, attachment upload, remote search, and date range selection.',
        achievement3: 'Encapsulated axios request layer for unified exception and loading handling, collaborated with backend for API integration ensuring accurate data rendering.',
        achievement4: 'Optimized table rendering performance through virtual scrolling to reduce DOM nodes and improve page response speed.'
      },
      education1: {
        school: 'China University of Petroleum',
        degree: 'Bachelor',
        major: 'Computer Science and Technology',
        period: '2021.09 – 2024.01'
      },
      education2: {
        school: 'Jiangxi University of Engineering',
        degree: 'Associate',
        major: 'IoT Application Technology',
        period: '2016.09 – 2019.09'
      },
      selfEvaluation: '7 years of frontend development experience with solid foundation and rich cross-platform project experience. Skilled in architecture design, technology selection, and performance optimization, capable of independently leading frontend development for medium to large projects. Possess technical influence, skilled in summarizing and promoting team technology evolution through technical sharing. Good team collaboration and communication skills, able to quickly locate and solve complex problems. Continuously关注前沿技术，乐于分享与创新。'
    },
    projects: {
      title: 'My Projects',
      viewDemo: 'View Demo',
      viewCode: 'View Code',
      technologies: 'Technologies',
      viewTongdaoDemo: 'View Demo',
      viewShougangDemo: 'View Demo',
      pcIpad: 'PC/iPad',
      mobile: 'Mobile'
    },
    shuttleBox: {
      search: 'Search...',
      selectAll: 'All',
      noResults: 'No matching players found'
    },
    tongdaoDemo: {
      title: 'Tongdao Intelligent Cloud Platform - Feature Demo',
      radarChartTitle: 'Player Ability Radar Chart',
      radarChartDesc: 'Visual analysis of player capabilities',
      playerSelection: 'Player Selection',
      playerSelectionDesc: 'Player selection with search and pagination support',
      selectedPlayers: 'Selected Players:',
      backToProjects: 'Back to Projects'
    },
    shougangDemo: {
      title: 'Shougang Park Property Management Platform - Permission Demo',
      selectRole: 'Select Role',
      currentRole: 'Current Role',
      menuPermissions: 'Menu Permissions',
      buttonPermissions: 'Button Permissions',
      dataPermissions: 'Data Permissions',
      dynamicRoutes: 'Dynamic Routes',
      noMenus: 'No menus available',
      noRoutes: 'No routes available',
      allowed: 'Allowed',
      denied: 'Denied',
      visible: 'Visible',
      hidden: 'Hidden',
      backToProjects: 'Back to Projects'
    },
    contact: {
      title: 'Get In Touch',
      subtitle: 'Have a project in mind? Let\'s work together!',
      name: 'Your Name',
      email: 'Your Email',
      message: 'Your Message',
      send: 'Send Message',
      success: 'Message sent successfully!',
      error: 'Failed to send message. Please try again.'
    },
    footer: {
      copyright: '© 2026 Ian Zhang. All rights reserved.',
      social: 'Connect with me'
    }
  },
  zh: {
    nav: {
      home: '首页',
      projects: '项目',
      about: '关于',
      contact: '联系'
    },
    home: {
      greeting: '你好，我是',
      name: 'Ian Zhang',
      title: '前端工程师',
      subtitle: '构建美观且实用的网络体验',
      cta: '查看我的作品',
      learnMore: '了解更多'
    },
    about: {
      title: '关于我',
      description: '我是一名前端工程师，专注于构建现代化网络应用。我擅长 Vue 2/3、React 18 和跨端开发，在性能优化和架构设计方面有深入研究。',
      skills: '专业技能',
      experience: '工作经历',
      projects: '项目经验',
      education: '教育背景',
      skillsList: {
        frontend: '前端基础：精通 HTML5/CSS3，熟练使用 rem/flex 实现响应式布局与移动端适配，能编写兼容主流浏览器的高质量页面。',
        javascript: 'JavaScript 及相关：精通原生 JavaScript、ES6+，熟悉 TypeScript，具备良好的模块化与面向对象编程能力；熟练使用 jQuery、Lodash 等库。',
        frameworks: '前端框架：熟练使用 Vue 2/3 全家桶（Vuex、Pinia、Vue-Router），具备从 Vue 2 到 Vue 3 + Quasar 的完整迁移经验；熟悉 React 18 及其生态，在团队中主导推广 Redux Toolkit + RTK Query 方案。',
        engineering: '工程化与构建：熟练使用 Webpack、Vite、Gulp 等构建工具，能根据项目需求进行定制化配置与性能优化；熟悉 ESLint、Prettier、Husky 等代码规范工具，具备 CI/CD 流程设计与自动化部署经验。',
        nodejs: 'Node.js 与后端：熟悉 Node.js，能使用 Express、Koa 搭建本地 Mock 服务与中间件开发；掌握 Sequelize ORM 框架，具备数据库设计与接口开发能力；能够与后端协作制定接口规范，提升前后端联调效率。',
        git: '版本控制与协作：熟练使用 Git 进行代码管理与团队协作，熟悉 Git Flow 工作流。',
        visualization: '可视化与组件库：熟练使用 ECharts、AntV 实现复杂数据可视化（雷达图、热区图）；熟练使用 ElementUI、Quasar、Ant Design 等 UI 库。',
        crossPlatform: '跨端与混合开发：有基于 Quasar 的跨端（PC、移动、iOS）项目经验，熟悉混合开发模式。',
        special: '专项技术：熟悉 Canvas 实现电子签名、图片处理；了解 OCR 技术集成；熟悉 PDF 生成与预览优化。'
      },
      workExp1: {
        company: '中电金信-纬创',
        role: '前端开发工程师',
        period: '2020.10 – 2026.01',
        desc1: '主导保险业务系统 Ipos 的前端架构设计与迭代，负责技术选型、项目构建及从 Vue 2 + Quasar V1 到 Vue 3 + Quasar V2 的平滑迁移，迁移版本于 2025 年 4 月上线，打包效率提升 25%，运行时性能提升 30%。',
        desc2: '负责核心功能开发，包括基于 Canvas 的电子签名组件、文件上传与 OCR 智能识别集成，优化用户投保流程，减少手动输入错误，提升投保效率。',
        desc3: '深度参与跨端（PC、移动、iOS）一致性体验设计，解决混合开发中的兼容性问题。',
        desc4: '使用 Node.js（Express）搭建本地 Mock 服务，协助后端定义接口规范，提高前后端联调效率。',
        desc5: '负责生产环境问题定位与修复，分析用户上报的深层原因，追溯代码问题并安排版本修复，确保系统高可用。',
        desc6: '技术影响力：在 DS-portal 招聘系统项目中，率先引入 React 18 + Redux Toolkit + RTK Query 方案，并在公司内部组织技术分享，推动该技术栈在多个团队落地，统一了前端状态管理标准，平均开发效率提升约 30%，并建立了可复用的项目模板。'
      },
      workExp2: {
        company: '同道伟业',
        role: '前端开发工程师',
        period: '2020.06 – 2020.10',
        desc1: '负责"同道智能云平台"、"同道大数据录入"及"云南足球协会"三个项目的前端开发与维护。',
        desc2: '在智能云平台中，基于原生 JavaScript + jQuery 维护老代码，同时引入模块化思想重构部分功能；使用 ECharts 实现球员/裁判能力雷达图、对比热区图及视频截取回放，提升数据可视化效果。',
        desc3: '为大数据后台封装类似穿梭框的复杂交互组件，支持选项分页加载与搜索，提升大数据量下的交互流畅度。',
        desc4: '集成二维码支付功能，通过轮询实现支付状态实时反馈，提升用户体验。',
        desc5: '在云南足球协会官网（Vue 项目）中，负责页面搭建及青训系统模块，使用 Vant 实现上拉加载下拉刷新，优化移动端体验。'
      },
      workExp3: {
        company: '腾信软创',
        role: '前端开发工程师',
        period: '2019.10 – 2020.05',
        desc1: '参与"首钢园物业管理平台"的前端开发，负责设备管理、用户管理等模块的页面布局与交互实现。',
        desc2: '基于 Vue + Vuex + Vue Router，结合 ElementUI 和 moment.js 完成上传附件图片、远程搜索及日期处理功能；封装 axios 拦截器，统一处理错误与 loading 状态，与后端联调实现数据动态渲染。',
        desc3: '参与项目迭代与代码审查，优化组件性能，提升页面加载速度。'
      },
      project1: {
        name: 'Ipos 跨端保险系统',
        period: '2020.11 – 2025.04',
        desc: '一款基于混合开发的保险业务系统，覆盖 PC、移动端及 iOS 平台，实现完整的投保工作流，包括用户信息管理、证件 OCR 识别、保单 PDF 生成预览下载、电子签名等。',
        tech: 'Vue 2/3、Quasar、Node.js（Express）、Java、Canvas、OCR SDK',
        challenge1: '技术升级：主导从 Vue 2 + Quasar V1 到 Vue 3 + Quasar V2 的平滑迁移，解决依赖冲突与 API 变更，确保业务连续性。',
        challenge2: '性能优化：优化 PDF 生成逻辑，将数据从 Base64 编码改为 Blob 流式处理，减少内存占用，生成速度提升约 30%。',
        challenge3: '用户体验：优化电子签名组件，通过 Canvas 绘图优化和防抖处理，提升签名绘制流畅度与保存效率。',
        challenge4: '智能化集成：集成 OCR 技术自动识别证件信息，减少用户输入，识别准确率达 95% 以上。'
      },
      project2: {
        name: 'DS-portal 招聘网站',
        period: '2023.06 – 2023.11',
        desc: '一款跨端招聘系统，覆盖 PC、移动端及 iOS，实现多角色登录、面试者信息管理、会议预定与会议室管理等完整招聘流程。',
        tech: 'React 18（RTK Query、Redux Toolkit）、Ant Design、Node.js + Sequelize',
        highlight1: '架构创新：采用 React 18 新特性，使用 Redux Toolkit 和 RTK Query 替代传统 Redux + 手动管理请求状态的方案，解决了大量样板代码、手动处理 loading/error 状态、缺乏请求缓存等痛点，代码量减少约 40%，开发效率提升约 30%。',
        highlight2: '技术推广：在公司内部组织专题技术分享，系统讲解 React 18 + RTKQ 的实践与优势，推动该技术栈在多个前端团队落地，统一了状态管理标准，并沉淀出可复用的项目模板。',
        highlight3: '工程化实践：基于 Ant Design 封装可复用布局与表单组件，实现多端适配；与后端协同定义接口规范，基于 Sequelize 辅助完成部分数据层联调，确保业务流程顺畅。'
      },
      project3: {
        name: '同道智能云平台 & 大数据后台',
        period: '2019.10 – 2020.10',
        desc: '智能云平台提供球队球员数据可视化分析；大数据后台管理合作方、产品包及人员信息；云南足球协会官网介绍俱乐部及青训。',
        tech: '原生 JavaScript、jQuery、ECharts、Vue、Vant',
        achievement1: '在智能云平台中，使用原生 JS + jQuery 维护并优化现有功能，封装可复用的图表组件，实现球员能力雷达图、热区图的动态渲染。',
        achievement2: '为大数据后台开发类似穿梭框的复杂组件，支持选项分页加载与搜索，提升大数据量下的交互流畅度。',
        achievement3: '集成二维码支付功能，通过轮询实现支付状态实时反馈，提升用户体验。',
        achievement4: '在云南足球协会官网中，使用 Vue + Vant 搭建响应式页面，实现青训新闻展示与数据拉取，优化移动端加载速度。'
      },
      project4: {
        name: '首钢园物业管理平台',
        period: '2020.01 – 2020.05',
        desc: '面向首钢园的设备管理后台，实现设备信息动态管理、用户权限控制等功能。',
        tech: 'Vue、Vuex、Vue Router、ElementUI、axios',
        achievement1: '负责前端页面布局，基于 Vuex 管理设备状态，使用 Vue Router 实现模块路由。',
        achievement2: '利用 ElementUI 组件快速搭建页面，实现设备信息的增删改查、附件图片上传、远程搜索及日期范围选择。',
        achievement3: '封装 axios 请求层，统一处理异常与 loading，与后端协同完成接口联调，确保数据准确渲染。',
        achievement4: '优化表格渲染性能，通过虚拟滚动减少 DOM 节点，提升页面响应速度。'
      },
      education1: {
        school: '中国石油大学',
        degree: '本科',
        major: '计算机科学与技术',
        period: '2021.09 – 2024.01'
      },
      education2: {
        school: '江西工程学院',
        degree: '专科',
        major: '物联网应用技术',
        period: '2016.09 – 2019.09'
      },
      selfEvaluation: '7 年前端开发经验，具备扎实的前端基础与丰富的跨端项目实战经验。擅长架构设计、技术选型与性能优化，能独立主导中大型项目的前端建设。具备技术影响力，善于总结沉淀并通过技术分享推动团队技术演进。良好的团队协作与沟通能力，能快速定位并解决复杂问题。持续关注前端前沿技术，乐于分享与创新。'
    },
    projects: {
      title: '我的项目',
      viewDemo: '查看演示',
      viewCode: '查看代码',
      technologies: '技术栈',
      viewTongdaoDemo: '查看演示',
      viewShougangDemo: '查看演示',
      pcIpad: 'PC/iPad',
      mobile: '移动端'
    },
    shuttleBox: {
      search: '搜索...',
      selectAll: '全选',
      noResults: '未找到匹配的球员'
    },
    tongdaoDemo: {
      title: '同道智能云平台 - 功能演示',
      radarChartTitle: '球员能力雷达图',
      radarChartDesc: '展示球员各项能力的可视化分析',
      playerSelection: '球员选择',
      playerSelectionDesc: '支持搜索、分页加载的球员选择功能',
      selectedPlayers: '已选球员：',
      backToProjects: '返回项目'
    },
    shougangDemo: {
      title: '首钢园物业管理平台 - 权限演示',
      selectRole: '选择角色',
      currentRole: '当前角色',
      menuPermissions: '菜单权限',
      buttonPermissions: '按钮权限',
      dataPermissions: '数据权限',
      dynamicRoutes: '动态路由',
      noMenus: '暂无菜单',
      noRoutes: '暂无路由',
      allowed: '允许',
      denied: '拒绝',
      visible: '可见',
      hidden: '隐藏',
      backToProjects: '返回项目'
    },
    contact: {
      title: '联系我',
      subtitle: '有项目想法？让我们一起合作！',
      name: '您的姓名',
      email: '您的邮箱',
      message: '您的留言',
      send: '发送消息',
      success: '消息发送成功！',
      error: '发送失败，请重试。'
    },
    footer: {
      copyright: '© 2026 Ian Zhang. 保留所有权利。',
      social: '与我联系'
    }
  }
}

const i18n = createI18n({
  legacy: false,
  locale: 'zh',
  fallbackLocale: 'en',
  messages
})

export default i18n
