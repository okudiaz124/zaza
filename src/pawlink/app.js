import '@fontsource-variable/inter';
import './app.css';
import { days, durations, roles } from './data.js';
import {
  account, accountData, availableSlot, directoryProviders, logIn, openWalkList, person, profile, register, save, state, updateBooking, useDemo
} from './state.js';
import { avatar, bottomNav, esc, flash, footer, header, link, resultsEmpty } from './ui.js';
import { about, authPage, help, home } from './public-pages.js';
import {
  bookingComplete, bookingDetails, bookingRecord, bookingSummary, directoryResults, specialistDirectory, specialistPublic,
  updateCosts, walkerProfile, walkersPage
} from './marketplace.js';
import {
  consultationDetails, consultationsPage, dashboard, earnings, onboardingPage, personalProfile, petForm, petsPage,
  professionalProfile, reservationsPage, shiftRow, walkPanel
} from './panels.js';

const root = document.getElementById('app');
const defaultFilters = { zone: '', date: '', time: '', minutes: 30, max: 25, rating: 4.5, verified: true, large: false, photos: false, order: 'rating' };
const walkerFor = id => directoryProviders('walker').find(walker => walker.id === id);
const specialistFor = id => directoryProviders('specialist').find(item => item.id === id);
const petFor = id => accountData().pets.find(pet => pet.id === id);
const consultFor = id => accountData().consultations.find(entry => entry.id === id);

function navigate(url, replace = false) {
  history[replace ? 'replaceState' : 'pushState']({}, '', url);
  render();
  if (location.hash) document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView();
  else window.scrollTo({ top: 0, behavior: 'instant' });
}

function notFound() {
  return `<main class="shell info-page">${resultsEmpty('Página no encontrada','La página solicitada no está disponible.',link('Ir al inicio','/'))}</main>`;
}

