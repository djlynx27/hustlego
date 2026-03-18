// Touch: force Vercel to resync case-sensitive files

import type { Database } from '@/integrations/supabase/types';
export type Zone = Database['public']['Tables']['zones']['Row'];
import { createClient } from '@supabase/supabase-js';

import { useEffect, useState, useCallback } from 'react';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Hook pour récupérer la liste des villes
export function useCities() {
	const [data, setData] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<any>(null);

	useEffect(() => {
		let mounted = true;
		setLoading(true);
		supabase
			.from('cities')
			.select('*')
			.then(({ data, error }) => {
				if (mounted) {
					if (error) setError(error);
					else setData(data || []);
					setLoading(false);
				}
			});
		return () => {
			mounted = false;
		};
	}, []);

	return { data, loading, error };
}

// Hook pour ajouter une ville
export function useAddCity() {
	const addCity = useCallback(async (city: any) => {
		const { data, error } = await supabase.from('cities').insert([city]);
		if (error) throw error;
		return data;
	}, []);
	return addCity;
}

// Hook pour récupérer la liste des zones
export function useZones() {
	const [data, setData] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<any>(null);

	useEffect(() => {
		let mounted = true;
		setLoading(true);
		supabase
			.from('zones')
			.select('*')
			.then(({ data, error }) => {
				if (mounted) {
					if (error) setError(error);
					else setData(data || []);
					setLoading(false);
				}
			});
		return () => {
			mounted = false;
		};
	}, []);

	return { data, loading, error };
}

// Hook pour insérer plusieurs créneaux horaires
export function useBulkInsertTimeSlots() {
	const bulkInsert = useCallback(async (slots: any[]) => {
		const { data, error } = await supabase.from('time_slots').insert(slots);
		if (error) throw error;
		return data;
	}, []);
	return bulkInsert;
}
