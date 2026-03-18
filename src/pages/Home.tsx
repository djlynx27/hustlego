import React from 'react';
import Map from '../components/Map';
import { UniversalFileAnalyzer } from '../components/UniversalFileAnalyzer';

const Home: React.FC = () => (
  <main
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
    }}
  >
    <h1>Bienvenue sur HustleGo 🚗</h1>
    <p>Optimise tes trajets, booste tes revenus.</p>
    <UniversalFileAnalyzer />
    <Map />
    <p>Installe l'app sur ton mobile pour une expérience PWA complète.</p>
  </main>
);

export default Home;
