import * as L from "leaflet";
import "leaflet/dist/leaflet.css";

import "./global.css";

// import "leaflet/dist/leaflet.css";

// import "leaflet.markercluster/dist/MarkerCluster.css";
// import "leaflet.markercluster/dist/MarkerCluster.Default.css";

// import "leaflet-draw/dist/leaflet.draw.css";

// import "leaflet-active-area";

// import "leaflet-spectrum-spatial";

import * as E from "@effect/data/Either";

import { pipe } from "@effect/data/Function";
import * as O from "@effect/data/Option";
import * as S from "@effect/data/String";
import * as Effect from "@effect/io/Effect";

import { LatLngBoundsExpression } from "leaflet";
import { Libraries, useJsApiLoader } from "@react-google-maps/api";
import { MapContainer, Marker, Popup, ZoomControl } from "react-leaflet";
import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import clsx from "clsx";
import styles from "./style.module.css";
import { Button, Spinner, useToast } from "@chakra-ui/react";
import { useMediaQuery } from "@uidotdev/usehooks";
import { Search } from "../../components/search";
import { Link, useNavigation, useSearchParams } from "react-router-dom";
import { StreetView } from "../../components/streetview";
import { motion } from "framer-motion";
import { updateURLSearchWithoutNavigation } from "../../hooks/use-update-url-search-without-navigation";

type LatLng = { lat: number; lng: number };

const scalesByZoomLevel: Record<number, string> = {
  0: "1 : 500,000,000",
  1: "1 : 250,000,000",
  2: "1 : 150,000,000",
  3: "1 : 70,000,000",
  4: "1 : 35,000,000",
  5: "1 : 15,000,000",
  6: "1 : 10,000,000",
  7: "1 : 4,000,000",
  8: "1 : 2,000,000",
  9: "1 : 1,000,000",
  10: "1 : 500,000",
  11: "1 : 250,000",
  12: "1 : 150,000",
  13: "1 : 70,000",
  14: "1 : 35,000",
  15: "1 : 15,000",
  16: "1 : 8,000",
  17: "1 : 4,000",
  18: "1 : 2,000",
  19: "1 : 1,000",
};
const googleMapsApiKey = import.meta.env.VITE_PUBLIC_GOOGLE_MAPS_API_KEY;

const googleMapsLibraries: Libraries = ["places"];

const maxMapViewBounds: LatLngBoundsExpression = [
  [4, 2.5],
  [14, 15],
];

const defaultZoom = 6;

const defaultCenter = { lat: 9.1715156, lng: 4.0128317 };

const markerIcon = L.icon({
  iconSize: [40, 50],
  // iconAnchor: [20, 50],
  // popupAnchor: [0, -50],
  iconUrl: "/marker.png",
});

export const markerProps = {
  autoPan: true,
  draggable: true,
  icon: markerIcon,
};

// function Loader() {
//   return (
//     <div className="h-full flex p-4">
//       <Spinner className="m-auto" size="sm" />
//     </div>
//   );
// }

// function LoadError() {
//   return (
//     <div className="h-full flex">
//       <div className="m-auto flex flex-col items-center justify-center space-y-2">
//         <p className="text-center">An error occurred.</p>

//         <Button
//           size="sm"
//           className="w-fit"
//           onClick={() => window.location.reload()}
//         >
//           Retry
//         </Button>
//       </div>
//     </div>
//   );
// }

enum GeolocationPositionErrorCode {
  PERMISSION_DENIED = 1,
  POSITION_UNAVAILABLE = 2,
  TIMEOUT = 3,
}

function getCurrentPosition() {
  return Effect.async<never, GeolocationPositionError, GeolocationPosition>(
    (resume) => {
      navigator.geolocation.getCurrentPosition(
        (position) => resume(Effect.succeed(position)),
        (error) => resume(Effect.fail(error))
      );
    }
  );
}

function toNumber(n: string | null) {
  return pipe(
    O.fromNullable(n),
    O.map(parseFloat),
    O.filter((_) => !Number.isNaN(_))
  );
}

