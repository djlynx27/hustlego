// Minimal GeoJSON types for MapboxHeatmap
export type GeoJsonFeature = {
  type: 'Feature';
  properties: Record<string, any>;
  geometry: {
    type: 'Point';
    coordinates: [number, number];
  };
};

export type GeoJsonFeatureCollection = {
  type: 'FeatureCollection';
  features: GeoJsonFeature[];
};
