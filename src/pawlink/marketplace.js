import { durations, money, neighborhoods, visitDate } from './data.js';
import { accountData, availableSlot, directoryProviders, state } from './state.js';
import { avatar, badge, cash, esc, field, formNotice, icon, link, resultsEmpty, select, steps, textarea } from './ui.js';

const bookingSteps = ['Detalles', 'Resumen', 'Confirmación'];
const dateMin = () => new Date().toLocaleDateString('sv-SE', { timeZone: 'America/Lima' });

function pills(name, options, value) {
  return `<div class="pills">${options.map(([key,label]) => `<button type="button" data-action="filter" data-filter="${name}" data-value="${key}" aria-pressed="${String(key) === String(value)}">${String(key) === String(value) ? icon('filter-check') : ''}${label}</button>`).join('')}</div>`;
}

function matchesWalker(walker, filter) {
  const query = filter.zone.trim().split(',')[0].trim().toLowerCase();
  return (!query || walker.districts.some(district => district.toLowerCase().includes(query)) || walker.name.toLowerCase().includes(query))
    && walker.rate <= filter.max && walker.rating >= filter.rating
    && (!filter.verified || walker.verified) && availableSlot(walker,filter.date,filter.time,filter.minutes)
    && (!filter.photos || walker.photos) && (!filter.large || walker.large);
}

function walkerCard(walker) {
  return `<article class="card provider-card">
    ${avatar(walker.name,walker.photo)}
    <div class="provider-copy"><h3>${esc(walker.name)} ${walker.verified ? badge('Verificado') : ''}</h3>
    <p class="provider-rating">${icon('rating')} <strong>${walker.rating}</strong> (${walker.reviews}) <span>· ${walker.years} años de experiencia</span></p>
    <p>${esc(walker.description)}</p><p class="provider-meta"><span>${icon('location')}${walker.districts.join(', ')}</span><span>${icon('available')}${walker.available}</span></p></div>
    <div class="provider-actions">${cash(walker.rate)}<small>por paseo</small>${link('Reservar',`/reservar/detalles?paseador=${walker.id}`)}${link('Ver perfil',`/paseador/${walker.id}`,'secondary')}</div>
  </article>`;
}

export function directoryResults() {
  const f = state.filters;
  const match = directoryProviders('walker').filter(walker => matchesWalker(walker, f));
  match.sort((a,b) => f.order === 'price' ? a.rate - b.rate : f.order === 'experience' ? b.years - a.years : b.rating - a.rating);
  return `<div class="result-title"><strong>${match.length} ${match.length === 1 ? 'paseador disponible' : 'paseadores disponibles'}${f.zone ? ' en '+esc(f.zone.split(',')[0]) : ''}</strong>
    ${select('Ordenar','order',[['rating','Mejor calificados'],['price','Menor precio'],['experience','Más experiencia']],f.order,'data-filter-input="order"')}</div>
    <div class="provider-list">${match.map(walkerCard).join('') || resultsEmpty('No encontramos paseadores','Prueba otra zona o ajusta tus filtros.')}</div>`;
}

