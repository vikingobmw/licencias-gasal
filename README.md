# GASAL Auth - Gestor de Licencias

Servidor central de licencias y activaciones para el Ecosistema GASAL.

## ✨ Características Principales

- **Emisión de Licencias**: Generación de claves únicas vinculadas a productos.
- **Validación de Hardware**: Control estricto de activaciones por ID de equipo.
- **Gestión de Sesiones**: Administración de usuarios con roles de Admin/Visor.
- **Seguridad**: Eye-toggle en contraseñas y prevención de caché de credenciales.

## 🚀 Instalación y Uso Local

1. **Instalar dependencias**:
   ```bash
   npm install
   ```

2. **Configurar Base de Datos**:
   Asegúrate de tener un archivo `.env` configurado con tu `DATABASE_URL` (SQLite por defecto).
   ```bash
   npx prisma generate
   npx prisma db push
   ```

3. **Iniciar servidor de desarrollo**:
   ```bash
   npm run dev
   ```
   El servidor estará disponible en [http://localhost:3001](http://localhost:3001).

## 📡 Integración con Clientes

Cualquier aplicación de GASAL que requiera validación debe apuntar a este servidor.
- **En desarrollo**: Apuntar a `http://localhost:3001`.
- **En producción**: Definir `NEXT_PUBLIC_LICENSE_SERVER_URL` en las aplicaciones cliente.

---
© 2026 GASAL
