# Configuración de pagos Wompi

## Variables de entorno (backend)
- `WOMPI_PUBLIC_KEY`: llave pública (prod: `pub_...`, sandbox: `test_...`).
- `WOMPI_WEBHOOK_SECRET`: "Eventos Webhook Secret" para verificar la firma HMAC del webhook.
- `WOMPI_BASE_URL` (opcional): `https://sandbox.wompi.co` para pruebas. Prod por defecto: `https://production.wompi.co`.
- `WOMPI_REDIRECT_URL` (opcional): URL o deep link al que regresa el usuario tras el checkout.

Ejemplo sandbox:
```
WOMPI_PUBLIC_KEY=test_pub_123
WOMPI_WEBHOOK_SECRET=whk_test_abc
WOMPI_BASE_URL=https://sandbox.wompi.co
WOMPI_REDIRECT_URL=https://checkout.bahiago.app/return
```

## Flujo de pago
1) App llama a `POST /payments/wompi/checkout` con `bookingId` (autenticado). Se guarda `paymentReference` y `paymentStatus=pending_payment` en la reserva.
2) El backend responde con `checkoutUrl`. La app abre esa URL (tarjeta, PSE, Nequi, débito Bancolombia).
3) Wompi envía webhook a `/payments/wompi/webhook` con `reference` y `status`. Se valida la firma con `WOMPI_WEBHOOK_SECRET` y se actualiza la reserva:
   - APPROVED → `paymentStatus=paid`, `status=confirmed`
   - PENDING → `paymentStatus=pending_payment`
   - DECLINED/ERROR → `paymentStatus=failed`
   - VOIDED → `paymentStatus=cancelled`

## Checklist de despliegue
- Configurar las env vars anteriores en el entorno de producción.
- Exponer públicamente `/payments/wompi/webhook` y registrar esa URL en el dashboard de Wompi.
- Habilitar cuentas de abono en Wompi (tarjetas, PSE, Nequi, débito Bancolombia) según tus bancos.
- Incrementar versión y desplegar backend; ejecutar migración Prisma (`npx prisma migrate deploy`).

## Notas
- Para ambientes locales, usa sandbox y `WOMPI_BASE_URL=https://sandbox.wompi.co`.
- Si usas una URL de retorno propia, actualiza también la app para manejar el deep link si quieres cerrar el flujo in-app.
