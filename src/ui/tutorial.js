export const TUTORIAL_STAGES = [
  {
    step: 1,
    title: '1. Presentación del Mundo',
    highlightSelector: '.brand-block',
    tabSuggestion: 'vida',
    explanation: 'Bienvenido a Jujutsu Life. Vivirás una existencia completa desde tu nacimiento (1 año) hasta tu madurez, retiro o muerte en un mundo donde las emociones humanas engendran maldiciones.',
    example: 'Ejemplo: No todo es combatir; tu crianza, estudios, amigos, deportes, salud mental y economía familiar son tan importantes como tu técnica.'
  },
  {
    step: 2,
    title: '2. Pantalla de Nacimiento y Bloqueo de Sorteo',
    highlightSelector: '#main-view',
    tabSuggestion: 'vida',
    explanation: 'Al nacer solo eliges Nombre, Género y Región. Todo tu linaje, talento y técnica se generan de forma única e irreversible.',
    example: 'Ejemplo: Una vez confirmada tu vida, no existe botón de re-sorteo ni se altera recargando la página.'
  },
  {
    step: 3,
    title: '3. Información de los Padres y Familia',
    highlightSelector: '[data-tab="familia"]',
    tabSuggestion: 'familia',
    explanation: 'Tus padres tienen nombres, profesiones, afecto, ingresos y un estilo de crianza que moldea tu desarrollo infantil.',
    example: 'Ejemplo: Una familia del Clan Gojo inicia con gran patrimonio y dojo, mientras que una familia común destaca en calidez y apoyo.'
  },
  {
    step: 4,
    title: '4. Estadísticas del Personaje',
    highlightSelector: '#sidebar-stats',
    tabSuggestion: 'vida',
    explanation: 'En el panel izquierdo ves tu Salud, Energía Maldita, Fuerza, Velocidad, Inteligencia, Control, Salud Mental, Prestigio y Cansancio.',
    example: 'Ejemplo: Si tu Cansancio supera 75, entrenas peor y corres riesgo de lesionarte hasta que descanses.'
  },
  {
    step: 5,
    title: '5. Técnica Innata y Rareza',
    highlightSelector: '[data-tab="hechiceria"]',
    tabSuggestion: 'hechiceria',
    explanation: 'Existen 20 técnicas canon clasificadas en Común, Rara, Heredada y Especial. Cuanto más poderosa es una técnica, menor es su probabilidad al nacer.',
    example: 'Ejemplo: Tu técnica permanece latente de 1 a 5 años y despierta a los 6 años de edad.'
  },
  {
    step: 6,
    title: '6. Interfaz Principal de 13 Secciones',
    highlightSelector: '#main-nav',
    tabSuggestion: 'vida',
    explanation: 'El menú superior organiza tu vida en 13 apartados claros: Vida, Familia, Colegio, Relaciones, Entrenamiento, Hechicería, Misiones, Viajes, Economía, Inventario, Mundo, Bitácora y Configuración.',
    example: 'Ejemplo: Puedes cambiar de sección con un clic o usando atajos de teclado.'
  },
  {
    step: 7,
    title: '7. Sistema de 4 Acciones Anuales',
    highlightSelector: '.action-orbs',
    tabSuggestion: 'vida',
    explanation: 'Cada año dispones de exactamente 4 acciones principales representadas por 4 orbes luminosos.',
    example: 'Ejemplo: Cada vez que entrenas, estudias, viajas o haces una misión, consumes 1 de las 4 acciones del año.'
  },
  {
    step: 8,
    title: '8. Avance Anual y Cumpleaños',
    highlightSelector: '#btn-advance-quarter',
    tabSuggestion: 'vida',
    explanation: 'Al pulsar "Avanzar Año (+1 Año)" cumples un año más, se actualizan tus familiares, el colegio, las finanzas y recuperas tus 4 acciones.',
    example: 'Ejemplo: Al cumplir 6 años ingresas a Primaria y despiertas tu don; a los 15 años ingresas al Colegio Técnico.'
  },
  {
    step: 9,
    title: '9. Entrenamiento con Minijuegos y Curva Logarítmica',
    highlightSelector: '[data-tab="entrenamiento"]',
    tabSuggestion: 'entrenamiento',
    explanation: 'Entrena cada estadística mediante minijuegos de sincronización, memoria de sellos y reflejos en 4 dificultades. El progreso es logarítmico.',
    example: 'Ejemplo: Subir una estadística de 10 a 15 es sencillo, pero pasar de 80 a 85 exige dificultad Difícil o Extremo.'
  },
  {
    step: 10,
    title: '10. Relaciones y Límites de Interacción',
    highlightSelector: '[data-tab="relaciones"]',
    tabSuggestion: 'relaciones',
    explanation: 'Interactúa con los 20 personajes canon (amistad, respeto, rivalidad, confianza y romance en edad adecuada). Tienes un límite de 2 interacciones por personaje al año.',
    example: 'Ejemplo: A partir de los 15 años puedes iniciar una relación romántica y en la adultez casarte y tener descendencia.'
  },
  {
    step: 11,
    title: '11. Vida Normal y Sistema Escolar',
    highlightSelector: '[data-tab="colegio"]',
    tabSuggestion: 'colegio',
    explanation: 'Tu asistencia, tareas, disciplina y exámenes escolares determinan tus calificaciones, reputación académica y acceso a becas.',
    example: 'Ejemplo: Obtener 80+ en los exámenes anuales te otorga una Beca escolar de 12.000 ¥.'
  },
  {
    step: 12,
    title: '12. Deportes y Competiciones',
    highlightSelector: '[data-tab="colegio"]',
    tabSuggestion: 'colegio',
    explanation: 'Desde los 6 años puedes unirte a clubes de Atletismo, Natación, Gimnasia, Fútbol, Baloncesto o Artes Marciales.',
    example: 'Ejemplo: Practicar deporte mejora tus estadísticas físicas y te permite ganar torneos escolares.'
  },
  {
    step: 13,
    title: '13. Economía, Vivienda y Empleos por Edad',
    highlightSelector: '[data-tab="economia"]',
    tabSuggestion: 'economia',
    explanation: 'Gestiona tus ahorros, pide mesada en la niñez, trabaja en empleos acordes a tu edad y mejora la vivienda familiar.',
    example: 'Ejemplo: Mudarte a una Residencia con Dojo o Mansión con Barrera incrementa tu recuperación anual y prestigio.'
  },
  {
    step: 14,
    title: '14. Sistema de Viajes y Exploración',
    highlightSelector: '[data-tab="viajes"]',
    tabSuggestion: 'viajes',
    explanation: 'Viaja a Tokio, Kioto, las sedes de los Tres Clanes, Sendai, Shibuya, las montañas de Hida o expediciones internacionales.',
    example: 'Ejemplo: Cada destino tiene requisitos de edad/rango, coste, personajes locales y eventos propios.'
  },
  {
    step: 15,
    title: '15. Eventos Principales a Pantalla Completa',
    highlightSelector: '#main-view',
    tabSuggestion: 'vida',
    explanation: 'Los acontecimientos cruciales (despertar de técnica, ingreso escolar, ataques de maldiciones, dilemas de clan) ocupan toda la pantalla.',
    example: 'Ejemplo: Tus elecciones quedan registradas en tu Memoria de Decisiones y moldean tu personalidad.'
  },
  {
    step: 16,
    title: '16. Misiones por Grado y Edad',
    highlightSelector: '[data-tab="misiones"]',
    tabSuggestion: 'misiones',
    explanation: 'Realiza misiones de investigación, escolta, infiltración y exorcismo desde Grado 4 hasta Grado Especial.',
    example: 'Ejemplo: Un niño pequeño no puede aceptar misiones letales; se desbloquean progresivamente según tu edad y grado.'
  },
  {
    step: 17,
    title: '17. Combate Táctico por Turnos',
    highlightSelector: '[data-tab="misiones"]',
    tabSuggestion: 'misiones',
    explanation: 'En combate eliges entre Ataque Básico, Técnica Maldita, Extensiones, Defensa/Dominio Simple, Técnica Inversa, Voto Vinculante, Objetos o Huir.',
    example: 'Ejemplo: Si tu Salud cae a 0 en combate, sufres muerte permanente (Permadeath).'
  },
  {
    step: 18,
    title: '18. Inventario, Reliquias y Coleccionables',
    highlightSelector: '[data-tab="inventario"]',
    tabSuggestion: 'inventario',
    explanation: 'Equipa armas malditas y talismanes para sumar bonificaciones de ataque, defensa, velocidad y reducción de coste de energía.',
    example: 'Ejemplo: Usa botiquines o sueros de Shoko Ieiri para recuperarte antes o durante un enfrentamiento.'
  },
  {
    step: 19,
    title: '19. Guardado en 3 Ranuras y Exportación JSON',
    highlightSelector: '#btn-open-saves',
    tabSuggestion: 'configuracion',
    explanation: 'El juego guarda automáticamente cada año y dispone de 3 ranuras manuales más exportación e importación en archivo JSON.',
    example: 'Ejemplo: El sistema valida la integridad del archivo y protege tu partida ante datos corruptos.'
  },
  {
    step: 20,
    title: '20. Decisiones, Consecuencias y Múltiples Finales',
    highlightSelector: '[data-tab="mundo"]',
    tabSuggestion: 'mundo',
    explanation: 'Cada decisión altera tu reputación con las facciones, genera rumores y conduce a más de 10 finales distintos (Grado Especial, Líder de Clan, Profesor, Usuario Maldito, Vida Familiar...).',
    example: 'Ejemplo: Puedes consultar este tutorial en cualquier momento desde el botón "Tutorial" de la cabecera.'
  }
];

