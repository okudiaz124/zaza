import { icon, link, esc, field, formNotice } from './ui.js';
import { roles } from './data.js';

const values = [
  ['Confianza y Seguridad', 'Cada profesional es verificado exhaustivamente. Priorizamos la seguridad de tus mascotas por encima de todo.', 'value-shield'],
  ['Felicidad de la Mascota', 'El bienestar y la felicidad de cada mascota están en el corazón de todo lo que hacemos.', 'value-heart'],
  ['Comunidad', 'Creemos en el poder de la comunidad. Dueños y profesionales trabajando juntos por amor a las mascotas.', 'value-community'],
  ['Transparencia', 'GPS en tiempo real, fotos e informes detallados garantizan total transparencia.', 'value-transparency'],
  ['Innovación', 'Aprovechamos la tecnología para mejorar los servicios de cuidado de mascotas y la experiencia del usuario.', 'value-eye'],
  ['Responsabilidad', 'Tomamos nuestra responsabilidad en serio, garantizando servicios de cuidado de mascotas confiables y profesionales.', 'value-shield']
];
const how = [
  ['Busca y Descubre','Explora paseadores verificados y especialistas en comportamiento en tu área. Lee reseñas y compara servicios.','step-search'],
  ['Reserva y Agenda','Selecciona tu profesional ideal, elige fecha y hora, y reserva de forma segura en nuestra plataforma.','step-calendar'],
  ['Seguimiento y Relax','Sigue los paseos en tiempo real con GPS, recibe fotos y obtén informes detallados del servicio.','step-tracking']
];
const features = [
  ['Profesionales Verificados','Cada paseador y especialista pasa por una verificación exhaustiva de antecedentes.','feature-shield'],
  ['Seguimiento GPS en Tiempo Real','Sigue el paseo de tu mascota en vivo en el mapa. Sabes exactamente dónde está en todo momento.','feature-gps'],
  ['Fotos y Videos','Recibe fotos y videos durante los paseos para que nunca te pierdas un momento.','feature-camera'],
  ['Reseñas Confiables','Lee reseñas honestas de otros dueños y elige al profesional ideal para tu mascota.','feature-star'],
  ['Enfocado en el Bienestar','Cada servicio está diseñado pensando en el bienestar de tu mascota.','feature-heart'],
  ['Impulsado por la Comunidad','Únete a otros dueños y profesionales que aman a las mascotas.','feature-community']
];

function marketingCards(items, steps = false) {
  return items.map(([title, text, glyph], index) => `<article class="marketing-card">
    ${steps ? `<span class="step-index">0${index + 1}</span>` : ''}
    <span class="tile-icon">${icon(glyph)}</span><h3>${title}</h3><p>${text}</p></article>`).join('');
}

const reviews = [
  ['“PawLink me dio tranquilidad. Puedo ver exactamente dónde está mi perro durante los paseos y las fotos son maravillosas.”','Sarah M.','Dueña de mascota'],
  ['“Como paseador, PawLink me ayudó a encontrar clientes de calidad y gestionar mis paseos sin problemas.”','Carlos E.','Paseador profesional'],
  ['“Encontré la ayuda que necesitaba para mi cachorro. El proceso de reserva fue muy sencillo.”','Gabriela L.','Dueña de mascota']
];

