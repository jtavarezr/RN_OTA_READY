# Plan de Implementación Completa para Gestión de Perfiles

## 1. Servidor (Express Bridge)
### Dependencias y Configuración
- Instalar `joi` para validación robusta de datos.
- Instalar `jest` y `supertest` para pruebas unitarias e integrales.

### Implementación de API RESTful
- **Validación**: Crear esquemas Joi para `UserProfile` (asegurando tipos, longitudes máximas y formatos como email/teléfono).
- **Middleware de Autenticación**: Implementar un middleware que verifique la existencia del usuario en Appwrite antes de permitir operaciones de escritura.
- **Endpoints**:
    - `GET /api/profile/:userId`: Lectura (ya existente, se mejorará el manejo de errores).
    - `POST /api/profile`: Creación/Reemplazo (validación estricta).
    - `PATCH /api/profile/:userId`: Actualización parcial (ideal para cambios rápidos).
    - `DELETE /api/profile/:userId`: (Opcional) Limpieza de datos.

### Pruebas
- Crear `server/tests/profile.test.js` para probar todos los endpoints y casos de borde (datos inválidos, usuario no existente).

## 2. Cliente (React Native)
### Dependencias
- Instalar `react-hook-form` y `zod` para manejo eficiente de formularios y validación en el cliente.

### UI de Edición de Perfil
- **Componente de Edición**: Crear un Modal o Pantalla separada (`EditProfileScreen`) para no saturar la vista de lectura.
- **Formulario Completo**:
    - Campos de texto simples: Nombre, Título, Resumen, Ubicación.
    - Listas dinámicas: Experiencia y Educación (añadir/editar/eliminar items).
    - Selector de Skills: Input de etiquetas.
- **Feedback Visual**:
    - Indicadores de carga (`ActivityIndicator`) en botones.
    - Mensajes de éxito/error (Toast o Banner).

### Lógica de Negocio
- Integrar `saveProfile` con el formulario validado.
- Manejo optimista de la UI (reflejar cambios inmediatamente mientras se guardan).

### Pruebas
- Crear `src/screens/main/__tests__/ProfileScreen.test.tsx` para verificar renderizado y flujo de edición.

## 3. Documentación y Seguridad
- **Swagger**: Actualizar la definición OpenAPI en `server/index.js` para documentar los nuevos esquemas de validación y respuestas.
- **Seguridad**: Asegurar que no se envíen datos sensibles innecesarios y sanitizar inputs.
