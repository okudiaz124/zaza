import { days, money, neighborhoods, roles, visitDate } from './data.js';
import { accountData, openWalkList, person, profile, state } from './state.js';
import { avatar, badge, cash, esc, field, formNotice, icon, link, metric, panel, petIcon, resultsEmpty, select, status, steps, textarea } from './ui.js';

function activities(items, title = 'Actividad reciente', url = '/reservas') {
  return `<article class="card activity"><header class="title-row"><h2>${title}</h2><a class="mobile-only" href="${url}">View All</a></header>
  ${items.length ? items.slice(0,4).map(item => `<a class="activity-row" href="${url}">${item.photo
    ? `<picture><source media="(max-width: 700px)" srcset="${esc(item.photo)}">${icon('activity')}</picture>`
    : `<span class="tile-icon">${icon('activity')}</span>`}
    <span><strong>${esc(item.pet)} - <span class="desktop-only">${item.provider && url === '/consultas' ? 'Consulta' : 'Paseo'}</span><span class="mobile-only">${url === '/consultas' ? 'CONSULTA' : 'WALKING'}</span></strong><small>${visitDate(item.date)}</small></span>${status(item.status)}</a>`).join('')
    : '<p class="muted no-activity">Tu actividad aparecerá aquí.</p>'}</article>`;
}

function shortcut(title, subtitle, glyph, href, extras = '') {
  return `<a class="card shortcut ${extras}" href="${href}"><span class="tile-icon">${icon(glyph)}</span><span><strong>${title}</strong><small>${subtitle}</small></span></a>`;
}

export function dashboard(role) {
  const p = person(role);
  const data = accountData(p);
  if (role === 'walker') {
    const walkList = openWalkList();
    const completed = walkList.filter(b => b.status === 'completed');
    return panel('/panel',role,`<section class="metrics-grid">
      ${metric('Total Paseos',walkList.length,'metric-bookings')}${metric('Completados',completed.length,'metric-pets','blue')}${metric('Ganancias',money(completed.reduce((s,x)=>s+x.amount,0)),'metric-upcoming','orange')}</section>
      ${activities(walkList,'Actividad Reciente','/mis-paseos')}
      <div class="shortcuts">${shortcut('Mis Paseos','Revisa tus próximos paseos','metric-bookings','/mis-paseos')}${shortcut('Perfil de Paseador','Actualiza tu información y disponibilidad','tab-pets','/perfil/paseador')}</div>`);
  }
  if (role === 'specialist') {
    const total = data.consultations.length;
    return panel('/panel',role,`<section class="metrics-grid">
      ${metric('Total de consultas',total,'metric-bookings')}${metric('Próximas consultas',data.consultations.filter(x=>x.status==='confirmed').length,'metric-upcoming','orange')}${metric('Completadas',data.consultations.filter(x=>x.status==='completed').length,'metric-pets','blue')}</section>
      ${activities(data.consultations,'Actividad Reciente','/consultas')}
      <div class="shortcuts">${shortcut('Consultas','Gestiona tus sesiones','metric-bookings','/consultas')}${shortcut('Perfil de Especialista','Actualiza tu información profesional','tab-pets','/perfil/especialista')}</div>`);
  }
  const upcoming = data.bookings.filter(item => item.status === 'confirmed').length;
  const list = data.bookings.map(item => ({...item,photo:data.pets.find(pet => pet.name === item.pet)?.photo }));
  const desktop = `<section class="metrics-grid">${metric('Total de mascotas',data.pets.length,'metric-pets')}
      ${metric('Total de reservas',data.bookings.length,'metric-bookings','blue')}${metric('Próximas reservas',upcoming,'metric-upcoming','orange')}</section>
      ${activities(list)}<div class="shortcuts">${shortcut('Manejar mascotas','Agrega y maneja tus mascotas','manage-pets','/mascotas')}
      ${shortcut('Encontrar paseadores','Busca paseadores confiables cerca de ti','find-walkers','/paseadores')}</div>`;
  const mobile = `<h1>Welcome, ${esc(p.name)}</h1><p>Your pets are having a great day today!</p>
    <section class="mobile-metrics"><article class="card">${icon('mobile-pet-icon')}${badge('Live')}<strong>${data.pets.length}</strong><span>Total Pets</span></article>
    <div><article class="card">${icon('mobile-bookings')}<span><strong>${data.bookings.length} Bookings</strong><small>This Month</small></span></article>
    <article class="card">${icon('mobile-upcoming')}<span><strong>${upcoming} Upcoming</strong><small>Next 48h</small></span></article></div></section>
    <section class="mobile-shortcuts"><a href="/mascotas"><div><strong>Manage Pets</strong><small>Update profiles &amp; health records</small></div>${icon('mobile-manage-art')}${icon('mobile-chevron')}</a>
    <a href="/paseadores"><div><strong>Find Walkers</strong><small>Discover trusted local care</small></div>${icon('mobile-find-art')}${icon('mobile-find-icon')}</a></section>${activities(list,'Recent Activity')}`;
  return panel('/panel',role,desktop,mobile);
}

