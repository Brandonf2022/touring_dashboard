import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Map } from 'react-map-gl';
import maplibregl from 'maplibre-gl';
import DeckGL from '@deck.gl/react';
import { ScatterplotLayer, LineLayer } from '@deck.gl/layers';

const INITIAL_VIEW_STATE = {
  latitude: 63,
  longitude: 12,
  zoom: 4.5,
  maxZoom: 16,
  pitch: 140,
  bearing: 0
};

const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json';

function getTooltip({object}) {
  return object && `${object.name}\nShared Artists: ${object.weight}`;
}

export default function App() {
  const [edgelistUrl, setEdgelistUrl] = useState('');
  const [edgelist, setEdgelist] = useState([]);

  useEffect(() => {
    if (edgelistUrl) {
      fetch(edgelistUrl)
        .then(res => res.json())
        .then(data => {
          console.log('Edgelist Data:', data);
          setEdgelist(data);
        })
        .catch(error => console.error('Error loading edgelist data:', error));
    }
  }, [edgelistUrl]);

  const layers = [
    new LineLayer({
      id: 'edges',
      data: edgelist,
      getSourcePosition: d => d.start,
      getTargetPosition: d => d.end,
      getColor: d => [255, 140, 0, Math.min(255, d.weight * 10)], // Orange color with opacity based on weight
      getWidth: d => Math.log(d.weight) + 1, // Adjust line width based on weight
      pickable: true
    }),
    new ScatterplotLayer({
      id: 'venues',
      data: edgelist,
      getPosition: d => d.start, // Use start coordinates for venues
      getFillColor: [0, 0, 255], // Blue color for venues
      getRadius: 100,
      radiusScale: 1,
      radiusMinPixels: 1,
      radiusMaxPixels: 10,
      pickable: true
    })
  ];

  return (
    <div>
      <div style={{position: 'absolute', top: 0, left: 0, padding: '10px', backgroundColor: 'white', zIndex: 1}}>
        <input
          type="text"
          placeholder="Enter venue-venue edgelist JSON URL"
          value={edgelistUrl}
          onChange={(e) => setEdgelistUrl(e.target.value)}
        />
      </div>
      <DeckGL
        layers={layers}
        initialViewState={INITIAL_VIEW_STATE}
        controller={true}
        getTooltip={getTooltip}
      >
        <Map reuseMaps mapLib={maplibregl} mapStyle={MAP_STYLE} preventStyleDiffing={true} />
      </DeckGL>
    </div>
  );
}

export function renderToDOM(container) {
  createRoot(container).render(<App />);
}