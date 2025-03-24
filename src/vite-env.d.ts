/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_MAPBOXGL_ACCESS_TOKEN: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}

declare module '*.geojson' {
    const value: any;
    export default value;
}

