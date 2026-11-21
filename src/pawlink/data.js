export const walkers = [
  { id: 'daniel', name: 'Daniel Smith', rating: 4.9, reviews: 82, years: 5, rate: 20, districts: ['Miraflores', 'San Isidro'], available: 'Disponible hoy', photos: true, large: true, description: 'Paseador con experiencia y pasión por el cuidado animal. Envío fotos y un resumen de cada paseo.', credentials: 'Primeros auxilios caninos · Paseador certificado' },
  { id: 'emma', name: 'Emma Davis', rating: 4.8, reviews: 55, years: 3, rate: 18, districts: ['San Isidro', 'Lince'], available: 'Disponible mañana', photos: true, large: false, description: 'Paseadora certificada. Hago paseos personalizados según la energía y el carácter de tu mascota.', credentials: 'Manejo y bienestar canino' },
  { id: 'lucia', name: 'Lucía Rojas', rating: 4.7, reviews: 31, years: 4, rate: 17, districts: ['Barranco', 'Miraflores'], available: 'Disponible hoy', photos: true, large: true, description: 'Amo los perros grandes y los paseos largos por el malecón. Experiencia con perros reactivos.', credentials: 'Manejo de perros reactivos' },
  { id: 'frank', name: 'Frank Lopez', rating: 4.5, reviews: 12, years: 2, rate: 15, districts: ['Surco', 'Barranco'], available: 'Disponible el sábado', photos: false, large: true, description: 'Nuevo en PawLink, pero crecí junto a perros y conozco todas sus necesidades.', credentials: 'Cuidado y acompañamiento canino' }
];

export const specialists = [
  { id: 'grace', name: 'Grace Taylor', topic: 'Terapia de Comportamiento', rate: 45, rating: 4.9, description: 'Especialista en ansiedad por separación y socialización temprana. Con más de 8 años de experiencia.', credentials: 'Especialista certificada en comportamiento animal' },
  { id: 'alex', name: 'Alex Morgan', topic: 'Comportamiento Felino', rate: 50, rating: 4.8, description: 'Experto en resolución de conflictos territoriales y problemas de higiene en gatos. Enfoque basado en el bienestar animal.', credentials: 'Especialista en comportamiento felino' }
];

export const roles = {
  owner: ['Dueño de Mascota', 'Necesito cuidado para mis mascotas'],
  walker: ['Paseador', 'Quiero pasear perros'],
  specialist: ['Especialista', 'Ofrezco consultas de comportamiento']
};

export const pets = [
  { id: 'bella', name: 'Bella', species: 'Perro', breed: 'Bulldog Francés', age: 1, weight: 10.5, notes: 'Cachorra, necesita trato con paciencia', photo: '/paw/bella.jpg' },
  { id: 'charlie', name: 'Charlie', species: 'Perro', breed: 'Beagle', age: 4, weight: 12, notes: 'Muy enérgico, le encanta hacer amigos', photo: '/paw/charlie.jpg' }
];

export const bookings = [
  { id: 'PL-1046', pet: 'Bella', provider: 'Frank Lopez', date: '2026-06-25', time: '13:35', minutes: 20, address: 'Av. La Paz 122', amount: 17.25, status: 'confirmed' },
  { id: 'PL-1032', pet: 'Charlie', provider: 'Daniel Smith', date: '2026-06-17', time: '11:45', minutes: 45, address: 'Jr. Luis N Sáenz 1344', amount: 34.5, status: 'completed' }
];

export const consultation = { id: 'C-102', pet: 'Rocky', breed: 'Pastor alemán', owner: 'Carol Martinez', provider: 'Grace Taylor', date: '2026-06-17', time: '11:45', minutes: 45, status: 'confirmed', notes: ['Rocky tiene ansiedad por separación.'] };

export const neighborhoods = ['Miraflores', 'San Isidro', 'Barranco', 'Surco', 'Lince', 'San Borja', 'La Molina'];
export const durations = [20, 30, 45, 60];
export const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
export const money = value => `S/${Number(value).toFixed(2)}`;

export function visitDate(date, time = '') {
  if (!date) return 'Por programar';
  const formatted = new Intl.DateTimeFormat('es-PE', { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(`${date}T00:00:00Z`));
  return time ? `${formatted} · ${time}` : formatted;
}
