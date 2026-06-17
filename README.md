# BuildPulse - Gestión de Incidencias Operacionales de Obra

BuildPulse es una aplicación web e interfaz técnica diseñada para la centralización, reporte y análisis espacial de fallas o errores durante procesos de construcción.

## 🚀 Demo en Vivo & Repositorio
* **Despliegue en producción:** [build-pulse.vercel.app](https://build-pulse.vercel.app)

---

## 🔒 Acceso & Autenticación (Punto Extra)
El proyecto cuenta con un flujo de autenticación simulado de alta fidelidad gestionado globalmente, con persistencia de sesión en el navegador.

* **Correo Electrónico:** `admin@buildpulse.com`
* **Contraseña:** `admin123`

---

## 🛠️ Stack Tecnológico Utilizado
1. **React.js & Next.js (App Router):** Arquitectura basada en Server/Client Components optimizados para el rendimiento de renderizado.
2. **Zustand:** Manejo del estado global de la aplicación (incidencias, filtros y sesión de usuario) integrado con el middleware `persist` para soporte ante recargas (`F5`).
3. **Mapbox GL:** Visualización geoespacial e interactiva de incidencias directamente sobre el mapa de la obra.
4. **SCSS (Sass):** Estructuración de estilos modularizada, responsive y con un diseño estético oscuro premium.
5. **Lucide React:** Set de iconos limpios y congruentes para la interfaz.

---

## ✨ Características Clave Implementadas

### 📌 1. Visor de Mapa e Incidencias
* Recreación fluida de la vista del mapa basada en capturas de diseño corporativo.
* Flujo dinámico de creación de incidencias mediante clicks espaciales sobre el mapa.
* Persistencia inmediata de los nuevos reportes reflejados con marcadores visuales interactivos.

### 📊 2. Dashboard Analítico Avanzado
* Centralización global de indicadores basados en el archivo `incidents.mock.json`.
* Métricas en tiempo real de estados (Abiertas, Pausadas, Cerradas) y criticidad (Alta, Media, Baja).
* Gráficos dinámicos interactivos (Torta y Área) que optimizan automáticamente su espacio para evitar descompases de carga en el navegador.

### 💡 3. Propuestas de Criterio Propio (Ir más allá)
* **Control de Sesión:** Sistema ineludible de Login/Logout para protección de vistas operacionales.
* **Fecha de Vencimiento:** Formulario extendido con captura de 'Fecha de vencimiento operativo', alimentando en tiempo real las alertas de la tabla de hallazgos críticos de hoy para evitar retrasos en obra.
* **Consola de Desarrollo Limpia:** Eliminación sistemática de advertencias asíncronas de herencia vertical en gráficos, garantizando una consola limpia de warnings (`F12`).
* **Diseño Súper Responsive:** Soporte completo multiplataforma, adaptando la navegación a un menú inferior fluido en dispositivos móviles.

---

## 💻 Instalación y Desarrollo Local

1. Clonar el repositorio:
   ```bash
   git clone [https://github.com/JonatanGaona/BuildPulse.git](https://github.com/JonatanGaona/BuildPulse.git)
   cd BuildPulse
Instalar las dependencias:

### Bash
npm install
Configurar las variables de entorno en un archivo .env.local:

### Fragmento de código
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=tu_mapbox_token_aqui

Levantar el servidor de desarrollo:
### Bash
npm run dev
Abra http://localhost:3000 en el navegador para ver el resultado.

Desarrollado con criterio y pasión por Jonatan Gaona · 2026