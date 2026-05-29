// services/location.service.js
const axios = require("axios");

class LocationService {

    // Rate limiting for free APIs (1 request per second)
    static lastRequestTime = 0;
    static async waitForRateLimit() {
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;
        if (timeSinceLastRequest < 1000) {
            await new Promise(resolve => setTimeout(resolve, 1000 - timeSinceLastRequest));
        }
        this.lastRequestTime = Date.now();
    }

    /**
     * Geocoding: Convert address to coordinates
     * Used for: Creating routes, validating addresses, finding stop locations
     */
    static async geocode(address) {
        try {
            await this.waitForRateLimit();

            const response = await axios.get("https://nominatim.openstreetmap.org/search", {
                params: {
                    q: address,
                    format: "json",
                    limit: 1,
                    addressdetails: 1,
                    countrycodes: "lk" // Sri Lanka only
                },
                headers: { "User-Agent": "SRMSS_Transport_System/1.0" }
            });

            if (response.data && response.data.length > 0) {
                return {
                    success: true,
                    lat: parseFloat(response.data[0].lat),
                    lng: parseFloat(response.data[0].lon),
                    display_name: response.data[0].display_name,
                    place_id: response.data[0].place_id,
                    type: response.data[0].type,
                    importance: response.data[0].importance
                };
            }
            return { success: false, message: "Location not found" };
        } catch (error) {
            console.error("Geocoding error:", error.message);
            return { success: false, message: "Failed to geocode address" };
        }
    }

    /**
     * Reverse Geocoding: Convert coordinates to address
     * Used for: Getting address from map clicks, validating bus stops
     */
    static async reverseGeocode(lat, lng) {
        try {
            await this.waitForRateLimit();

            const response = await axios.get("https://nominatim.openstreetmap.org/reverse", {
                params: { lat, lon: lng, format: "json", addressdetails: 1 },
                headers: { "User-Agent": "SRMSS_Transport_System/1.0" }
            });

            if (response.data) {
                return {
                    success: true,
                    display_name: response.data.display_name,
                    address: response.data.address,
                    lat: parseFloat(response.data.lat),
                    lng: parseFloat(response.data.lon)
                };
            }
            return { success: false, message: "Address not found" };
        } catch (error) {
            console.error("Reverse geocoding error:", error.message);
            return { success: false, message: "Failed to reverse geocode" };
        }
    }

    /**
     * Get route between two points
     * Used for: Route planning, distance calculation, ETA prediction
     */
    static async getRoute(origin, destination) {
        try {
            // Get coordinates if addresses provided
            let originCoords, destCoords;

            if (typeof origin === 'string') {
                const geoResult = await this.geocode(origin);
                if (!geoResult.success) throw new Error("Origin not found");
                originCoords = { lat: geoResult.lat, lng: geoResult.lng };
            } else {
                originCoords = origin;
            }

            if (typeof destination === 'string') {
                const geoResult = await this.geocode(destination);
                if (!geoResult.success) throw new Error("Destination not found");
                destCoords = { lat: geoResult.lat, lng: geoResult.lng };
            } else {
                destCoords = destination;
            }

            const url = `https://router.project-osrm.org/route/v1/driving/${originCoords.lng},${originCoords.lat};${destCoords.lng},${destCoords.lat}`;

            const response = await axios.get(url, {
                params: { overview: "full", geometries: "geojson", steps: true }
            });

            if (response.data && response.data.routes && response.data.routes.length > 0) {
                const route = response.data.routes[0];
                return {
                    success: true,
                    distance_km: route.distance / 1000,
                    distance_miles: (route.distance / 1000) * 0.621371,
                    duration_minutes: route.duration / 60,
                    duration_hours: route.duration / 3600,
                    duration_seconds: route.duration,
                    geometry: route.geometry,
                    summary: route.legs[0]?.summary || "Route",
                    waypoints: response.data.waypoints
                };
            }
            return { success: false, message: "Route not found" };
        } catch (error) {
            console.error("Route error:", error.message);
            return { success: false, message: "Failed to calculate route" };
        }
    }

    /**
     * Get route with multiple waypoints (for routes with multiple stops)
     * Used for: Full route planning with intermediate stops
     */
    static async getRouteWithWaypoints(waypoints) {
        try {
            const coordinates = [];
            for (const point of waypoints) {
                let coords;
                if (typeof point === 'string') {
                    const geoResult = await this.geocode(point);
                    if (!geoResult.success) throw new Error(`Location not found: ${point}`);
                    coords = { lat: geoResult.lat, lng: geoResult.lng };
                } else {
                    coords = point;
                }
                coordinates.push(`${coords.lng},${coords.lat}`);
            }

            const coordinatesStr = coordinates.join(";");
            const url = `https://router.project-osrm.org/route/v1/driving/${coordinatesStr}`;

            const response = await axios.get(url, {
                params: { overview: "full", geometries: "geojson", steps: true }
            });

            if (response.data && response.data.routes && response.data.routes.length > 0) {
                const route = response.data.routes[0];
                return {
                    success: true,
                    distance_km: route.distance / 1000,
                    duration_minutes: route.duration / 60,
                    duration_hours: route.duration / 3600,
                    geometry: route.geometry,
                    waypoints: response.data.waypoints,
                    legs: route.legs
                };
            }
            return { success: false, message: "Route not found" };
        } catch (error) {
            console.error("Waypoint route error:", error.message);
            return { success: false, message: "Failed to calculate route with waypoints" };
        }
    }

