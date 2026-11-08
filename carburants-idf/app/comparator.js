'use client';

import { useMemo, useState } from 'react';

const fuels = [
  ['gazole', 'Gazole'],
  ['e10', 'SP95-E10'],
  ['sp95', 'SP95'],
  ['sp98', 'SP98'],
  ['e85', 'E85'],
  ['gplc', 'GPLc'],
];

const pageSize = 12;
const euros = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 3,
  maximumFractionDigits: 3,
});
const dateFormat = new Intl.DateTimeFormat('fr-FR', {
  dateStyle: 'medium',
  timeZone: 'Europe/Paris',
});
const alphabetical = new Intl.Collator('fr', { sensitivity: 'base' });

function normalize(value) {
  return value.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, ' ').trim();
}

function getPrice(station, fuel) {
  return station[`price_${fuel}`];
}

function StationCard({ station, fuel, fuelLabel }) {
  const name = station.name || station.brand || 'Station-service';
  return (
    <article className="station">
      <div className="station-main">
        <div>
          <span className="station-city">{station.city} · {station.cp}</span>
          <h3>{name}</h3>
          <p>{station.address}</p>
        </div>
        <div className="station-price">
          <span>{fuelLabel}</span>
          <strong>{euros.format(getPrice(station, fuel))}<small>/L</small></strong>
        </div>
      </div>
      <details>
        <summary>Voir la fiche station</summary>
        <dl className="other-prices">
          {fuels.map(([key, label]) => {
            const price = getPrice(station, key);
            return (
              <div key={key}>
                <dt>{label}</dt>
                <dd>{Number.isFinite(price) ? `${euros.format(price)}/L` : '—'}</dd>
              </div>
            );
          })}
        </dl>
        <p>Dernière mise à jour de la fiche le {dateFormat.format(new Date(station.update))}.</p>
        {station.automate_24_24 === 'Oui' && <p>Automate disponible 24 h/24.</p>}
        {station.shortage?.length > 0 && <p>Ruptures signalées dans le fichier · {station.shortage.join(', ')}</p>}
        {station.services?.length > 0 && <p>Services · {station.services.join(', ')}</p>}
      </details>
    </article>
  );
}

export default function Comparator({ stations }) {
  const [fuel, setFuel] = useState('gazole');
  const [query, setQuery] = useState('');
  const [department, setDepartment] = useState('');
  const [order, setOrder] = useState('price-asc');
  const [visible, setVisible] = useState(pageSize);
  const fuelLabel = fuels.find(([key]) => key === fuel)[1];

  const catalog = useMemo(() => {
    const departments = new Map();
    let latestUpdate = 0;
    const entries = stations.map((station) => {
      departments.set(station.depcode, station.depname);
      latestUpdate = Math.max(latestUpdate, Date.parse(station.update));
      return {
        station,
        search: normalize(`${station.city} ${station.cp} ${station.name || ''} ${station.brand || ''}`),
      };
    });
    return {
      entries,
      departments: [...departments].sort(([a], [b]) => alphabetical.compare(a, b)),
      latestUpdate,
    };
  }, [stations]);

  const results = useMemo(() => {
    const words = normalize(query).split(' ').filter(Boolean);
    return catalog.entries
      .filter(({ station, search }) => (
        Number.isFinite(getPrice(station, fuel))
        && (!department || station.depcode === department)
        && words.every((word) => search.includes(word))
      ))
      .map(({ station }) => station)
      .sort((a, b) => {
        if (order === 'city') return alphabetical.compare(a.city, b.city);
        const difference = getPrice(a, fuel) - getPrice(b, fuel);
        return order === 'price-desc' ? -difference : difference;
      });
  }, [catalog, department, fuel, order, query]);

  const lowestPrice = results.reduce(
    (lowest, station) => Math.min(lowest, getPrice(station, fuel)),
    Infinity,
  );

  function updateFilter(setFilter, value) {
    setFilter(value);
    setVisible(pageSize);
  }

  function reset() {
    setFuel('gazole');
    setQuery('');
    setDepartment('');
    setOrder('price-asc');
    setVisible(pageSize);
  }

  return (
    <>
      <header className="topbar">
        <div className="container topbar-inner">
          <span className="wordmark"><span className="mark" aria-hidden="true">CP</span> CarbuPrix</span>
          <span className="topbar-note">Comparateur de carburants</span>
        </div>
      </header>
      <main className="container">
        <section className="hero" aria-labelledby="hero-title">
          <div>
            <p className="eyebrow">STATIONS-SERVICE · PRIX AU LITRE</p>
            <h1 id="hero-title">Fais le plein<br />au meilleur prix.</h1>
            <p>Choisis ton carburant, cherche une ville et compare les prix relevés dans les stations du fichier.</p>
          </div>
          <aside className="hero-data" aria-label="Données utilisées">
            <strong>{stations.length}</strong>
            <span>stations dans le fichier</span>
            <span className="hero-date">Dernière date relevée<br />{dateFormat.format(catalog.latestUpdate)}</span>
          </aside>
        </section>

        <section className="filter-panel" aria-label="Filtres de recherche">
          <div className="fields">
            <label className="search-field">Ville, code postal ou enseigne
              <input type="search" placeholder="Ex. Créteil, 94000, Intermarché" value={query}
                onChange={(event) => updateFilter(setQuery, event.target.value)} />
            </label>
            <label>Carburant
              <select value={fuel} onChange={(event) => updateFilter(setFuel, event.target.value)}>
                {fuels.map(([key, label]) => <option key={key} value={key}>{label}</option>)}
              </select>
            </label>
            <label>Département
              <select value={department} onChange={(event) => updateFilter(setDepartment, event.target.value)}>
                <option value="">Tous les départements</option>
                {catalog.departments.map(([code, name]) => <option key={code} value={code}>{code} · {name}</option>)}
              </select>
            </label>
          </div>
          <button className="link-button" type="button" onClick={reset}>Réinitialiser les filtres</button>
        </section>

        <section className="results" aria-labelledby="results-title">
          <div className="results-header">
            <div>
              <h2 id="results-title">Les stations</h2>
              <p role="status">
                {results.length} {results.length === 1 ? 'résultat' : 'résultats'} · {fuelLabel}
                {results.length > 0 && ` · Dès ${euros.format(lowestPrice)}/L`}
              </p>
            </div>
            <label className="sort-label">Trier par
              <select value={order} onChange={(event) => updateFilter(setOrder, event.target.value)}>
                <option value="price-asc">Prix croissant</option>
                <option value="price-desc">Prix décroissant</option>
                <option value="city">Ville de A à Z</option>
              </select>
            </label>
          </div>
          {results.length === 0 ? (
            <div className="empty">
              <h3>Aucune station trouvée</h3>
              <p>Essaie une autre ville, un autre département ou un autre carburant.</p>
            </div>
          ) : (
            <div className="station-grid">
              {results.slice(0, visible).map((station) => (
                <StationCard key={station.id} station={station} fuel={fuel} fuelLabel={fuelLabel} />
              ))}
            </div>
          )}
          {visible < results.length && (
            <button className="more-button" type="button" onClick={() => setVisible(visible + pageSize)}>
              Afficher plus de stations
            </button>
          )}
        </section>
        <footer>Source · prix-des-carburants-j-7.json. Les prix affichés proviennent du relevé fourni.</footer>
      </main>
    </>
  );
}
