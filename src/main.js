import '@fontsource-variable/inter';
import './styles.css';
import { createWalkMap } from './map.js';
import { addPosition, sample } from './walk.js';

const get = id => document.getElementById(id);
const storeKey = 'pawlink.walks.v1';
const params = new URLSearchParams(location.search);
const bookingId = params.get('reserva');
const appStoreKey = 'pawlink.app.v1';
const view = Object.fromEntries([
  'map', 'map-title', 'map-description', 'map-status', 'map-message', 'fit-route',
  'distance', 'duration', 'point-count', 'pet-name', 'walk-status', 'walk-help', 'start',
  'pause', 'finish', 'cancel', 'notice', 'history-count', 'empty-history', 'walk-list', 'show-demo'
].map(id => [id, get(id)]));
const map = createWalkMap(view.map, view['map-message']);
const number = new Intl.NumberFormat('es-PE', { maximumFractionDigits: 2 });
const date = new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium', timeStyle: 'short' });
let model = { walks: [], draft: null };
let selected = null;
let watchId;
let resumedAt;
let gpsState = 'idle';

try {
  const saved = JSON.parse(localStorage.getItem(storeKey));
  if (Array.isArray(saved?.walks)) model = saved;
} catch {
  notice('No se pudo abrir el historial del navegador.', 'error');
}

function notice(message, tone = '') {
  view.notice.hidden = !message;
  view.notice.textContent = message;
  view.notice.dataset.tone = tone;
}

function save(next = model) {
  try {
    localStorage.setItem(storeKey, JSON.stringify(next));
    return true;
  } catch {
    notice('No se pudo guardar en este navegador. Libera espacio o habilita el almacenamiento y vuelve a intentarlo.', 'error');
    return false;
  }
}

function showDistance(meters) {
  return meters >= 1000 ? `${number.format(meters / 1000)} km` : `${number.format(Math.round(meters))} m`;
}

function showDuration(milliseconds) {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const clock = `${minutes % 60}:${String(seconds % 60).padStart(2, '0')}`;
  return minutes < 60 ? clock : `${Math.floor(minutes / 60)}:${clock.padStart(5, '0')}`;
}

function elapsed(walk) {
  return walk.duration + (walk === model.draft && resumedAt ? Math.max(0, Date.now() - resumedAt) : 0);
}

function renderMetrics() {
  const walk = model.draft || selected;
  view.distance.textContent = showDistance(walk?.meters || 0);
  view.duration.textContent = showDuration(walk ? elapsed(walk) : 0);
  view['point-count'].textContent = walk?.points.length || 0;
}

function renderControls() {
  const { draft } = model;
  const hasPoints = Boolean(draft?.points.length);
  const running = watchId !== undefined;
  const statuses = {
    idle: ['GPS inactivo', 'LISTO', ''],
    waiting: ['Buscando GPS', 'BUSCANDO', 'wait'],
    live: ['GPS en vivo', 'EN CURSO', 'live'],
    weak: ['Señal débil', 'GPS DÉBIL', 'wait'],
    paused: ['En pausa', 'EN PAUSA', 'wait'],
    history: ['Recorrido guardado', 'LISTO', ''],
    example: ['Recorrido de ejemplo', 'LISTO', '']
  };
  const [mapText, walkText, tone] = statuses[gpsState];
  view['map-status'].textContent = mapText;
  view['map-status'].dataset.tone = tone;
  view['walk-status'].textContent = walkText;
  view['walk-status'].dataset.tone = tone;
  view['map-title'].textContent = selected ? selected.name : 'Mapa del paseo';
  view['map-description'].textContent = selected === sample ? 'Ruta de muestra en Miraflores, Lima.'
    : selected ? date.format(selected.startedAt)
      : 'La ruta se dibujará con los puntos GPS de tu paseo.';
  view['pet-name'].disabled = Boolean(draft);
  if (draft) view['pet-name'].value = draft.name;
  view.start.textContent = draft ? 'Continuar' : 'Empezar';
  view.start.hidden = running;
  view.pause.hidden = !running || !hasPoints;
  view.finish.hidden = !hasPoints;
  view.cancel.hidden = !draft || hasPoints;
  view['fit-route'].disabled = !(draft || selected)?.points.length;
  view['show-demo'].disabled = Boolean(draft);
}

function responsiveIcon(name) {
  const picture = document.createElement('picture');
  const source = document.createElement('source');
  source.media = '(max-width: 650px)';
  source.srcset = `/figma/${name}-mobile.svg`;
  const image = document.createElement('img');
  image.src = `/figma/${name}-desktop.svg`;
  image.alt = '';
  picture.append(source, image);
  return picture;
}

function renderHistory() {
  view['history-count'].textContent = model.walks.length;
  view['empty-history'].hidden = model.walks.length > 0;
  view['walk-list'].replaceChildren(...model.walks.map(walk => {
    const item = document.createElement('li');
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'history-item';
    button.dataset.id = walk.id;
    button.disabled = Boolean(model.draft);
    button.setAttribute('aria-pressed', String(selected?.id === walk.id));
    const details = document.createElement('span');
    const name = document.createElement('strong');
    name.textContent = walk.name;
    const caption = document.createElement('small');
    caption.append(responsiveIcon('calendar'), `${date.format(walk.startedAt)} · ${showDistance(walk.meters)}`);
    details.append(name, caption);
    button.append(details, responsiveIcon('arrow'));
    button.addEventListener('click', () => showWalk(walk));
    item.append(button);
    return item;
  }));
}