function petsList(items) {
  return `<div class="pets-grid">${items.map(pet => `<article class="card pet-card">${petIcon(pet)}
    <div><h3>${esc(pet.name)}</h3><p class="muted">${esc(pet.breed || pet.species)}</p><p>Edad: ${esc(pet.age)} ${Number(pet.age) === 1 ? 'año' : 'años'}<span> · </span>Peso: ${esc(pet.weight)} kg</p>
      ${pet.notes ? `<p class="muted">${esc(pet.notes)}</p>` : ''}</div>
    <div class="pet-actions"><button class="text-button" type="button" data-action="edit-pet" data-id="${pet.id}">Editar</button></div></article>`).join('') || resultsEmpty('Aún no hay mascotas','Añade una mascota para gestionar su perfil y reservar paseos.')}</div>`;
}

export function petsPage() {
  const data = accountData();
  const html = `<div class="title-row page-caption"><div><h2>Mis Mascotas</h2><p class="mobile-only muted">Gestiona los perfiles de tus mejores amigos.</p></div>
  <button type="button" class="button primary" data-action="edit-pet">Agregar Mascota</button></div>${petsList(data.pets)}`;
  return panel('/mascotas','owner',html,html);
}

export function petForm(pet = {}) {
  return `<form data-form="save-pet" class="stack"><input type="hidden" name="id" value="${esc(pet.id)}">
    ${field('Nombre','name',{value:pet.name,attrs:'required maxlength="60"'})}
    <div class="field-row">${select('Especie','species',['Perro','Gato','Otra'],pet.species || 'Perro')}${field('Raza','breed',{value:pet.breed,attrs:'maxlength="60"'})}</div>
    <div class="field-row">${field('Edad (años)','age',{type:'number',value:pet.age,attrs:'required min="0" max="50"'})}${field('Peso (kg)','weight',{type:'number',value:pet.weight,attrs:'required min="0.1" max="200" step="0.1"'})}</div>
    ${textarea('Notas','notes',pet.notes,'Indicaciones de cuidado','maxlength="700"')}
    ${formNotice}<div class="actions end">${pet.id ? `<button class="button danger" type="button" data-action="remove-pet" data-id="${pet.id}">Eliminar</button>` : ''}<button class="button primary">Guardar mascota</button></div></form>`;
}

