import { money, roles } from './data.js';
import { account, person } from './state.js';

export const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
})[char]);
export const icon = (name, className = '') => `<img class="icon ${className}" src="/paw/${name}.svg" alt="">`;
export const link = (title, path, style = 'primary') => `<a class="button ${style}" href="${path}">${title}</a>`;
export const badge = (label, tone = 'green') => `<span class="badge ${tone}">${esc(label)}</span>`;
export const avatar = (name, photo, css = '') => photo
  ? `<img class="avatar ${css}" src="${esc(photo)}" alt="">`
  : `<span class="avatar ${css}" aria-hidden="true">${esc(name.trim().slice(0, 1).toUpperCase())}</span>`;
export const petIcon = pet => avatar(pet.name, pet.photo);
export const labelStatus = value => ({ confirmed: 'Confirmada', completed: 'Completado', cancelled: 'Cancelada' })[value] || 'Pendiente';
export const status = value => badge(labelStatus(value), ({ confirmed: 'blue', cancelled: 'gray' })[value] || 'green');
export const field = (label, name, { type = 'text', value = '', placeholder = '', attrs = '' } = {}) => `<label class="field"><span>${label}</span><input name="${name}" type="${type}" value="${esc(value)}" placeholder="${esc(placeholder)}" ${attrs}></label>`;
export const textarea = (label, name, value = '', placeholder = '', attrs = '') => `<label class="field"><span>${label}</span><textarea name="${name}" rows="4" placeholder="${esc(placeholder)}" ${attrs}>${esc(value)}</textarea></label>`;
export function select(label, name, choices, selected = '', attrs = '') {
  return `<label class="field"><span>${label}</span><select name="${name}" ${attrs}>${choices.map(choice => {
    const [value, title] = Array.isArray(choice) ? choice : [choice, choice];
    return `<option value="${esc(value)}"${String(value) === String(selected) ? ' selected' : ''}>${esc(title)}</option>`;
  }).join('')}</select></label>`;
}
export const cash = value => `<strong class="price">${money(value)}</strong>`;
export const formNotice = '<p class="form-message" role="alert" hidden></p>';
export const resultsEmpty = (title, body, action = '') => `<article class="card empty"><h3>${title}</h3><p>${body}</p>${action}</article>`;

const tabs = {
  owner: [['Resumen','/panel','tab-dashboard'],['Mis mascotas','/mascotas','tab-pets'],['Reservas','/reservas','tab-reservations'],['Encontrar paseadores','/paseadores','tab-walkers']],
  walker: [['Resumen','/panel','tab-dashboard'],['Mis Paseos','/mis-paseos','tab-reservations'],['Ganancias','/ganancias','feature-heart'],['Perfil','/perfil/paseador','mobile-tab-profile']],
  specialist: [['Resumen','/panel','tab-dashboard'],['Consultas','/consultas','tab-reservations'],['Perfil','/perfil/especialista','mobile-tab-profile']]
};

export function header(path, menuRole) {
  const p = account();
  const display = p || (menuRole && person(menuRole));
  const square = path === '/paseadores' || path === '/reservas' || path.startsWith('/reservar');
  const logo = square ? 'directory-logo' : path === '/iniciar-sesion' ? 'login-logo' : 'web-logo';
  return `<header class="topbar">
    <div class="shell topbar-inner">
      <a class="brand" href="/" aria-label="PawLink, inicio">${icon(logo, square ? 'brand-box' : 'desktop-mark')}${icon('mobile-logo', 'mobile-mark')}<span>PawLink</span></a>
      <nav class="site-nav" aria-label="Principal">
        <a href="/" ${path === '/' ? 'aria-current="page"' : ''}>Inicio</a><a href="/paseadores" ${path === '/paseadores' ? 'aria-current="page"' : ''}>Buscar Paseadores</a><a href="/nosotros" ${path === '/nosotros' ? 'aria-current="page"' : ''}>Nosotros</a>
      </nav>
      <div class="topbar-actions">
        <span class="language" aria-label="Idioma español">${icon('globe')} ES</span>
        ${display ? `<button type="button" class="account-menu" data-action="menu" aria-label="Menú de perfil">${avatar(display.name)}<span>${esc(display.name)}</span>${icon('chevron')}</button>`
          : `<a class="login-nav" href="/iniciar-sesion">Iniciar Sesión</a>${link('Comenzar','/registro')}`}
        <button type="button" class="mobile-menu" data-action="menu" aria-label="Abrir menú">${icon('mobile-bell')}</button>
      </div>
    </div>
  </header>`;
}

