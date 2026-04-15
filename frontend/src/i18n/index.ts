import { createI18n } from 'vue-i18n'

const messages = {
  en: {
    nav: {
      home: 'Home',
      projects: 'Projects',
      about: 'About',
      contact: 'Contact'
    },
    common: {
      back: 'Back',
      backToProjects: 'Back to Projects'
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
      description: 'As a senior frontend engineer, I specialize in building high-performance, modern web applications. I have transitioned to an AI-assisted frontend full-stack developer, deeply integrating tools like bolt.new and cursor. This portfolio project demonstrates full-stack development from scratch with Docker deployment, showcasing the practical impact of AI toolchains on development efficiency.',
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
        desc6: 'Technical Impact: Pioneered React 18 + Redux Toolkit + RTK Query in the system. Organized technical sharing internally, promoted the tech stack across multiple teams, unified frontend state management standards, improved development efficiency by ~30%, and established reusable project templates. System includes 20+ due diligence check modules with complex business process state machine management.'
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
        name: 'DS-portal Recruitment Due Diligence Portal System',
        period: '2023.06 – 2023.11',
        desc: 'The system covering the complete recruitment process management from FSC application to final certification. Includes 20+ due diligence check modules (Nice Actimize AML check, Questnet check, CEA check, FATCA tax compliance check, MediSave liability check, professional qualification check, employment reference check, financial soundness check, etc.), supports multi-role permission control (TD Ops Staff, Manager), file management, PDF preview, REEF regulatory exam management and other complex business scenarios.',
        tech: 'React 18, Redux Toolkit + RTK Query, React Router 6, Okta OAuth 2.0, Ant Design, styled-components, react-pdf, Application Insights, Jest, Docker',
        challenge1: 'Modern state management architecture: Pioneered React 18 + Redux Toolkit + RTK Query to replace traditional Redux + manual request state management. Through RTK Query\'s automatic caching, request deduplication, and automatic loading/error state management, reduced code volume by ~40% and improved development efficiency by ~30%. Established unified API layer architecture with 20+ API modules.',
        challenge2: 'Enterprise-grade authentication: Integrated Okta OAuth 2.0 + PKCE authentication flow for secure enterprise single sign-on. Configured multi-environment authentication strategies (Development/UAT/Production) supporting automatic token refresh and session management.',
        challenge3: 'Complex business process engine: Designed and implemented state machine management for 9 main process states (FSC application, application review, interview and signing, due diligence, management review, RNF lodgement, issuance, completion of hiring), each containing multiple sub-steps and conditional judgments to ensure strict compliance of business processes.',
        challenge4: 'High-performance file processing system: Developed intelligent file upload component supporting single/multiple file upload, file renaming templates, size/format validation, and resumable upload. Implemented PDF online preview (based on react-pdf), Blob streaming download, file classification management and other core functions.'
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
      workProjects: 'Work Projects',
      personalProjects: 'Personal Projects',
      viewDemo: 'View Demo',
      viewCode: 'View Code',
      technologies: 'Technologies',
      viewTongdaoDemo: 'View Demo',
      viewShougangDemo: 'View Demo',
      pcIpad: 'PC/iPad',
      mobile: 'Mobile',
      comingSoon: 'Coming Soon',
      onlineAddress: 'Online Address',
      webgis: {
        title: 'WebGIS Platform',
        description: 'A web-based geographic information system platform for visualizing and analyzing spatial data with interactive maps.'
      }
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
    dsPortalDemo: {
      title: 'DS-portal Recruitment Website - Feature Demo',
      demoTitle: 'Demo',
      codeTitle: 'React 18 + RTKQ Code',
      stateMachine: 'Recruitment Process State Machine',
      currentState: 'Current State',
      stateDescription: 'State Description',
      nextState: 'Next State',
      reset: 'Reset',
      fileManagement: 'File Management',
      uploadFile: 'Upload File',
      fileName: 'File Name',
      fileSize: 'File Size',
      fileType: 'File Type',
      actions: 'Actions',
      preview: 'Preview',
      download: 'Download',
      delete: 'Delete',
      dropFiles: 'Drop files here',
      dragOrClick: 'Drag files here or click to upload',
      fileLimits: 'Max file size: 100MB, supported formats: PDF, JPG, PNG, DOC, DOCX, XLS, XLSX',
      renameTemplate: 'Rename Template',
      renamePlaceholder: 'e.g., {date}_{candidate}',
      renameHint: 'Use {date} for current date, {candidate} for candidate name',
      uploadProgress: 'Upload Progress',
      resume: 'Resume',
      fileSizeError: 'File size exceeds 100MB limit',
      fileTypeError: 'File format not supported',
      pdfPreviewNote: 'PDF preview requires actual file to be uploaded',
      stateMachineCodeTitle: 'State Machine Definition & Route Guard',
      createAppApiTitle: 'RTK Query Base API Configuration',
      homePageApiTitle: 'Home Page API Example',
      uploadComponentTitle: 'File Upload Component',
      routerConfigTitle: 'Router Configuration with Okta Auth',
      oktaConfigTitle: 'Okta OAuth Configuration',
      stateCreated: 'Initial recruitment process created',
      stateFscApplication: 'FSC application submitted',
      stateReviewApplication: 'Application under review',
      stateInterviewSigning: 'Interview and contract signing phase',
      stateDueDiligence: 'Due diligence checks in progress',
      stateTdOpsReview: 'TD Ops management review',
      stateRnfLodgement: 'RNF lodgement process',
      stateIssuedFscCode: 'FSC code issued',
      stateCompletionHiring: 'Completion and hiring process'
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
    common: {
      back: '返回',
      backToProjects: '返回项目'
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
      description: '一名资深前端工程师，专注于构建高性能、现代化的Web应用。转型为AI辅助开发领域的前端全栈工程师，深度融合bolt.new、cursor等智能编程工具。本作品集项目从0到1完整覆盖前后端全栈部署，使用Docker容器化部署，展现AI工具链在提升开发效率方面的实践成果。',
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
        desc6: '技术影响力：在该系统中，率先引入 React 18 + Redux Toolkit + RTK Query 方案，并在公司内部组织技术分享，推动该技术栈在多个团队落地，统一了前端状态管理标准，平均开发效率提升约 30%，并建立了可复用的项目模板。系统包含20+个尽职调查检查模块，具备复杂业务流程状态机管理。'
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
        name: 'DS-portal 招聘尽职调查门户系统',
        period: '2023.06 – 2023.11',
        desc: '该系统，覆盖完整的招聘流程管理，从FSC申请到最终发证的全流程数字化。系统包含20+个尽职调查检查模块（Nice Actimize反洗钱检查、Questnet检查、CEA检查、FATCA税务合规检查、MediSave责任检查、专业资格检查、就业参考检查、财务稳健性检查等），支持多角色权限控制（TD Ops Staff、Manager）、文件管理、PDF预览、REEF监管考试管理等复杂业务场景。',
        tech: 'React 18、Redux Toolkit + RTK Query、React Router 6、Okta OAuth 2.0、Ant Design、styled-components、react-pdf、Application Insights、Jest、Docker',
        challenge1: '现代化状态管理架构：率先引入 React 18 + Redux Toolkit + RTK Query 方案，替代传统 Redux + 手动管理请求状态。通过 RTK Query 的自动缓存、请求去重、loading/error状态自动管理，代码量减少约 40%，开发效率提升约 30%。建立了统一的API层架构，包含20+个API模块。',
        challenge2: '企业级身份认证：集成 Okta OAuth 2.0 + PKCE 认证流程，实现安全的企业级单点登录。配置多环境认证策略（Development/UAT/Production），支持token自动刷新和会话管理。',
        challenge3: '复杂业务流程引擎：设计并实现了9个主要流程状态的状态机管理（FSC申请、申请审核、面试签约、尽职调查、管理层审核、RNF申报、发证、完成招聘），每个状态包含多个子步骤和条件判断，确保业务流程的严格合规性。',
        challenge4: '高性能文件处理系统：开发智能文件上传组件，支持单文件/多文件上传、文件重命名模板、大小格式校验、断点续传等功能。实现PDF文档在线预览（基于react-pdf）、Blob流式下载、文件分类管理等核心功能。'
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
      workProjects: '工作项目',
      personalProjects: '个人项目',
      viewDemo: '查看演示',
      viewCode: '查看代码',
      technologies: '技术栈',
      viewTongdaoDemo: '查看演示',
      viewShougangDemo: '查看演示',
      pcIpad: 'PC/iPad',
      mobile: '移动端',
      comingSoon: '即将推出',
      onlineAddress: '线上地址',
      webgis: {
        title: 'WebGIS 平台',
        description: '基于Web的地理信息系统平台，用于可视化和分析空间数据，提供交互式地图功能。'
      }
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
    dsPortalDemo: {
      title: 'DS-portal 招聘网站 - 功能演示',
      demoTitle: '演示',
      codeTitle: 'React 18 + RTKQ 代码',
      stateMachine: '招聘流程状态机',
      currentState: '当前状态',
      stateDescription: '状态描述',
      nextState: '下一状态',
      reset: '重置',
      fileManagement: '文件管理',
      uploadFile: '上传文件',
      fileName: '文件名',
      fileSize: '文件大小',
      fileType: '文件类型',
      actions: '操作',
      preview: '预览',
      download: '下载',
      delete: '删除',
      dropFiles: '拖放文件到此处',
      dragOrClick: '拖放文件到此处或点击上传',
      fileLimits: '最大文件大小：100MB，支持格式：PDF、JPG、PNG、DOC、DOCX、XLS、XLSX',
      renameTemplate: '重命名模板',
      renamePlaceholder: '例如：{date}_{candidate}',
      renameHint: '使用 {date} 表示当前日期，{candidate} 表示候选人姓名',
      uploadProgress: '上传进度',
      resume: '恢复',
      fileSizeError: '文件大小超过100MB限制',
      fileTypeError: '不支持的文件格式',
      pdfPreviewNote: 'PDF预览需要上传实际文件',
      stateMachineCodeTitle: '状态机定义与路由守卫',
      createAppApiTitle: 'RTK Query 基础API配置',
      homePageApiTitle: '首页API示例',
      uploadComponentTitle: '文件上传组件',
      routerConfigTitle: '路由配置与Okta认证',
      oktaConfigTitle: 'Okta OAuth配置',
      stateCreated: '初始招聘流程已创建',
      stateFscApplication: 'FSC申请已提交',
      stateReviewApplication: '申请审核中',
      stateInterviewSigning: '面试与签约阶段',
      stateDueDiligence: '尽职调查检查进行中',
      stateTdOpsReview: 'TD Ops管理审核',
      stateRnfLodgement: 'RNF登记流程',
      stateIssuedFscCode: 'FSC代码已发放',
      stateCompletionHiring: '完成与录用流程'
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
