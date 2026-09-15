"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntentClassifier = void 0;
class IntentClassifier {
    /**
     * Classify user text into an intent with confidence score and extracted entities.
     */
    static classify(text) {
        const cleanText = text.trim().toLowerCase();
        const entities = {};
        // 1. Extract Budget (e.g., "under ₹100", "< 150", "under 80 rs", "cheap")
        const budgetMatch = cleanText.match(/(?:under|below|less than|within|around|₹|rs\.?)\s*(\d+)/i) ||
            cleanText.match(/(\d+)\s*(?:rs|rupees|inr)/i);
        if (budgetMatch) {
            entities.budget = parseInt(budgetMatch[1], 10);
        }
        else if (cleanText.includes('cheap') || cleanText.includes('affordable')) {
            entities.budget = 80;
        }
        // 2. Extract Diet Preference
        if (cleanText.includes('vegan')) {
            entities.diet = 'vegan';
        }
        else if (cleanText.includes('veg') || cleanText.includes('vegetarian')) {
            entities.diet = 'veg';
        }
        else if (cleanText.includes('healthy') || cleanText.includes('diet') || cleanText.includes('nutrition') || cleanText.includes('protein')) {
            entities.diet = 'healthy';
        }
        // 3. Extract Color
        const colors = ['black', 'blue', 'white', 'red', 'green', 'yellow', 'grey', 'gray', 'silver', 'brown'];
        for (const c of colors) {
            if (cleanText.includes(c)) {
                entities.color = c;
                break;
            }
        }
        // 4. Extract Common Items
        const commonItems = ['wallet', 'id card', 'id-card', 'headphones', 'earphones', 'airpods', 'keys', 'bottle', 'water bottle', 'laptop', 'charger', 'notebook', 'mouse', 'phone', 'umbrella'];
        for (const it of commonItems) {
            if (cleanText.includes(it)) {
                entities.item = it;
                break;
            }
        }
        // 5. Extract Locations / Buildings
        const commonLocations = [
            { key: 'library', name: 'Dr. A.P.J. Abdul Kalam Central Library' },
            { key: 'cs block', name: 'Ramanujan Computing Center & AI Labs' },
            { key: 'computer lab', name: 'Ramanujan Computing Center & AI Labs' },
            { key: 'computing center', name: 'Ramanujan Computing Center & AI Labs' },
            { key: 'academic', name: 'Aryabhata Academic Complex' },
            { key: 'food court', name: 'Anna Food Court & Central Dining' },
            { key: 'cafeteria', name: 'Anna Food Court & Central Dining' },
            { key: 'sports', name: 'Major Dhyan Chand Sports Complex' },
            { key: 'gym', name: 'Campus Gymnasium & Fitness Hub' },
            { key: 'health', name: 'Dhanvantari Health & Emergency Care Center' },
            { key: 'clinic', name: 'Dhanvantari Health & Emergency Care Center' },
            { key: 'hospital', name: 'Dhanvantari Health & Emergency Care Center' },
            { key: 'hostel', name: 'Hostel Block' },
            { key: 'kaveri', name: 'Kaveri Boys Hostel Block A' },
            { key: 'ganga', name: 'Ganga Girls Hostel Block B' },
            { key: 'innovation', name: 'Vikram Sarabhai Innovation & Incubation Hub' },
            { key: 'makerspace', name: 'MakerSpace 3D Prototyping Lab' },
            { key: 'auditorium', name: 'Nalanda Main Auditorium' }
        ];
        for (const loc of commonLocations) {
            if (cleanText.includes(loc.key)) {
                entities.destination = loc.name;
                entities.location = loc.name;
                break;
            }
        }
        // 6. Keywords
        const words = cleanText.split(/\s+/).filter(w => w.length > 3);
        entities.keywords = words;
        // Classification Rules based on semantic regex and keyword intent
        let intent = 'GENERAL_CAMPUS_QUERY';
        let confidence = 0.85;
        // Emergency Check (Highest priority)
        if (cleanText.includes('emergency') ||
            cleanText.includes('ambulance') ||
            cleanText.includes('urgent medical') ||
            cleanText.includes('doctor immediately') ||
            cleanText.includes('accident') ||
            cleanText.includes('helpline') ||
            cleanText.includes('fire') ||
            cleanText.includes('suicide') ||
            cleanText.includes('first aid')) {
            intent = 'EMERGENCY';
            confidence = 0.98;
            return { intent, confidence, entities };
        }
        // Lost Item
        if (cleanText.includes('lost my') ||
            cleanText.includes('i lost') ||
            cleanText.includes('missing') ||
            cleanText.includes('lost item') ||
            cleanText.includes('misplaced') ||
            cleanText.includes('lost a') ||
            (cleanText.includes('lost') && entities.item)) {
            intent = 'LOST_ITEM';
            confidence = 0.95;
            return { intent, confidence, entities };
        }
        // Found Item
        if (cleanText.includes('found a') ||
            cleanText.includes('i found') ||
            cleanText.includes('handed over') ||
            cleanText.includes('picked up a') ||
            cleanText.includes('found item') ||
            cleanText.includes('someone left')) {
            intent = 'FOUND_ITEM';
            confidence = 0.94;
            return { intent, confidence, entities };
        }
        // Facility Search (printing, atm, labs)
        if (cleanText.includes('where can i print') ||
            cleanText.includes('printing') ||
            cleanText.includes('photocopy') ||
            cleanText.includes('xerox') ||
            cleanText.includes('atm') ||
            cleanText.includes('cash') ||
            cleanText.includes('study room') ||
            cleanText.includes('nearest lab') ||
            cleanText.includes('open right now') ||
            cleanText.includes('open now')) {
            intent = 'FACILITY_SEARCH';
            confidence = 0.93;
            return { intent, confidence, entities };
        }
        // Campus Navigation
        if (cleanText.includes('navigate') ||
            cleanText.includes('directions') ||
            cleanText.includes('how to get to') ||
            cleanText.includes('how do i get to') ||
            cleanText.includes('way to') ||
            cleanText.includes('route to') ||
            cleanText.includes('where is') ||
            cleanText.includes('where are') ||
            cleanText.includes('take me to') ||
            cleanText.includes('distance to')) {
            intent = 'CAMPUS_NAVIGATION';
            confidence = 0.92;
            return { intent, confidence, entities };
        }
        // Food Recommendation
        if (cleanText.includes('eat') ||
            cleanText.includes('food') ||
            cleanText.includes('hungry') ||
            cleanText.includes('lunch') ||
            cleanText.includes('dinner') ||
            cleanText.includes('breakfast') ||
            cleanText.includes('cafeteria') ||
            cleanText.includes('canteen') ||
            cleanText.includes('snack') ||
            cleanText.includes('dosa') ||
            cleanText.includes('biryani') ||
            cleanText.includes('chai') ||
            cleanText.includes('coffee') ||
            entities.budget !== undefined ||
            entities.diet !== undefined) {
            intent = 'FOOD_RECOMMENDATION';
            confidence = 0.94;
            return { intent, confidence, entities };
        }
        // Roommate Matching
        if (cleanText.includes('roommate') ||
            cleanText.includes('room mate') ||
            cleanText.includes('flatmate') ||
            cleanText.includes('hostel companion') ||
            cleanText.includes('room partner') ||
            cleanText.includes('share a room') ||
            cleanText.includes('night owl') ||
            cleanText.includes('early bird')) {
            intent = 'ROOMMATE_MATCHING';
            confidence = 0.95;
            return { intent, confidence, entities };
        }
        // Event Discovery
        if (cleanText.includes('event') ||
            cleanText.includes('happening') ||
            cleanText.includes('hackathon') ||
            cleanText.includes('workshop') ||
            cleanText.includes('competition') ||
            cleanText.includes('seminar') ||
            cleanText.includes('fest') ||
            cleanText.includes('what to do today') ||
            cleanText.includes('activities')) {
            intent = 'EVENT_DISCOVERY';
            confidence = 0.92;
            return { intent, confidence, entities };
        }
        // Contact Admin
        if (cleanText.includes('admin') ||
            cleanText.includes('registrar') ||
            cleanText.includes('warden') ||
            cleanText.includes('complain') ||
            cleanText.includes('contact office') ||
            cleanText.includes('maintenance')) {
            intent = 'CONTACT_ADMIN';
            confidence = 0.88;
            return { intent, confidence, entities };
        }
        // General Chat
        if (cleanText === 'hi' ||
            cleanText === 'hello' ||
            cleanText.startsWith('hey') ||
            cleanText.includes('who are you') ||
            cleanText.includes('what can you do') ||
            cleanText.includes('thank')) {
            intent = 'GENERAL_CHAT';
            confidence = 0.96;
            return { intent, confidence, entities };
        }
        // Default to Campus Query
        return {
            intent: 'GENERAL_CAMPUS_QUERY',
            confidence: 0.80,
            entities
        };
    }
}
exports.IntentClassifier = IntentClassifier;
