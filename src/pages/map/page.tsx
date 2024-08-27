import { LatLngBoundsExpression } from "leaflet";
import { Libraries, useJsApiLoader } from "@react-google-maps/api";
import { MapContainer } from "react-leaflet";
import { useState } from "react";
import clsx from "clsx";
import styles from "./style.module.css";
import { Button, Spinner } from "@chakra-ui/react";




function Loader() {
    return (
      <div className="h-full flex p-4">
        <Spinner className="m-auto" size="sm" />
      </div>
    );
  }
  
  function LoadError() {
    return (
      <div className="h-full flex">
        <div className="m-auto flex flex-col items-center justify-center space-y-2">
          <p className="text-center">An error occurred.</p>
  
          <Button
            size="sm"
            className="w-fit"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

const googleMapsApiKey = import.meta.env.VITE_PUBLIC_GOOGLE_MAPS_API_KEY;

const googleMapsLibraries: Libraries = ["places"];

const maxMapViewBounds: LatLngBoundsExpression = [
  [4, 2.5],
  [14, 15],
];

const defaultZoom = 6;

const defaultCenter = { lat: 9.1715156, lng: 4.0128317 };

export function MapPage() {
  const zoom = defaultZoom;

  const { lat, lng } = defaultCenter;
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey,
    libraries: googleMapsLibraries,
  });
  const [map, setMap] = useState<L.Map | null>(null);

  return (
    <>
      <main className="h-full flex flex-col">
        {isLoaded ? (
          <MapContainer
            zoom={zoom}
            ref={setMap}
            minZoom={6}
            maxZoom={18}
            zoomControl={false}
            center={[lat, lng]}
            attributionControl={false}
            maxBounds={maxMapViewBounds}
            className={clsx("h-full flex-1", styles.map)}
          ></MapContainer>
        ) : (
            <div className="h-full flex flex-col">
            <div className="m-auto">
              <Spinner />
            </div>
          </div>
        )}
      </main>
    </>
  );
}
