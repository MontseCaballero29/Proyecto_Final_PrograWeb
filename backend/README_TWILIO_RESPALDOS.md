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

- Al registrar un perfil de artesano se solicita un SMS indicando que está en revisión.
- Al aprobarlo desde la pantalla de edición se solicita un WhatsApp indicando que fue aprobado.
- Si Twilio está deshabilitado, falta una credencial o el usuario no tiene teléfono, el proceso principal continúa y el backend registra la causa en la consola.

Para usar el Sandbox de WhatsApp, el teléfono receptor debe haberse unido previamente al Sandbox de la cuenta de Twilio.

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
