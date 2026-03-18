import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useRef } from 'react';

interface ZoneMarker {
  id: string;
  name: string;
  type: string;
  latitude: number;
  longitude: number;
  demandScore?: number;
}

interface LeafletMapProps {
  center: [number, number];
  zoom?: number;
  markers: ZoneMarker[];
  driverPosition?: { lat: number; lng: number };
  className?: string;
}

function getMarkerColor(score: number): string {
  if (score >= 70) return '#22c55e';
  if (score >= 40) return '#eab308';
  return '#ef4444';
}

export function LeafletMap({
  center,
  zoom = 12,
  markers,
  driverPosition,
  className = '',
}: LeafletMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const driverMarkerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    if (!mapRef.current) {
      mapRef.current = L.map(containerRef.current, {
        center,
        zoom,
        zoomControl: true,
        attributionControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(mapRef.current);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update center/zoom
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setView(center, zoom);
    }
  }, [center[0], center[1], zoom]);

  // Update markers
  useEffect(() => {
    if (!mapRef.current) return;

    // Remove existing markers
    mapRef.current.eachLayer((layer) => {
      if (layer instanceof L.CircleMarker) {
        mapRef.current!.removeLayer(layer);
      }
    });

    markers.forEach((m) => {
      const score = m.demandScore ?? 50;
      const color = getMarkerColor(score);

      L.circleMarker([m.latitude, m.longitude], {
        radius: 10,
        fillColor: color,
        color: '#fff',
        weight: m.type?.toLowerCase().includes('delivery') ? 3 : 2,
        dashArray: m.type?.toLowerCase().includes('delivery') ? '4' : undefined,
        opacity: 1,
        fillOpacity: 0.85,
      })
        .addTo(mapRef.current!)
        .bindPopup(
          `<div style="font-family:sans-serif;min-width:120px">
            <strong>${m.name}</strong><br/>
            <span style="text-transform:capitalize">${m.type}</span><br/>
            <span style="color:${color};font-weight:bold">Score: ${score}</span>
          </div>`
        );
    });

    if (driverPosition) {
      if (!driverMarkerRef.current) {
        driverMarkerRef.current = L.marker(
          [driverPosition.lat, driverPosition.lng],
          {
            icon: L.divIcon({
              className: 'driver-car-marker',
              html: '<div style="font-size:26px;line-height:1;filter:drop-shadow(0 2px 5px rgba(0,0,0,0.9));text-align:center">🚗</div>',
              iconSize: [30, 30],
              iconAnchor: [15, 15],
            }),
          }
        ).addTo(mapRef.current!);
      } else {
        driverMarkerRef.current.setLatLng([
          driverPosition.lat,
          driverPosition.lng,
        ]);
      }
    } else if (driverMarkerRef.current) {
      driverMarkerRef.current.remove();
      driverMarkerRef.current = null;
    }
  }, [markers]);

  return <div ref={containerRef} className={`w-full h-full ${className}`} />;
}

export default LeafletMap;
