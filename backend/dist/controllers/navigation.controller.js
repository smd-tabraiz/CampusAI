"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NavigationController = void 0;
const prisma_1 = require("../utils/prisma");
const route_service_1 = require("../services/route.service");
class NavigationController {
    static async getLocations(req, res) {
        try {
            const { category, search } = req.query;
            const where = {};
            if (category && typeof category === 'string' && category !== 'ALL') {
                where.category = category.toUpperCase();
            }
            if (search && typeof search === 'string') {
                where.OR = [
                    { name: { contains: search } },
                    { description: { contains: search } },
                    { code: { contains: search } }
                ];
            }
            const locations = await prisma_1.prisma.campusLocation.findMany({
                where,
                orderBy: { name: 'asc' }
            });
            res.json({ locations });
        }
        catch (error) {
            res.status(500).json({ error: error.message || 'Failed to fetch campus locations.' });
        }
    }
    static async getLocationById(req, res) {
        try {
            const { id } = req.params;
            const location = await prisma_1.prisma.campusLocation.findUnique({
                where: { id },
                include: {
                    events: {
                        take: 3,
                        orderBy: { date: 'asc' }
                    }
                }
            });
            if (!location) {
                res.status(404).json({ error: 'Location not found.' });
                return;
            }
            res.json({ location });
        }
        catch (error) {
            res.status(500).json({ error: error.message || 'Failed to fetch location.' });
        }
    }
    static async searchLocations(req, res) {
        try {
            const query = (req.query.q || '').trim();
            if (!query) {
                res.json({ locations: [], facilities: [], buildings: [] });
                return;
            }
            const [locations, facilities, buildings] = await Promise.all([
                prisma_1.prisma.campusLocation.findMany({
                    where: {
                        OR: [
                            { name: { contains: query } },
                            { description: { contains: query } },
                            { category: { contains: query.toUpperCase() } }
                        ]
                    },
                    take: 6
                }),
                prisma_1.prisma.facility.findMany({
                    where: {
                        OR: [
                            { name: { contains: query } },
                            { buildingName: { contains: query } },
                            { category: { contains: query.toUpperCase() } }
                        ]
                    },
                    take: 6
                }),
                prisma_1.prisma.building.findMany({
                    where: {
                        OR: [
                            { name: { contains: query } },
                            { code: { contains: query } },
                            { description: { contains: query } }
                        ]
                    },
                    take: 6
                })
            ]);
            res.json({ locations, facilities, buildings });
        }
        catch (error) {
            res.status(500).json({ error: error.message || 'Failed to search campus locations.' });
        }
    }
    static async getRoute(req, res) {
        try {
            const { originId, destinationId, accessibleMode } = req.query;
            if (!originId || !destinationId) {
                res.status(400).json({ error: 'originId and destinationId are required.' });
                return;
            }
            const [origin, destination] = await Promise.all([
                prisma_1.prisma.campusLocation.findUnique({ where: { id: String(originId) } }),
                prisma_1.prisma.campusLocation.findUnique({ where: { id: String(destinationId) } })
            ]);
            if (!origin || !destination) {
                res.status(404).json({ error: 'One or both navigation locations could not be found.' });
                return;
            }
            const route = route_service_1.RouteService.planRoute({ name: origin.name, lat: origin.lat, lng: origin.lng }, { name: destination.name, lat: destination.lat, lng: destination.lng, isAccessible: destination.isAccessible }, accessibleMode === 'true');
            res.json({ route, origin, destination });
        }
        catch (error) {
            res.status(500).json({ error: error.message || 'Failed to calculate campus route.' });
        }
    }
    static async getBuildings(_req, res) {
        try {
            const buildings = await prisma_1.prisma.building.findMany({
                orderBy: { name: 'asc' }
            });
            res.json({ buildings });
        }
        catch (error) {
            res.status(500).json({ error: error.message || 'Failed to fetch campus buildings.' });
        }
    }
    static async getFacilities(req, res) {
        try {
            const { category } = req.query;
            const where = {};
            if (category && typeof category === 'string' && category !== 'ALL') {
                where.category = category.toUpperCase();
            }
            const facilities = await prisma_1.prisma.facility.findMany({
                where,
                orderBy: { name: 'asc' }
            });
            res.json({ facilities });
        }
        catch (error) {
            res.status(500).json({ error: error.message || 'Failed to fetch campus facilities.' });
        }
    }
}
exports.NavigationController = NavigationController;
