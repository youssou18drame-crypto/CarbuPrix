import 'leaflet/dist/leaflet.css';
import './globals.css';

export const metadata = {
  title: 'CarbuPrix | Comparateur de carburants',
  description: 'Compare les prix par carburant, ville ou département à partir du fichier de stations-service fourni.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
