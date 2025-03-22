import { useRef, useState } from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Box } from "@mui/material";
import { useMap } from '../hooks/useMap';
import { useMapLayers } from '../hooks/useMapLayers';
import { useFetchFlights } from '../hooks/useFetchFlights';
import { useTrails } from '../hooks/useTrails';
import InfoDrawer from '../components/InfoDrawer';

export default function Home() {
    const mapContainerRef = useRef<HTMLDivElement | null>(null);
    const { mapRef, mapLoadedRef } = useMap(mapContainerRef);
    const coordinates = useFetchFlights();
    const [selectedFlight, setSelectedFlight] = useState<GeoJSON.Feature<GeoJSON.Point> | null>(null);

    useMapLayers({ mapRef, mapLoadedRef, coordinates, selectedFlight, setSelectedFlight });
    useTrails({ mapRef, mapLoadedRef, coordinates });

    return (
        <>
            <Box id="map" style={{ height: '100%' }} ref={mapContainerRef}></Box>

            <InfoDrawer
                isOpen={Boolean(selectedFlight)}
                handleClose={() => setSelectedFlight(null)}
                selectedFlight={selectedFlight}
            />
        </>
    );
}
