import { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../contexts/I18nContext';
import CitySelect from '../components/CitySelect';
import DemandBadge from '../components/DemandBadge';
// ...imports hooks et composants nécessaires (à adapter si besoin)
import { useCities } from '../hooks/useSupabase';
import { useDemandScores } from '../hooks/useDemandScores';
import { formatTime24h, getCurrentSlotTime, getDemandClass } from '../lib/demandUtils';
import { getActiveTimeBoosts } from '../lib/timeBoosts';
import { Clock, PartyPopper, Download, WifiOff, Navigation, Bell, Ticket } from 'lucide-react';
import ScoreFactorIcons from '../components/ScoreFactorIcons';
import WeatherWidget from '../components/WeatherWidget';
const MapboxHeatmap = lazy(() => import('../components/MapboxHeatmap'));
import { useHoliday } from '../hooks/useHoliday';
import { useHabsGame } from '../hooks/useHabsGame';
import { usePwaInstall } from '../hooks/usePwaInstall';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { useNotifications } from '../hooks/useNotifications';
import { Button } from '../components/ui/button';
import { useUserLocation, haversineKm } from '../hooks/useUserLocation';
import NavigationSheet from '../components/NavigationSheet';
import { useCityId } from '../hooks/useCityId';
import { getGoogleMapsNavUrl, getWazeNavUrl } from '../lib/venueCoordinates';
import DeadTimeTimer from '../components/DeadTimeTimer';
import { WeeklyGoalDisplay } from '../components/WeeklyGoal';
import MultiAppStatus from '../components/MultiAppStatus';

const CITY_CENTERS = {
	mtl: [45.5017, -73.5673],
	qc: [46.8139, -71.2080],
	ott: [45.4215, -75.6972],
};

export default function TodayScreen2() {
	const navigate = useNavigate();
	const { t, lang } = useI18n();
	const [cityId, setCityId] = useCityId();
	const [now, setNow] = useState(new Date());
	const { canInstall, install } = usePwaInstall();
	const isOnline = useOnlineStatus();
	const { enabled: notifEnabled, requestPermission } = useNotifications(cityId);
	const { location: userLocation } = useUserLocation();
	const [navZone, setNavZone] = useState(null);

	useEffect(() => {
		const timer = setInterval(() => setNow(new Date()), 15000);
		return () => clearInterval(timer);
	}, []);

	const { start, end } = getCurrentSlotTime(now);
	const { data: cities = [] } = useCities();
	const { scores, factors, zones, endingSoon, relevantTmEvents } = useDemandScores(cityId);
	const { data: holiday } = useHoliday(getCurrentSlotTime(now).date);
	const { data: habsGame } = useHabsGame(getCurrentSlotTime(now).date);
	const timeBoosts = useMemo(() => getActiveTimeBoosts(now), [now]);

	// Ranked zones by score descending
	const rankedZones = useMemo(() => {
		return zones
			.map(z => ({ ...z, score: scores.get(z.id) ?? 0 }))
			.sort((a, b) => b.score - a.score);
	}, [zones, scores]);

	const heroZone = rankedZones[0] ?? null;
	const nextZones = rankedZones.slice(1, 4);

	const getDistance = (zone) => {
		if (!userLocation || !zone) return null;
		return haversineKm(userLocation.latitude, userLocation.longitude, zone.latitude, zone.longitude);
	};

	const heroDistance = getDistance(heroZone);

	const mapCenter = heroZone
		? [heroZone.latitude, heroZone.longitude]
		: CITY_CENTERS[cityId] ?? CITY_CENTERS.mtl;

	const mapMarkers = useMemo(() => {
		return rankedZones.map(z => ({
			id: z.id,
			name: z.name,
			type: z.type,
			latitude: z.latitude,
			longitude: z.longitude,
			demandScore: z.score,
		}));
	}, [rankedZones]);

	return (
		<div className="flex flex-col h-full pb-36">
			{/* 1. Compact header */}
			<div className="flex items-center gap-2 px-3 pt-2 pb-1 h-12">
				<div className="w-[140px] flex-shrink-0">
					<CitySelect cities={cities} value={cityId} onChange={setCityId} />
				</div>
				<div className="flex-1 min-w-0">
					<WeatherWidget cityId={cityId} />
				</div>
				<span className="text-[14px] text-muted-foreground font-body flex-shrink-0">
					{/* ...existing code... */}
				</span>
			</div>
			{/* ...existing code... */}
		</div>
	);
}
