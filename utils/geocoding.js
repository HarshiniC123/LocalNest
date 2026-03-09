// Geocoding utility using OpenStreetMap Nominatim API

async function geocodeLocation(location) {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&limit=1`,
            {
                headers: {
                    'User-Agent': 'WanderLust-App'
                }
            }
        );
        
        if (!response.ok) {
            throw new Error(`Geocoding API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data && data.length > 0) {
            const result = data[0];
            return {
                latitude: parseFloat(result.lat),
                longitude: parseFloat(result.lon),
                displayName: result.display_name,
                success: true
            };
        } else {
            return {
                latitude: null,
                longitude: null,
                displayName: null,
                success: false,
                error: 'Location not found'
            };
        }
    } catch (error) {
        console.error('Geocoding error:', error);
        return {
            latitude: null,
            longitude: null,
            displayName: null,
            success: false,
            error: error.message
        };
    }
}

module.exports = { geocodeLocation };
