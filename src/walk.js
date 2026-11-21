const EARTH_RADIUS = 6_371_000;
const radians = degrees => degrees * Math.PI / 180;

export function distanceBetween(a, b) {
  const latDifference = radians(b.lat - a.lat);
  const lngDifference = radians(b.lng - a.lng);
  const chord = Math.sin(latDifference / 2) ** 2
    + Math.cos(radians(a.lat)) * Math.cos(radians(b.lat)) * Math.sin(lngDifference / 2) ** 2;
  return 2 * EARTH_RADIUS * Math.asin(Math.sqrt(Math.min(1, chord)));
}

export function addPosition(walk, { coords, timestamp }) {
  const { latitude: lat, longitude: lng, accuracy } = coords;
  if (![lat, lng, accuracy, timestamp].every(Number.isFinite)
    || Math.abs(lat) > 90 || Math.abs(lng) > 180 || accuracy > 50 || accuracy < 0) {
    return 'imprecise';
  }

  const next = { lat, lng, timestamp, segment: walk.segment };
  const previous = walk.points.at(-1);
  if (previous?.segment === next.segment) {
    const distance = distanceBetween(previous, next);
    const seconds = (timestamp - previous.timestamp) / 1000;
    if (seconds <= 0 || distance < Math.max(5, accuracy / 2) || distance / seconds > 12) {
      return 'unchanged';
    }
    walk.meters += distance;
  }
  walk.points.push(next);
  return 'added';
}

export function routeSegments(points) {
  const segments = [];
  let previousSegment;
  for (const point of points) {
    if (point.segment !== previousSegment) {
      segments.push([]);
      previousSegment = point.segment;
    }
    segments.at(-1).push([point.lat, point.lng]);
  }
  return segments;
}

const samplePoints = [
  [-12.12816, -77.02735], [-12.12837, -77.02770], [-12.12869, -77.02821],
  [-12.12904, -77.02861], [-12.12935, -77.02836], [-12.12985, -77.02790],
  [-12.12960, -77.02753], [-12.12920, -77.02701], [-12.12888, -77.02657],
  [-12.12849, -77.02690]
].map(([lat, lng]) => ({ lat, lng, segment: 0 }));

export const sample = {
  id: 'example',
  name: 'Paseo de ejemplo',
  duration: 8 * 60 * 1000,
  meters: samplePoints.slice(1).reduce((sum, point, index) => sum + distanceBetween(samplePoints[index], point), 0),
  points: samplePoints
};
