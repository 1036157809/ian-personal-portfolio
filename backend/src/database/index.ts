import { Sequelize } from 'sequelize';
import initProjectModel from '../models/Project';
import initContactModel from '../models/Contact';

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite',
  logging: false,
});

// Initialize models
const Project = initProjectModel(sequelize);
const Contact = initContactModel(sequelize);

export { Project, Contact };

export async function initDatabase() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    
    // Sync models
    await Project.sync();
    await Contact.sync();
    
    // Seed initial data if needed
    const projectCount = await Project.count();
    if (projectCount === 0) {
      await seedProjects();
    }
    
    console.log('Database synced successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    throw error;
  }
}

async function seedProjects() {
  const projects = [
    {
      title: 'Ipos Cross-Platform Insurance System',
      titleZh: 'Ipos 跨端保险系统',
      description: 'A hybrid development insurance business system covering PC, mobile, and iOS platforms, implementing complete insurance workflow including user information management, ID OCR recognition, policy PDF generation/preview/download, and electronic signatures.',
      descriptionZh: '一款基于混合开发的保险业务系统，覆盖 PC、移动端及 iOS 平台，实现完整的投保工作流，包括用户信息管理、证件 OCR 识别、保单 PDF 生成预览下载、电子签名等。',
      technologies: ['Vue 2/3', 'Quasar', 'Node.js (Express)', 'Java', 'Canvas', 'OCR SDK'],
      imageUrl: '/images/pc/ipos-pc-1.jpg',
      mobileImageUrl: '/images/mobile/ipos-mobile-1.jpg',
      additionalImages: [
        '/images/pc/ipos-pc-2.jpg',
        '/images/pc/ipos-pc-3.jpg',
        '/images/pc/ipos-pc-4.jpg',
        '/images/mobile/ipos-mobile-2.jpg',
        '/images/mobile/ipos-mobile-3.jpg',
        '/images/mobile/ipos-mobile-4.jpg'
      ],
      demoUrl: '',
      githubUrl: '',
      order: 1
    },
    {
      title: 'DS-portal Recruitment Website',
      titleZh: 'DS-portal 招聘网站',
      description: 'A cross-platform recruitment system covering PC, mobile, and iOS, implementing multi-role login, candidate information management, meeting booking, and conference room management.',
      descriptionZh: '一款跨端招聘系统，覆盖 PC、移动端及 iOS，实现多角色登录、面试者信息管理、会议预定与会议室管理等完整招聘流程。',
      technologies: ['React 18 (RTK Query, Redux Toolkit)', 'Ant Design', 'Node.js + Sequelize'],
      imageUrl: '',
      demoUrl: '',
      githubUrl: '',
      order: 2
    },
    {
      title: 'Tongdao Intelligent Cloud Platform & Big Data Backend',
      titleZh: '同道智能云平台 & 大数据后台',
      description: 'Intelligent cloud platform provides team/player data visualization analysis; big data backend manages partners, product packages, and personnel information; Yunnan Football Association official website introduces clubs and youth training.',
      descriptionZh: '智能云平台提供球队球员数据可视化分析；大数据后台管理合作方、产品包及人员信息；云南足球协会官网介绍俱乐部及青训。',
      technologies: ['Native JavaScript', 'jQuery', 'ECharts', 'Vue', 'Vant'],
      imageUrl: '',
      demoUrl: '',
      githubUrl: '',
      order: 3
    },
    {
      title: 'Shougang Park Property Management Platform',
      titleZh: '首钢园物业管理平台',
      description: 'Equipment management backend for Shougang Park, implementing dynamic equipment information management and user permission control.',
      descriptionZh: '面向首钢园的设备管理后台，实现设备信息动态管理、用户权限控制等功能。',
      technologies: ['Vue', 'Vuex', 'Vue Router', 'ElementUI', 'axios'],
      imageUrl: '',
      demoUrl: '',
      githubUrl: '',
      order: 4
    }
  ];
  
  await Project.bulkCreate(projects);
  console.log('Sample projects seeded successfully.');
}

export default sequelize;
