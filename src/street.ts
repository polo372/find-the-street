import { latLngBounds } from "leaflet";

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

export const initializeStreetForCity = async (city: string): Promise<void> => {
  const query = `
  [out:json];
area[name="${city}"][admin_level=8]->.searchArea;
(
  // Highways
  way["highway"="primary"](area.searchArea);
  way["highway"="secondary"](area.searchArea);
  way["highway"="tertiary"](area.searchArea);

  // Mairie
  node["amenity"="townhall"](area.searchArea);
  way["amenity"="townhall"](area.searchArea);
  relation["amenity"="townhall"](area.searchArea);

  // Palais de justice
  node["amenity"="courthouse"](area.searchArea);
  way["amenity"="courthouse"](area.searchArea);
  relation["amenity"="courthouse"](area.searchArea);

  // Cathédrale
  node["building"="cathedral"](area.searchArea);
  way["building"="cathedral"](area.searchArea);
  relation["building"="cathedral"](area.searchArea);

  // Hôpitaux
  node["amenity"="hospital"](area.searchArea);
  way["amenity"="hospital"](area.searchArea);
  relation["amenity"="hospital"](area.searchArea);

  // Cinémas
  node["amenity"="cinema"](area.searchArea);
  way["amenity"="cinema"](area.searchArea);
  relation["amenity"="cinema"](area.searchArea);

  // Gares
  node["railway"="station"](area.searchArea);
  way["railway"="station"](area.searchArea);
  relation["railway"="station"](area.searchArea);
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
