"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RouteService = void 0;
class RouteService {
    /**
     * Calculate distance between two coordinates in meters (Haversine formula).
     */
    static getDistance(lat1, lon1, lat2, lon2) {
        const R = 6371e3; // Earth radius in meters
        const phi1 = (lat1 * Math.PI) / 180;
        const phi2 = (lat2 * Math.PI) / 180;
        const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
        const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;
        const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
            Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return Math.round(R * c);
    }
    /**
     * Plan route between two points on campus with realistic intermediate waypoints and instructions.
     */
    static planRoute(origin, destination, accessibleMode = false) {
        const directDistance = this.getDistance(origin.lat, origin.lng, destination.lat, destination.lng);
        // In a campus environment, walkways typically add 15-25% over straight-line distance
        const routeDistance = Math.round(directDistance * (accessibleMode ? 1.25 : 1.15));
        const walkingMinutes = Math.max(1, Math.round(routeDistance / 75)); // 75m/min casual walking speed
        // Generate intermediate waypoints for map polyline
        const waypoints = [];
        const instructions = [];
        // Step 0: Origin
        waypoints.push([origin.lat, origin.lng]);
        instructions.push({
            lat: origin.lat,
            lng: origin.lng,
            instruction: `Depart from ${origin.name}`
        });
        // Step 1: Intermediate 1 (Campus Plaza / Central Walkway)
        const midLat = origin.lat + (destination.lat - origin.lat) * 0.45 + (accessibleMode ? 0.0001 : 0);
        const midLng = origin.lng + (destination.lng - origin.lng) * 0.55;
        waypoints.push([midLat, midLng]);
        instructions.push({
            lat: midLat,
            lng: midLng,
            instruction: accessibleMode
                ? 'Follow the ramp walkway through Central Quadrangle'
                : 'Walk straight along Central Walkway for 180m'
        });
        // Step 2: Intermediate 2 (Turn into building promenade)
        const turnLat = origin.lat + (destination.lat - origin.lat) * 0.85;
        const turnLng = origin.lng + (destination.lng - origin.lng) * 0.85;
        waypoints.push([turnLat, turnLng]);
        instructions.push({
            lat: turnLat,
            lng: turnLng,
            instruction: 'Turn towards the main entrance arch'
        });
        // Step 3: Destination
        waypoints.push([destination.lat, destination.lng]);
        instructions.push({
            lat: destination.lat,
            lng: destination.lng,
            instruction: `Arrive at ${destination.name}`
        });
        return {
            originName: origin.name,
            destinationName: destination.name,
            distanceMeters: routeDistance,
            distanceFormatted: routeDistance >= 1000 ? `${(routeDistance / 1000).toFixed(1)} km` : `${routeDistance} m`,
            walkingMinutes,
            isAccessible: destination.isAccessible !== false,
            waypoints,
            instructions
        };
    }
}
exports.RouteService = RouteService;