function reservationCards(items, walker = false) {
  return `<div class="reservations-list">${items.map(item => `<article class="card reservation">
    <div class="reservation-body">${walker ? `<span class="tile-icon">${icon('metric-pets')}</span>` : ''}
      <div><div class="row-align"><h3>${esc(item.pet)}</h3>${walker ? '' : status(item.status)}</div>
      <div class="reservation-meta"><span>${icon('calendar')}${visitDate(item.date,item.time)}</span><span>Duración: ${item.minutes}min</span><span>${icon('location')}${esc(item.address)}</span></div>
      ${walker ? '' : `<p class="muted">Paseador: <strong>${esc(item.provider)}</strong></p><p>${cash(item.amount)}</p>`}</div></div>
    <div class="reservation-controls">${walker ? status(item.status) : ''}<div class="actions">
      ${item.status === 'confirmed'
        ? `${walker ? link('Empezar',`/gps.html?mascota=${encodeURIComponent(item.pet)}&reserva=${encodeURIComponent(item.id)}`) : ''}
          <button class="text-button neutral" type="button" data-action="cancel-booking" data-id="${item.id}">Cancelar</button>`
        : item.status === 'completed' && walker ? link('Ver historial GPS','/gps.html#historial','secondary') : ''}</div></div></article>`).join('') || resultsEmpty(walker ? 'Aún no tienes paseos' : 'Aún no tienes reservas',walker ? 'Tus paseos programados aparecerán aquí.' : 'Busca un paseador y reserva el próximo paseo.',walker ? '' : link('Encontrar paseadores','/paseadores'))}</div>`;
}

export function reservationsPage() {
  const html = `<div class="title-row page-caption"><div><h2>Mis Reservas</h2><p class="mobile-only muted">Gestiona los paseos de tus mejores amigos.</p></div>${link('Reservar Paseo','/paseadores')}</div>${reservationCards(accountData().bookings)}`;
  return panel('/reservas','owner',html,html);
}

export function walkPanel() {
  const items = openWalkList();
  return panel('/mis-paseos','walker',`<div class="title-row page-caption"><div><h2>Mis Paseos</h2><p class="muted">Administra tus paseos programados</p></div>
    ${link('Abrir GPS','/gps.html','secondary')}</div>${reservationCards(items,true)}`);
}

export function earnings() {
  const entries = openWalkList().filter(item => item.status === 'completed');
  const total = entries.reduce((sum,item) => sum + item.amount,0);
  return panel('/ganancias','walker',`<div class="page-caption"><h2>Ganancias</h2><p class="muted">Seguimiento de tus ingresos y paseos completados</p></div>
    <section class="metrics-grid">${metric('Ingresos totales',money(total),'metric-upcoming')}${metric('Paseos completados',entries.length,'metric-bookings','blue')}${metric('Ingreso promedio',money(entries.length ? total / entries.length : 0),'metric-pets','orange')}</section>
    <article class="card stack money-history"><h2>Historial de Pagos</h2>${entries.length
      ? entries.map(item => `<div class="title-row"><div><strong>${esc(item.pet)} · Paseo</strong><p class="muted">${visitDate(item.date)}</p></div>${cash(item.amount)}</div>`).join('')
      : '<p class="muted">Los paseos completados aparecerán aquí.</p>'}</article>`);
}

export function consultationsPage(role) {
  const p = person(role);
  const entries = accountData(p).consultations;
  const html = `<div class="title-row page-caption"><div><h2>${role === 'owner' ? 'Mis Consultas' : 'Consultas'}</h2><p class="muted">${role === 'owner' ? 'Historial de sesiones y seguimientos.' : 'Administra tus sesiones de consulta de comportamiento'}</p></div>
  ${role === 'owner' ? link('Buscar especialistas','/especialistas') : ''}</div>
  <div class="reservations-list">${entries.map(entry => `<article class="card reservation"><div class="reservation-body">${avatar(entry.pet)}<div><div class="row-align"><h3>${esc(entry.pet)}</h3>${status(entry.status)}</div><p class="muted">${esc(role === 'owner' ? entry.provider : entry.owner)}</p><p>${visitDate(entry.date,entry.time)} · ${entry.minutes} min</p></div></div>
  ${link('Ver detalles',`/consultas/${entry.id}`,'secondary')}</article>`).join('') || resultsEmpty('Aún no hay consultas','Las sesiones reservadas aparecerán aquí.')}</div>`;
  return panel('/consultas',role,html,html);
}

