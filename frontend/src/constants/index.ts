export const ROUTES = {
  HOME: '/',
  PROJECTS: '/projects',
  ABOUT: '/about',
  TOOLS: '/tools',
  DEMO_DS_PORTAL: '/demo/ds-portal',
  DEMO_SHOUGANG: '/demo/shougang',
  DEMO_TONGDAO: '/demo/tongdao',
  DEMO_AVIATION_MAP: '/demo/aviation-map',
  DEMO_MUSIC_VIZ: '/demo/music-viz',
  DEMO_FILE_CONVERTER: '/demo/file-converter',
} as const;

export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
} as const;

export const LANGUAGES = {
  EN: 'en',
  ZH: 'zh',
} as const;

export default { ROUTES, THEMES, LANGUAGES };