function routing(path, params) {
  const [first, second, third, fourth] = path.split('/').slice(1);
  const current = account();
  const ownerOnly = ['mascotas','reservas','reservar'].includes(first);
  const walkerOnly = ['mis-paseos','ganancias'].includes(first) || (first === 'perfil' && second === 'paseador');
  const specialistOnly = first === 'perfil' && second === 'especialista';
  if (current && ((ownerOnly && current.role !== 'owner') || (walkerOnly && current.role !== 'walker')
    || (specialistOnly && current.role !== 'specialist'))) {
    return { title:'Panel de control', role:current.role, html:`<main class="shell info-page">${resultsEmpty(
      'Esta función pertenece a otro tipo de cuenta','Puedes seguir desde el panel de tu cuenta.',link('Ir a mi panel','/panel'))}</main>` };
  }
  const role = current?.role || (walkerOnly ? 'walker' : specialistOnly || first === 'consultas' ? 'specialist' : 'owner');
  let route = {};
  switch (first) {
    case '': route = { title:'PawLink', html:home(), publicNav:true }; break;
    case 'nosotros': route = { title:'Nosotros', html:about(), publicNav:true }; break;
    case 'iniciar-sesion': route = { title:'Iniciar Sesión', html:authPage(false), publicNav:true }; break;
    case 'registro': route = { title:'Crea tu cuenta', html:authPage(true,params.get('rol') || 'owner'), publicNav:true }; break;
    case 'paseadores': route = { title:'Buscar paseadores', html:walkersPage(), publicNav:!current }; break;
    case 'paseador': {
      const walker = walkerFor(second);
      if (walker) route = { title:walker.name, html:walkerProfile(walker), publicNav:!current };
      break;
    }
    case 'especialistas': route = { title:'Especialistas', html:specialistDirectory(params.get('tema') || params.get('buscar') || ''), publicNav:!current }; break;
    case 'especialista': {
      const specialist = specialistFor(second);
      if (specialist) route = { title:specialist.name, html:specialistPublic(specialist), publicNav:!current };
      break;
    }
    case 'panel': route = { title:'Panel de control', html:dashboard(role), role }; break;
    case 'mascotas': route = { title:'Mis Mascotas', html:petsPage(), role }; break;
    case 'reservas': route = { title:'Mis Reservas', html:reservationsPage(), role }; break;
    case 'mis-paseos': route = { title:'Mis Paseos', html:walkPanel(), role }; break;
    case 'ganancias': route = { title:'Ganancias', html:earnings(), role }; break;
    case 'consultas': {
      const record = second ? consultFor(second) || accountData(person('specialist')).consultations.find(entry => entry.id === second) : null;
      route = { title:second ? 'Detalles de Consulta' : 'Consultas', html:second ? (record ? consultationDetails(record,role) : notFound()) : consultationsPage(role), role };
      break;
    }
    case 'perfil':
      if (second === 'paseador' && third === 'configurar' && [1,2,3].includes(Number(fourth))) {
        route = { title:'Crea tu perfil de paseador', html:onboardingPage(Number(fourth)), role };
      } else if (['paseador','especialista'].includes(second)) {
        route = { title:role === 'walker' ? 'Perfil de Paseador' : 'Perfil de Especialista', html:professionalProfile(role), role };
      } else route = { title:'Perfil', html:current ? personalProfile() : authPage(false), role:current?.role, publicNav:!current };
      break;
    case 'reservar': {
      const draft = state.bookingDraft;
      const walker = walkerFor(params.get('paseador') || draft?.walker || 'daniel');
      if (second === 'detalles' && walker) route = { title:'Reservar paseo', html:bookingDetails(walker), role };
      if (second === 'resumen' && walker && draft?.ownerId === person().id) route = { title:'Revisa tu reserva', html:bookingSummary(walker,draft,petFor(draft.pet)?.name || draft.pet), role };
      const lastBooking = accountData().bookings.find(item => item.id === state.lastBooking);
      if (second === 'confirmacion' && lastBooking) route = { title:'Reserva confirmada', html:bookingComplete(lastBooking), role };
      if (!route.html && walker) route = { title:'Reservar paseo', html:bookingDetails(walker), role };
      break;
    }
    case 'ayuda': route = { title:'Centro de ayuda', html:help(), publicNav:!current }; break;
    default: break;
  }
  return { role:current?.role || route.role, ...route, html:route.html || notFound() };
}

function render() {
  const path = location.pathname.replace(/\/$/,'') || '/';
  const route = routing(path,new URLSearchParams(location.search));
  document.title = route.title && route.title !== 'PawLink' ? `${route.title} · PawLink` : 'PawLink';
  root.innerHTML = header(path,route.publicNav ? null : route.role) + route.html + footer()
    + bottomNav(path,route.role || 'owner',route.publicNav || !route.role)
    + '<dialog id="dialog" aria-labelledby="dialog-title"></dialog>';
}

function dialog(title, html) {
  const element = document.getElementById('dialog');
  element.innerHTML = `<div class="title-row"><h2 id="dialog-title">${title}</h2><button type="button" class="icon-button" data-action="close-dialog" aria-label="Cerrar">×</button></div>${html}`;
  if (!element.open) element.showModal();
}

function menu() {
  const p = account();
  const options = p
    ? [['Mi panel','/panel'],['Mi perfil','/perfil'],['Mis Consultas','/consultas']]
    : [['Inicio','/'],['Iniciar Sesión','/iniciar-sesion'],['Crear Cuenta','/registro']];
  if (p?.role === 'walker') options.push(['Mis Paseos','/mis-paseos'],['Ganancias','/ganancias']);
  if (p?.role === 'owner') options.push(['Mis Mascotas','/mascotas'],['Mis Reservas','/reservas']);
  options.push(['Buscar Paseadores','/paseadores'],['Especialistas','/especialistas'],['Nosotros','/nosotros'],['Seguimiento GPS','/gps.html']);
  dialog(p ? 'Menú de Perfil' : 'PawLink',`<div class="menu-list">
    ${p ? `<div class="row-align">${avatar(p.name)}<div><strong>${esc(p.name)}</strong><p class="muted">${roles[p.role][0]}</p></div></div>` : ''}
    ${options.map(([label,href])=>`<a href="${href}">${label} →</a>`).join('')}
    ${p ? '<button type="button" class="button secondary" data-action="logout">Cerrar sesión</button>' : ''}</div>`);
}