export function consultationDetails(entry, role) {
  return panel('/consultas',role,`<a class="back" href="/consultas">← Volver a Consultas</a><div class="detail-grid">
    <div class="stack">
    <article class="card stack"><div class="title-row"><h2>Información de mascota</h2>${status(entry.status)}</div><div class="row-align">${avatar(entry.pet)}<div><h3>${esc(entry.pet)}</h3><p class="muted">${esc(entry.breed || 'Mascota del cliente')}</p></div></div></article>
    <article class="card stack"><h2>Información del dueño</h2><p>${esc(entry.owner)}</p></article>
    <article class="card stack"><h2>Notas de la sesión</h2>${(entry.notes || []).map(text => `<blockquote>${esc(text)}</blockquote>`).join('') || '<p class="muted">Aún no hay notas.</p>'}
    ${role === 'specialist' ? `<form class="stack" data-form="consultation-note"><input type="hidden" name="id" value="${entry.id}">${textarea('Agregar nota','notes','','Escribe una nota de sesión','required maxlength="700"')}${formNotice}<div class="actions"><button class="button primary">Guardar nota</button></div></form>` : ''}</article>
    </div><aside class="card stack"><h2>Información de la sesión</h2><dl class="key-values"><div><dt>Especialista</dt><dd>${esc(entry.provider)}</dd></div><div><dt>Fecha</dt><dd>${visitDate(entry.date,entry.time)}</dd></div>
    <div><dt>Duración</dt><dd>${entry.minutes} min</dd></div></dl>
    ${role === 'specialist' && entry.status === 'confirmed' ? `<button class="button primary" data-action="finish-consultation" data-id="${entry.id}">Completar consulta</button>` : ''}</aside></div>`);
}

export function personalProfile() {
  const p = person();
  const current = profile(p);
  return `<main class="shell info-page"><h1>Perfil</h1><div class="detail-grid">
    <form class="card stack" data-form="account"><div class="row-align">${avatar(p.name)}<div><h2>${esc(p.name)}</h2><p class="muted">${roles[p.role][0]}</p></div></div>
    <h3>Información de la cuenta</h3>${field('Nombre completo','name',{value:current.name || p.name,attrs:'required maxlength="80"'})}
    ${field('Correo electrónico','email',{type:'email',value:p.email,attrs:'readonly'})}
    ${field('Teléfono','phone',{type:'tel',value:current.phone || p.phone,attrs:'maxlength="24"'})}
    ${formNotice}<button class="button primary">Guardar cambios</button></form>
    <aside class="card stack"><h2>Ajustes y soporte</h2>${p.role === 'owner' ? link('Mis mascotas','/mascotas','secondary') : link('Editar perfil profesional', p.role === 'walker' ? '/perfil/paseador' : '/perfil/especialista','secondary')}
    ${link('Centro de ayuda','/ayuda','secondary')}<button class="button secondary" type="button" data-action="logout">Cerrar sesión</button></aside></div></main>`;
}

export function professionalProfile(role) {
  const p = person(role);
  const values = profile(p);
  const isWalker = role === 'walker';
  const title = isWalker ? 'Perfil de Paseador' : 'Perfil de Especialista';
  const path = isWalker ? '/perfil/paseador' : '/perfil/especialista';
  return panel(path,role,`<div class="page-caption"><h2>${title}</h2><p class="muted">Personaliza tu información profesional.</p></div>
  <form class="card stack professional-form" data-form="professional"><input type="hidden" name="role" value="${role}">
  ${textarea('Biografía','biography',values.biography,isWalker ? 'Cuéntales a los dueños sobre ti...' : 'Describe tu experiencia y enfoque...','maxlength="1000"')}
  ${isWalker ? field('Años de Experiencia','experience',{type:'number',value:values.experience ?? 2,attrs:'required min="0" max="70"'})
      : select('Especialidad','topic',['Terapia de Comportamiento','Comportamiento Felino','Adiestramiento','Nutrición'],values.topic || 'Terapia de Comportamiento')}
  ${field(isWalker ? 'Certificaciones' : 'Credenciales y Certificaciones','credentials',{value:values.credentials,placeholder:isWalker ? 'Ej: Certificado en RCP, Paseador Profesional' : 'Ej: Especialista Certificado en Comportamiento Animal',attrs:'maxlength="200"'})}
  ${field(isWalker ? 'Tarifa por Paseo (S/)' : 'Tarifa por Sesión (S/)','rate',{type:'number',value:values.rate ?? (isWalker ? 15 : 50),attrs:'required min="1" max="9999" step="0.01"'})}
  ${formNotice}<div class="actions">${isWalker ? link('Zona y disponibilidad','/perfil/paseador/configurar/2','secondary') : ''}<button class="button primary">Guardar Cambios</button></div></form>`);
}

