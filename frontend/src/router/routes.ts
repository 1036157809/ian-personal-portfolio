import { ROUTES } from 'src/constants';

export const routes = [
  {
    path: ROUTES.HOME,
    name: 'Home',
    component: () => import('src/views/home/index.vue'),
  },
  {
    path: ROUTES.PROJECTS,
    name: 'Projects',
    component: () => import('src/views/projects/index.vue'),
  },
  {
    path: ROUTES.ABOUT,
    name: 'About',
    component: () => import('src/views/about/index.vue'),
  },
  {
    path: ROUTES.CONTACT,
    name: 'Contact',
    component: () => import('src/views/contact/index.vue'),
  },
  {
    path: ROUTES.DEMO_DS_PORTAL,
    name: 'DSPortalDemo',
    component: () => import('src/views/demos/ds-portal/index.vue'),
  },
  {
    path: ROUTES.DEMO_SHOUGANG,
    name: 'ShougangDemo',
    component: () => import('src/views/demos/shougang/index.vue'),
  },
  {
    path: ROUTES.DEMO_TONGDAO,
    name: 'TongdaoDemo',
    component: () => import('src/views/demos/tongdao/index.vue'),
  },
  {
    path: ROUTES.DEMO_AVIATION_MAP,
    name: 'AviationMap',
    component: () => import('src/views/demos/aviation-map/index.vue'),
  },
];

export const scrollBehavior = () => {
  return { top: 0 };
};

export default routes;
