import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { routeSegments } from './walk.js';

export function createWalkMap(element, tileMessage) {
  const map = L.map(element, { scrollWheelZoom: false }).setView([-12.1289, -77.0278], 15);
  map.attributionControl.setPrefix(false);
  map.zoomControl.zoomInTitle = 'Acercar';
  map.zoomControl.zoomOutTitle = 'Alejar';
  for (const [selector, label] of [['.leaflet-control-zoom-in', 'Acercar'], ['.leaflet-control-zoom-out', 'Alejar']]) {
    const control = element.querySelector(selector);
    control.title = label;
    control.setAttribute('aria-label', label);
  }

  const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);
  let failedTiles = 0;
  tiles.on('loading', () => { failedTiles = 0; });
  tiles.on('tileerror', () => { failedTiles += 1; });
  tiles.on('load', () => { tileMessage.hidden = failedTiles === 0; });

  const underlay = L.polyline([], { color: '#fff', weight: 9, opacity: .9, interactive: false }).addTo(map);
  const line = L.polyline([], { color: '#047857', weight: 5, opacity: 1, interactive: false }).addTo(map);
  const markers = L.layerGroup().addTo(map);
  let first;
  let last;

  function draw(points) {
    const segments = routeSegments(points);
    underlay.setLatLngs(segments);
    line.setLatLngs(segments);
    markers.clearLayers();
    first = points[0];
    last = points.at(-1);
    if (!first) return;
    L.circleMarker([first.lat, first.lng], {
      radius: 7, color: '#fff', fillColor: '#047857', fillOpacity: 1, weight: 3
    }).bindTooltip('Inicio').addTo(markers);
    if (points.length > 1) {
      L.circleMarker([last.lat, last.lng], {
        radius: 7, color: '#fff', fillColor: '#1d4ed8', fillOpacity: 1, weight: 3
      }).bindTooltip('Último punto').addTo(markers);
    }
  }

  function fit() {
    if (!first) return;
    if (first === last) {
      map.setView([first.lat, first.lng], 17);
      return;
    }
    map.fitBounds(line.getBounds(), { padding: [30, 36], maxZoom: 17 });
  }

  function follow() {
    if (last && !map.getBounds().pad(-.18).contains([last.lat, last.lng])) {
      map.panTo([last.lat, last.lng]);
    }
  }

  return { draw, fit, follow };
}
