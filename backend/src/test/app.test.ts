import { describe, it, expect } from 'vitest';
import { IntentClassifier } from '../ai/intent.classifier';
import { MatchingService } from '../services/matching.service';
import { RouteService } from '../services/route.service';
import { aiService } from '../ai/ai.service';

describe('CampusAI Backend Unit & Logic Tests', () => {
  describe('Intent Classification & Entity Extraction', () => {
    it('correctly classifies navigation queries with entity extraction', () => {
      const result = IntentClassifier.classify('Where is the computer lab?');
      expect(result.intent).toBe('CAMPUS_NAVIGATION');
      expect(result.entities.destination).toContain('Computing');
    });

    it('correctly classifies food recommendations with budget entity extraction', () => {
      const result = IntentClassifier.classify('I want something healthy to eat under ₹100');
      expect(result.intent).toBe('FOOD_RECOMMENDATION');
      expect(result.entities.budget).toBe(100);
      expect(result.entities.diet).toBe('healthy');
    });

    it('correctly classifies lost item reports', () => {
      const result = IntentClassifier.classify('I lost my black wallet near the cafeteria');
      expect(result.intent).toBe('LOST_ITEM');
      expect(result.entities.item).toBe('wallet');
      expect(result.entities.color).toBe('black');
    });

    it('prioritizes campus emergencies with top confidence', () => {
      const result = IntentClassifier.classify('Medical emergency! Need ambulance immediately');
      expect(result.intent).toBe('EMERGENCY');
      expect(result.confidence).toBeGreaterThanOrEqual(0.95);
    });

    it('identifies roommate matching requests', () => {
      const result = IntentClassifier.classify('Find me a roommate who studies at night');
      expect(result.intent).toBe('ROOMMATE_MATCHING');
    });

    it('identifies event discovery requests', () => {
      const result = IntentClassifier.classify('What events and hackathons are happening this week?');
      expect(result.intent).toBe('EVENT_DISCOVERY');
    });

    it('identifies facility printing requests', () => {
      const result = IntentClassifier.classify('Where can I print my assignment?');
      expect(result.intent).toBe('FACILITY_SEARCH');
    });
  });

  describe('Matching Service', () => {
    it('calculates high semantic match for matching lost & found items', () => {
      const lost = {
        title: 'Black JBL Wireless Headphones',
        description: 'Over-ear black bluetooth headphones lost in cafeteria',
        category: 'ELECTRONICS',
        color: 'Black',
        locationName: 'Anna Food Court',
        lostDate: '2026-09-07'
      };

      const found = {
        title: 'Black Bluetooth Headphones',
        description: 'Found black wireless headphones on food court table',
        category: 'ELECTRONICS',
        color: 'Black',
        locationName: 'Anna Food Court',
        foundDate: '2026-09-07'
      };

      const match = MatchingService.calculateItemMatch(lost, found);
      expect(match.confidenceScore).toBeGreaterThanOrEqual(80);
      expect(match.matchReason).toContain('Exact category match');
      expect(match.matchReason).toContain('Matching color profile');
    });

    it('calculates low match for dissimilar items', () => {
      const lost = {
        title: 'Silver Laptop Charger',
        description: 'Macbook charger in library',
        category: 'ELECTRONICS',
        color: 'Silver',
        locationName: 'Central Library',
        lostDate: '2026-09-01'
      };

      const found = {
        title: 'Red Umbrella',
        description: 'Red folding umbrella found near sports complex',
        category: 'ACCESSORIES',
        color: 'Red',
        locationName: 'Sports Complex',
        foundDate: '2026-09-07'
      };

      const match = MatchingService.calculateItemMatch(lost, found);
      expect(match.confidenceScore).toBeLessThan(40);
    });

    it('calculates 5-dimensional roommate compatibility vector', () => {
      const profileA = {
        sleepSchedule: 'NIGHT_OWL',
        studyHabits: 'BALANCED',
        cleanliness: 'METICULOUS',
        budget: 8000,
        smokingPreference: 'NON_SMOKER',
        foodPreference: 'VEGETARIAN'
      };

      const profileB = {
        sleepSchedule: 'NIGHT_OWL',
        studyHabits: 'BALANCED',
        cleanliness: 'METICULOUS',
        budget: 8500,
        smokingPreference: 'NON_SMOKER',
        foodPreference: 'VEGETARIAN'
      };

      const result = MatchingService.calculateRoommateCompatibility(profileA, profileB);
      expect(result.overallScore).toBeGreaterThanOrEqual(90);
      expect(result.breakdown.sleepSchedule).toBe(100);
      expect(result.breakdown.studyHabits).toBe(100);
      expect(result.breakdown.cleanliness).toBe(100);
      expect(result.whyMatch).toBeTruthy();
    });
  });

  describe('Route Service', () => {
    it('calculates realistic campus route with distance and waypoints', () => {
      const origin = { name: 'Main Gate', lat: 12.9700, lng: 77.5900 };
      const dest = { name: 'Computer Science Block', lat: 12.9725, lng: 77.5938, isAccessible: true };

      const route = RouteService.planRoute(origin, dest, false);
      expect(route.distanceMeters).toBeGreaterThan(0);
      expect(route.walkingMinutes).toBeGreaterThanOrEqual(1);
      expect(route.waypoints.length).toBeGreaterThanOrEqual(3);
      expect(route.instructions.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('AI Service Orchestration', () => {
    it('handles emergency queries returning emergency cards', async () => {
      const res = await aiService.processMessage('Where is the emergency clinic and ambulance?');
      expect(res.intent).toBe('EMERGENCY');
      expect(res.cards?.some(c => c.type === 'emergency')).toBe(true);
    });

    it('returns food cards for food recommendation query', async () => {
      const res = await aiService.processMessage('Find food under ₹100');
      expect(res.intent).toBe('FOOD_RECOMMENDATION');
      expect(res.cards?.some(c => c.type === 'food')).toBe(true);
    });
  });
});
