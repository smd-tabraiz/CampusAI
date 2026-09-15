import { prisma } from '../utils/prisma';
import { ExtractedEntities } from './types';

export interface ToolResult<T = any> {
  tool: string;
  data: T;
  summary: string;
}

export class AiTools {
  /**
   * Tool 1: search_events
   */
  static async search_events(entities: ExtractedEntities): Promise<ToolResult> {
    const where: any = {};

    if (entities.category) {
      where.category = { contains: entities.category };
    }

    if (entities.keywords && entities.keywords.length > 0) {
      where.OR = entities.keywords.map(kw => ({
        OR: [
          { title: { contains: kw } },
          { description: { contains: kw } },
          { category: { contains: kw } }
        ]
      }));
    }

    const events = await prisma.event.findMany({
      where,
      take: 5,
      orderBy: { date: 'asc' }
    });

    return {
      tool: 'search_events',
      data: events,
      summary: `Found ${events.length} upcoming events.`
    };
  }

  /**
   * Tool 2: find_nearby_locations
   */
  static async find_nearby_locations(entities: ExtractedEntities): Promise<ToolResult> {
    const query = entities.destination || entities.location || '';
    
    const locations = await prisma.campusLocation.findMany({
      where: query
        ? {
            OR: [
              { name: { contains: query } },
              { description: { contains: query } },
              { category: { contains: query.toUpperCase() } }
            ]
          }
        : undefined,
      take: 4
    });

    // Also check facilities if no main location matched
    const facilities = await prisma.facility.findMany({
      where: query
        ? {
            OR: [
              { name: { contains: query } },
              { category: { contains: query.toUpperCase() } },
              { buildingName: { contains: query } }
            ]
          }
        : undefined,
      take: 4
    });

    return {
      tool: 'find_nearby_locations',
      data: { locations, facilities },
      summary: `Found ${locations.length} campus locations and ${facilities.length} specialized facilities.`
    };
  }

  /**
   * Tool 3: find_food
   */
  static async find_food(entities: ExtractedEntities): Promise<ToolResult> {
    const where: any = {};

    if (entities.budget) {
      where.price = { lte: entities.budget };
    }

    if (entities.diet === 'veg') {
      where.isVeg = true;
    } else if (entities.diet === 'vegan') {
      where.isVegan = true;
    } else if (entities.diet === 'healthy') {
      where.isHealthy = true;
    }

    if (entities.foodType) {
      where.OR = [
        { name: { contains: entities.foodType } },
        { description: { contains: entities.foodType } },
        { category: { contains: entities.foodType.toUpperCase() } }
      ];
    }

    const items = await prisma.foodItem.findMany({
      where,
      include: {
        cafeteria: {
          select: { name: true, locationName: true, rating: true, openingHours: true }
        }
      },
      take: 6,
      orderBy: { popularScore: 'desc' }
    });

    const cafeterias = await prisma.cafeteria.findMany({
      take: 4,
      orderBy: { rating: 'desc' }
    });

    return {
      tool: 'find_food',
      data: { items, cafeterias },
      summary: `Found ${items.length} matching menu items across ${cafeterias.length} cafeterias.`
    };
  }

  /**
   * Tool 4: search_lost_found
   */
  static async search_lost_found(entities: ExtractedEntities): Promise<ToolResult> {
    const query = entities.item || entities.keywords?.join(' ') || '';
    
    const foundMatches = await prisma.foundItem.findMany({
      where: {
        status: 'ACTIVE',
        ...(query ? {
          OR: [
            { title: { contains: query } },
            { description: { contains: query } },
            { color: { contains: query } }
          ]
        } : {})
      },
      take: 4,
      orderBy: { createdAt: 'desc' }
    });

    const lostMatches = await prisma.lostItem.findMany({
      where: {
        status: 'ACTIVE',
        ...(query ? {
          OR: [
            { title: { contains: query } },
            { description: { contains: query } },
            { color: { contains: query } }
          ]
        } : {})
      },
      take: 4,
      orderBy: { createdAt: 'desc' }
    });

    return {
      tool: 'search_lost_found',
      data: { foundMatches, lostMatches },
      summary: `Found ${foundMatches.length} recently turned-in items and ${lostMatches.length} reported lost items.`
    };
  }

  /**
   * Tool 5: find_roommates
   */
  static async find_roommates(userId?: string, entities?: ExtractedEntities): Promise<ToolResult> {
    const profiles = await prisma.roommateProfile.findMany({
      where: userId ? { userId: { not: userId } } : undefined,
      include: {
        user: {
          select: { name: true, department: true, year: true, avatarUrl: true }
        }
      },
      take: 5
    });

    return {
      tool: 'find_roommates',
      data: profiles,
      summary: `Found ${profiles.length} roommate candidates with matching campus preferences.`
    };
  }

  /**
   * Tool 6: get_campus_information
   */
  static async get_campus_information(entities: ExtractedEntities, queryText: string): Promise<ToolResult> {
    const terms = (entities.keywords || []).concat(queryText.toLowerCase().split(/\s+/).filter(w => w.length > 3));

    const kbEntries = await prisma.knowledgeBase.findMany();
    
    // Score based on keyword overlap
    const scored = kbEntries.map(entry => {
      let score = 0;
      const lowerContent = (entry.title + ' ' + entry.content + ' ' + entry.keywords).toLowerCase();
      for (const t of terms) {
        if (lowerContent.includes(t.toLowerCase())) {
          score += 1;
        }
      }
      return { entry, score };
    });

    scored.sort((a, b) => b.score - a.score);
    const topEntries = scored.filter(s => s.score > 0).slice(0, 3).map(s => s.entry);

    return {
      tool: 'get_campus_information',
      data: topEntries.length > 0 ? topEntries : kbEntries.slice(0, 2),
      summary: topEntries.length > 0 ? `Found ${topEntries.length} verified campus records.` : 'Found general campus information.'
    };
  }
}
