import { bookings, consultation, pets, specialists, walkers } from './data.js';

const key = 'pawlink.app.v1';
const demos = {
  owner: { id: 'demo-owner', name: 'Bob Williams', role: 'owner' },
  walker: { id: 'demo-walker', name: 'Frank Lopez', role: 'walker' },
  specialist: { id: 'demo-specialist', name: 'Grace Taylor', role: 'specialist' }
};

function read(storageKey, fallback) {
  try {
    return JSON.parse(localStorage.getItem(storageKey)) ?? fallback;
  } catch {
    return fallback;
  }
}

export const state = read(key, {
  accounts: {},
  active: null,
  profiles: {},
  filters: { zone: '', date: '', time: '', minutes: 30, max: 25, rating: 4.5, verified: true, large: false, photos: false, order: 'rating' },
  ownerData: {},
  onboarding: {},
  bookingDraft: null,
  lastBooking: null
});

export function save() {
  localStorage.setItem(key, JSON.stringify(state));
}

export function account() {
  return Object.values(demos).find(item => item.id === state.active)
    || Object.values(state.accounts).find(item => item.id === state.active)
    || null;
}

export function person(fallback = 'owner') {
  return account() || demos[fallback];
}

export function useDemo(role) {
  state.active = demos[role].id;
  save();
}

export function accountData(p = person()) {
  return state.ownerData[p.id] ??= {
    pets: p.id === 'demo-owner' ? structuredClone(pets) : [],
    bookings: ['demo-owner', 'demo-walker'].includes(p.id) ? structuredClone(bookings).filter(item => p.role !== 'walker' || item.provider === p.name) : [],
    consultations: p.id === 'demo-specialist' ? [structuredClone(consultation)] : []
  };
}

export function profile(p = person()) {
  return state.profiles[p.id] ??= {};
}

async function passwordDigest(password, salt) {
  const bytes = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', bytes.encode(password), 'PBKDF2', false, ['deriveBits']);
  const digest = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', iterations: 120_000, salt: bytes.encode(salt) }, key, 256);
  return Array.from(new Uint8Array(digest), n => n.toString(16).padStart(2, '0')).join('');
}

export async function register({ name, email, password, phone, role }) {
  email = email.trim().toLowerCase();
  if (Object.hasOwn(state.accounts, email)) throw new Error('Ya existe una cuenta con ese correo en este navegador.');
  const salt = crypto.randomUUID();
  const digest = await passwordDigest(password, salt);
  const user = { id: crypto.randomUUID(), name: name.trim(), email, phone, role, salt, digest };
  state.accounts[email] = user;
  state.active = user.id;
  save();
  return user;
}

export async function logIn({ email, password }) {
  const user = state.accounts[email.trim().toLowerCase()];
  if (!user || await passwordDigest(password, user.salt) !== user.digest) {
    throw new Error('Correo o contraseña incorrectos. Revisa los datos o prueba con una cuenta de demostración.');
  }
  state.active = user.id;
  save();
  return user;
}

export function directoryProviders(role) {
  const source = role === 'walker' ? walkers : specialists;
  const localProviders = Object.values(state.accounts).filter(user => {
    const info = state.profiles[user.id];
    return user.role === role && Number(info?.rate) > 0 && (role !== 'walker' || info.shifts?.some(day => day.length));
  }).map(user => {
    const info = state.profiles[user.id];
    return { id:user.id, ownerId:user.id, name:user.name, description:info.biography || '', photo:info.photo,
      years:Number(info.experience || 0), rate:Number(info.rate), credentials:info.credentials || 'Sin certificaciones registradas',
      districts:info.districts || [], shifts:info.shifts, available:'Consulta su disponibilidad', verified:false, large:false,
      rating:0, reviews:0, photos:false, topic:info.topic || 'Comportamiento animal' };
  });
  return [...source.map(item => ({ ...item, verified:true, ownerId: item.id === 'grace' ? 'demo-specialist' : item.id === 'frank' ? 'demo-walker' : null })),...localProviders];
}

export function openWalkList() {
  const p = person('walker');
  const items = Object.values(state.ownerData).flatMap(data => data.bookings).filter(item => item.providerId === p.id
    || (p.id === 'demo-walker' && !item.providerId && item.provider === 'Frank Lopez'));
  if (p.id === 'demo-walker') items.unshift(...accountData(p).bookings);
  const unique = new Map(items.map(item => [item.id,item]));
  const gpsWalks = read('pawlink.walks.v1', {}).walks || [];
  return [...unique.values()].map(item => gpsWalks.some(walk => walk.bookingId === item.id)
    ? { ...item, status: 'completed' } : item);
}

export function availableSlot(walker, date, time, minutes = 30) {
  if (!date || !time || !walker.shifts) return true;
  const day = (new Date(date+'T12:00:00Z').getUTCDay() + 6) % 7;
  const absolute = value => Number(value.slice(0,2)) * 60 + Number(value.slice(3,5));
  const start = absolute(time);
  return (walker.shifts[day] || []).some(shift => absolute(shift.from) <= start && start + minutes <= absolute(shift.to));
}

export function updateBooking(id, status) {
  Object.values(state.ownerData).forEach(data => {
    const booking = data.bookings.find(item => item.id === id);
    if (booking) booking.status = status;
  });
  save();
}
