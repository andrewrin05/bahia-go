import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

const translations = {
  profileTitle: { es: 'Perfil', en: 'Profile' },
  profileSubtitle: {
    es: 'Accede a tus reservas desde cualquier dispositivo y guarda tus datos personales.',
    en: 'Access your bookings from any device and save your personal details.',
  },
  ctaLogin: { es: 'Iniciar sesión o registrarse', en: 'Sign in or register' },
  settingsTitle: { es: 'Ajustes', en: 'Settings' },
  currencyLabel: { es: 'Moneda', en: 'Currency' },
  currencyCOP: { es: 'COP (Peso colombiano)', en: 'COP (Colombian Peso)' },
  currencyUSD: { es: 'USD', en: 'USD' },
  languageLabel: { es: 'Idioma', en: 'Language' },
  languageES: { es: 'Español', en: 'Spanish' },
  languageEN: { es: 'English', en: 'English' },
  appearanceLabel: { es: 'Apariencia', en: 'Appearance' },
  appearanceDark: { es: 'Oscuro', en: 'Dark' },
  appearanceLight: { es: 'Claro', en: 'Light' },
  notificationsLabel: { es: 'Notificaciones', en: 'Notifications' },
  notificationsSoon: { es: 'Configurable próximamente.', en: 'Configurable soon.' },
  helpTitle: { es: 'Ayuda', en: 'Help' },
  about: { es: 'Sobre Bahía Go', en: 'About Bahía Go' },
  aboutLegal: { es: 'Acerca de y legal', en: 'About & legal' },
  aboutBody: {
    es: 'Alquiler de embarcaciones en Cartagena.',
    en: 'Boat rentals in Cartagena.',
  },
  aboutDescription: {
    es: 'Bahía Go te conecta con embarcaciones y experiencias náuticas en Cartagena.',
    en: 'Bahía Go connects you with boats and nautical experiences in Cartagena.',
  },
  versionLabel: { es: 'Versión', en: 'Version' },
  supportTitle: { es: 'Soporte y contacto', en: 'Support & contact' },
  supportEmailLabel: { es: 'Escríbenos a', en: 'Contact us at' },
  legalTitle: { es: 'Avisos legales', en: 'Legal notices' },
  privacyPolicy: { es: 'Política de privacidad', en: 'Privacy policy' },
  termsOfService: { es: 'Términos de servicio', en: 'Terms of service' },
  legalDisclaimer: {
    es: 'Consulta los documentos oficiales en los enlaces a continuación.',
    en: 'Review the official documents at the links below.',
  },
  termsTitle: { es: 'Términos de servicio', en: 'Terms of Service' },
  termsIntro: {
    es: 'Estas condiciones regulan el uso de Bahía Go y las reservas realizadas en la plataforma.',
    en: 'These terms govern your use of Bahía Go and the bookings made through the platform.',
  },
  termsScope: { es: 'Alcance y relación contractual', en: 'Scope and contractual relationship' },
  termsBookings: { es: 'Reservas, cambios y cancelaciones', en: 'Bookings, changes, and cancellations' },
  termsPayments: { es: 'Pagos, tarifas y cargos', en: 'Payments, fees, and charges' },
  termsConduct: { es: 'Conducta del usuario', en: 'User conduct' },
  termsLiability: { es: 'Responsabilidad y limitaciones', en: 'Liability and limitations' },
  termsChanges: { es: 'Cambios en los términos', en: 'Changes to the terms' },
  termsContact: { es: 'Contacto', en: 'Contact' },
  termsScopeItems: {
    es: [
      'Bahía Go conecta usuarios con propietarios/anfitriones de embarcaciones y experiencias; no es el proveedor directo del servicio náutico.',
      'Cada reserva constituye un contrato entre el usuario y el anfitrión; Bahía Go facilita el pago y la gestión.',
      'Al usar la app aceptas estos términos y la política de privacidad.',
    ],
    en: [
      'Bahía Go connects users with boat owners/hosts; it is not the direct provider of nautical services.',
      'Each booking is a contract between the user and the host; Bahía Go facilitates payment and management.',
      'By using the app you agree to these terms and the privacy policy.',
    ],
  },
  termsBookingsItems: {
    es: [
      'Debes revisar disponibilidad, detalles y políticas específicas del anfitrión antes de reservar.',
      'Cambios o cancelaciones siguen la política del anfitrión y/o la que se muestre en la reserva.',
      'Podemos cancelar o rechazar reservas por motivos de seguridad, fraude o incumplimiento.',
    ],
    en: [
      'You must review availability, details, and host-specific policies before booking.',
      'Changes or cancellations follow the host policy and/or the policy shown in the booking.',
      'We may cancel or decline bookings for safety, fraud, or violations.',
    ],
  },
  termsPaymentsItems: {
    es: [
      'Pagos se procesan mediante proveedores como Stripe; pueden aplicarse comisiones o cargos de servicio.',
      'Impuestos y tasas locales pueden añadirse según la ubicación del servicio.',
      'Propinas o cargos adicionales a bordo son responsabilidad del usuario y anfitrión según acuerden.',
    ],
    en: [
      'Payments are processed via providers like Stripe; service fees or commissions may apply.',
      'Taxes and local fees may be added depending on the service location.',
      'Tips or onboard extra charges are handled between user and host as agreed.',
    ],
  },
  termsConductItems: {
    es: [
      'Usa la app conforme a la ley y respeta a anfitriones, tripulación y otros usuarios.',
      'No realices actividades ilegales, fraudulentas o peligrosas; sigue las instrucciones de seguridad a bordo.',
      'Eres responsable de la veracidad de tu información y de los daños causados por incumplimiento.',
    ],
    en: [
      'Use the app lawfully and respect hosts, crew, and other users.',
      'Do not engage in illegal, fraudulent, or unsafe activities; follow safety instructions onboard.',
      'You are responsible for the accuracy of your information and for damages caused by violations.',
    ],
  },
  termsLiabilityItems: {
    es: [
      'Bahía Go no garantiza la disponibilidad continua del servicio y se ofrece "tal cual".',
      'La responsabilidad de Bahía Go se limita en la medida permitida por la ley; no somos responsables por daños indirectos o pérdida de ganancias.',
      'Los anfitriones son responsables de la calidad y seguridad de las embarcaciones y experiencias que ofrecen.',
    ],
    en: [
      'Bahía Go does not guarantee uninterrupted service and is provided “as is.”',
      'Bahía Go liability is limited to the maximum extent permitted by law; we are not liable for indirect or consequential damages.',
      'Hosts are responsible for the quality and safety of boats and experiences they offer.',
    ],
  },
  termsChangesBody: {
    es: 'Podemos actualizar estos términos. Si hay cambios sustanciales, te lo notificaremos y seguir usando la app implicará aceptación de la versión vigente.',
    en: 'We may update these terms. If there are material changes, we will notify you; continued use means acceptance of the current version.',
  },
  termsContactBody: {
    es: 'Para dudas sobre estos términos, contáctanos en soporte@bahiago.com.',
    en: 'For questions about these terms, contact us at soporte@bahiago.com.',
  },
  privacyTitle: { es: 'Política de privacidad', en: 'Privacy Policy' },
  privacyIntro: {
    es: 'Esta política explica qué datos recopilamos, cómo los usamos y tus opciones como usuario de Bahía Go.',
    en: 'This policy explains what data we collect, how we use it, and your choices as a Bahía Go user.',
  },
  privacyDataWeCollect: { es: 'Datos que recopilamos', en: 'Data we collect' },
  privacyUse: { es: 'Cómo usamos los datos', en: 'How we use data' },
  privacyShare: { es: 'Cuándo compartimos datos', en: 'When we share data' },
  privacyRetention: { es: 'Conservación de datos', en: 'Data retention' },
  privacySecurity: { es: 'Seguridad', en: 'Security' },
  privacyRights: { es: 'Tus derechos', en: 'Your rights' },
  privacyChildren: { es: 'Menores de edad', en: 'Children' },
  privacyContact: { es: 'Contacto', en: 'Contact' },
  privacyDataItems: {
    es: [
      'Datos de cuenta: nombre, email, teléfono (para reservas y soporte).',
      'Datos de reserva: embarcación, fechas, huéspedes y preferencias.',
      'Pagos: tokens de pago y estado de transacciones (Stripe procesa los pagos, no guardamos tu tarjeta completa).',
      'Ubicación: aproximada o en segundo plano para mostrar opciones cercanas (solo si la habilitas).',
      'Uso y dispositivo: identificadores del app, idioma, tipo de dispositivo, IP, logs técnicos para seguridad y analítica básica.',
      'Comunicaciones: mensajes con anfitriones y soporte.',
    ],
    en: [
      'Account data: name, email, phone (for bookings and support).',
      'Booking data: boat, dates, guests, and preferences.',
      'Payments: payment tokens and transaction status (Stripe processes payments; we do not store full card numbers).',
      'Location: approximate or background to show nearby options (only if you enable it).',
      'Usage and device: app identifiers, language, device type, IP, technical logs for security and basic analytics.',
      'Communications: messages with hosts and support.',
    ],
  },
  privacyUseItems: {
    es: [
      'Prestar el servicio: crear cuentas, gestionar reservas y pagos.',
      'Personalizar contenido (ej. embarcaciones cercanas) y recordar ajustes de idioma/moneda/apariencia.',
      'Seguridad y prevención de fraude.',
      'Soporte y comunicaciones operativas.',
      'Analítica básica y mejora del producto.',
    ],
    en: [
      'Provide the service: create accounts, manage bookings and payments.',
      'Personalize content (e.g., nearby boats) and remember language/currency/appearance settings.',
      'Security and fraud prevention.',
      'Support and operational communications.',
      'Basic analytics and product improvements.',
    ],
  },
  privacyShareItems: {
    es: [
      'Proveedores de pago (Stripe) para procesar transacciones.',
      'Mapas/ubicación y servicios de infraestructura (hosting, CDN, correo, SMS).',
      'Analítica y monitoreo para mejorar estabilidad y seguridad.',
      'Requerimientos legales o para proteger derechos, seguridad y cumplimiento.',
    ],
    en: [
      'Payment processors (Stripe) to handle transactions.',
      'Maps/location and infrastructure services (hosting, CDN, email, SMS).',
      'Analytics and monitoring to improve stability and security.',
      'Legal requirements or to protect rights, safety, and compliance.',
    ],
  },
  privacyRetentionBody: {
    es: 'Conservamos datos mientras tengas cuenta o sean necesarios para reservas, soporte y obligaciones legales. Luego los eliminamos o anonimizamos según normativa aplicable.',
    en: 'We retain data while you have an account or as needed for bookings, support, and legal obligations. After that, we delete or anonymize it per applicable law.',
  },
  privacySecurityBody: {
    es: 'Aplicamos medidas razonables (cifrado en tránsito, controles de acceso, monitoreo). Ningún sistema es 100% seguro, usa una contraseña única y cuida tu dispositivo.',
    en: 'We apply reasonable measures (encryption in transit, access controls, monitoring). No system is 100% secure—use a strong unique password and protect your device.',
  },
  privacyRightsBody: {
    es: 'Puedes acceder, actualizar o eliminar tu cuenta. Para solicitudes sobre datos, contáctanos y atenderemos según la ley aplicable.',
    en: 'You can access, update, or delete your account. For data requests, contact us and we will handle them as required by applicable law.',
  },
  privacyChildrenBody: {
    es: 'Bahía Go no está dirigido a menores de 18 años. Si crees que un menor nos proporcionó datos, avísanos para eliminarlos.',
    en: 'Bahía Go is not directed to children under 18. If you believe a minor provided data, let us know so we can delete it.',
  },
  privacyContactBody: {
    es: 'Para dudas sobre privacidad o ejercer derechos, escríbenos a soporte@bahiago.com.',
    en: 'For privacy questions or to exercise your rights, contact us at soporte@bahiago.com.',
  },
  helpCenter: { es: 'Centro de ayuda', en: 'Help center' },
  helpCenterBody: { es: 'Soporte disponible próximamente.', en: 'Support available soon.' },
  logout: { es: 'Cerrar sesión', en: 'Sign out' },
  adminPublish: { es: 'Publicar anuncio (admin)', en: 'Publish listing (admin)' },
  loadingProfile: { es: 'Cargando perfil...', en: 'Loading profile...' },
  errorProfileTitle: { es: 'Error', en: 'Error' },
  errorProfileBody: { es: 'No se pudo cargar el perfil', en: 'Profile could not be loaded' },
  logoutConfirmTitle: { es: 'Cerrar sesión', en: 'Sign out' },
  logoutConfirmBody: {
    es: '¿Estás seguro de que quieres cerrar sesión?',
    en: 'Are you sure you want to sign out?',
  },
  logoutCancel: { es: 'Cancelar', en: 'Cancel' },
  logoutConfirm: { es: 'Cerrar sesión', en: 'Sign out' },
  userFallback: { es: 'Usuario', en: 'User' },
  emailUnavailable: { es: 'Email no disponible', en: 'Email unavailable' },
  phoneUnavailable: { es: 'Teléfono no registrado', en: 'Phone not registered' },
  roleLabel: { es: 'Rol', en: 'Role' },
  languageSelectedES: { es: 'Español seleccionado', en: 'Spanish selected' },
  languageSelectedEN: { es: 'Inglés seleccionado', en: 'English selected' },
  currencySelectedCOP: { es: 'Pesos colombianos (COP)', en: 'Colombian Pesos (COP)' },
  currencySelectedUSD: { es: 'Dólares (USD)', en: 'US Dollars (USD)' },
  appearanceSelectedDark: { es: 'Modo oscuro activo', en: 'Dark mode active' },
  appearanceSelectedLight: { es: 'Modo claro activo', en: 'Light mode active' },
  tabHome: { es: 'Inicio', en: 'Home' },
  tabDaytrips: { es: 'Pasadías', en: 'Day trips' },
  tabBookings: { es: 'Reservas', en: 'Bookings' },
  tabFavorites: { es: 'Favoritos', en: 'Favorites' },
  tabMessages: { es: 'Mensajes', en: 'Messages' },
  tabProfile: { es: 'Perfil', en: 'Profile' },
  bookingsLoading: { es: 'Cargando reservas...', en: 'Loading bookings...' },
  bookingsEmpty: { es: 'No tienes reservas aún', en: 'You have no bookings yet' },
  bookingsLoginTitle: { es: 'Inicia sesión para ver tus reservas', en: 'Sign in to view your bookings' },
  bookingsLoginSubtitle: { es: 'Toca aquí para iniciar sesión', en: 'Tap here to sign in' },
  bookingsTotal: { es: 'Total', en: 'Total' },
  favoritesLoading: { es: 'Cargando favoritos...', en: 'Loading favorites...' },
  favoritesEmpty: { es: 'No tienes favoritos aún', en: 'You have no favorites yet' },
  favoritesLoginTitle: { es: 'Inicia sesión para ver tus favoritos', en: 'Sign in to view your favorites' },
  favoritesLoginSubtitle: { es: 'Toca aquí para iniciar sesión', en: 'Tap here to sign in' },
  messagesTitle: { es: 'Mensajes', en: 'Messages' },
  messagesLoginTitle: { es: 'Inicia sesión para ver tus mensajes', en: 'Sign in to see your messages' },
  messagesLoginBody: {
    es: 'Necesitas estar autenticado para acceder a tus conversaciones',
    en: 'You need to be authenticated to access your conversations',
  },
  messagesEmptyTitle: { es: 'No tienes conversaciones aún', en: 'You have no conversations yet' },
  messagesEmptyBody: {
    es: 'Las conversaciones con propietarios aparecerán aquí',
    en: 'Conversations with owners will appear here',
  },
  payNow: { es: 'Pagar ahora', en: 'Pay now' },
  payWithWompi: { es: 'Pagar con tarjeta / PSE / Nequi', en: 'Pay with card / PSE / Nequi' },
  paymentPending: { es: 'Pago pendiente', en: 'Payment pending' },
  paymentPaid: { es: 'Pago completado', en: 'Payment completed' },
  paymentFailed: { es: 'Pago fallido', en: 'Payment failed' },
  openCheckout: { es: 'Abrir checkout', en: 'Open checkout' },
  paymentError: { es: 'No se pudo iniciar el pago', en: 'Could not start payment' },
  paymentReturnTitle: { es: 'Resultado del pago', en: 'Payment result' },
  paymentReturnSuccess: { es: 'Tu pago fue aprobado', en: 'Your payment was approved' },
  paymentReturnPending: { es: 'Tu pago sigue pendiente', en: 'Your payment is still pending' },
  paymentReturnFailed: { es: 'Tu pago no se completó', en: 'Your payment did not complete' },
  paymentReference: { es: 'Referencia', en: 'Reference' },
  goToBookings: { es: 'Ir a reservas', en: 'Go to bookings' },
};

