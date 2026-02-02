# Bahía Go

A mobile app for boat rentals in Cartagena, Colombia, similar to Uber but for yachts, speedboats, jet skis, and other watercraft.

## Tech Stack

- **Frontend**: Expo React Native with TypeScript
- **Backend**: NestJS with TypeScript
- **Database**: Prisma with SQLite
- **Authentication**: JWT with Twilio SMS OTP
- **Navigation**: Expo Router
- **UI**: React Native Paper with dark theme and green accents

## Features

- User authentication with SMS OTP
- Browse available boats
- Book boats
- Favorites
- Messages/Chat
- Saved searches
- Real-time availability
- Location services
- Payment integration (Stripe)

## Estado actual

- Operación enfocada en Cartagena (sin búsqueda por mapa/geocoding).
- Mapa y Google Places removidos; no necesitas `react-native-maps` ni claves de Google para correr la app.

## Setup

### Backend

1. Navigate to `backend/` directory
2. Install dependencies: `npm install`
3. Set up database: `npx prisma migrate dev`
4. Configure environment variables in `.env`
5. Start server: `npm run start:dev` (honors `PORT`, default 8081)

### Frontend

1. Navigate to `app/` directory
2. Install dependencies: `npm install`
3. Define `EXPO_PUBLIC_API_BASE_URL` in `.env` (e.g. `http://192.168.1.18:8081`)
4. Start Expo: `npm start`

## Environment Variables

### Backend (.env)

```
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key-here"
TWILIO_ACCOUNT_SID="your-twilio-account-sid"
TWILIO_AUTH_TOKEN="your-twilio-auth-token"
TWILIO_FROM_NUMBER="+1234567890"
TWILIO_TO_NUMBER="+1234567890"
PORT=8081
ADMIN_EMAILS="admin@bahia-go.com,otro@dominio.com"
```

### Frontend (.env)

```
EXPO_PUBLIC_API_BASE_URL=http://<tu-ip-lan>:8081
```

### Admin (cómo publicar sin que los clientes vean)

- Usa correos listados en `ADMIN_EMAILS` para iniciar sesión y obtener rol ADMIN.
- Los barcos/pasadías tienen `published` (false por defecto). El listado público solo muestra `published=true`.
- Ruta admin para crear embarcaciones desde la app: `/admin/boats/create` (requiere token ADMIN). Ahí puedes dejar `published=false` (borrador) o activarlo cuando quieras que se vea.

## Development

- Backend runs on `http://localhost:8081` (or `http://<tu-ip-lan>:8081` en LAN)
- Frontend usa Expo Go para pruebas
- Usa la IP local en dispositivos físicos; en emulador Android se usa `10.0.2.2`

## Project Structure

```
.
├── app/                    # Expo React Native app
│   ├── app/                # Expo Router pages
│   ├── assets/             # Images and icons
│   ├── components/         # Reusable components
│   └── ...
├── backend/                # NestJS API
│   ├── prisma/             # Database schema
│   ├── src/
│   │   ├── auth/           # Authentication module
│   │   ├── boats/          # Boats module
│   │   ├── prisma/         # Database service
│   │   └── ...
│   └── ...
└── README.md

## Deployment

### Backend

1. Choose a hosting platform (Railway, Render, Heroku, etc.)
2. Set environment variables in your hosting platform:
   - `DATABASE_URL`: Your database URL (for production, use PostgreSQL)
   - `JWT_SECRET`: A secure random string
   - `EMAIL_USER` and `EMAIL_PASS`: For OTP emails
   - `PORT`: Usually set by the platform
   - `ADMIN_EMAILS`: Comma-separated admin emails
   - `WOMPI_PUBLIC_KEY`, `WOMPI_WEBHOOK_SECRET`: For payments
3. Deploy the backend code
4. Run `npx prisma migrate deploy` to apply migrations
5. Run `npx prisma db seed` to seed data (optional)

### Frontend

1. Use Expo Application Services (EAS) for building
2. Configure `EXPO_PUBLIC_API_BASE_URL` to your deployed backend URL
3. Build and submit to app stores using `eas build`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request
```