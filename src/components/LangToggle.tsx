import { useI18n } from '@/contexts/I18nContext';

export function LangToggle() {
  const { lang, toggleLang } = useI18n();
  return (
    <button
      onClick={toggleLang}
      className="fixed top-2 right-2 z-50 w-9 h-9 flex items-center justify-center rounded-full bg-card/90 border border-border text-[11px] font-display font-bold text-muted-foreground hover:text-foreground transition-colors backdrop-blur-sm shadow-sm"
      aria-label="Changer la langue"
    >
      {lang === 'en' ? 'EN' : 'FR'}
    </button>
  );
}
