import { api } from '@/lib/api';

export interface IntegrationChannel {
  id: string;
  provider: string;
  name: string;
  status: 'not_connected' | 'connected' | 'paused' | 'error';
  externalId?: string;
  webhookUrl?: string;
  lastSyncAt?: string;
  automationRules?: AutomationRule[];
}

export interface AutomationRule {
  id: string;
  channelId?: string;
  name: string;
  trigger: string;
  conditions?: string;
  action: string;
  template?: string;
  isActive: boolean;
  channel?: IntegrationChannel;
}

export const integrationService = {
  async channels() {
    const response = await api.get('/integrations/channels');
    return response.data as IntegrationChannel[];
  },

  async updateChannel(id: string, data: Partial<IntegrationChannel>) {
    const response = await api.patch(`/integrations/channels/${id}`, data);
    return response.data as IntegrationChannel;
  },

  async rules() {
    const response = await api.get('/integrations/rules');
    return response.data as AutomationRule[];
  },

  async createRule(data: Partial<AutomationRule>) {
    const response = await api.post('/integrations/rules', data);
    return response.data as AutomationRule;
  },

  async updateRule(id: string, data: Partial<AutomationRule>) {
    const response = await api.patch(`/integrations/rules/${id}`, data);
    return response.data as AutomationRule;
  },
};
