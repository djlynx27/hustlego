import { useI18n } from '@/contexts/I18nContext';

export function LangToggle() {
  const { lang, toggleLang } = useI18n();
  return (
    <button
      onClick={toggleLang}
      className="w-9 h-9 flex items-center justify-center rounded-full bg-muted border border-border text-[11px] font-display font-bold text-muted-foreground hover:text-foreground hover:border-primary transition-colors flex-shrink-0"
      aria-label="Changer la langue"
    >
      {lang === 'en' ? 'EN' : 'FR'}
    </button>
  );
}
