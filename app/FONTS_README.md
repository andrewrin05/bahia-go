# Fuentes Personalizadas - Bahía Go

## Fuentes Actuales
La aplicación actualmente usa fuentes del sistema optimizadas para cada plataforma:
- **iOS**: SF Pro (San Francisco) - fuente nativa de Apple
- **Android**: Roboto - fuente nativa de Google
- **Web**: SF Pro Display/Text con fallbacks

## Cómo Instalar Fuentes Personalizadas (Opcional)

Si quieres usar fuentes personalizadas como Inter, sigue estos pasos:

### 1. Descargar Fuentes
Descarga las fuentes Inter desde [Google Fonts](https://fonts.google.com/specimen/Inter):
- Inter-Regular.ttf
- Inter-Medium.ttf
- Inter-SemiBold.ttf
- Inter-Bold.ttf

### 2. Colocar en el Proyecto
Coloca los archivos .ttf en la carpeta `assets/fonts/`

### 3. Actualizar Configuración
Modifica `constants/fonts.js` para usar las fuentes personalizadas:

```javascript
export const fontConfig = {
  fontFamily: 'Inter-Regular',
  fontConfig: {
    // ... configuración para cada plataforma
  },
};
```

### 4. Cargar Fuentes
En `app/_layout.js`, agrega la carga de fuentes:

```javascript
import { useFonts } from 'expo-font';

const [fontsLoaded] = useFonts({
  'Inter-Regular': require('../assets/fonts/Inter-Regular.ttf'),
  // ... otras variantes
});
```

## Beneficios de las Fuentes Actuales
- **Rendimiento**: Fuentes del sistema se cargan instantáneamente
- **Compatibilidad**: Optimizadas para cada plataforma
- **Accesibilidad**: Incluyen características de accesibilidad nativas
- **Tamaño**: No aumentan el tamaño de la app