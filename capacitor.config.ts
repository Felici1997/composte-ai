import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  // ─── Identifiant unique de l'app (NE PAS CHANGER après publication) ───
  appId: 'com.composteai.app',
  appName: 'Composte AI',

  // ─── Dossier de build web ───
  webDir: 'dist',

  // ─── Config serveur (dev uniquement) ───
  server: {
    // Décommente et remplace par ton IP locale pour tester en dev :
    // url: 'http://192.168.1.X:8080',
    // cleartext: true,
    androidScheme: 'https',
  },

  // ─── Plugins natifs ───
  plugins: {
    // Barre de statut (couleur selon le thème Composte)
    StatusBar: {
      style: 'dark',
      backgroundColor: '#022c22',
    },

    // Clavier — évite que le clavier cache les champs
    Keyboard: {
      resize: 'body',
      style: 'dark',
      resizeOnFullScreen: true,
    },

    // Notifications push (à configurer avec Firebase plus tard)
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },

    // Caméra — permissions
    Camera: {
      // Android demandera les permissions automatiquement
    },

    // Géolocalisation
    Geolocation: {
      // iOS : messages affichés à l'utilisateur
    },

    // Splash screen (Android/iOS)
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#022c22',
      androidSplashResourceName: 'splash',
      showSpinner: false,
    },
  },

  // ─── Config Android spécifique ───
  android: {
    buildOptions: {
      // keystorePath: 'composte-release.keystore',   // pour la publication
      // keystoreAlias: 'composte',
    },
    // Permissions déclarées dans AndroidManifest.xml
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false, // true en dev
  },

  // ─── Config iOS spécifique ───
  ios: {
    contentInset: 'automatic',
    scrollEnabled: true,
    allowsLinkPreview: false,
  },
};

export default config;