    /**
     * Search for places (bus stations, landmarks, cities)
     * Used for: Autocomplete in route creation, finding stops
     */
    static async searchPlaces(query, limit = 10, type = null) {
        try {
            await this.waitForRateLimit();

            let searchQuery = query;
            if (type === "bus_station") {
                searchQuery = `${query} bus station`;
            } else if (type === "railway") {
                searchQuery = `${query} railway station`;
            }

            const response = await axios.get("https://nominatim.openstreetmap.org/search", {
                params: {
                    q: searchQuery,
                    format: "json",
                    limit: limit,
                    addressdetails: 1,
                    countrycodes: "lk",
                    "accept-language": "en"
                },
                headers: { "User-Agent": "SRMSS_Transport_System/1.0" }
            });

            if (response.data) {
                return {
                    success: true,
                    places: response.data.map(place => ({
                        place_id: place.place_id,
                        name: place.display_name.split(",")[0],
                        full_address: place.display_name,
                        lat: parseFloat(place.lat),
                        lng: parseFloat(place.lon),
                        type: place.type,
                        category: place.category,
                        importance: place.importance
                    }))
                };
            }
            return { success: true, places: [] };
        } catch (error) {
            console.error("Search error:", error.message);
            return { success: false, message: "Failed to search places" };
        }
    }

    /**
     * Get nearby bus stops and transport hubs
     * Used for: Finding stops near depot, route optimization
     */
    static async getNearbyBusStops(lat, lng, radius = 1000) {
        try {
            const overpassQuery = `
                [out:json];
                (
                    node["highway"="bus_stop"](around:${radius},${lat},${lng});
                    node["public_transport"="platform"](around:${radius},${lat},${lng});
                    node["amenity"="bus_station"](around:${radius},${lat},${lng});
                );
                out body;
            `;

            const response = await axios.post("https://overpass-api.de/api/interpreter", overpassQuery, {
                headers: { "Content-Type": "text/plain" }
            });

            if (response.data && response.data.elements) {
                const stops = response.data.elements.map(element => ({
                    id: element.id,
                    name: element.tags?.name || "Unnamed Stop",
                    lat: element.lat,
                    lng: element.lon,
                    type: element.tags?.highway || element.tags?.amenity || "bus_stop",
                    distance_km: this.calculateDistance(lat, lng, element.lat, element.lon)
                }));

                // Sort by distance
                stops.sort((a, b) => a.distance_km - b.distance_km);

                return { success: true, count: stops.length, stops };
            }
            return { success: true, stops: [] };
        } catch (error) {
            console.error("Nearby stops error:", error.message);
            return { success: false, message: "Failed to find nearby stops" };
        }
    }

    /**
     * Calculate straight-line distance between two points
     * Used for: Quick distance estimation, validation
     */
    static calculateDistance(lat1, lng1, lat2, lng2) {
        const R = 6371;
        const dLat = this.toRad(lat2 - lat1);
        const dLng = this.toRad(lng2 - lng1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    static toRad(degrees) {
        return degrees * (Math.PI / 180);
    }

    /**
     * Validate and optimize route with stops
     * Used for: Route planning module - main feature
     */
    static async validateAndOptimizeRoute(routeData) {
        try {
            const { start_point, end_point, intermediate_stops = [] } = routeData;

            // Geocode start point
            const startGeo = await this.geocode(start_point);
            if (!startGeo.success) {
                return { success: false, error: `Start point not found: ${start_point}` };
            }

            // Geocode end point
            const endGeo = await this.geocode(end_point);
            if (!endGeo.success) {
                return { success: false, error: `End point not found: ${end_point}` };
            }

            // Geocode intermediate stops
            const validatedStops = [];
            for (const stop of intermediate_stops) {
                const stopGeo = await this.geocode(stop);
                if (stopGeo.success) {
                    validatedStops.push({
                        original: stop,
                        coordinates: { lat: stopGeo.lat, lng: stopGeo.lng },
                        display_name: stopGeo.display_name
                    });
                } else {
                    validatedStops.push({
                        original: stop,
                        error: "Location not found"
                    });
                }
            }

            // Calculate full route
            const waypoints = [start_point, ...intermediate_stops, end_point].filter(s => s);
            const route = await this.getRouteWithWaypoints(waypoints);

            return {
                success: true,
                start_point: {
                    address: start_point,
                    coordinates: { lat: startGeo.lat, lng: startGeo.lng },
                    display_name: startGeo.display_name
                },
                end_point: {
                    address: end_point,
                    coordinates: { lat: endGeo.lat, lng: endGeo.lng },
                    display_name: endGeo.display_name
                },
                intermediate_stops: validatedStops,
                route_details: route.success ? {
                    total_distance_km: route.distance_km,
                    total_duration_minutes: route.duration_minutes,
                    total_duration_hours: route.duration_hours,
                    geometry: route.geometry
                } : null,
                valid_stops_count: validatedStops.filter(s => !s.error).length,
                invalid_stops_count: validatedStops.filter(s => s.error).length
            };
        } catch (error) {
            console.error("Route validation error:", error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get distance matrix between multiple origins and destinations
     * Used for: Optimizing multiple route assignments
     */
    static async getDistanceMatrix(origins, destinations) {
        try {
            const results = [];
            for (const origin of origins) {
                const row = [];
                for (const destination of destinations) {
                    const route = await this.getRoute(origin, destination);
                    if (route.success) {
                        row.push({
                            distance_km: route.distance_km,
                            duration_minutes: route.duration_minutes
                        });
                    } else {
                        row.push(null);
                    }
                }
                results.push(row);
            }
            return { success: true, matrix: results };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }
}

module.exports = LocationService;