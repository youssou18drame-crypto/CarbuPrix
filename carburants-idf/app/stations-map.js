'use client';

import { divIcon } from 'leaflet';
import { useEffect, useMemo } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';

const stationIcon = divIcon({
  className: 'station-marker',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
  popupAnchor: [0, -8],
});

function FitStations({ positions }) {
  const map = useMap();

  useEffect(() => {
    map.fitBounds(positions, { padding: [28, 28], maxZoom: 14 });
  }, [map, positions]);

  return null;
}

export default function StationsMap({ stations, fuelLabel, formatPrice }) {
  const markers = useMemo(() => stations.flatMap((station) => {
    const { lat, lon } = station.geo_point ?? {};
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return [];
    return [{ station, position: [lat, lon] }];
  }), [stations]);
  const positions = useMemo(() => markers.map(({ position }) => position), [markers]);

  if (markers.length === 0) {
    return <p className="map-placeholder">Aucune station à afficher sur la carte.</p>;
  }

  return (
    <MapContainer
      className="stations-map"
      bounds={positions}
      boundsOptions={{ padding: [28, 28], maxZoom: 14 }}
      scrollWheelZoom={false}
    >
      <TileLayer
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        maxZoom={19}
      />
      <FitStations positions={positions} />
      {markers.map(({ station, position }) => {
        const name = station.name || station.brand || 'Station-service';
        return (
          <Marker
            key={station.id}
            position={position}
            icon={stationIcon}
            title={`${name} · ${station.city}`}
          >
            <Popup>
              <strong>{name}</strong><br />
              {station.address}<br />
              {station.cp} {station.city}<br />
              <strong>{fuelLabel} · {formatPrice(station)}/L</strong>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
