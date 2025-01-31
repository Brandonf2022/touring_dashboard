import React, { useState, useEffect, useMemo } from 'react';
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

export default function App() {
  const [edgelistUrl, setEdgelistUrl] = useState('');
  const [edgelist, setEdgelist] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [countryFilter, setCountryFilter] = useState('');
  const [hoverInfo, setHoverInfo] = useState(null);

  useEffect(() => {
    if (edgelistUrl) {
      setDataLoaded(false);
      fetch(edgelistUrl)
        .then(res => res.json())
        .then(data => {
          console.log('Edgelist Data:', data);
          setEdgelist(data);
          setDataLoaded(true);
        })
        .catch(error => {
          console.error('Error loading edgelist data:', error);
          setDataLoaded(false);
        });
    }
  }, [edgelistUrl]);

  const filteredEdgelist = useMemo(() => {
    if (!countryFilter) return edgelist;
    return edgelist.filter(edge => 
      edge.name.toLowerCase().includes(countryFilter.toLowerCase()) &&
      !edge.name.toLowerCase().startsWith('[unspecified]')
    );
  }, [edgelist, countryFilter]);

  const layers = [
    new LineLayer({
      id: 'edges',
      data: filteredEdgelist,
      getSourcePosition: d => d.start,
      getTargetPosition: d => d.end,
      getColor: d => [255, 140, 0, Math.min(255, d.weight * 100)],
      getWidth: d => Math.log(d.weight) + 4,
      pickable: true,
      onHover: info => setHoverInfo(info)
    }),
    new ScatterplotLayer({
      id: 'venues',
      data: filteredEdgelist,
      getPosition: d => d.start,
      getFillColor: [0, 0, 255],
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
        <br />
        <input
          type="text"
          placeholder="Enter country to filter"
          value={countryFilter}
          onChange={(e) => setCountryFilter(e.target.value)}
        />
      </div>
      <DeckGL
        layers={layers}
        initialViewState={INITIAL_VIEW_STATE}
        controller={true}
      >
        {hoverInfo && hoverInfo.object && (
          <div style={{
            position: 'absolute',
            left: hoverInfo.x,
            top: hoverInfo.y,
            padding: '8px',
            background: 'white',
            borderRadius: '4px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
            zIndex: 1
          }}>
            {hoverInfo.object.name}
          </div>
        )}
        <Map reuseMaps mapLib={maplibregl} mapStyle={MAP_STYLE} preventStyleDiffing={true} />
      </DeckGL>
    </div>
  );
}

export function renderToDOM(container) {
  createRoot(container).render(<App />);
}
