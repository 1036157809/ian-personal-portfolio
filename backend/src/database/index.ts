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
      title: 'AIA Ipos Cross-Platform Insurance System',
      titleZh: 'AIA Ipos 跨端保险系统',
      description: 'AIA Philippines requires a hybrid development insurance business system covering PC, mobile, and iOS platforms, implementing complete insurance workflow including user information management, ID OCR recognition, policy PDF generation/preview/download, and electronic signatures.',
      descriptionZh: 'AIA菲律宾需要一款基于混合开发的保险业务系统，覆盖 PC、移动端及 iOS 平台，实现完整的投保工作流，包括用户信息管理、证件 OCR 识别、保单 PDF 生成预览下载、电子签名等。',
      technologies: ['Vue 2/3', 'Quasar', 'Node.js (Express)', 'Java', 'Canvas', 'OCR SDK'],
      imageUrl: '/images/pc/ipos-pc-1.jpg',
      mobileImageUrl: '/images/mobile/ipos-mobile-1.jpg',
      additionalImages: [
        '/images/pc/ipos-pc-2.jpg',
        '/images/pc/ipos-pc-3.jpg',
        '/images/pc/ipos-pc-4.jpg',
        '/images/pc/ipos-pc-5.jpg',
        '/images/pc/ipos-pc-6.jpg',
        '/images/mobile/ipos-mobile-2.jpg',
        '/images/mobile/ipos-mobile-3.jpg',
        '/images/mobile/ipos-mobile-4.jpg'
      ],
      demoUrl: 'https://ipos.aia.com.ph/phipos/#/loginPage',
      githubUrl: '',
      order: 1
    },
    {
      title: 'AIA DS-portal Recruitment Due Diligence Portal System',
      titleZh: 'AIA DS-portal 招聘尽职调查门户系统',
      description: 'AIA Singapore requires a complete digital recruitment due diligence system to manage the entire process from FSC application to final certification. The system must meet strict financial regulatory compliance requirements, including various due diligence checks to ensure candidates\' background, qualifications, and financial status meet regulatory standards.',
      descriptionZh: 'AIA新加坡需要一个完整的数字化招聘尽职调查系统，用于管理从FSC申请到最终发证的全流程。系统需要满足金融监管的严格合规要求，包含多种尽职调查检查，确保候选人的背景、资质、财务状况等符合监管标准。',
      technologies: ['React 18', 'Redux Toolkit + RTK Query', 'React Router 6', 'Okta OAuth 2.0', 'Ant Design', 'styled-components', 'react-pdf', 'Application Insights', 'Jest', 'Docker'],
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