// function stringToNumber(str: string | null) {
//   const val =
//     typeof str === "string" && str.trim() !== ""
//       ? Number(str)
//       : typeof str === "number"
//       ? str
//       : null;

//   return val !== null && Number.isNaN(val) ? null : val;
// }

function parseLatLng(str: string | null) {
  return pipe(
    O.fromNullable(str),
    O.map(S.split(",")),
    O.map(([lat, lng]) => ({ lat: toNumber(lat), lng: toNumber(lng) })),
    O.flatMap(O.all)
  );
}

function useURLSearchParams() {
  const navigation = useNavigation();

  const [search, setSearch] = useSearchParams();

  return [
    useMemo(
      () =>
        navigation.location
          ? new URLSearchParams(navigation.location.search)
          : search,
      [search, navigation.location]
    ),
    setSearch,
  ] as const;
}

export function MapPage() {
  const zoom = defaultZoom;

  const { lat, lng } = defaultCenter;

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey,
    libraries: googleMapsLibraries,
  });

  const [cursor, setCursor] = useState(() => {
    return { lat, lng, z: zoom };
  });
  const mapRef = useRef<L.Map | null>(null);
  const [map, setMap] = useState<L.Map | null>(null);
  const isLargeScreen = useMediaQuery("(min-width: 1024px)");
  const [showStreetview, setShowStreetview] = useState<LatLng | null>(null);
  const [markerLatlng, setLatLng] = useState(() => {
    return new L.LatLng(lat, lng);
  });

  const markerRef = useRef<L.Marker | null>(null);
  const toast = useToast();
  const [search, setSearch] = useURLSearchParams();

  console.log(isLoaded);

  const markerEventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;

        if (marker) {
          const latlng = marker.getLatLng();

          setLatLng(latlng);

          map?.setView(latlng);

          setSearch((search) => {
            search.set("p", `${latlng.lat},${latlng.lng}`);
            search.delete("d");
            return search;
          });
        }
      },
    }),
    [map, setSearch]
  );

  const onSearch = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      const form = new FormData(e.target as HTMLFormElement);

      pipe(
        O.fromNullable(form.get("query")),
        O.map((_) => _.toString()),
        O.flatMap(parseLatLng),
        O.match({
          onNone: () => {},
          onSome: ({ lat, lng }) => {
            const latlng = new L.LatLng(lat, lng);

            setLatLng(latlng);
            map?.flyTo(latlng, 16);

            setSearch((search) => {
              search.set("p", `${lat},${lng}`);
              return search;
            });
          },
        })
      );
    },
    [map, setSearch]
  );

  const onAutocompletePlaceChange = useCallback(
    (loc: google.maps.LatLng) => {
      const lat = loc.lat();
      const lng = loc.lng();

      setSearch((search) => {
        search.set("p", `${lat},${lng}`);
        search.delete("d");
        return search;
      });

      const latlng = new L.LatLng(lat, lng);
      setLatLng(latlng);
      map?.flyTo(latlng, 16);
    },
    [map, setSearch]
  );

  console.log(showStreetview?.lat, showStreetview?.lng);

  const onCurrentLocation = useCallback(() => {
    pipe(
      getCurrentPosition(),
      Effect.tap(({ coords }) => {
        return Effect.sync(() => {
          const { latitude, longitude } = coords;

          setSearch((search) => {
            search.set("p", `${latitude},${longitude}`);
            search.delete("d");

            return search;
          });

          const latlng = new L.LatLng(latitude, longitude);
          setLatLng(latlng);

          map?.flyTo(latlng, 16);
        });
      }),
      Effect.tapError((err) => {
        return Effect.sync(() => {
          const description =
            err.code === GeolocationPositionErrorCode.PERMISSION_DENIED
              ? "Please grant the location permission to search using your location"
              : err.code === GeolocationPositionErrorCode.POSITION_UNAVAILABLE
              ? "Encountered an error with your GPS device"
              : "An error occured while trying to get your current location";

          toast({
            status: "error",
            description: `${err.message}. ${description}`,
          });
        });
      }),
      Effect.runFork
    );
  }, [map, toast, setSearch]);

  const onMouseMove = useCallback((e: L.LeafletMouseEvent) => {
    const { lat, lng } = e.latlng;
    setCursor((_) => ({ ..._, lat, lng }));
  }, []);

  const onZoomChange = useCallback(() => {
    const map = mapRef.current;

    if (map) {
      const z = map.getZoom();
      setCursor((_) => ({ ..._, z }));
      updateURLSearchWithoutNavigation("z", z.toString());
    }
  }, []);

  const streetview = useMemo(() => {
    return showStreetview ? (
      <Popup
        autoPan
        autoClose={false}
        closeButton={false}
        closeOnClick={false}
        position={[showStreetview.lat, showStreetview.lng]}
      >
        <motion.div
          layoutId="streetview"
          className="h-[20rem] streetview-popup space-y-3 flex flex-col"
        >
          <StreetView
            latitude={showStreetview.lat}
            longitude={showStreetview.lng}
            key={`${showStreetview.lat}:${showStreetview.lat}`}
          />

          <Button
            size="sm"
            className="w-full"
            onClick={() => setShowStreetview(null)}
          >
            Close
          </Button>
        </motion.div>
      </Popup>
    ) : null;
  }, [showStreetview]);

  useEffect(() => {
    let layer: L.Layer | undefined;
    let control: L.Control.Layers | undefined;

    if (map && isLoaded) {
      import("./google-maps").then(({ baseMaps, googleRoad }) => {
        const options = { collapsed: true, position: "topright" };

        control = L.control
          .layers(baseMaps, undefined, options as any)
          .addTo(map);

        layer = googleRoad as L.Layer;

        map.addLayer(layer);
      });
    }

    return () => {
      control?.remove();
      if (layer) map?.removeLayer(layer);
    };
  }, [map, isLoaded]);

  useEffect(() => {
    mapRef.current = map;
  }, [map]);

  useEffect(() => {
    map?.on("mousemove", onMouseMove);
    return () => {
      map?.off("mousemove", onMouseMove);
    };
  }, [map, onMouseMove]);

  useEffect(() => {
    map?.on("zoomend", onZoomChange);
    return () => {
      map?.off("zoomend", onZoomChange);
    };
  }, [map, onZoomChange]);

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
          >
            <div className="p-16 lg:p-4 lg:w-[20%]">
              <Search
                onSubmit={onSearch}
                google_maps_loaded={isLoaded}
                onCurrentLocation={onCurrentLocation}
                onAutocomplete={onAutocompletePlaceChange}
              />
            </div>
            <ZoomControl position={isLargeScreen ? "bottomright" : "topleft"} />

            {streetview}

            {markerLatlng ? (
              <Marker
                {...markerProps}
                ref={markerRef}
                key={`${lat}-${lng}`}
                position={markerLatlng}
                eventHandlers={markerEventHandlers}
              >
                <Popup>
                  <motion.div layoutId="streetview">
                    <div className="flex justify-between text-white gap-4">
                    <Button
                      as={Link}

                      size="sm"
                      className=""
                      onClick={() => setShowStreetview({ lat, lng })}
                    >
                      Street View
                    </Button>

                    <Button as={Link} size="sm" className="" to="/">
                      save
                    </Button>

                    </div>      
                  </motion.div>
                </Popup>
              </Marker>
            ) : null}
          </MapContainer>
        ) : (
          <div className="h-full flex flex-col">
            <div className="m-auto">
              <Spinner />
            </div>
          </div>
        )}

        <div className={styles.coordinates_preview}>
          <p>
            <span>Lat-Lng:&nbsp;</span>
            <span>
              {cursor.lat.toFixed(5)}, {cursor.lng.toFixed(5)}
            </span>
          </p>

          <p>
            <span>Scale:&nbsp;</span>
            <span>{scalesByZoomLevel[Math.round(cursor.z)]}</span>
          </p>

          <p>
            <span>Zoom:&nbsp;</span>
            <span>{cursor.z}</span>
          </p>
        </div>
      </main>

      <div tabIndex={-1} className="active-region" />
    </>
  );
}
