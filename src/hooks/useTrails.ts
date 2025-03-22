import { useRef, useEffect } from "react";
import { FeatureCollection, Point } from "geojson";
import mapboxgl from "mapbox-gl";

interface TrailProps {
    mapRef: React.RefObject<mapboxgl.Map | null>,
    mapLoadedRef: React.RefObject<Boolean>,
    coordinates: FeatureCollection<Point> | null
}

export const useTrails = ({ mapRef, mapLoadedRef, coordinates }: TrailProps) => {
    const prevCoordinatesRef = useRef<GeoJSON.FeatureCollection<GeoJSON.Point> | null>(null);
    const trailsRef = useRef<FeatureCollection>({ type: 'FeatureCollection', features: [] });

    useEffect(() => {
        if (coordinates && prevCoordinatesRef.current && mapRef.current && mapLoadedRef.current) {
            addTrail(prevCoordinatesRef.current, coordinates);
        }
        prevCoordinatesRef.current = coordinates;
    }, [coordinates]);

    const addTrail = (prev: GeoJSON.FeatureCollection<GeoJSON.Point>, current: GeoJSON.FeatureCollection<GeoJSON.Point>) => {
        if (!mapRef.current) return;
        const map = mapRef.current;
        const mergedData = mergeFeaturesById(prev, current);

        if (map.getSource('trails')) {
            (map.getSource('trails') as mapboxgl.GeoJSONSource).setData(mergedData);
        } else {
            map.addSource('trails', {
                type: 'geojson',
                data: mergedData
            });

            map.addLayer({
                id: 'trails',
                type: 'line',
                source: 'trails',
                paint: {
                    'line-width': 3,
                    'line-color': ['get', 'color']
                }
            });
        }
    };

    const mergeFeaturesById = (data1: FeatureCollection, data2: FeatureCollection) => {
        const merged = { ...trailsRef.current };

        const featureMap = new Map<number, [number, number][]>();

        merged.features.forEach(feature => {
            const id = feature.properties?.id as number;
            if (!featureMap.has(id)) {
                const geometry = feature.geometry;
                if (geometry.type === "Point") {
                    featureMap.set(id, [[geometry.coordinates[0], geometry.coordinates[1]]]);
                } else if (geometry.type === "LineString") {
                    featureMap.set(id, geometry.coordinates as [number, number][]);
                }
            }
        });

        [...data1.features, ...data2.features].forEach(feature => {
            const id = feature.id as number;
            if (!featureMap.has(id)) {
                featureMap.set(id, []);
            }

            const geometry = feature.geometry as GeoJSON.Geometry;

            if (geometry.type === "Point") {
                featureMap.get(id)?.push([geometry.coordinates[0], geometry.coordinates[1]]);
            } else if (geometry.type === "LineString") {
                featureMap.get(id)?.push(...(geometry.coordinates as [number, number][]));
            }
        });

        merged.features = Array.from(featureMap.entries()).map(([id, coordinates]) => ({
            type: 'Feature',
            properties: {
                id,
                color: '#F7455D'
            },
            geometry: {
                type: 'LineString',
                coordinates
            }
        }));

        trailsRef.current = merged;
        return merged;
    };

    return trailsRef;
};
