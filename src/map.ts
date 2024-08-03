import L from "leaflet";

export const createMap = (lat: number, long: number): L.Map => {
  const map = document.createElement("div");
  map.setAttribute("id", "map");
  document.getElementById("app")?.append(map);
  return setupMap(map, lat, long);
};

export const deleteMap = (): void => {
  const map = document.getElementById("map");
  map?.remove();
};

const setupMap = (
  element: HTMLDivElement,
  lat: number,
  long: number
): L.Map => {
  const map = L.map(element).setView([lat, long], 14);
  L.tileLayer(
    "https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png",
    {
      maxZoom: 19,
    }
  ).addTo(map);
  return map;
};

export const getCenterMapFromCity = async (
  city: string
): Promise<[number, number]> => {
  const query = `
  [out:json];
area[name="${city}"][admin_level=8]->.searchArea;
relation(area.searchArea);
out bb;
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

  const bounds = data.elements[0].bounds as {
    minlat: number;
    minlon: number;
    maxlat: number;
    maxlon: number;
  };
  return [
    (bounds.minlat + bounds.maxlat) / 2,
    (bounds.minlon + bounds.maxlon) / 2,
  ];
};
