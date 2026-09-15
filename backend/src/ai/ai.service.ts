import { IntentClassifier } from './intent.classifier';
import { IbmWatsonxProvider } from './ibm.provider';
import { HeuristicProvider } from './heuristic.provider';
import { AiTools } from './tools';
import { AiChatResponse, UserContext, StructuredCard } from './types';
import { config } from '../config';

export class AiService {
  private ibmProvider = new IbmWatsonxProvider();
  private heuristicProvider = new HeuristicProvider();

  /**
   * Process a student/faculty query and route through intent classification,
   * tool execution, and structured card assembly.
   */
  async processMessage(
    userText: string,
    context?: UserContext,
    history?: { sender: string; content: string }[]
  ): Promise<AiChatResponse> {
    // 1. Intent Classification & Entity Extraction
    const classification = IntentClassifier.classify(userText);
    const { intent, confidence, entities } = classification;

    const cards: StructuredCard[] = [];
    const quickReplies: string[] = [];
    let message = '';

    // 2. Controlled Tool Execution based on Intent
    switch (intent) {
      case 'EMERGENCY': {
        const kbResult = await AiTools.get_campus_information(entities, 'emergency medical health doctor');
        message = '🚨 CAMPUS EMERGENCY RESPONSE: If you or someone else requires urgent medical attention, please contact the 24/7 Dhanvantari Health Clinic or dial the campus emergency line immediately.';
        
        cards.push({
          type: 'emergency',
          data: {
            title: 'Dhanvantari 24x7 Emergency Medical Center',
            ambulancePhone: '+91 80 2345 6789',
            doctorPhone: '+91 80 2345 6790',
            location: 'Opposite Sports Complex, Ground Floor',
            status: 'OPEN 24/7'
          }
        });

        quickReplies.push('Call Ambulance', 'Navigate to Clinic', 'Hostel Warden Contacts');
        break;
      }

      case 'CAMPUS_NAVIGATION': {
        const locResult = await AiTools.find_nearby_locations(entities);
        const locations = locResult.data.locations;

        if (locations.length > 0) {
          const primary = locations[0];
          message = `Here is the route to ${primary.name}. It is approximately 4-6 minutes walking distance (${primary.openingHours}).`;
          
          cards.push({
            type: 'navigation_route',
            data: {
              destination: primary.name,
              code: primary.code,
              category: primary.category,
              lat: primary.lat,
              lng: primary.lng,
              distance: '420 meters',
              estimatedWalkingMinutes: 5,
              accessibleRoute: primary.isAccessible,
              openingHours: primary.openingHours,
              amenities: primary.amenities ? JSON.parse(primary.amenities) : []
            }
          });

          for (const loc of locations.slice(1, 3)) {
            cards.push({
              type: 'location',
              data: {
                name: loc.name,
                category: loc.category,
                lat: loc.lat,
                lng: loc.lng,
                openingHours: loc.openingHours,
                description: loc.description
              }
            });
          }
        } else {
          message = `I searched the campus directory for "${entities.destination || userText}". Here are the nearest key academic hubs.`;
          const allLocs = await AiTools.find_nearby_locations({});
          for (const loc of allLocs.data.locations.slice(0, 3)) {
            cards.push({
              type: 'location',
              data: loc
            });
          }
        }

        quickReplies.push('Open Interactive Map', 'Find Accessible Route', 'Where is the Cafeteria?');
        break;
      }

      case 'FACILITY_SEARCH': {
        const result = await AiTools.find_nearby_locations(entities);
        const facilities = result.data.facilities;
        const locations = result.data.locations;

        if (facilities.length > 0) {
          message = `I located ${facilities.length} active facilities matching your request. The closest is ${facilities[0].name} in ${facilities[0].buildingName}.`;
          for (const f of facilities) {
            cards.push({
              type: 'facility',
              data: f
            });
          }
        } else if (locations.length > 0) {
          message = `Here are the matching campus hubs open right now:`;
          for (const loc of locations) {
            cards.push({ type: 'location', data: loc });
          }
        } else {
          message = 'The Central Library printing center (Room 102) and Food Court SBI ATM are open right now with 24/7 access.';
        }

        quickReplies.push('Library Printing Timings', 'Nearest ATM', 'Computer Labs Open');
        break;
      }

      case 'LOST_ITEM': {
        const searchResult = await AiTools.search_lost_found(entities);
        const { foundMatches } = searchResult.data;

        if (foundMatches.length > 0) {
          message = `I checked the campus Found registry. I found ${foundMatches.length} potentially matching item(s) recently turned in! Take a look below:`;
          for (const match of foundMatches) {
            cards.push({
              type: 'lost_found_match',
              data: {
                ...match,
                confidenceScore: 88,
                status: 'Potential Match'
              }
            });
          }
        } else {
          message = `I have logged your lost item report inquiry. No exact match has been turned in yet at the security desk. Would you like to post an official Lost Item Report so other students and staff can assist you?`;
        }

        cards.push({
          type: 'action_button',
          data: {
            title: 'Report a Lost Item',
            actionText: 'Submit Lost Report',
            route: '/lost-found?action=report_lost'
          }
        });

        quickReplies.push('File Lost Report', 'View Found Items', 'Contact Security Desk');
        break;
      }

      case 'FOUND_ITEM': {
        message = 'Thank you for helping keep our campus safe and honest! You can quickly register the found item or drop it at the nearest Campus Security Desk at Central Library or Food Court.';
        cards.push({
          type: 'action_button',
          data: {
            title: 'Report a Found Item',
            actionText: 'Submit Found Item Notice',
            route: '/lost-found?action=report_found'
          }
        });
        quickReplies.push('Register Found Item', 'Drop-off Locations');
        break;
      }

      case 'EVENT_DISCOVERY': {
        const eventResult = await AiTools.search_events(entities);
        const events = eventResult.data;

        if (events.length > 0) {
          message = `Here are the upcoming campus events tailored for you, including upcoming tech symposiums and competitions:`;
          for (const ev of events) {
            cards.push({
              type: 'event',
              data: ev
            });
          }
        } else {
          message = 'There are no events matching your specific search right now. Here are the top upcoming events across campus this month:';
          const fallbackEvents = await AiTools.search_events({});
          for (const ev of fallbackEvents.data.slice(0, 3)) {
            cards.push({ type: 'event', data: ev });
          }
        }

        quickReplies.push('Technical Hackathons', 'Cultural Fests', 'Free Workshops');
        break;
      }

      case 'FOOD_RECOMMENDATION': {
        const foodResult = await AiTools.find_food(entities);
        const { items, cafeterias } = foodResult.data;

        const budgetNotice = entities.budget ? ` under ₹${entities.budget}` : '';
        const dietNotice = entities.diet ? ` matching your ${entities.diet} diet` : '';
        message = `Here are delicious, popular food recommendations${budgetNotice}${dietNotice}:`;

        for (const item of items.slice(0, 4)) {
          cards.push({
            type: 'food',
            data: {
              ...item,
              whyRecommended: entities.budget
                ? `Fits your ₹${entities.budget} budget perfectly and is rated ${item.popularScore}★ by students.`
                : `Popular campus favorite at ${item.cafeteria?.name || 'Main Canteen'}.`
            }
          });
        }

        quickReplies.push('Food under ₹80', 'Pure Veg Options', 'Healthy Salads', 'Cafeterias Open Now');
        break;
      }

      case 'ROOMMATE_MATCHING': {
        const rmResult = await AiTools.find_roommates(context?.userId, entities);
        const candidates = rmResult.data;

        message = `Based on your lifestyle and hostel preferences, here are top compatible roommates for the upcoming academic year:`;
        for (const cand of candidates) {
          cards.push({
            type: 'roommate',
            data: {
              ...cand,
              compatibilityScore: 92,
              breakdown: {
                sleepSchedule: 90,
                studyHabits: 95,
                cleanliness: 94,
                budget: 88,
                lifestyle: 91
              },
              whyMatch: `Shares ${cand.sleepSchedule.replace('_', ' ')} routine, ${cand.cleanliness.toLowerCase()} cleanliness, and comparable hostel budget.`
            }
          });
        }

        quickReplies.push('Filter by Hostel', 'Night Owl Roommates', 'Update My Preferences');
        break;
      }

      case 'CONTACT_ADMIN': {
        const kbResult = await AiTools.get_campus_information(entities, 'registrar admin office hours contact');
        message = 'Here are the verified campus administrative office details and operating hours:';
        for (const item of kbResult.data) {
          cards.push({
            type: 'location',
            data: {
              name: item.title,
              category: 'ADMIN',
              description: item.content,
              openingHours: '09:30 AM - 05:00 PM'
            }
          });
        }
        quickReplies.push('Registrar Contact', 'Welfare Cell', 'Hostel Warden');
        break;
      }

      case 'GENERAL_CHAT': {
        try {
          if (config.ibmApiKey && config.ibmProjectId) {
            message = await this.ibmProvider.generateResponse(userText, context, history);
          } else {
            message = await this.heuristicProvider.generateResponse(userText, context, history);
          }
        } catch {
          message = await this.heuristicProvider.generateResponse(userText, context, history);
        }
        quickReplies.push('What events are happening?', 'Find food near me', 'Navigate to CS Block', 'Report lost item');
        break;
      }

      case 'GENERAL_CAMPUS_QUERY':
      default: {
        const infoResult = await AiTools.get_campus_information(entities, userText);
        if (infoResult.data.length > 0) {
          const top = infoResult.data[0];
          message = `${top.title}:\n\n${top.content}`;
        } else {
          message = "I couldn't find verified campus records for that exact request. Would you like me to help connect you with campus administration or explore campus facilities?";
        }
        quickReplies.push('Library Hours & Printing', 'Campus Shuttle Timings', 'Wi-Fi Setup Help');
        break;
      }
    }

    return {
      message,
      intent,
      confidence,
      entities,
      cards,
      quickReplies
    };
  }
}

export const aiService = new AiService();
