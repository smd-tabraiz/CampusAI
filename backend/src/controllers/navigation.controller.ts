import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { RouteService } from '../services/route.service';

export class NavigationController {
  static async getLocations(req: Request, res: Response): Promise<void> {
    try {
      const { category, search } = req.query;

      const where: any = {};
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

      const locations = await prisma.campusLocation.findMany({
        where,
        orderBy: { name: 'asc' }
      });

      res.json({ locations });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to fetch campus locations.' });
    }
  }

  static async getLocationById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const location = await prisma.campusLocation.findUnique({
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
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to fetch location.' });
    }
  }

  static async searchLocations(req: Request, res: Response): Promise<void> {
    try {
      const query = (req.query.q as string || '').trim();
      if (!query) {
        res.json({ locations: [], facilities: [], buildings: [] });
        return;
      }

      const [locations, facilities, buildings] = await Promise.all([
        prisma.campusLocation.findMany({
          where: {
            OR: [
              { name: { contains: query } },
              { description: { contains: query } },
              { category: { contains: query.toUpperCase() } }
            ]
          },
          take: 6
        }),
        prisma.facility.findMany({
          where: {
            OR: [
              { name: { contains: query } },
              { buildingName: { contains: query } },
              { category: { contains: query.toUpperCase() } }
            ]
          },
          take: 6
        }),
        prisma.building.findMany({
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
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to search campus locations.' });
    }
  }

  static async getRoute(req: Request, res: Response): Promise<void> {
    try {
      const { originId, destinationId, accessibleMode } = req.query;

      if (!originId || !destinationId) {
        res.status(400).json({ error: 'originId and destinationId are required.' });
        return;
      }

      const [origin, destination] = await Promise.all([
        prisma.campusLocation.findUnique({ where: { id: String(originId) } }),
        prisma.campusLocation.findUnique({ where: { id: String(destinationId) } })
      ]);

      if (!origin || !destination) {
        res.status(404).json({ error: 'One or both navigation locations could not be found.' });
        return;
      }

      const route = RouteService.planRoute(
        { name: origin.name, lat: origin.lat, lng: origin.lng },
        { name: destination.name, lat: destination.lat, lng: destination.lng, isAccessible: destination.isAccessible },
        accessibleMode === 'true'
      );

      res.json({ route, origin, destination });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to calculate campus route.' });
    }
  }

  static async getBuildings(_req: Request, res: Response): Promise<void> {
    try {
      const buildings = await prisma.building.findMany({
        orderBy: { name: 'asc' }
      });
      res.json({ buildings });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to fetch campus buildings.' });
    }
  }

  static async getFacilities(req: Request, res: Response): Promise<void> {
    try {
      const { category } = req.query;
      const where: any = {};
      if (category && typeof category === 'string' && category !== 'ALL') {
        where.category = category.toUpperCase();
      }

      const facilities = await prisma.facility.findMany({
        where,
        orderBy: { name: 'asc' }
      });
      res.json({ facilities });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to fetch campus facilities.' });
    }
  }
}
