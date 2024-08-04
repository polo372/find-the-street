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
