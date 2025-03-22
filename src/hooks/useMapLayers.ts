

import mapboxgl from "mapbox-gl";
import { FeatureCollection } from "geojson";
import { useEffect } from "react";

interface MapLayerProps {
    mapRef: React.RefObject<mapboxgl.Map | null>,
    mapLoadedRef: React.RefObject<Boolean>,
    coordinates: FeatureCollection | null,
    selectedFlight: GeoJSON.Feature<GeoJSON.Point> | null,
    setSelectedFlight: React.Dispatch<React.SetStateAction<GeoJSON.Feature<GeoJSON.Point> | null>>
}

export const useMapLayers = ({ mapRef, mapLoadedRef, coordinates, selectedFlight, setSelectedFlight }: MapLayerProps) => {
    useEffect(() => {
        if (!mapRef.current || !coordinates || !mapLoadedRef) return;
        const map = mapRef.current;

        if (map.getSource("points")) {
            (map.getSource("points") as mapboxgl.GeoJSONSource).setData(coordinates);
        } else {
            map.addSource("points", { type: "geojson", data: coordinates });

            map.addLayer({
                id: "points",
                type: "symbol",
                source: "points",
                layout: {
                    "icon-image": "airplane",
                    "icon-allow-overlap": true,
                    "icon-ignore-placement": true,
                    "icon-anchor": "bottom",
                    "icon-size": 0.05,
                },
            });

            map.on('click', 'points', (event) => {
                const feature = event.features?.[0];
                if (!feature) return;
                setSelectedFlight(feature as GeoJSON.Feature<GeoJSON.Point>);
            });
        }
    }, [coordinates, mapRef, selectedFlight, setSelectedFlight]);
};