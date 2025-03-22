import { useRef, useEffect } from "react";
import mapboxgl from "mapbox-gl";

export const useMap = (mapContainerRef: React.RefObject<HTMLDivElement | null>) => {
    const mapRef = useRef<mapboxgl.Map | null>(null);
    const mapLoadedRef = useRef<Boolean>(false);

    useEffect(() => {
        mapboxgl.accessToken = import.meta.env.VITE_MAPBOXGL_ACCESS_TOKEN;

        if (!mapContainerRef.current) return;

        const map = new mapboxgl.Map({
            container: mapContainerRef.current,
            style: "mapbox://styles/mapbox/streets-v12",
            center: [39, 35],
            zoom: 3,
        });

        mapRef.current = map;

        map.on("style.load", () => {
            mapLoadedRef.current = true;
            map.loadImage("/airplane.png", (error, image) => {
                if (error) return console.error("Error loading image:", error);
                if (image) {
                    map.addImage("airplane", image);
                }
            }
            );
        });

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, [mapContainerRef]);

    return { mapRef, mapLoadedRef };
};