function refreshResults() {
  const element = document.getElementById('directory-results');
  if (element) element.innerHTML = directoryResults();
  const range = document.getElementById('range-value');
  if (range) range.value = 'S/'+state.filters.max;
}

function requireText(value, title) {
  if (!value?.trim()) throw new Error(`Completa ${title}.`);
  return value.trim();
}

function ensureFuture(date, time) {
  if (!date || !time || new Date(date+'T'+time+'-05:00').getTime() <= Date.now()) {
    throw new Error('Selecciona una fecha y hora futuras.');
  }
}

function updatesToConsultation(id, edit) {
  for (const data of Object.values(state.ownerData)) {
    const entry = data.consultations.find(record => record.id === id);
    if (entry) edit(entry);
  }
  save();
}

function smallerPhoto(file) {
  if (file.size > 5 * 1024 * 1024 || !['image/jpeg','image/png'].includes(file.type)) {
    throw new Error('Selecciona una imagen JPG o PNG de hasta 5 MB.');
  }
  return createImageBitmap(file).then(image => {
    const edge = Math.max(image.width,image.height);
    const scale = Math.min(1, 240 / edge);
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1,Math.round(image.width * scale));
    canvas.height = Math.max(1,Math.round(image.height * scale));
    canvas.getContext('2d').drawImage(image,0,0,canvas.width,canvas.height);
    image.close();
    return canvas.toDataURL('image/jpeg',.82);
  });
}

