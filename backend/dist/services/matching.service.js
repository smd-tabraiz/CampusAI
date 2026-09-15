"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MatchingService = void 0;
class MatchingService {
    /**
     * Calculate similarity between a lost item and a found item.
     */
    static calculateItemMatch(lost, found) {
        let score = 0;
        const reasons = [];
        // 1. Category exact match (30 points)
        if (lost.category === found.category) {
            score += 30;
            reasons.push(`Exact category match (${lost.category})`);
        }
        // 2. Color match (20 points)
        const lostColor = lost.color.toLowerCase();
        const foundColor = found.color.toLowerCase();
        if (lostColor && foundColor && (lostColor.includes(foundColor) || foundColor.includes(lostColor))) {
            score += 20;
            reasons.push(`Matching color profile (${lost.color})`);
        }
        // 3. Location match (20 points)
        const lostLoc = lost.locationName.toLowerCase();
        const foundLoc = found.locationName.toLowerCase();
        if (lostLoc.includes(foundLoc) || foundLoc.includes(lostLoc)) {
            score += 20;
            reasons.push(`Found in the same area (${lost.locationName})`);
        }
        else {
            // Partial location proximity
            const wordsA = lostLoc.split(/\s+/);
            const wordsB = foundLoc.split(/\s+/);
            const common = wordsA.filter(w => w.length > 3 && wordsB.includes(w));
            if (common.length > 0) {
                score += 10;
                reasons.push(`Similar campus zone (${common.join(', ')})`);
            }
        }
        // 4. Description & Title textual overlap (20 points)
        const textA = (lost.title + ' ' + lost.description).toLowerCase();
        const textB = (found.title + ' ' + found.description).toLowerCase();
        const tokensA = new Set(textA.split(/\W+/).filter(w => w.length > 3));
        const tokensB = new Set(textB.split(/\W+/).filter(w => w.length > 3));
        let intersectionCount = 0;
        tokensA.forEach(token => {
            if (tokensB.has(token)) {
                intersectionCount++;
            }
        });
        if (intersectionCount > 0) {
            const textOverlap = Math.min(20, intersectionCount * 5);
            score += textOverlap;
            reasons.push(`${intersectionCount} matching descriptive keywords`);
        }
        // 5. Date proximity (10 points)
        try {
            const diffMs = Math.abs(new Date(lost.lostDate).getTime() - new Date(found.foundDate).getTime());
            const diffDays = diffMs / (1000 * 60 * 60 * 24);
            if (diffDays <= 2) {
                score += 10;
                reasons.push('Reported within 48 hours of each other');
            }
            else if (diffDays <= 5) {
                score += 5;
                reasons.push('Reported within 5 days');
            }
        }
        catch {
            // fallback
        }
        const confidenceScore = Math.min(99, Math.max(15, score));
        const matchReason = reasons.join(' • ') || 'Potential category similarity';
        return { confidenceScore, matchReason };
    }
    /**
     * Calculate 5-dimensional compatibility between two roommate profiles.
     */
    static calculateRoommateCompatibility(pA, pB) {
        // 1. Sleep Schedule (25% weight)
        let sleepScore = 70;
        if (pA.sleepSchedule === pB.sleepSchedule) {
            sleepScore = 100;
        }
        else if ((pA.sleepSchedule === 'FLEXIBLE' || pB.sleepSchedule === 'FLEXIBLE')) {
            sleepScore = 88;
        }
        else {
            // Early bird vs Night owl
            sleepScore = 55;
        }
        // 2. Study Habits (20% weight)
        let studyScore = 75;
        if (pA.studyHabits === pB.studyHabits) {
            studyScore = 100;
        }
        else if (pA.studyHabits === 'BALANCED' || pB.studyHabits === 'BALANCED') {
            studyScore = 90;
        }
        else {
            studyScore = 65;
        }
        // 3. Cleanliness (25% weight)
        let cleanScore = 70;
        if (pA.cleanliness === pB.cleanliness) {
            cleanScore = 100;
        }
        else if ((pA.cleanliness === 'METICULOUS' && pB.cleanliness === 'MODERATE') ||
            (pA.cleanliness === 'MODERATE' && pB.cleanliness === 'METICULOUS') ||
            (pA.cleanliness === 'MODERATE' && pB.cleanliness === 'RELAXED')) {
            cleanScore = 85;
        }
        else {
            // Meticulous vs Relaxed
            cleanScore = 50;
        }
        // 4. Budget (15% weight)
        let budgetScore = 80;
        const budgetDiff = Math.abs((pA.budget || 8000) - (pB.budget || 8000));
        if (budgetDiff === 0)
            budgetScore = 100;
        else if (budgetDiff <= 1500)
            budgetScore = 90;
        else if (budgetDiff <= 3000)
            budgetScore = 75;
        else
            budgetScore = 60;
        // 5. Lifestyle & Social (15% weight)
        let lifestyleScore = 80;
        if (pA.smokingPreference === pB.smokingPreference)
            lifestyleScore += 10;
        else
            lifestyleScore -= 20;
        if (pA.foodPreference === pB.foodPreference || pA.foodPreference === 'ANY' || pB.foodPreference === 'ANY') {
            lifestyleScore += 10;
        }
        lifestyleScore = Math.min(100, Math.max(40, lifestyleScore));
        // Weighted Overall
        const overall = Math.round(sleepScore * 0.25 +
            studyScore * 0.20 +
            cleanScore * 0.25 +
            budgetScore * 0.15 +
            lifestyleScore * 0.15);
        const matchPoints = [];
        if (sleepScore >= 85)
            matchPoints.push(`compatible ${pA.sleepSchedule.replace('_', ' ').toLowerCase()} sleep schedules`);
        if (cleanScore >= 85)
            matchPoints.push(`${pA.cleanliness.toLowerCase()} cleanliness style`);
        if (studyScore >= 85)
            matchPoints.push('aligned study focus');
        if (budgetScore >= 85)
            matchPoints.push('matching monthly budget');
        const whyMatch = matchPoints.length > 0
            ? `Strong synergy with ${matchPoints.join(', ')}.`
            : 'Compatible campus preferences and hostel choice.';
        return {
            overallScore: overall,
            breakdown: {
                sleepSchedule: sleepScore,
                studyHabits: studyScore,
                cleanliness: cleanScore,
                budget: budgetScore,
                lifestyle: lifestyleScore
            },
            whyMatch
        };
    }
}
exports.MatchingService = MatchingService;