export function walkersPage() {
  const f = state.filters;
  return `<main class="shell directory">
    <h1><span class="desktop-only">Encuentra un paseador</span><span class="mobile-only">Buscar un Paseador</span></h1>
    <p class="muted">Filtra por zona, fecha y presupuesto, y empieza tu reserva en minutos.</p>
    <form class="card search-strip" data-form="search">
      <label class="icon-field">${icon('search')}<input aria-label="¿Dónde necesitas el paseo?" name="zone" placeholder="Miraflores, Lima" value="${esc(f.zone)}" maxlength="80"></label>
      <label class="icon-field">${icon('calendar')}<input aria-label="Fecha de búsqueda" type="date" name="date" value="${esc(f.date)}"></label>
      <label class="icon-field">${icon('clock')}<input aria-label="Hora de búsqueda" type="time" name="time" value="${esc(f.time)}"></label>
      <button type="submit" class="button primary">Buscar</button>
    </form>
    <div class="directory-grid"><details class="card filters" open><summary>Filtros</summary>
      <div class="filter-content"><div class="filter-title"><h2>Filtros</h2><button class="text-button" type="button" data-action="clear-filters">Limpiar</button></div>
      <div><h3>Zona</h3>${pills('zone', neighborhoods.slice(0,4).map(item => [item,item]), f.zone)}</div>
      <div><h3>Duración del paseo</h3>${pills('minutes', durations.map(d => [d,d+' min']), f.minutes)}</div>
      <label class="range-field"><span>Precio por paseo</span><input aria-label="Precio máximo" type="range" min="10" max="30" value="${f.max}" data-filter-input="max"><span class="range-labels">S/10 <output id="range-value">S/${f.max}</output></span></label>
      <div><h3>Calificación mínima</h3>${pills('rating', [[4.5,'4.5+'],[4,'4.0+'],[0,'Todas']], f.rating)}</div>
      <div class="checks"><h3>Preferencias</h3>${[['verified','Solo verificados'],['large','Acepta perros grandes'],['photos','Envía fotos del paseo']].map(([key,title]) =>
        `<label><input type="checkbox" data-filter-input="${key}" ${f[key] ? 'checked' : ''}>${title}</label>`).join('')}</div></div></details>
      <section id="directory-results" aria-label="Resultados">${directoryResults()}</section></div>
  </main>`;
}

export function walkerProfile(walker) {
  return `<main class="shell detail-page">
    <a class="back" href="/paseadores">← Volver a paseadores</a>
    <div class="detail-grid"><div class="stack">
    <article class="card profile-heading">${avatar(walker.name,walker.photo)}<div><h1>${esc(walker.name)}</h1><p>${icon('rating')} <strong>${walker.rating}</strong> (${walker.reviews} reseñas)</p><div class="row-align">${walker.verified ? badge('Verificado') : ''}${badge(walker.years+' años de experiencia','blue')}</div></div></article>
    <article class="card stack"><h2>Sobre ${esc(walker.name.split(' ')[0])}</h2><div><h3>Biografía</h3><p class="muted">${esc(walker.description)}</p></div><div><h3>Detalles del paseador</h3><dl class="key-values"><div><dt>Experiencia</dt><dd>${walker.years} años</dd></div><div><dt>Certificaciones</dt><dd>${esc(walker.credentials)}</dd></div><div><dt>Distrito</dt><dd>${walker.districts.join(', ')}</dd></div></dl></div></article>
    <article class="card stack"><h2>Reseñas</h2><p>${icon('rating')} <strong>${walker.rating} de 5</strong> · ${walker.reviews} reseñas</p><p class="muted">Puntuación de referencia incluida en el directorio de demostración.</p></article>
    </div><aside class="card stack"><div class="profile-price">${cash(walker.rate)} <span>por paseo</span></div><div class="checks"><p>${icon('check')} Paseos de 20 a 60 minutos</p><p>${icon('check')} Seguimiento GPS</p>${walker.photos ? `<p>${icon('check')} Fotos durante el paseo</p>` : ''}</div>${link('Reservar paseo',`/reservar/detalles?paseador=${walker.id}`)}</aside></div>
  </main>`;
}

