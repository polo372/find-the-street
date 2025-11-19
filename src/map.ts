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
  street.path.forEach((segment) => {
    (street.type === "landmark"
      ? polygon(segment, { color: "red" })
      : polyline(segment, { color: "red" })
    ).addTo(map);
  });

  // Bind popup to the first segment or a central marker?
  // For simplicity, let's just add a marker at the center of the first segment for the popup
  // or just attach it to the last added shape.
  // Better: just show the popup on the first segment.
  const firstSegment = street.path[0];
  if (firstSegment) {
    // We don't need to add it again, but we need a reference to open popup.
    // Actually, let's just use a marker for the popup to be clean.
    // Or simply bind to the first segment drawn.
    // Let's keep it simple:
    // The loop above adds all segments.
    // We can just open a popup at the center of the first segment.
    const center = latLngBounds(firstSegment).getCenter();
    marker(center, { opacity: 0 }) // Invisible marker for popup
      .addTo(map)
      .bindPopup(`Position correcte: ${street.name}`)
      .openPopup();
  }
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
  let minDistance = Infinity;

  street.path.forEach((segment) => {
    let distance = Infinity;
    if (street.type === "landmark") {
      distance = isPointInPolygon(latlng, segment)
        ? 0
        : calculateDistanceToPolygon(latlng, segment, map);
    } else {
      distance = calculateDistanceToPolyline([latlng.lat, latlng.lng], segment);
    }
    if (distance < minDistance) {
      minDistance = distance;
    }
  });

  return minDistance;
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
