(function() {
  'use strict';
  window.addEventListener('load', function() {
    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    var forms = document.getElementsByClassName('needs-validation');
    // Loop over them and prevent submission
    var validation = Array.prototype.forEach.call(forms, function(form) {
      form.addEventListener('submit', function(event) {
        if (form.checkValidity() === false) {
          event.preventDefault();
          event.stopPropagation();
        }
        form.classList.add('was-validated');
      }, false);
    });
  }, false);

  
  // map initialization for listing show page
  if (document.getElementById('map')) {
    const mapDiv = document.getElementById('map');
    const latitude = mapDiv.dataset.latitude;
    const longitude = mapDiv.dataset.longitude;
    const locationString = mapDiv.dataset.location;
    const title = mapDiv.dataset.title;
    const price = mapDiv.dataset.price;
    
    // Use stored coordinates if available
    if (latitude && longitude) {
      initializeMap(parseFloat(latitude), parseFloat(longitude), title, price);
    } else if (locationString) {
      // Fallback to geocoding with Nominatim
      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationString)}&limit=1`, {
        headers: { 'User-Agent': 'LocalNest-App' }
      })
        .then(res => res.json())
        .then(data => {
          if (data && data.length) {
            const lat = parseFloat(data[0].lat);
            const lon = parseFloat(data[0].lon);
            initializeMap(lat, lon, title, price);
          } else {
            mapDiv.innerHTML = '<p class="text-muted">Location not found</p>';
          }
        })
        .catch(e => {
          console.error('geocode error', e);
          mapDiv.innerHTML = '<p class="text-danger">Error loading map</p>';
        });
    }
  }
  
  // Initialize map with marker and popup
  function initializeMap(lat, lon, title, price) {
    const map = L.map('map').setView([lat, lon], 13);
    
    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);
    
    // Create custom compass icon
    const compassIcon = L.divIcon({
      html: '<i class="fa-regular fa-compass" style="color: #dc3545; font-size: 24px;"></i>',
      className: 'custom-compass-icon',
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
    
    // Add transparent red circle around the location
    const circle = L.circle([lat, lon], {
      color: '#dc3545',        // Red border
      fillColor: '#dc3545',    // Red fill
      fillOpacity: 0.1,        // Very transparent
      radius: 100,             // Small radius (100 meters)
      weight: 2                // Border thickness
    }).addTo(map);
    
    // Create marker with popup
    const popupContent = `
      <div class="map-popup">
        <h6 class="mb-2">${title}</h6>
        <p class="mb-1"><strong>Price:</strong> ₹${parseInt(price).toLocaleString('en-IN')}/night</p>
        <p class="mb-0"><strong>Coordinates:</strong> ${lat.toFixed(4)}, ${lon.toFixed(4)}</p>
      </div>
    `;
    
    const marker = L.marker([lat, lon], { icon: compassIcon })
      .bindPopup(popupContent)
      .addTo(map);
    
    // Add hover functionality
    marker.on('mouseover', function() {
      this.openPopup();
    });
    
    marker.on('mouseout', function() {
      this.closePopup();
    });
    
    // Open popup by default
    marker.openPopup();
  }
})();