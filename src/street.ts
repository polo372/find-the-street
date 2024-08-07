import { latLngBounds } from "leaflet";
import firehouses from "./assets/firehouses.json";

export type Street = {
  name: string;
  path: [number, number][];
  type: "street" | "landmark";
  bounds: Bounds;
};

export type Bounds = {
  maxlat: number;
  maxlon: number;
  minlat: number;
  minlon: number;
};

let streets: Street[] = [];

export const initializeStreetForCity = async (
  firehouseName: string
): Promise<void> => {
  const firehousePolygon = firehouses.find(
    (firehouse: { name: string; polygon: string }) =>
      firehouse.name === firehouseName
  )?.polygon;
  const query = `
  [out:json];
(
  way["highway"="primary"](poly: "${firehousePolygon}");
  way["highway"="secondary"](poly: "${firehousePolygon}");
  way["highway"="tertiary"](poly: "${firehousePolygon}");

  // Mairie
  node["amenity"="townhall"](poly: "${firehousePolygon}");
  way["amenity"="townhall"](poly: "${firehousePolygon}");
  relation["amenity"="townhall"](poly: "${firehousePolygon}");

  // Palais de justice
  node["amenity"="courthouse"](poly: "${firehousePolygon}");
  way["amenity"="courthouse"](poly: "${firehousePolygon}");
  relation["amenity"="courthouse"](poly: "${firehousePolygon}");

  // Cathédrale
  node["building"="cathedral"](poly: "${firehousePolygon}");
  way["building"="cathedral"](poly: "${firehousePolygon}");
  relation["building"="cathedral"](poly: "${firehousePolygon}");

  // Hôpitaux
  node["amenity"="hospital"](poly: "${firehousePolygon}");
  way["amenity"="hospital"](poly: "${firehousePolygon}");
  relation["amenity"="hospital"](poly: "${firehousePolygon}");

  // Cinémas
  node["amenity"="cinema"](poly: "${firehousePolygon}");
  way["amenity"="cinema"](poly: "${firehousePolygon}");
  relation["amenity"="cinema"](poly: "${firehousePolygon}");

  // Gares
  node["railway"="station"](poly: "${firehousePolygon}");
  way["railway"="station"](poly: "${firehousePolygon}");
  relation["railway"="station"](poly: "${firehousePolygon}");
);
out geom;
`;
  const overpassUrl = `https://overpass-api.de/api/interpreter`;

  const response = await fetch(overpassUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `data=${encodeURIComponent(query)}`,
  });
  const data = await response.json();
  const streetMap = new Map<string, Street>();

  data.elements
    .filter((element: any) => !!element.tags.name)
    .filter((element: any) => element.geometry)
    .forEach((element: any) => {
      const type = element.type;
      const name = element.tags.name;
      const bounds = element.bounds;
      const path = element.geometry.map((coord: any) => [coord.lat, coord.lon]);
      if (streetMap.has(name)) {
        streetMap.get(name)!.path.push(...path);
      } else {
        streetMap.set(name, {
          name: name,
          path: path,
          type: type === "way" ? "street" : "landmark",
          bounds,
        });
      }
    });

  streets = Array.from(streetMap.values());
};

export const getRandomStreets = (count: number): Street[] => {
  const streetsTemp = [...streets];
  const selectedStreets = new Set<Street>();
  while (
    selectedStreets.size < count &&
    selectedStreets.size < streetsTemp.length
  ) {
    const randomIndex = Math.floor(Math.random() * streetsTemp.length);
    selectedStreets.add(streetsTemp[randomIndex]);
    streetsTemp.splice(randomIndex, 1);
  }
  return Array.from(selectedStreets);
};

export const displayStreet = (street: Street): void => {
  deleteStreet();
  const streetDiv = document.createElement("div");
  streetDiv.innerHTML = `Chercher: <span>${street.name}</span>`;
  streetDiv.setAttribute("id", "street");
  document.getElementById("app")?.append(streetDiv);
};
export const deleteStreet = (): void => {
  document.getElementById("street")?.remove();
};

export const getCenterMapPoint = (
  streets: Street[]
): [number, number][] | null => {
  const rest = streets
    .map((street) => street.bounds)
    .reduce<null | Bounds>((acc, bounds) => {
      if (!acc) return bounds;
      return {
        maxlat: Math.max(acc.maxlat, bounds.maxlat),
        maxlon: Math.max(acc.maxlon, bounds.maxlon),
        minlat: Math.min(acc.minlat, bounds.minlat),
        minlon: Math.min(acc.minlon, bounds.minlon),
      };
    }, null);

  if (rest === null) return null;
  const bounds = latLngBounds(
    [rest.minlat, rest.minlon],
    [rest.maxlat, rest.maxlon]
  );
  const polygonPoints: [number, number][] = [
    [bounds.getSouthWest().lat, bounds.getSouthWest().lng],
    [bounds.getNorthWest().lat, bounds.getNorthWest().lng],
    [bounds.getNorthEast().lat, bounds.getNorthEast().lng],
    [bounds.getSouthEast().lat, bounds.getSouthEast().lng],
  ];
  return polygonPoints;
};
