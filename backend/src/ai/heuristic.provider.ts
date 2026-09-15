import { IAiProvider, UserContext } from './types';

export class HeuristicProvider implements IAiProvider {
  name = 'CampusAI Intelligent Heuristic Engine';

  async generateResponse(
    prompt: string,
    context?: UserContext,
    _history?: { sender: string; content: string }[]
  ): Promise<string> {
    const studentName = context?.userName ? context.userName.split(' ')[0] : 'there';
    return `Hello ${studentName}! I'm CampusAI, your intelligent hyperlocal companion. I'm here to help you navigate campus, discover events, find great food, connect with compatible roommates, and track lost & found items. How can I assist your campus life today?`;
  }
}