export function home() {
  return `<main class="landing">
    <div class="desktop-only">
      <section class="hero"><div class="shell hero-grid">
        <div class="hero-copy"><span class="hero-kicker">${icon('hero-badge')} Plataforma Confiable de Cuidado de Mascotas</span>
          <h1>Conectamos<br>Dueños con<br><em>Profesionales<br>de Confianza</em></h1>
          <p>Reserva con seguridad, rastrea paseos en tiempo real y encuentra paseadores verificados y especialistas certificados en comportamiento animal cerca de ti.</p>
          <div class="actions">${link(`Comenzar Ahora ${icon('hero-arrow')}`,'/registro')}${link('Buscar un Paseador','/paseadores','outline')}</div>
          <div class="hero-proof">${['Profesionales verificados','GPS en vivo','Soporte 24/7'].map(text => `<span>${icon('hero-check')}${text}</span>`).join('')}</div>
        </div>
        <div class="hero-feature card"><div class="feature-head"><span class="tile-icon orange">${icon('hero-users')}</span><div><h3>Dueños de mascotas felices</h3><p>Confianza respaldada por 10,000+ dueños de mascotas</p></div></div>
          <div class="hero-shortcuts">${[
            ['Encontrar paseadores','Cerca a ti','hero-search','/paseadores'],
            ['Seguimiento en vivo','GPS en tiempo real','hero-calendar','/gps.html'],
            ['Fotos de actualización','Durante paseos','hero-camera','/reservas'],
            ['Mejores calificaciones','4.9 promedio','hero-star','/especialistas']
          ].map(([title, description, glyph, href]) => `<a href="${href}">${icon(glyph)}<strong>${title}</strong><small>${description}</small></a>`).join('')}</div></div>
      </div></section>
      <section class="marketing-section shell"><h2>Cómo Funciona PawLink</h2><p>Cuidados a medida confiables para tus mascotas en simples pasos</p><div class="marketing-grid">${marketingCards(how, true)}</div></section>
      <section class="soft-section"><div class="marketing-section shell"><h2>Por Qué los Dueños Eligen PawLink</h2><p>La confianza, seguridad y tranquilidad están en el centro de todo lo que hacemos.</p><div class="marketing-grid">${marketingCards(features)}</div></div></section>
      <section class="marketing-section shell pro-section"><div><h2>¿Eres un profesional de mascotas?</h2><p>Únete a PawLink y haz crecer tu negocio. Conéctate con dueños en tu área y construye tu reputación.</p><ul>${['Sé descubierto por miles de dueños de mascotas','Establece tu propio horario y tarifas','Construye tu perfil profesional con reseñas','Pagos seguros y cobertura de seguro','Accede a herramientas premium y análisis'].map(t => `<li>${icon('check')}${t}</li>`).join('')}</ul><div class="actions">${link('Ser Paseador','/registro?rol=walker')}${link('Ser Especialista','/registro?rol=specialist','outline')}</div></div>
        <div class="pro-preview"><div class="card"><strong>✨</strong><div>Tarifa media<strong>S/25/hr</strong></div></div><p>Paseadores y especialistas de confianza en la comunidad PawLink.</p></div></section>
      <section class="soft-section"><div class="marketing-section shell"><h2>Lo Que Dice Nuestra Comunidad</h2><div class="marketing-grid reviews">${reviews.map(([quote, name, role]) => `<article class="marketing-card"><div class="stars">${icon('star').repeat(5)}</div><p>${quote}</p><strong>${name}</strong><small>${role}</small></article>`).join('')}</div>
      <div class="cta"><h2>¿Listo para darle a tu mascota el mejor cuidado?</h2><p>Únete a miles de dueños felices y profesionales de confianza en PawLink hoy.</p><div class="actions">${link(`Comienza Gratis ${icon('banner-arrow')}`,'/registro','white')}${link('Buscar un Paseador','/paseadores','light-outline')}</div></div></div></section>
    </div>
    <div class="mobile-only mobile-home">
      <section class="mobile-intro card"><h1>Cuidamos a tu mejor amigo.</h1><p>Conecta con los mejores cuidadores y servicios veterinarios en un solo lugar.</p>${link('Comenzar ahora','/registro')}</section>
      <section class="mobile-services"><h2>Servicios Destacados</h2><div>
        <a class="mobile-telemedicine" href="/especialistas"><span>${icon('mobile-service-health')}</span><div><strong>Telemedicina 24/7</strong><small>Consultas rápidas por video.</small></div></a>
        <a href="/paseadores">${icon('mobile-service-walk')}Paseos</a><a href="/especialistas?tema=Nutrición">${icon('mobile-service-food')}Nutrición</a>
      </div></section>
      <section class="mobile-stories"><h2>Historias Reales</h2><div class="story-scroller">
        ${[['Elena Martínez','Dueña de Bruno','elena','Gracias a PawLink encontré al mejor paseador para Bruno. El reporte diario me da muchísima tranquilidad.'],['Gabriela L.','Dueña de mascota','testimonial-second','La reserva fue fácil y encontré ayuda para mi mascota.']].map(([n,role,img,q]) =>
          `<article><div class="stars">${icon('mobile-review-star').repeat(5)}</div><p>“${q}”</p><div class="row-align"><img class="avatar" src="/paw/${img}.jpg" alt=""><div><strong>${n}</strong><small>${role}</small></div></div></article>`).join('')}
      </div></section>
      <section class="mobile-cta"><h2>¿Listo para mejorar la vida de tu mascota?</h2><p>Únete a más de 10,000 dueños que confían en PawLink para el cuidado diario.</p>${link('Registrarse Gratis','/registro')}</section>
      <div class="trust-icons">${['one','two','three','four'].map(id => icon('mobile-trust-'+id)).join('')}</div>
    </div>
  </main>`;
}

