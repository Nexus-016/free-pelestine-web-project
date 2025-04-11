// Palestine GeoJSON data (simplified representation)
window.palestineGeoJSON = {
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "name": "Palestine",
        "code": "PSE"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [34.22, 31.22], // Gaza Southwest
            [34.58, 31.22], // Gaza Southeast
            [34.58, 31.70], // Gaza Northeast
            [34.22, 31.70], // Gaza Northwest
            [34.22, 31.22]  // Gaza close loop
          ],
          [
            [35.00, 31.30], // West Bank Southwest 
            [35.60, 31.30], // West Bank Southeast
            [35.60, 32.55], // West Bank Northeast
            [35.00, 32.55], // West Bank Northwest
            [35.00, 31.30]  // West Bank close loop
          ]
        ]
      }
    }
  ]
};
