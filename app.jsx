import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Map } from 'react-map-gl';
import maplibregl from 'maplibre-gl';
import DeckGL from '@deck.gl/react';
import { LineLayer, ScatterplotLayer, ArcLayer} from '@deck.gl/layers';

const INITIAL_VIEW_STATE = {
  latitude: 63,
  longitude: 12,
  zoom: 4.5,
  maxZoom: 16,
  pitch: 50,
  bearing: 0
};

const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json';

function getColor(modularityClass) {
  // Define three color codes
  const colorRed = [255, 0, 0]; // Red
  const colorGreen = [0, 255, 0]; // Green
  const colorBlue = [0, 0, 255]; // Blue

  // Assign colors based on modularityClass range
  if (modularityClass >= 1 && modularityClass <= 5) {
    return colorRed; // Assign Red to modularityClass 1-5
  } else if (modularityClass >= 6 && modularityClass <= 10) {
    return colorGreen; // Assign Green to modularityClass 6-10
  } else if (modularityClass >= 11 && modularityClass <= 15) {
    return colorBlue; // Assign Blue to modularityClass 11-15
  } else {
    return [128, 128, 128]; // Return a default color (Gray) if out of range
  }
}



function getLineColor(modularityClass) {


return color;
}

function getSize(eigenvectorCentrality) {
  
  const minSize = 1000;
  const maxSize = 100000;
  const clampedValue = Math.max(0, Math.min(1, eigenvectorCentrality));
  console.log(clampedValue);
  console.log(minSize + (maxSize - minSize) * clampedValue);
return minSize + (maxSize - minSize) * clampedValue;

{/*}
const maxSize = 100;
const minSize = 10;
const radius = eigenvectorCentrality*10000;
console.log(radius);
return radius;
*/}
}


function getTooltip({object}) {
  // Assuming the object has a 'Venue_Name' field for venues
  return (
    object &&
    `${object.venue_country || ''}: ${object.Venue_Name || ''}`
  );
}
export default function App() {
  const [venuesUrl, setVenuesUrl] = useState('');
  const [tripUrl, setTripUrl] = useState('');
  const [showURLInput, setShowURLInput] = useState(false);
  const [venues, setVenues] = useState([]);
  const [tripPaths, setTripPaths] = useState([]);
  const [isLineLayerActive, setIsLineLayerActive] = useState(true);

  useEffect(() => {
    if (venuesUrl) {
      fetch(venuesUrl)
        .then(res => res.json())
        .then(data => {
          console.log('Venues Data:', data); // This will log the data to the console
          setVenues(data);
        })
        .catch(error => console.error('Error loading venues data:', error));
    }
  }, [venuesUrl]);

  useEffect(() => {
    if (tripUrl) {
      fetch(tripUrl)
        .then(res => res.json())
        .then(data => setTripPaths(data))
        .catch(error => console.error('Error loading trip data:', error));
    }
  }, [tripUrl]);

  // Handling dropdown changes for dataset selection
  const handleDropdownChange = (e) => {
    const value = e.target.value;
    setShowURLInput(value === 'ENTER URL OF DATASET');
    if (value === 'DATASET1') {
      setVenuesUrl('./placeholder.json');
    } else if (value === 'DATASET2') {
      setVenuesUrl('./Borealis_Venues.json');
    }
  };


// Assuming getColor function is correctly defined above, as shown in the previous message
// Update the use of getColor in the layers to pass the modularityClass dynamically

const layers = [
  new ScatterplotLayer({
    id: 'venues',
    data: venues,
    getPosition: d => [d.Long, d.Lat],
    getFillColor: [70, 51, 150], // Assuming this doesn't depend on modularity_class
    getRadius: d => getSize(d['Eigenvector Centrality']),
    radiusScale: 1,
    radiusMinPixels: 1,
    radiusMaxPixels: 40,
    opacity: 100,
    lineWidthMinPixels: 2,
    pickable: true
  }),
  isLineLayerActive ?
  new LineLayer({
    id: 'trips-paths',
    data: tripPaths,
    getSourcePosition: d => d.start,
    getTargetPosition: d => d.end,
    // Correctly pass modularity_class to getColor
    getColor: d => getColor(d.modularity_class), // Fixed to correctly reference modularity_class
    getWidth: 3,
    pickable: true
  }) :
  new ArcLayer({
    id: 'arc',
    data: tripPaths,
    getSourcePosition: d => d.start,
    getTargetPosition: d => d.end,
    // Ensure getSourceColor and getTargetColor correctly reference modularity_class
    getSourceColor: d => getColor(d.modularity_class), // Fixed
    getTargetColor: d => getColor(d.modularity_class), // Fixed
    getWidth: d => getSize(d['Eigenvector Centrality'])
  })
];


  
  return (
    <div>
      <div style={{position: 'absolute', top: 0, left: 0, padding: '10px', backgroundColor: 'white', zIndex: 1}}>
        <select onChange={handleDropdownChange}>
          <option value="">Select Dataset</option>
          <option value="DATASET1">Placeholder</option>
          <option value="DATASET2">Borealis Venues</option>
          <option value="ENTER URL OF DATASET">Enter URL of Dataset</option>
        </select>
        {showURLInput && (
          <input
            type="text"
            placeholder="Enter venues dataset URL"
            onChange={(e) => setVenuesUrl(e.target.value)}
          />
        )}
        <input
          type="text"
          placeholder="Enter artist trips dataset URL"
          value={tripUrl}
          onChange={(e) => setTripUrl(e.target.value)}
        />
        <div>
        <label>Toggle Line/Arc Layer
          <input
            type="checkbox"
            checked={isLineLayerActive}
            onChange={() => setIsLineLayerActive(!isLineLayerActive)}
              />
          </label>
        </div>
{/*        <div style={{ padding: '10px', backgroundColor: 'lightgrey', marginTop: '20px' }}>
        <h3>Venues Data:</h3>
        <ul>
          {venues.map((venue, index) => (
            <li key={index}>{JSON.stringify(venue)}</li>
          ))}
        </ul>
        </div>
          */}
          
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
