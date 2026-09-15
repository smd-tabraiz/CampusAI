"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HeuristicProvider = void 0;
class HeuristicProvider {
    name = 'CampusAI Intelligent Heuristic Engine';
    async generateResponse(prompt, context, _history) {
        const studentName = context?.userName ? context.userName.split(' ')[0] : 'there';
        return `Hello ${studentName}! I'm CampusAI, your intelligent hyperlocal companion. I'm here to help you navigate campus, discover events, find great food, connect with compatible roommates, and track lost & found items. How can I assist your campus life today?`;
    }
}
exports.HeuristicProvider = HeuristicProvider;