export function renderStepByStepTutorial(currentStepIndex = 0) {
  const total = TUTORIAL_STAGES.length;
  const idx = Math.min(total - 1, Math.max(0, Number(currentStepIndex) || 0));
  const stage = TUTORIAL_STAGES[idx];
  const progressPct = Math.round(((idx + 1) / total) * 100);

  return `
    <div class="tutorial-wizard">
      <div class="stat-header" style="margin-bottom: 6px;">
        <span>Progreso del Tutorial Interactivo</span>
        <strong>Etapa ${idx + 1} de ${total} (${progressPct}%)</strong>
      </div>
      <div class="progress-track" style="margin-bottom: 12px;">
        <div class="progress-fill bar-ce" style="width: ${progressPct}%"></div>
      </div>

      <div class="tutorial-stepper-dots" style="flex-wrap: wrap;">
        ${TUTORIAL_STAGES.map((st, i) => `
          <button
            type="button"
            class="tutorial-dot ${i === idx ? 'is-current' : ''}"
            data-tutorial-step="${i}"
            title="${st.title}"
          >
            ${i + 1}
          </button>
        `).join('')}
      </div>

      <div class="card card-highlight birth-reveal-anim" style="padding: 18px; margin-bottom: 14px;">
        <div class="badge-row" style="margin-bottom: 6px;">
          <span class="badge badge-accent">Etapa ${stage.step} / ${total}</span>
          <span class="badge badge-gold">Sección relacionada: ${stage.tabSuggestion.toUpperCase()}</span>
        </div>
        <h3 class="card-title" style="font-size: 1.18rem; margin-bottom: 8px;">${stage.title}</h3>
        <p class="card-desc" style="color: var(--text-primary); font-size: 0.94rem;">${stage.explanation}</p>
        <div class="card" style="margin-top: 10px; background: #0d121d;">
          <p class="card-desc" style="color: #6ee7b7;"><strong>${stage.example}</strong></p>
        </div>
      </div>

      <div class="action-bar" style="justify-content: space-between;">
        <button
          type="button"
          class="btn btn-secondary"
          data-tutorial-step="${idx - 1}"
          ${idx === 0 ? 'disabled' : ''}
        >
          ← Anterior
        </button>

        <button
          type="button"
          class="btn btn-outline btn-sm"
          data-tutorial-try-tab="${stage.tabSuggestion}"
        >
          Probar Sección (${stage.tabSuggestion})
        </button>

        ${idx < total - 1 ? `
          <button type="button" class="btn btn-primary" data-tutorial-step="${idx + 1}">
            Siguiente Etapa →
          </button>
        ` : `
          <button type="button" class="btn btn-primary" data-action="close-tutorial">
            ¡Finalizar Tutorial y Jugar!
          </button>
        `}
      </div>
    </div>
  `;
}

export function highlightTutorialElement(stepIndex = 0) {
  if (typeof document === 'undefined') return;
  document.querySelectorAll('.tutorial-highlighted').forEach((el) => {
    el.classList.remove('tutorial-highlighted');
  });
  const stage = TUTORIAL_STAGES[stepIndex];
  if (!stage || !stage.highlightSelector) return;
  const target = document.querySelector(stage.highlightSelector);
  if (target) {
    target.classList.add('tutorial-highlighted');
  }
}
