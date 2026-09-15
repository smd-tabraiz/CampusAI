"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoommateController = void 0;
const prisma_1 = require("../utils/prisma");
const matching_service_1 = require("../services/matching.service");
class RoommateController {
    static async getProfile(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({ error: 'Unauthorized.' });
                return;
            }
            const profile = await prisma_1.prisma.roommateProfile.findUnique({
                where: { userId: req.user.id },
                include: {
                    user: {
                        select: { name: true, email: true, department: true, year: true, avatarUrl: true }
                    }
                }
            });
            res.json({ profile });
        }
        catch (error) {
            res.status(500).json({ error: error.message || 'Failed to fetch roommate profile.' });
        }
    }
    static async upsertProfile(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({ error: 'Unauthorized.' });
                return;
            }
            const { preferredHostel, roomType, sleepSchedule, studyHabits, cleanliness, foodPreference, noiseTolerance, smokingPreference, pets, socialPreference, budget, bio } = req.body;
            const profileData = {
                preferredHostel: preferredHostel || 'Kaveri Hostel',
                roomType: roomType || 'DOUBLE',
                sleepSchedule: sleepSchedule || 'FLEXIBLE',
                studyHabits: studyHabits || 'BALANCED',
                cleanliness: cleanliness || 'MODERATE',
                foodPreference: foodPreference || 'ANY',
                noiseTolerance: noiseTolerance || 'MEDIUM',
                smokingPreference: smokingPreference || 'NON_SMOKER',
                pets: pets || 'NO_PETS',
                socialPreference: socialPreference || 'AMBIVERT',
                budget: budget ? parseInt(budget, 10) : 8000,
                department: req.user.department || 'General',
                year: req.user.year || 2,
                bio: bio || 'Looking for an organized and friendly roommate.'
            };
            const profile = await prisma_1.prisma.roommateProfile.upsert({
                where: { userId: req.user.id },
                update: profileData,
                create: {
                    userId: req.user.id,
                    ...profileData
                },
                include: {
                    user: {
                        select: { name: true, department: true, year: true, avatarUrl: true }
                    }
                }
            });
            res.json({ message: 'Roommate profile saved successfully.', profile });
        }
        catch (error) {
            res.status(500).json({ error: error.message || 'Failed to save roommate profile.' });
        }
    }
    static async getMatches(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({ error: 'Unauthorized.' });
                return;
            }
            // Fetch current user's profile
            let userProfile = await prisma_1.prisma.roommateProfile.findUnique({
                where: { userId: req.user.id }
            });
            // If user has not created a profile yet, provide default archetype for previewing
            if (!userProfile) {
                userProfile = {
                    id: 'temp',
                    userId: req.user.id,
                    preferredHostel: 'Kaveri Hostel',
                    roomType: 'DOUBLE',
                    sleepSchedule: 'NIGHT_OWL',
                    studyHabits: 'BALANCED',
                    cleanliness: 'METICULOUS',
                    foodPreference: 'VEGETARIAN',
                    noiseTolerance: 'MEDIUM',
                    smokingPreference: 'NON_SMOKER',
                    pets: 'NO_PETS',
                    socialPreference: 'AMBIVERT',
                    budget: 8000,
                    department: req.user.department || 'Computer Science & Engineering',
                    year: req.user.year || 3,
                    bio: '',
                    updatedAt: new Date()
                };
            }
            // Fetch candidates
            const candidates = await prisma_1.prisma.roommateProfile.findMany({
                where: { userId: { not: req.user.id } },
                include: {
                    user: {
                        select: { id: true, name: true, department: true, year: true, avatarUrl: true }
                    }
                }
            });
            // Calculate compatibility for each candidate
            const scoredCandidates = candidates.map(cand => {
                const comp = matching_service_1.MatchingService.calculateRoommateCompatibility(userProfile, cand);
                return {
                    ...cand,
                    compatibilityScore: comp.overallScore,
                    breakdown: comp.breakdown,
                    whyMatch: comp.whyMatch
                };
            });
            scoredCandidates.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
            res.json({ matches: scoredCandidates });
        }
        catch (error) {
            res.status(500).json({ error: error.message || 'Failed to calculate roommate matches.' });
        }
    }
    static async connect(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({ error: 'Unauthorized.' });
                return;
            }
            const { targetUserId, message } = req.body;
            if (!targetUserId) {
                res.status(400).json({ error: 'targetUserId is required.' });
                return;
            }
            if (targetUserId === req.user.id) {
                res.status(400).json({ error: 'Cannot connect with yourself.' });
                return;
            }
            const [userProfile, targetProfile] = await Promise.all([
                prisma_1.prisma.roommateProfile.findUnique({ where: { userId: req.user.id } }),
                prisma_1.prisma.roommateProfile.findUnique({ where: { userId: targetUserId } })
            ]);
            const comp = matching_service_1.MatchingService.calculateRoommateCompatibility(userProfile || { sleepSchedule: 'FLEXIBLE', studyHabits: 'BALANCED', cleanliness: 'MODERATE', budget: 8000 }, targetProfile || { sleepSchedule: 'FLEXIBLE', studyHabits: 'BALANCED', cleanliness: 'MODERATE', budget: 8000 });
            const connection = await prisma_1.prisma.roommateConnection.upsert({
                where: {
                    requesterId_targetId: {
                        requesterId: req.user.id,
                        targetId: targetUserId
                    }
                },
                update: {
                    status: 'PENDING',
                    message: message || null
                },
                create: {
                    requesterId: req.user.id,
                    targetId: targetUserId,
                    status: 'PENDING',
                    compatibilityScore: comp.overallScore,
                    message: message || `Hi! I found our profiles are a ${comp.overallScore}% match on CampusAI and would like to connect.`
                }
            });
            // Trigger notification for recipient
            await prisma_1.prisma.notification.create({
                data: {
                    userId: targetUserId,
                    title: '🤝 New Roommate Connection Request!',
                    message: `${req.user.name} (${comp.overallScore}% Match) wants to connect regarding hostel accommodation.`,
                    type: 'ROOMMATE',
                    linkUrl: '/roommate'
                }
            });
            res.status(201).json({ message: 'Connection request sent successfully.', connection });
        }
        catch (error) {
            res.status(500).json({ error: error.message || 'Failed to send roommate connection request.' });
        }
    }
    static async getConnections(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({ error: 'Unauthorized.' });
                return;
            }
            const [received, sent] = await Promise.all([
                prisma_1.prisma.roommateConnection.findMany({
                    where: { targetId: req.user.id },
                    include: {
                        requester: { select: { id: true, name: true, department: true, year: true, avatarUrl: true } }
                    },
                    orderBy: { createdAt: 'desc' }
                }),
                prisma_1.prisma.roommateConnection.findMany({
                    where: { requesterId: req.user.id },
                    include: {
                        target: { select: { id: true, name: true, department: true, year: true, avatarUrl: true } }
                    },
                    orderBy: { createdAt: 'desc' }
                })
            ]);
            res.json({ received, sent });
        }
        catch (error) {
            res.status(500).json({ error: error.message || 'Failed to fetch roommate connections.' });
        }
    }
    static async respondConnection(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({ error: 'Unauthorized.' });
                return;
            }
            const { id } = req.params;
            const { status } = req.body; // ACCEPTED | DECLINED
            if (!['ACCEPTED', 'DECLINED'].includes(status)) {
                res.status(400).json({ error: 'Status must be ACCEPTED or DECLINED.' });
                return;
            }
            const connection = await prisma_1.prisma.roommateConnection.findUnique({
                where: { id }
            });
            if (!connection || connection.targetId !== req.user.id) {
                res.status(404).json({ error: 'Connection request not found or unauthorized.' });
                return;
            }
            const updated = await prisma_1.prisma.roommateConnection.update({
                where: { id },
                data: { status }
            });
            if (status === 'ACCEPTED') {
                await prisma_1.prisma.notification.create({
                    data: {
                        userId: connection.requesterId,
                        title: '🎉 Roommate Request Accepted!',
                        message: `${req.user.name} accepted your roommate connection request. You can now coordinate room allotment!`,
                        type: 'ROOMMATE',
                        linkUrl: '/roommate'
                    }
                });
            }
            res.json({ message: `Connection ${status.toLowerCase()} successfully.`, connection: updated });
        }
        catch (error) {
            res.status(500).json({ error: error.message || 'Failed to update connection.' });
        }
    }
}
exports.RoommateController = RoommateController;
