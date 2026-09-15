"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_controller_1 = require("../controllers/admin.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Protect all admin routes with authentication and ADMIN role
router.use(auth_middleware_1.authenticate, (0, auth_middleware_1.requireRole)(['ADMIN']));
router.get('/analytics', admin_controller_1.AdminController.getAnalytics);
router.get('/users', admin_controller_1.AdminController.getUsers);
router.put('/users/:id/role', admin_controller_1.AdminController.updateUserRole);
router.get('/knowledge-base', admin_controller_1.AdminController.getKnowledgeBase);
router.post('/knowledge-base', admin_controller_1.AdminController.createKnowledgeBase);
router.put('/knowledge-base/:id', admin_controller_1.AdminController.updateKnowledgeBase);
router.delete('/knowledge-base/:id', admin_controller_1.AdminController.deleteKnowledgeBase);
exports.default = router;
