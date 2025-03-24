import { FeatureCollection } from "geojson";
import { useEffect, useState, useRef } from "react";

interface MapLayerProps {
    mapRef: React.RefObject<mapboxgl.Map | null>,
    coordinates: FeatureCollection | null,
    setSelectedFlight: React.Dispatch<React.SetStateAction<GeoJSON.Feature<GeoJSON.Point> | null>>
}

export const useMapLayers = ({ mapRef, coordinates, setSelectedFlight }: MapLayerProps) => {
    const [existingIcons, setExistingIcons] = useState<Record<string, string>>({});
    const [animatedFeatures, setAnimatedFeatures] = useState<FeatureCollection | null>(null);
    const lastCoordinatesRef = useRef<FeatureCollection | null>(null);
    const startPositionsRef = useRef<Record<string, [number, number]>>({});

    useEffect(() => {
        if (!mapRef.current || !coordinates) return;
        const map = mapRef.current;

        if (JSON.stringify(lastCoordinatesRef.current) === JSON.stringify(coordinates)) {
            return;
        }
        lastCoordinatesRef.current = coordinates;

        const source = map.getSource("points") as mapboxgl.GeoJSONSource;
        if (source) {
            let frame: number;
            const steps = 50;
            let currentStep = 0;

            const animate = () => {
                if (currentStep >= steps) {
                    setAnimatedFeatures(coordinates);
                    return;
                }

                const newFeatures = coordinates.features.map(f => {
                    const geometry = f.geometry as GeoJSON.Point;
                    const id = f.id as string;

                    if (!startPositionsRef.current[id]) {
                        if (geometry.coordinates.length === 2) {
                            startPositionsRef.current[id] = geometry.coordinates as [number, number];
                        }
                    }

                    const start = startPositionsRef.current[id];
                    const end = geometry.coordinates;

                    const lng = start[0] + ((end[0] - start[0]) * (currentStep + 1)) / steps;
                    const lat = start[1] + ((end[1] - start[1]) * (currentStep + 1)) / steps;

                    const angle = Math.atan2(end[1] - start[1], end[0] - start[0]) * (180 / Math.PI);

                    startPositionsRef.current[id] = [lng, lat];

                    return {
                        ...f,
                        geometry: { ...geometry, coordinates: [lng, lat] },
                        properties: {
                            ...f.properties,
                            icon: existingIcons[id] || f.properties?.icon || "airport",
                            rotation: angle
                        }
                    };
                });

                const newCoordinates = { ...coordinates, features: newFeatures };
                source.setData(newCoordinates);
                setAnimatedFeatures(newCoordinates);

                currentStep++;
                frame = requestAnimationFrame(animate);
            };



            animate();
            return () => cancelAnimationFrame(frame);
        } else {
            map.addSource("points", { type: "geojson", data: coordinates });

            map.addLayer({
                id: 'points',
                type: 'symbol',
                source: 'points',
                layout: {
                    'icon-image': ['coalesce', ['get', 'icon'], 'airport'],
                    'icon-anchor': 'bottom',
                    'icon-rotate': ['get', 'rotation'],
                    'icon-allow-overlap': true
                },
            });

            setAnimatedFeatures(coordinates);
        }
    }, [coordinates, mapRef.current]);

    const existingIconsRef = useRef<Record<string, string>>({});
    const animatedFeaturesRef = useRef<FeatureCollection | null>(null);

    useEffect(() => {
        existingIconsRef.current = existingIcons;
    }, [existingIcons]);

    useEffect(() => {
        animatedFeaturesRef.current = animatedFeatures;
    }, [animatedFeatures]);

    useEffect(() => {
        if (!mapRef.current) return;
        const map = mapRef.current;

        const handleMouseMove = (e: mapboxgl.MapMouseEvent & { features?: mapboxgl.MapboxGeoJSONFeature[] }) => {
            map.getCanvas().style.cursor = 'pointer';
            if (!e.features || e.features.length === 0) return;
            const id = e.features[0].id as string;

            if (existingIconsRef.current[id] === "selected-airport") return;
            existingIconsRef.current[id] = "selected-airport";

            if (animatedFeaturesRef.current) {
                const updatedFeatures = animatedFeaturesRef.current.features.map(f => ({
                    ...f,
                    properties: {
                        ...f.properties,
                        icon: existingIconsRef.current[f.id as string] || "airport"
                    }
                }));

                const source = map.getSource("points") as mapboxgl.GeoJSONSource;
                if (source) source.setData({ ...animatedFeaturesRef.current, features: updatedFeatures });
            }
        };


        const handleMouseLeave = () => {
            map.getCanvas().style.cursor = '';

            const updatedFeatures = animatedFeaturesRef.current?.features.map(f => {
                if (f.properties?.icon !== "airport") {
                    return {
                        ...f,
                        properties: {
                            ...f.properties,
                            icon: "airport"
                        }
                    };
                }
                return f;
            });

            if (updatedFeatures) {
                const source = map.getSource("points") as mapboxgl.GeoJSONSource;
                if (source) {
                    source.setData({ ...animatedFeaturesRef.current, features: updatedFeatures, type: "FeatureCollection" });
                }
                setAnimatedFeatures({ ...animatedFeaturesRef.current, features: updatedFeatures, type: "FeatureCollection" });
            }

            setExistingIcons({});
            existingIconsRef.current = {};
        };


        const handleClick = (e: mapboxgl.MapMouseEvent & { features?: mapboxgl.MapboxGeoJSONFeature[] }) => {
            if (!e.features || e.features.length === 0) return;
            const feature = e.features[0] as GeoJSON.Feature<GeoJSON.Point>;

            setSelectedFlight(feature);
        };

        map.on('mousemove', 'points', handleMouseMove);
        map.on('mouseleave', 'points', handleMouseLeave);
        map.on('click', 'points', handleClick);

        return () => {
            map.off('mousemove', 'points', handleMouseMove);
            map.off('mouseleave', 'points', handleMouseLeave);
            map.off('click', 'points', handleClick);
        };
    }, [mapRef.current]);


    return null;
};
