import { ROUTES } from 'src/constants';

export const routes = [
  {
    path: ROUTES.HOME,
    name: 'Home',
    component: () => import('src/views/Home.vue'),
  },
  {
    path: ROUTES.PROJECTS,
    name: 'Projects',
    component: () => import('src/views/Projects.vue'),
  },
  {
    path: ROUTES.ABOUT,
    name: 'About',
    component: () => import('src/views/About.vue'),
  },
  {
    path: ROUTES.CONTACT,
    name: 'Contact',
    component: () => import('src/views/Contact.vue'),
  },
  {
    path: ROUTES.DEMO_DS_PORTAL,
    name: 'DSPortalDemo',
    component: () => import('src/views/demos/DSPortalDemo.vue'),
  },
  {
    path: ROUTES.DEMO_SHOUGANG,
    name: 'ShougangDemo',
    component: () => import('src/views/demos/ShougangPermissionDemo.vue'),
  },
  {
    path: ROUTES.DEMO_TONGDAO,
    name: 'TongdaoDemo',
    component: () => import('src/views/demos/TongdaoDemo.vue'),
  },
];

export default routes;
