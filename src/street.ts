export type Street = {
  name: string;
  path: [number, number][];
  type: "street" | "landmark";
};

let streets: Street[] = [];

export const initializeStreetForCity = async (city: string): Promise<void> => {
  const query = `
  [out:json];
area[name="${city}"][admin_level=8]->.searchArea;
(
  // Highways
  way["highway"](area.searchArea);
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
    .forEach((element: any) => {
      const type = element.type;
      const name = element.tags.name;
      const path = element.geometry.map((coord: any) => [coord.lat, coord.lon]);
      if (streetMap.has(name)) {
        streetMap.get(name)!.path.push(...path);
      } else {
        streetMap.set(name, {
          name: name,
          path: path,
          type: type === "way" ? "street" : "landmark",
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
