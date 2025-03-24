import { useState, useEffect } from "react";
import { FeatureCollection } from "geojson";

const API_URL = "http://127.0.0.1:8000/flights/";

export const useFetchFlights = () => {
    const [coordinates, setCoordinates] = useState<GeoJSON.FeatureCollection<GeoJSON.Point> | null>(null);

    useEffect(() => {
        const fetchCoordinates = async () => {
            try {
                const response = await fetch(API_URL);
                if (!response.ok) throw new Error("Failed to fetch data");
                const data: FeatureCollection = await response.json();
                if (data.features.every(feature => feature.geometry.type === "Point")) {
                    setCoordinates(data as GeoJSON.FeatureCollection<GeoJSON.Point>);
                } else {
                    throw new Error("Fetched data is not of type Point");
                }
            } catch (error) {
                console.error("Error fetching flight data:", error);
            }
        };

        fetchCoordinates();
        const interval = setInterval(fetchCoordinates, 1000);
        return () => clearInterval(interval);
    }, []);

    return coordinates;
};