export function specialistDirectory(query = '') {
  const items = directoryProviders('specialist').filter(item => !query || query === 'Nutrición' || (item.name+' '+item.topic+' '+item.description).toLowerCase().includes(query.toLowerCase()));
  return `<main class="shell directory specialist-directory">
    <h1>Especialistas en Comportamiento Animal</h1><p class="muted">Obtén orientación experta para el bienestar emocional y conductual de tu mascota.</p>
    <form class="card search-strip single" data-form="specialist-search"><label class="icon-field">${icon('search')}<input type="search" aria-label="Buscar especialista" name="query" placeholder="Buscar especialista..." value="${esc(query)}"></label><button class="button primary">Buscar</button></form>
    <div class="provider-list">${items.map(item => `<article class="card provider-card">${avatar(item.name,item.photo)}<div class="provider-copy"><h3>${esc(item.name)} ${item.verified ? badge('Verificado') : ''}</h3><p>${icon('rating')} ${item.rating} · ${esc(item.topic)}</p><p>${esc(item.description)}</p></div><div class="provider-actions">${cash(item.rate)}<small>por sesión</small>${link('Ver perfil',`/especialista/${item.id}`,'secondary')}${link('Reservar consulta',`/especialista/${item.id}#solicitar`)}</div></article>`).join('') || resultsEmpty('Sin resultados','Prueba otro nombre o especialidad.')}</div>
    <article class="card specialist-advice"><h2>¿No sabes a quién elegir?</h2><p>Cuéntanos qué te preocupa del comportamiento de tu mascota al solicitar una consulta.</p></article>
  </main>`;
}

export function specialistPublic(item) {
  const pets = accountData().pets;
  return `<main class="shell detail-page">
    <a class="back" href="/especialistas">← Volver a especialistas</a>
    <div class="detail-grid"><div class="stack">
      <article class="card profile-heading">${avatar(item.name,item.photo)}<div><h1>${esc(item.name)}</h1><p>${esc(item.topic)}</p>${item.verified ? badge('Verificado') : ''}</div></article>
      <article class="card stack"><h2>Sobre ${esc(item.name.split(' ')[0])}</h2><p>${esc(item.description)}</p><h3>Credenciales y Certificaciones</h3><p>${esc(item.credentials)}</p></article>
    </div><form class="card stack" id="solicitar" data-form="consult-request"><input type="hidden" name="provider" value="${item.id}"><h2>Reservar consulta</h2>
    ${cash(item.rate)}${pets.length
      ? select('Mascota','pet',pets.map(p => [p.id,p.name]),pets[0].id,'required')
      : `${field('Nombre de tu mascota','pet',{attrs:'required maxlength="60"'})}`}
    <div class="field-row">${field('Fecha','date',{type:'date',attrs:`required min="${dateMin()}"`})}${field('Hora','time',{type:'time',attrs:'required'})}</div>
    ${textarea('Motivo','notes','','Describe el comportamiento que te preocupa','required maxlength="700"')}
    ${formNotice}<button class="button primary">Confirmar consulta</button></form></div>
  </main>`;
}

function priceBreakdown(walker, minutes) {
  const base = Math.round(walker.rate * minutes / 30 * 100) / 100;
  const service = Math.round(base * .15 * 100) / 100;
  return { base, service, total: base + service };
}

function costs(walker, minutes) {
  const { base, service, total } = priceBreakdown(walker, minutes);
  return `<div class="costs"><div><span>Paseo de ${minutes} min</span><span>${money(base)}</span></div><div><span>Tarifa de servicio</span><span>${money(service)}</span></div><div><strong>Total</strong>${cash(total)}</div></div>`;
}

export function bookingDetails(walker) {
  const draft = state.bookingDraft?.walker === walker.id ? state.bookingDraft : {};
  const pets = accountData().pets;
  const minutes = draft.minutes || state.filters.minutes || 30;
  return `<main class="shell booking-page"><a class="back" href="/paseador/${walker.id}">← Volver al perfil de ${esc(walker.name.split(' ')[0])}</a>
    <h1>Reservar paseo</h1><p class="muted">Completa los detalles del paseo con ${esc(walker.name)}.</p>${steps(bookingSteps,0)}
    <div class="detail-grid">
      <form class="card stack" data-form="booking-details"><input name="walker" type="hidden" value="${walker.id}"><h2>Detalles del paseo</h2>
        ${pets.length ? select('¿Quién sale a pasear?','pet',pets.map(p => [p.id,p.name+' · '+p.breed]),draft.pet || pets[0].id,'required')
          : field('Nombre de tu mascota','pet',{placeholder:'Bella',value:draft.pet,attrs:'required maxlength="60"'})}
        <div class="field-row">${field('Fecha','date',{type:'date',value:draft.date || state.filters.date,attrs:`required min="${dateMin()}"`})}
          ${field('Hora de inicio','time',{type:'time',value:draft.time || state.filters.time,attrs:'required'})}</div>
        ${select('Duración del paseo','minutes',durations.map(d => [d,d+' min']),minutes,'required data-calculate-cost')}
        ${field('Dirección de recojo','address',{value:draft.address,placeholder:'Av. La Paz 122, Miraflores',attrs:'required maxlength="160"'})}
        ${textarea('Indicaciones adicionales (opcional)','notes',draft.notes,'Ej. Usar arnés o avisar al llegar','maxlength="700"')}
        ${formNotice}<div class="actions end"><button class="button primary">Continuar al resumen →</button></div>
      </form><aside class="card stack"><h2>Tu paseador</h2><div class="row-align">${avatar(walker.name,walker.photo)}<div><h3>${esc(walker.name)}</h3><p class="muted">★ ${walker.rating} · ${walker.years} años de experiencia</p></div></div><div id="booking-cost">${costs(walker,minutes)}</div></aside>
    </div></main>`;
}