export function about() {
  return `<main>
    <section class="about-hero"><span class="hero-kicker">🐾 Sobre PawLink</span><h1>Conectamos Dueños con<br><em>Profesionales de Confianza</em></h1>
      <p>PawLink es una plataforma de cuidado de mascotas basada en la confianza que conecta dueños con paseadores verificados y especialistas certificados en comportamiento animal.</p></section>
    <section class="shell mission-grid"><article><h2>Nuestra Misión</h2><p>Brindar tranquilidad a los dueños de mascotas conectándolos con profesionales de confianza, mejorando la salud, felicidad y bienestar de sus mascotas.</p></article>
    <article><h3><span class="tile-icon">${icon('vision')}</span> Nuestra Visión</h3><p>Convertirnos en el mercado líder de cuidado de mascotas en América Latina, ofreciendo soluciones tecnológicas que mejoren el bienestar animal y fortalezcan la confianza.</p></article></section>
    <section class="soft-section"><div class="marketing-section shell"><h2>Nuestros Valores</h2><div class="marketing-grid">${marketingCards(values)}</div></div></section>
  </main>`;
}

export function authPage(register, role = 'owner') {
  return `<main class="auth-page shell"><div class="auth-title"><h1>${register ? 'Crea tu cuenta' : 'Bienvenido de nuevo'}</h1><p>${register ? 'Únete a nuestra comunidad de amantes de las mascotas.' : 'Inicia sesión en tu cuenta'}</p></div>
  <form class="card auth-form" data-form="${register ? 'register' : 'login'}">
    ${register ? `<fieldset class="role-selection"><legend>Soy...</legend>${Object.entries(roles).map(([key,[title,subtitle]]) =>
      `<label class="role-card"><input type="radio" name="role" value="${key}" ${key === role ? 'checked' : ''}><span class="tile-icon">${icon(({owner:'metric-pets',walker:'step-tracking',specialist:'feature-shield'})[key])}</span><span><strong>${title}</strong><small>${subtitle}</small></span></label>`).join('')}</fieldset>
      ${field('Nombre completo','name',{ placeholder:'John Doe', attrs:'required maxlength="80" autocomplete="name"' })}` : ''}
    ${field('Correo electrónico','email',{ type:'email', placeholder:'you@example.com', attrs:'required maxlength="120" autocomplete="email"' })}
    ${register ? field('Teléfono (opcional)','phone',{ type:'tel',placeholder:'+51 999 000 000', attrs:'maxlength="24" autocomplete="tel"' }) : ''}
    ${field('Contraseña','password',{ type:'password', placeholder:register ? 'Al menos 8 caracteres' : '••••••••', attrs:register ? 'required minlength="8" maxlength="128" autocomplete="new-password"' : 'required maxlength="128" autocomplete="current-password"' })}
    ${formNotice}<button type="submit" class="button primary wide">${register ? 'Crear Cuenta' : 'Iniciar Sesión'}</button>
  </form>
  <p class="auth-switch">${register ? '¿Ya tienes una cuenta? <a href="/iniciar-sesion">Iniciar Sesión</a>' : '¿No tienes una cuenta? <a href="/registro">Registrarse</a>'}</p>
  <details class="demo-options"><summary>Probar con una cuenta de demostración</summary><div class="actions">${Object.entries(roles).map(([key,[title]]) =>
    `<button class="button secondary" type="button" data-action="demo" data-role="${key}">${title}</button>`).join('')}</div></details>
  </main>`;
}

export function help() {
  return `<main class="shell info-page"><h1>Centro de ayuda</h1><div class="card stack">
    <section id="contacto"><h2>Ayuda con un paseo</h2><p>Consulta el estado en Mis Reservas. Para registrar la ruta, abre Mis Paseos y pulsa Empezar.</p></section>
    <section id="seguridad"><h2>Consejos de seguridad</h2><p>Antes de un paseo, revisa el punto de recojo y comparte las indicaciones de cuidado de tu mascota con el paseador.</p></section>
    <section id="privacidad"><h2>Privacidad</h2><p>Esta versión guarda los datos y recorridos en el navegador donde se registraron.</p></section>
    <section id="terminos"><h2>Uso del prototipo</h2><p>Las tarifas, perfiles de muestra y reservas permiten probar el flujo de PawLink. Aquí no se realizan cobros.</p></section>
  </div></main>`;
}