function showWalk(walk) {
  if (model.draft) return;
  selected = walk;
  gpsState = walk === sample ? 'example' : 'history';
  notice('');
  map.draw(walk.points);
  map.fit();
  renderControls();
  renderMetrics();
  for (const button of view['walk-list'].querySelectorAll('button')) {
    button.setAttribute('aria-pressed', String(button.dataset.id === walk.id));
  }
  view['map-title'].scrollIntoView({ block: 'nearest' });
}

function receivePosition(position) {
  if (watchId === undefined || !model.draft) return;
  const walk = model.draft;
  const result = addPosition(walk, position);
  gpsState = result === 'imprecise' ? 'weak' : 'live';
  if (result === 'imprecise') {
    notice('Esperando una ubicación con mejor precisión. Intenta caminar al aire libre.', 'error');
  } else {
    notice('');
  }
  if (result === 'added') {
    resumedAt ||= Date.now();
    walk.duration = elapsed(walk);
    resumedAt = Date.now();
    save();
    map.draw(walk.points);
    if (walk.points.length === 1) map.fit();
    else map.follow();
  }
  renderControls();
  renderMetrics();
}

function stopWatch() {
  if (watchId !== undefined) navigator.geolocation.clearWatch(watchId);
  watchId = undefined;
  if (model.draft && resumedAt) model.draft.duration = elapsed(model.draft);
  resumedAt = undefined;
}

function positionError(error) {
  if (watchId === undefined) return;
  if (error.code === 1) {
    stopWatch();
    gpsState = 'paused';
    save();
    notice('Activa el permiso de ubicación para este sitio y vuelve a intentarlo.', 'error');
  } else {
    gpsState = 'weak';
    notice('El GPS aún no responde. Verifica que la ubicación esté activada o vuelve a intentarlo al aire libre.', 'error');
  }
  renderControls();
}

function startWalk() {
  const name = view['pet-name'].value.trim();
  if (!name) {
    notice('Escribe el nombre de tu mascota.', 'error');
    view['pet-name'].focus();
    return;
  }
  if (!window.isSecureContext || !navigator.geolocation) {
    notice('Abre PawLink por HTTPS en un navegador compatible para activar el GPS.', 'error');
    return;
  }
  const walk = model.draft || {
    id: crypto.randomUUID(), name, bookingId, startedAt: Date.now(), duration: 0, meters: 0, points: [], segment: 0
  };
  if (walk.points.length) walk.segment += 1;
  model.draft = walk;
  selected = null;
  gpsState = 'waiting';
  notice('Buscando tu ubicación…');
  save();
  map.draw(walk.points);
  watchId = navigator.geolocation.watchPosition(receivePosition, positionError, {
    enableHighAccuracy: true, timeout: 15000, maximumAge: 0
  });
  renderControls();
  renderHistory();
  renderMetrics();
}

function pauseWalk() {
  stopWatch();
  gpsState = 'paused';
  notice('Paseo en pausa. Puedes continuar o guardar el recorrido.');
  save();
  renderControls();
  renderMetrics();
  view.start.focus();
}

function completeBooking(id) {
  if (!id) return;
  try {
    const app = JSON.parse(localStorage.getItem(appStoreKey));
    if (!app?.ownerData) return;
    for (const account of Object.values(app.ownerData)) {
      const booking = account.bookings.find(item => item.id === id);
      if (booking?.status === 'confirmed') booking.status = 'completed';
    }
    localStorage.setItem(appStoreKey, JSON.stringify(app));
  } catch {
    // The walk itself is already saved in the GPS history.
  }
}

function finishWalk() {
  if (!model.draft?.points.length) return;
  stopWatch();
  const { draft } = model;
  const next = { draft: null, walks: [draft, ...model.walks] };
  if (!save(next)) {
    gpsState = 'paused';
    renderControls();
    return;
  }
  model = next;
  completeBooking(draft.bookingId);
  showWalk(draft);
  renderHistory();
  notice('Paseo guardado en este navegador.');
  view['walk-list'].querySelector('button')?.focus({ preventScroll: true });
}

function cancelWalk() {
  stopWatch();
  model.draft = null;
  gpsState = 'idle';
  notice('');
  save();
  map.draw([]);
  renderControls();
  renderHistory();
  renderMetrics();
  view.start.focus();
}

view.start.addEventListener('click', startWalk);
view.pause.addEventListener('click', pauseWalk);
view.finish.addEventListener('click', finishWalk);
view.cancel.addEventListener('click', cancelWalk);
view['fit-route'].addEventListener('click', map.fit);
view['show-demo'].addEventListener('click', () => showWalk(sample));
window.addEventListener('pagehide', () => {
  if (!model.draft) return;
  stopWatch();
  gpsState = 'paused';
  save();
  renderControls();
});
if (params.get('mascota') && !model.draft) view['pet-name'].value = params.get('mascota').slice(0, 48);
if (model.draft) {
  gpsState = 'paused';
  map.draw(model.draft.points);
  map.fit();
  notice('Tienes un paseo pendiente. Puedes continuarlo desde aquí.');
}
renderControls();
renderHistory();
renderMetrics();
setInterval(renderMetrics, 1000);
