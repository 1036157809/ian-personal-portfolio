export default {
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
      title: 'Aviation Map',
      description: 'An aviation map application based on OpenLayers with Web Mercator projection, providing interactive map features with marker addition and view reset capabilities.'
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
};