export function updateCosts(walkerId, minutes) {
  const wallet = document.getElementById('booking-cost');
  const walker = directoryProviders('walker').find(item => item.id === walkerId);
  if (wallet && walker) wallet.innerHTML = costs(walker, Number(minutes));
}

export function bookingSummary(walker, draft, pet) {
  return `<main class="shell booking-page"><a class="back" href="/reservar/detalles?paseador=${walker.id}">← Editar detalles</a>
  <h1>Revisa tu reserva</h1><p class="muted">Confirma que todo esté correcto antes de reservar.</p>${steps(bookingSteps,1)}
  <div class="detail-grid"><article class="card stack"><h2>Resumen del paseo</h2><dl class="key-values">
  <div><dt>Mascota</dt><dd>${esc(pet)}</dd></div><div><dt>Paseador</dt><dd>${esc(walker.name)}</dd></div>
  <div><dt>Fecha y hora</dt><dd>${visitDate(draft.date,draft.time)}</dd></div><div><dt>Duración</dt><dd>${draft.minutes} min</dd></div>
  <div><dt>Dirección</dt><dd>${esc(draft.address)}</dd></div>${draft.notes ? `<div><dt>Indicaciones</dt><dd>${esc(draft.notes)}</dd></div>` : ''}</dl></article>
  <form class="card stack" data-form="booking-confirm"><h2>Resumen del precio</h2>${costs(walker,draft.minutes)}<p class="muted">Reserva de demostración, sin cobro.</p>${formNotice}<button class="button primary">Confirmar reserva</button></form></div>
  </main>`;
}

export function bookingComplete(booking) {
  return `<main class="shell booking-page">${steps(bookingSteps,2)}<article class="card confirmation stack">
    <span class="tile-icon">${icon('check')}</span><h1>¡Reserva confirmada!</h1><p>Tu paseo con ${esc(booking.provider)} quedó reservado.</p>
    <div class="confirmation-details"><div class="title-row"><h2>Reserva #${esc(booking.id)}</h2>${badge('Confirmada')}</div>
    <dl class="key-values"><div><dt>Mascota</dt><dd>${esc(booking.pet)}</dd></div><div><dt>Paseador</dt><dd>${esc(booking.provider)}</dd></div>
    <div><dt>Fecha</dt><dd>${visitDate(booking.date,booking.time)}</dd></div><div><dt>Duración</dt><dd>${booking.minutes} min</dd></div><div><dt>Total</dt><dd>${cash(booking.amount)}</dd></div></dl></div>
    ${link('Ver mis reservas','/reservas')}${link('Volver al inicio','/','secondary')}</article></main>`;
}

export function bookingRecord(walker, draft, pet) {
  return { ...draft, pet, id:'PL-'+crypto.randomUUID().slice(0,8).toUpperCase(), provider:walker.name, providerId:walker.ownerId, status:'confirmed', amount:priceBreakdown(walker,draft.minutes).total };
}
