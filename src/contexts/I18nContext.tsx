import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

type Lang = 'en' | 'fr';

const translations: Record<string, Record<Lang, string>> = {
	today: { en: 'Today', fr: "Aujourd'hui" },
	planning: { en: 'Planning', fr: 'Planification' },
	zones: { en: 'Zones', fr: 'Zones' },
	admin: { en: 'Admin', fr: 'Admin' },
	drive: { en: 'Drive', fr: 'Conduite' },
	events: { en: 'Events', fr: 'Événements' },
	// ... (ajoute d'autres clés si besoin)
};

interface I18nContextType {
	lang: Lang;
	toggleLang: () => void;
	t: (key: string) => string;
	locale: string;
}

const I18nContext = createContext<I18nContextType>({
	lang: 'fr',
	toggleLang: () => {},
	t: (key) => key,
	locale: 'fr-CA',
});

export function I18nProvider({ children }: { children: React.ReactNode }) {
	const [lang, setLang] = useState<Lang>('fr');
	const toggleLang = useCallback(() => setLang(l => l === 'en' ? 'fr' : 'en'), []);
	const t = useCallback((key: string) => translations[key]?.[lang] ?? key, [lang]);
	const locale = useMemo(() => (lang === 'fr' ? 'fr-CA' : 'en-CA'), [lang]);

	return (
		<I18nContext.Provider value={{ lang, toggleLang, t, locale }}>
			{children}
		</I18nContext.Provider>
	);
}

export const useI18n = () => useContext(I18nContext);
