import {
  LatLng,
  latLng,
  latLngBounds,
  LeafletMouseEvent,
  marker,
  polyline,
  Map,
  map,
  tileLayer,
  polygon,
} from "leaflet";
import * as turf from "@turf/turf";
import { Street } from "./street";

export const createMap = (lat: number, long: number): L.Map => {
  const map = document.createElement("div");
  map.setAttribute("id", "map");
  document.getElementById("mapZone")?.append(map);
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
  const myMap = map(element).setView([lat, long], 14);
  tileLayer(
    "https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png",
    {
      maxZoom: 19,
    }
  ).addTo(myMap);
  myMap.doubleClickZoom.disable();
  return myMap;
};

export const displayClickPoint = (event: LeafletMouseEvent, map: Map) => {
  marker(event.latlng).addTo(map);
};
export const drawStreet = (street: Street, map: Map) => {
  (street.type === "landmark"
    ? polygon(street.path, { color: "red" })
    : polyline(street.path, { color: "red" })
  )
    .addTo(map)
    .bindPopup(`Position correcte: ${street.name}`)
    .openPopup();
};

export const getPolygonCenter = (polygonPoints: [number, number][]): LatLng => {
  const bounds = latLngBounds(polygonPoints);
  return bounds.getCenter();
};

export const calculateDistanceToStreetOrLandmark = (
  latlng: LatLng,
  street: Street,
  map: Map
) => {
  if (street.type === "landmark") {
    return isPointInPolygon(latlng, street.path)
      ? 0
      : calculateDistanceToPolygon(latlng, street.path, map);
  } else {
    return calculateDistanceToPolyline([latlng.lat, latlng.lng], street.path);
  }
};

export const isPointInPolygon = (
  point: LatLng,
  polygonPoints: [number, number][]
) => {
  // Turf a besoin d'une boucle fermée
  polygonPoints.push(polygonPoints[0]);
  const polylineGeoJSON = turf.point([point.lng, point.lat]);
  const polygonGeoJSON = turf.polygon([polygonPoints]);

  return turf.booleanWithin(polylineGeoJSON, polygonGeoJSON);
};

export const isPolylineWithinPolygon = (
  polyline: [number, number][],
  polygonPoints: [number, number][]
) => {
  // Turf a besoin d'une boucle fermée
  polygonPoints.push(polygonPoints[0]);
  const polylineGeoJSON = turf.lineString(polyline);
  const polygonGeoJSON = turf.polygon([polygonPoints]);

  return turf.booleanWithin(polylineGeoJSON, polygonGeoJSON);
};

export const calculateDistanceToPolygon = (
  point: LatLng,
  polygon: [number, number][],
  map: Map
) => {
  let minDistance = Infinity;
  polygon.forEach((coord) => {
    const distance = map.distance(point, latLng(coord));
    if (distance < minDistance) {
      minDistance = distance;
    }
  });
  return minDistance;
};

export const calculateDistanceToPolyline = (
  point: [number, number],
  lineCoordinates: [number, number][]
) => {
  const pointGeoJSON = turf.point(point);
  const lineGeoJSON = turf.lineString(lineCoordinates);

  const distance = turf.pointToLineDistance(pointGeoJSON, lineGeoJSON, {
    units: "meters",
  });

  return distance;
};
