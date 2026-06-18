import { useThemeStore } from 'src/stores/theme';

export function useThemeDetector() {
  const store = useThemeStore();
  const updateByTime = () => {
    const hour = new Date().getHours();
    const isNightNow = hour < 6 || hour >= 18;
    if (store.isDark !== isNightNow) {
      store.isDark = isNightNow;
      if (isNightNow) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };
  updateByTime();
  const interval = setInterval(updateByTime, 3600000);
  return () => clearInterval(interval);
}