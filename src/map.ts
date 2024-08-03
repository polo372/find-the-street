import L from "leaflet";

export const createMap = (): L.Map => {
  const map = document.createElement("div");
  map.setAttribute("id", "map");
  document.getElementById("app")?.append(map);
  return setupMap(map);
};

export const deleteMap = (): void => {
  const map = document.getElementById("map");
  map?.remove();
};

function setupMap(element: HTMLDivElement): L.Map {
  const map = L.map(element).setView([47.3936, 0.6848], 14);
  L.tileLayer(
    "https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png",
    {
      maxZoom: 19,
    }
  ).addTo(map);
  return map;
}