const SettingsContext = createContext(null);

const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#007AFF',
    background: '#FFFFFF',
    surface: '#F8F9FA',
    onSurface: '#0B0E14',
    outline: '#E0E6EF',
  },
};

const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#4DA3FF',
    background: '#0B0E14',
    surface: '#10141D',
    onSurface: '#F7F8FA',
    outline: '#1C2331',
  },
};

export const AppSettingsProvider = ({ children }) => {
  const [language, setLanguage] = useState('es');
  const [currency, setCurrency] = useState('COP');
  const [appearance, setAppearance] = useState('dark');

  useEffect(() => {
    const load = async () => {
      try {
        const [lang, curr, theme] = await Promise.all([
          AsyncStorage.getItem('settings_language'),
          AsyncStorage.getItem('settings_currency'),
          AsyncStorage.getItem('settings_appearance'),
        ]);
        if (lang) setLanguage(lang);
        if (curr) setCurrency(curr);
        if (theme) setAppearance(theme);
      } catch (error) {
        console.warn('No se pudieron cargar ajustes locales', error);
      }
    };
    load();
  }, []);

  const persist = async (key, value) => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.warn('No se pudo guardar el ajuste', key, error);
    }
  };

  const toggleLanguage = () => {
    const next = language === 'es' ? 'en' : 'es';
    setLanguage(next);
    persist('settings_language', next);
  };

  const toggleCurrency = () => {
    const next = currency === 'COP' ? 'USD' : 'COP';
    setCurrency(next);
    persist('settings_currency', next);
  };

  const toggleAppearance = () => {
    const next = appearance === 'dark' ? 'light' : 'dark';
    setAppearance(next);
    persist('settings_appearance', next);
  };

  const t = (key) => translations[key]?.[language] || translations[key]?.es || key;

  const paperTheme = useMemo(() => (appearance === 'dark' ? darkTheme : lightTheme), [appearance]);
  const statusBarStyle = appearance === 'dark' ? 'light' : 'dark';

  const value = {
    language,
    currency,
    appearance,
    toggleLanguage,
    toggleCurrency,
    toggleAppearance,
    t,
    paperTheme,
    statusBarStyle,
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    console.warn('useSettings se llamó fuera de AppSettingsProvider, usando valores por defecto');
    return {
      language: 'es',
      currency: 'COP',
      appearance: 'dark',
      toggleLanguage: () => {},
      toggleCurrency: () => {},
      toggleAppearance: () => {},
      t: (key) => translations[key]?.es || key,
      paperTheme: darkTheme,
      statusBarStyle: 'light',
    };
  }
  return ctx;
};

// Export default provider for Expo Router layout consumption
export default AppSettingsProvider;
