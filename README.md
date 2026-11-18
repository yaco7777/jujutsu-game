# Jujutsu Life — Simulador de Vida Completa y RPG de Jujutsu Kaisen

Videojuego web de simulación de vida estilo *BitLife* combinado con progresión y combate táctico por turnos en el universo de *Jujutsu Kaisen*. Desarrollado con HTML5, CSS3 y JavaScript moderno (ES Modules) sin dependencias en tiempo de ejecución.

> **Aviso legal**: Obra fan no comercial con fines educativos y recreativos. Todos los eventos, diálogos y textos han sido redactados originalmente en español.

---

## 1. Requisitos e Instalación

- **Node.js**: 18.0.0 o superior.
- **npm**: 9.0.0 o superior.
- **100 % Offline**: No requiere conexión a internet, backend ni APIs externas.

```bash
# Instalar dependencias
npm install

# Ejecutar servidor de desarrollo en http://localhost:5173/
npm run dev

# Compilar versión de producción en ./dist
npm run build

# Ejecutar las 7 suites de pruebas automatizadas (31 pruebas)
npm run test
```

---

## 2. Características Principales

1. **Nacimiento a 1 Año de Edad y Sorteo Único Irreversible**:
   - El jugador solo elige **Nombre**, **Género** y **Región**.
   - El sistema genera aleatoriamente (y bloquea en guardado sin opción de re-sorteo) los **padres**, el **clan**, el **estilo de crianza**, la **economía familiar**, el **talento innato** y la **técnica maldita** ponderada por rareza (*Común ~60%, Rara ~26%, Heredada ~9%, Especial ~5%*).
2. **Cinco Etapas de Vida Realistas (Avance Anual + 4 Acciones por Año)**:
   - **1–5 años (Primera Infancia)**: Desarrollo motor, lenguaje, cuentos con los padres, juegos e indicios de energía maldita.
   - **6–11 años (Infancia Escolar)**: Escuela primaria, despertar de la técnica innata a los 6 años, deportes y primeras amistades.
   - **12–14 años (Preadolescencia)**: Torneos escolares, primeros empleos juveniles, viajes regionales y orientación.
   - **15–17 años (Adolescencia)**: Colegio Técnico de Tokio o Kioto, exámenes de grado, misiones supervisadas y citas románticas.
   - **18+ años (Adultez)**: Carrera profesional (9 caminos posibles), política de clanes, matrimonio, hijos con herencia de talento/técnica, vivienda propia y dominios.
3. **Menú Principal de 13 Secciones**:
   - `01 Vida`, `02 Familia`, `03 Colegio`, `04 Relaciones`, `05 Entrenamiento`, `06 Hechicería`, `07 Misiones`, `08 Viajes`, `09 Economía`, `10 Inventario`, `11 Mundo`, `12 Bitácora`, `13 Configuración`.
4. **Tutorial Interactivo de 20 Etapas (`src/ui/tutorial.js`)**:
   - Guía paso a paso con barra de progreso, resaltado visual de elementos de la interfaz, ejemplos prácticos y botón para probar cada sección.
5. **Sistema de Entrenamiento con Minijuegos y Curva Logarítmica (`src/engine/trainingEngine.js`)**:
   - 8 modalidades (*Fuerza, Velocidad, Resistencia, Control de Energía, Inteligencia Táctica, Maestría Técnica, Concentración y Control Emocional*) con 3 minijuegos interactivos en 4 dificultades (*Fácil, Normal, Difícil, Extremo*), fatiga, riesgo de lesión y fórmula de rendimiento decreciente.
6. **Catálogos Canon Obligatorios**:
   - **20 Técnicas Canon** con coste real, modificador de daño, 2 extensiones y Expansión de Dominio.
   - **20 Personajes Canon** con amistad, respeto, rivalidad, confianza, romance (15+), matrimonio (18+), límite de 2 interacciones anuales por NPC, entrenamiento conjunto y misiones en dúo.
   - **32 Eventos Narrativos** de infancia, escuela, familia, clanes y hechicería que se muestran a **pantalla completa**.

---

## 3. Estructura del Proyecto

```text
jujutsu-life/
├── index.html
├── package.json
├── README.md
├── vite.config.js
├── src/
│   ├── main.js
│   ├── styles/
│   │   └── main.css
│   ├── data/
│   │   ├── techniques.js       # 20 técnicas canon + pesos de rareza
│   │   ├── events.js           # 32 eventos narrativos (infancia a adultez)
│   │   ├── npcs.js             # 20 personajes canon con diálogos y bonificaciones
│   │   ├── items.js            # Herramientas malditas, talismanes y consumibles
│   │   └── missions.js         # Misiones de Grado 4 a Grado Especial
│   ├── engine/
│   │   ├── gameState.js        # Creación, sorteo bloqueado, biografía y sanitización
│   │   ├── gameLoop.js         # Avance anual, 4 acciones por año, noticias y finales
│   │   ├── progression.js      # Grados, exámenes, RCT, Dominio Simple/Expansión y 9 caminos
│   │   ├── trainingEngine.js   # 8 modalidades, minijuegos, fatiga y curva logarítmica
│   │   ├── schoolEngine.js     # Asistencia, notas, becas, 6 deportes y torneos
│   │   ├── familyEngine.js     # Padres, hermanos, abuelos, crianza, vivienda, empleos e hijos
│   │   ├── travelEngine.js     # 7 destinos, requisitos, costes y encuentros locales
│   │   ├── eventEngine.js      # Selección contextual y resolución de eventos
│   │   ├── combatEngine.js     # Combate por turnos, Destello Negro, votos y permadeath
│   │   ├── relationships.js    # Límites de interacción, romance, matrimonio, alianzas y dúos
│   │   ├── inventory.js        # Compra, venta, equipamiento y uso de consumibles
│   │   ├── saveSystem.js       # 3 ranuras, autoguardado y exportación/importación JSON
│   │   └── utils.js            # Funciones auxiliares y formateo
│   └── ui/
│       ├── render.js           # Orquestador reactivo de las 13 secciones y minijuegos
│       ├── navigation.js       # Navegación de 13 pestañas, modales y atajos
│       ├── views.js            # Generadores HTML de las 13 secciones y eventos pantalla completa
│       ├── tutorial.js         # Tutorial interactivo paso a paso de 20 etapas
│       ├── animations.js       # Efectos visuales y audio sintetizado Web Audio opcional
│       ├── confirmations.js    # Diálogos de confirmación para decisiones importantes
│       └── notifications.js    # Notificaciones visuales toast
└── tests/
    ├── gameState.test.js
    ├── combatEngine.test.js
    ├── eventEngine.test.js
    ├── progression.test.js
    ├── trainingEngine.test.js
    ├── relationships.test.js
    └── saveSystem.test.js
```
