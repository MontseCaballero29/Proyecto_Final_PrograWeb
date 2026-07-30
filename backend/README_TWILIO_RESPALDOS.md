# Twilio y respaldos de MySQL

## Variables para Twilio

No escribas las credenciales directamente en `application.properties`. Define estas variables de entorno:

```text
TWILIO_ENABLED=true
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_SMS_FROM=+1xxxxxxxxxx
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
```

Los teléfonos de los usuarios deben guardarse en formato internacional E.164, por ejemplo `+529511234567`.

- El formulario **Crear cuenta** solicita el celular antes de registrar al visitante.
- Una cuenta existente puede agregar o corregir su número en **Configuración → Datos personales**.
- Al registrar un perfil de artesano se solicita un SMS indicando que está en revisión.
- Al aprobarlo desde la pantalla de edición se solicita un WhatsApp indicando que fue aprobado.
- Si Twilio está deshabilitado, falta una credencial o el usuario no tiene teléfono, el proceso principal continúa y el backend registra la causa en la consola.

Para usar el Sandbox de WhatsApp, el teléfono receptor debe haberse unido previamente al Sandbox de la cuenta de Twilio.

## Flujo de prueba

1. Crea una cuenta de visitante con un celular real en formato internacional.
2. Inicia sesión como administrador y registra como artesano a ese usuario. El sistema solicitará el envío del SMS.
3. Abre el perfil del artesano y apruébalo. El sistema solicitará el envío por WhatsApp.

En una cuenta de prueba de Twilio, verifica también que el número receptor esté autorizado. Para WhatsApp Sandbox, el receptor debe enviar primero el código de unión que muestra la consola de Twilio.

## Generar respaldo `.sql`

### Windows PowerShell

Desde la carpeta `backend`:

```powershell
$env:DB_USER = "root"
$env:DB_PASSWORD = "TU_PASSWORD"
.\scripts\generar-respaldo.ps1
```

### Linux

Desde la carpeta `backend`:

```bash
DB_USER=root DB_PASSWORD='TU_PASSWORD' ./scripts/generar-respaldo.sh
```

El archivo se crea en `backend/backups/` con fecha y hora. Los `.sql` están ignorados por Git para no publicar datos de la base de datos.
