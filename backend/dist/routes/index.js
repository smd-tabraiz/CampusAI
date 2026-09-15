"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_routes_1 = __importDefault(require("./auth.routes"));
const ai_routes_1 = __importDefault(require("./ai.routes"));
const navigation_routes_1 = __importDefault(require("./navigation.routes"));
const lost_found_routes_1 = __importDefault(require("./lost-found.routes"));
const food_routes_1 = __importDefault(require("./food.routes"));
const roommate_routes_1 = __importDefault(require("./roommate.routes"));
const events_routes_1 = __importDefault(require("./events.routes"));
const notifications_routes_1 = __importDefault(require("./notifications.routes"));
const admin_routes_1 = __importDefault(require("./admin.routes"));
const router = (0, express_1.Router)();
router.use('/auth', auth_routes_1.default);
router.use('/ai', ai_routes_1.default);
router.use('/', navigation_routes_1.default);
router.use('/lost-found', lost_found_routes_1.default);
router.use('/', food_routes_1.default);
router.use('/roommates', roommate_routes_1.default);
router.use('/events', events_routes_1.default);
router.use('/notifications', notifications_routes_1.default);
router.use('/admin', admin_routes_1.default);
// Health check endpoint
router.get('/health', (_req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'CampusAI Core API Engine',
        version: '1.0.0'
    });
});
exports.default = router;