export function footer() {
  return `<footer class="footer"><div class="shell">
    <div class="footer-grid">
      <div><a class="brand" href="/">${icon('footer-logo','brand-box')}<span>PawLink</span></a>
        <p>Conectamos a dueños responsables con profesionales de confianza para el cuidado de sus mascotas.</p></div>
      <div><h3>Servicios</h3><a href="/paseadores">Paseo de perros</a><a href="/especialistas">Consultas de comportamiento</a><a href="/registro?rol=walker">Conviértete en paseador</a></div>
      <div><h3>Compañía</h3><a href="/nosotros">Sobre nosotros</a><a href="/ayuda#contacto">Contacto</a><a href="/ayuda#privacidad">Política de privacidad</a><a href="/ayuda#terminos">Términos del servicio</a></div>
      <div><h3>Soporte</h3><a href="/ayuda">Centro de ayuda</a><a href="/ayuda#seguridad">Consejos de seguridad</a><a href="/ayuda#seguridad">Confianza y seguridad</a></div>
    </div>
    <p class="copyright">© 2026 PawLink. Todos los derechos reservados.</p></div></footer>`;
}

export function bottomNav(path, role = 'owner', publicPage = false) {
  const options = publicPage
    ? [['Resumen','/','mobile-landing-home'],['Consultas','/especialistas','mobile-landing-consult'],['Perfil','/perfil','mobile-landing-profile']]
    : role === 'owner'
      ? [['Dashboard','/panel','mobile-tab-dashboard'],['My Pets','/mascotas','mobile-tab-pets'],['Bookings','/reservas','mobile-tab-bookings'],['Profile','/perfil','mobile-tab-profile']]
      : tabs[role];
  return `<nav class="bottom-nav" aria-label="Navegación móvil">${options.map(([name, url, glyph]) =>
    `<a href="${url}" ${path === url ? 'aria-current="page"' : ''}>${icon(glyph)}<span>${name}</span></a>`).join('')}</nav>`;
}

export function panel(path, role, content, mobileContent = '') {
  const p = person(role);
  return `<main class="dashboard-page shell">
    <section class="${mobileContent ? 'desktop-only ' : ''}dashboard-desktop">
      <h1>Panel de control</h1><p class="muted welcome">Bienvenido de nuevo, ${esc(p.name.split(' ')[0])}</p>
      <nav class="panel-tabs" aria-label="Panel de ${roles[role][0]}">${tabs[role].map(([title, url, glyph]) =>
        `<a href="${url}" ${url === path ? 'aria-current="page"' : ''}>${icon(glyph)}${title}</a>`).join('')}</nav>
      ${content}
    </section>
    ${mobileContent ? `<section class="mobile-only dashboard-mobile">${mobileContent}</section>` : ''}
  </main>`;
}

export function steps(labels, active) {
  return `<ol class="steps">${labels.map((label,index) => `<li ${index === active ? 'aria-current="step"' : ''} class="${index < active ? 'step-done' : ''}"><span>${index < active ? '✓' : index + 1}</span>${label}</li>`).join('')}</ol>`;
}

export function metric(label, number, glyph, tone = 'green') {
  return `<article class="card metric"><div><p>${label}</p><strong>${number}</strong></div><span class="tile-icon ${tone}">${icon(glyph)}</span></article>`;
}

export function flash(message, error = false) {
  const node = document.getElementById('live-status');
  node.textContent = message;
  node.className = `toast ${error ? 'toast-error' : ''}`;
  clearTimeout(flash.timer);
  flash.timer = setTimeout(() => { node.className = 'visually-hidden'; }, 4800);
}
