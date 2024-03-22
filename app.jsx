import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Map } from 'react-map-gl';
import maplibregl from 'maplibre-gl';
import DeckGL from '@deck.gl/react';
import { LineLayer, ScatterplotLayer } from '@deck.gl/layers';

const INITIAL_VIEW_STATE = {
  latitude: 47.65,
  longitude: 7,
  zoom: 4.5,
  maxZoom: 16,
  pitch: 50,
  bearing: 0
};

const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json';

function getColor() {
  return [80, 130, 255];
}

function getSize(type) {
  if (type.search('major') >= 0) {
    return 100;
  }
  if (type.search('small') >= 0) {
    return 30;
  }
  return 60;
}

function getTooltip({object}) {
  return (
    object &&
    `${object.country || object.abbrev || ''}
    ${object.name.indexOf('0x') >= 0 ? '' : object.name}`
  );
}

export default function App() {
  const [venuesUrl, setVenuesUrl] = useState(''); // Corrected variable name
  const [tripUrl, setTripUrl] = useState(''); // Assuming this remains unchanged
  const [showURLInput, setShowURLInput] = useState(false);
  const [airports, setAirports] = useState([]);
  const [flightPaths, setFlightPaths] = useState([]);

// Fetch venues data based on the venuesUrl
useEffect(() => {
  if (venuesUrl) {
    fetch(venuesUrl)
      .then(res => res.json())
      .then(data => setAirports(data))
      .catch(error => console.error('Error loading venues data:', error));
  }
}, [venuesUrl]);

// Fetch flight paths data based on the tripUrl
useEffect(() => {
  if (tripUrl) {
    fetch(tripUrl)
      .then(res => res.json())
      .then(data => setFlightPaths(data))
      .catch(error => console.error('Error loading flight paths data:', error));
  }
}, [tripUrl]);

const handleDropdownChange = (e) => {
  const value = e.target.value;
  if (value === 'ENTER URL OF DATASET') {
    setShowURLInput(true);
  } else {
    setShowURLInput(false);
    // Assuming DATASET1 and DATASET2 are placeholders for actual URLs
    // You'd replace these with your actual dataset URLs
    setVenuesUrl(value === 'DATASET1' ? 'URL_FOR_DATASET1' : value === 'DATASET2' ? 'URL_FOR_DATASET2' : '');
  }
};
const loadArtistTrips = () => {
  // Assuming tripUrl is already set
  fetch(tripUrl)
    .then(res => res.json())
    .then(data => setFlightPaths(data))
    .catch(error => console.error('Error loading flight paths data:', error));
};

  const layers = [
    new ScatterplotLayer({
      id: 'airports',
      data: airports,
      radiusScale: 20,
      getPosition: d => d.coordinates,
      getFillColor: [255, 140, 0],
      getRadius: d => getSize(d.type),
      pickable: true
    }),
    new LineLayer({
      id: 'flight-paths',
      data: flightPaths,
      opacity: 1,
      getSourcePosition: d => d.start,
      getTargetPosition: d => d.end,
      getColor,
      getWidth: 3,
      pickable: true
    })
  ];

  return (
    <div>
        <div style={{position: 'absolute', top: 0, left: 0, padding: '10px', backgroundColor: 'white', zIndex: 1}}>
          <div>
            <select onChange={handleDropdownChange}>
            <option value="">Select Dataset</option>
            <option value="DATASET1">DATASET1</option>
            <option value="DATASET2">DATASET2</option>
            <option value="ENTER URL OF DATASET">ENTER URL OF DATASET</option>
          </select>
          {showURLInput && (
            <input
              type="text"
              placeholder="Enter venues dataset URL"
              onChange={(e) => setVenuesUrl(e.target.value)}
            />
          )}
        </div>
      
        <div>
        <input
          type="text"
          placeholder="Enter artist trips dataset URL"
          value={tripUrl} // Make sure this matches the state variable name exactly
          onChange={(e) => setTripUrl(e.target.value)} // Corrected the function name and usage
         />
         <button onClick={loadArtistTrips}>Load Artists' trips</button>

        </div>
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
