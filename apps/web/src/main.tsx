import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

function App() {
  return (
    <main className="shell">
      <section className="hero">
        <p className="eyebrow">SENSOTECH • FOUNDATION</p>
        <h1>Your farm intelligence system.</h1>
        <p className="muted">A production-ready foundation for farm context, sensors, satellite, AI, weather, markets and the farmer ecosystem.</p>
        <div className="status"><span /> API foundation ready</div>
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);