const forms = {
  async register(values) {
    const role = Object.hasOwn(roles,values.role) ? values.role : 'owner';
    values.name = requireText(values.name,'tu nombre');
    await register({ ...values, role });
    navigate(role === 'walker' ? '/perfil/paseador/configurar/1' : role === 'specialist' ? '/perfil/especialista' : '/panel');
    flash('Tu cuenta local está lista.');
  },
  async login(values) {
    await logIn(values);
    navigate('/panel');
  },
  search(values) {
    Object.assign(state.filters,values);
    save();
    render();
  },
  'specialist-search'(values) {
    navigate('/especialistas?buscar='+encodeURIComponent(values.query.trim()));
  },
  'save-pet'(values) {
    const data = accountData();
    const name = requireText(values.name,'el nombre de la mascota');
    const current = data.pets.find(item => item.id === values.id);
    const pet = {...current,...values,name,id:current?.id || crypto.randomUUID()};
    data.pets = current ? data.pets.map(item => item.id === current.id ? pet : item) : [...data.pets,pet];
    save();
    document.getElementById('dialog').close();
    render();
    flash('Mascota guardada.');
  },
  'booking-details'(values) {
    ensureFuture(values.date,values.time);
    const address = requireText(values.address,'la dirección de recojo');
    const pet = requireText(values.pet,'la mascota');
    const walker = walkerFor(values.walker);
    if (!durations.includes(Number(values.minutes)) || !walker) throw new Error('Revisa los datos del paseo.');
    if (!availableSlot(walker,values.date,values.time,Number(values.minutes))) throw new Error('El paseador no tiene disponibilidad en ese horario.');
    state.bookingDraft = { ...values, address, pet, minutes:Number(values.minutes), ownerId:person().id };
    save();
    navigate('/reservar/resumen');
  },
  'booking-confirm'() {
    const draft = state.bookingDraft;
    const walker = walkerFor(draft?.walker);
    if (!draft || !walker || draft.ownerId !== person().id) throw new Error('Vuelve a completar los detalles del paseo.');
    ensureFuture(draft.date,draft.time);
    const booking = bookingRecord(walker,draft,petFor(draft.pet)?.name || draft.pet);
    accountData().bookings.unshift(booking);
    state.lastBooking = booking.id;
    state.bookingDraft = null;
    save();
    navigate('/reservar/confirmacion');
  },
  'consult-request'(values) {
    ensureFuture(values.date,values.time);
    const p = person();
    if (p.role !== 'owner') throw new Error('Las consultas se reservan desde una cuenta de dueño.');
    const item = specialistFor(values.provider);
    if (!item) throw new Error('Selecciona un especialista.');
    const pet = petFor(values.pet);
    const entry = { id:'C-'+crypto.randomUUID(), pet:pet?.name || requireText(values.pet,'la mascota'), breed:pet?.breed,
      owner:p.name, provider:item.name, date:values.date, time:values.time, minutes:45, status:'confirmed', notes:[requireText(values.notes,'el motivo')] };
    accountData(p).consultations.unshift(entry);
    if (item.ownerId) {
      accountData({id:item.ownerId}).consultations.unshift(structuredClone(entry));
    }
    if (!account()) useDemo('owner');
    save();
    navigate('/consultas/'+entry.id);
    flash('Consulta registrada.');
  },
  'consultation-note'(values) {
    if (person('specialist').role !== 'specialist') throw new Error('Solo el especialista puede agregar notas.');
    const text = requireText(values.notes,'la nota');
    updatesToConsultation(values.id, entry => { entry.notes = [...(entry.notes || []),text]; });
    render();
    flash('Nota guardada.');
  },
  account(values) {
    const p = account();
    if (!p) throw new Error('Inicia sesión para guardar tu perfil.');
    const name = requireText(values.name,'tu nombre');
    Object.assign(profile(p),{name,phone:values.phone});
    if (p.email) Object.assign(p,{name,phone:values.phone});
    save();
    render();
    flash('Cambios guardados.');
  },
  professional(values) {
    Object.assign(profile(person(values.role)),values);
    save();
    render();
    flash('¡Perfil actualizado exitosamente!');
  },
  async onboarding(values,form) {
    const p = person('walker');
    const stage = Number(values.stage);
    const info = state.onboarding[p.id] ??= {};
    if (stage === 1) {
      let photo = info.photo;
      if (values.photo.size) photo = await smallerPhoto(values.photo);
      Object.assign(info, { biography:requireText(values.biography,'la biografía'), experience:values.experience,
        rate:values.rate, credentials:values.credentials, photo });
    } else if (stage === 2) {
      const districts = new FormData(form).getAll('districts');
      if (!districts.length) throw new Error('Selecciona por lo menos un distrito.');
      Object.assign(info,{area:values.area,districts,radius:values.radius});
    } else {
      const data = new FormData(form);
      const shifts = days.map((_,index)=> {
        const starts = data.getAll('from-'+index);
        const ends = data.getAll('to-'+index);
        return starts.map((from,shift) => {
          const to = ends[shift];
          if (!from || !to || from >= to) throw new Error('La hora de fin debe ser posterior a la de inicio.');
          const overlap = starts.some((other,otherIndex) => otherIndex !== shift && from < ends[otherIndex] && other < to);
          if (overlap) throw new Error('Los horarios de un mismo día no pueden superponerse.');
          return {from,to};
        });
      });
      if (!shifts.some(day => day.length)) throw new Error('Agrega al menos un horario.');
      info.shifts = shifts;
      Object.assign(profile(p),info);
    }
    save();
    navigate(stage === 3 ? '/perfil/paseador' : '/perfil/paseador/configurar/'+(stage+1));
    if (stage === 3) flash('Perfil de paseador guardado.');
  }
};

