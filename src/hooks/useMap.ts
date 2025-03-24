import { useRef, useEffect } from "react";
import mapboxgl from "mapbox-gl";

export const useMap = (mapContainerRef: React.RefObject<HTMLDivElement | null>) => {
    const mapRef = useRef<mapboxgl.Map | null>(null);

    useEffect(() => {
        mapboxgl.accessToken = import.meta.env.VITE_MAPBOXGL_ACCESS_TOKEN;

        if (!mapContainerRef.current) return;

        const map = new mapboxgl.Map({
            container: mapContainerRef.current,
            style: "mapbox://styles/aylna/cm8mn1o97006q01s95ggkbf0b",
            center: [39, 35],
            zoom: 3,
        });

        mapRef.current = map;

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
            }
        };
    }, [mapContainerRef]);

    return { mapRef };
};