export function onboardingPage(stage) {
  const p = person('walker');
  const info = state.onboarding[p.id] || {};
  const labels = ['Perfil y tarifa','Zona de cobertura','Disponibilidad'];
  let fields = '';
  if (stage === 1) {
    fields = `<div class="row-align">${avatar(p.name,info.photo)}<div><h3>Foto de perfil</h3><p class="muted">JPG o PNG, máximo 5 MB.</p></div></div>
    ${field('Subir foto','photo',{type:'file',attrs:'accept="image/jpeg,image/png"'})}${textarea('Biografía','biography',info.biography,'Cuéntales a los dueños quién eres.','required maxlength="1000"')}
    <div class="field-row">${field('Años de experiencia','experience',{type:'number',value:info.experience,attrs:'required min="0" max="70"'})}
    ${field('Tarifa por paseo (S/)','rate',{type:'number',value:info.rate,attrs:'required min="1" max="9999" step="0.01"'})}</div>
    ${field('Certificaciones','credentials',{value:info.credentials,attrs:'maxlength="200"'})}`;
  } else if (stage === 2) {
    fields = `${select('Distrito base','area',neighborhoods,info.area || 'Surco','required')}
    <fieldset class="checks"><legend>Distritos donde paseas</legend><div class="coverage-options">${neighborhoods.map(area => `<label><input type="checkbox" name="districts" value="${area}" ${(info.districts || []).includes(area) ? 'checked' : ''}>${area}</label>`).join('')}</div></fieldset>
    ${field('Radio de recojo (km)','radius',{type:'number',value:info.radius ?? 3,attrs:'required min="1" max="30"'})}
    <div class="coverage-map"><span>${icon('location')}</span><p>Zona de recojo</p></div>`;
  } else {
    fields = `<p class="muted">Indica los días y horarios en los que puedes recibir reservas.</p><div class="availability">${days.map((day,index) => {
      const shifts = info.shifts?.[index] || [];
      return `<section data-day="${index}"><div class="title-row"><h3>${day}</h3><button class="text-button" type="button" data-action="add-shift" data-day="${index}">+ Agregar horario</button></div><div class="shift-list">${shifts.map(shift => shiftRow(index,shift)).join('')}</div></section>`;
    }).join('')}</div>`;
  }
  return `<main class="shell booking-page onboarding"><h1>Crea tu perfil de paseador</h1><p class="muted">Paso ${stage} de 3 · Completa tu perfil profesional</p>${steps(labels,stage-1)}
    <form class="card stack" data-form="onboarding"><input type="hidden" name="stage" value="${stage}"><h2>${stage === 3 ? 'Disponibilidad semanal' : labels[stage-1]}</h2>
    ${fields}${formNotice}<div class="actions end">${stage > 1 ? link('Volver',`/perfil/paseador/configurar/${stage-1}`,'secondary') : ''}
      <button class="button primary">${stage === 3 ? 'Guardar perfil' : 'Continuar →'}</button></div></form></main>`;
}

export function shiftRow(index, shift = {}) {
  return `<div class="shift-row">${field('Desde','from-'+index,{type:'time',value:shift.from,attrs:'required'})}
    ${field('Hasta','to-'+index,{type:'time',value:shift.to,attrs:'required'})}
    <button class="text-button danger" type="button" data-action="remove-shift">Quitar</button></div>`;
}