const actions = {
  menu,
  'close-dialog': () => document.getElementById('dialog').close(),
  logout() { state.active = null; state.bookingDraft = null; save(); navigate('/'); },
  demo(button) { useDemo(button.dataset.role); navigate('/panel'); },
  'edit-pet'(button) {
    const pet = accountData().pets.find(item => item.id === button.dataset.id);
    dialog(pet ? 'Editar mascota' : 'Agregar mascota',petForm(pet));
  },
  'remove-pet'(button) {
    const id = button.dataset.id;
    dialog('Eliminar mascota',`<p>¿Quieres quitar esta mascota de tu perfil?</p><div class="actions end"><button class="button secondary" data-action="close-dialog">Volver</button><button class="button danger" data-action="confirm-remove-pet" data-id="${id}">Eliminar mascota</button></div>`);
  },
  'confirm-remove-pet'(button) {
    const data = accountData();
    data.pets = data.pets.filter(item => item.id !== button.dataset.id);
    save();
    render();
    flash('Mascota eliminada.');
  },
  'cancel-booking'(button) {
    dialog('Cancelar paseo',`<p>Esta reserva se marcará como cancelada en el historial.</p><div class="actions end">
      <button class="button secondary" data-action="close-dialog">Conservar reserva</button><button class="button danger" data-action="confirm-cancel" data-id="${button.dataset.id}">Cancelar reserva</button></div>`);
  },
  'confirm-cancel'(button) {
    const id = button.dataset.id;
    if (accountData().bookings.some(item=>item.id===id) || openWalkList().some(item=>item.id===id)) updateBooking(id,'cancelled');
    render();
    flash('Reserva cancelada.');
  },
  filter(button) {
    const key = button.dataset.filter;
    const value = button.dataset.value;
    state.filters[key] = key === 'zone' ? (state.filters.zone === value ? '' : value) : Number(value);
    save();
    render();
    const selector = `[data-action="filter"][data-filter="${key}"][data-value="${value}"]`;
    root.querySelector(selector)?.focus({preventScroll:true});
  },
  'clear-filters'() { state.filters = {...defaultFilters}; save(); render(); },
  'add-shift'(button) {
    button.closest('section').querySelector('.shift-list').insertAdjacentHTML('beforeend',shiftRow(button.dataset.day));
  },
  'remove-shift'(button) { button.closest('.shift-row').remove(); },
  'finish-consultation'(button) {
    if (person('specialist').role !== 'specialist') return;
    updatesToConsultation(button.dataset.id,entry => {entry.status='completed';});
    render();
    flash('Consulta completada.');
  }
};

root.addEventListener('submit',async event => {
  const form = event.target.closest('form[data-form]');
  if (!form) return;
  event.preventDefault();
  const submit = form.querySelector('button[type="submit"], button:not([type])');
  const message = form.querySelector('.form-message');
  if (submit) submit.disabled = true;
  if (message) message.hidden = true;
  try {
    await forms[form.dataset.form](Object.fromEntries(new FormData(form)),form);
  } catch (error) {
    if (message) {
      message.textContent = error.message;
      message.hidden = false;
    } else flash(error.message,true);
  } finally {
    if (submit) submit.disabled = false;
  }
});

root.addEventListener('click',event => {
  const button = event.target.closest('button[data-action]');
  if (button) {
    actions[button.dataset.action]?.(button);
    return;
  }
  const anchor = event.target.closest('a[href]');
  if (!anchor || event.button || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || anchor.target || anchor.download) return;
  const url = new URL(anchor.href);
  if (url.origin !== location.origin || url.pathname.endsWith('.html')) return;
  event.preventDefault();
  navigate(url.pathname + url.search + url.hash);
});

root.addEventListener('change',event => {
  const input = event.target;
  if (input.matches('[data-calculate-cost]')) {
    updateCosts(input.form.elements.walker.value,input.value);
  }
  const key = input.dataset.filterInput;
  if (!key) return;
  state.filters[key] = input.type === 'checkbox' ? input.checked : input.type === 'range' ? Number(input.value) : input.value;
  save();
  refreshResults();
});

root.addEventListener('input',event => {
  if (event.target.dataset.filterInput === 'max') document.getElementById('range-value').value = 'S/'+event.target.value;
});
window.addEventListener('popstate',render);
render();
if (location.hash) requestAnimationFrame(() => document.getElementById(location.hash.slice(1))?.scrollIntoView());
