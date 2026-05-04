export type IntegrationDirection = 'inbound' | 'outbound' | 'bidirectional';

export interface IntegrationProviderDefinition {
  provider: string;
  name: string;
  category: 'social' | 'payment' | 'crm' | 'erp' | 'webhook';
  direction: IntegrationDirection;
  authType: 'oauth' | 'api_key' | 'basic' | 'webhook_secret' | 'manual';
  supportedEvents: string[];
  supportedActions: string[];
  requiredConfigKeys: string[];
  notes: string;
}

export const integrationProviderDefinitions: IntegrationProviderDefinition[] = [
  {
    provider: 'facebook',
    name: 'Facebook Page',
    category: 'social',
    direction: 'inbound',
    authType: 'oauth',
    supportedEvents: ['new_message', 'new_comment', 'new_lead'],
    supportedActions: ['create_lead', 'tag_lead', 'auto_reply', 'notify_admin'],
    requiredConfigKeys: ['pageId', 'appId', 'appSecret'],
    notes: 'Use Meta Graph API and webhooks after app review.',
  },
  {
    provider: 'instagram',
    name: 'Instagram Business',
    category: 'social',
    direction: 'inbound',
    authType: 'oauth',
    supportedEvents: ['new_message', 'new_comment', 'new_lead'],
    supportedActions: ['create_lead', 'tag_lead', 'auto_reply', 'notify_admin'],
    requiredConfigKeys: ['businessAccountId', 'appId', 'appSecret'],
    notes: 'Requires Instagram professional account connected to a Facebook Page.',
  },
  {
    provider: 'zalo',
    name: 'Zalo Official Account',
    category: 'social',
    direction: 'bidirectional',
    authType: 'oauth',
    supportedEvents: ['new_message', 'new_follow', 'new_lead'],
    supportedActions: ['create_lead', 'auto_reply', 'notify_admin'],
    requiredConfigKeys: ['oaId', 'appId', 'appSecret'],
    notes: 'Use OA webhooks and approved message templates.',
  },
  {
    provider: 'tiktok',
    name: 'TikTok Lead/Form',
    category: 'social',
    direction: 'inbound',
    authType: 'oauth',
    supportedEvents: ['new_lead'],
    supportedActions: ['create_lead', 'tag_lead', 'notify_admin'],
    requiredConfigKeys: ['advertiserId', 'appId', 'appSecret'],
    notes: 'Lead generation integration depends on TikTok Business approval.',
  },
  {
    provider: 'sepay',
    name: 'Sepay Payment Webhook',
    category: 'payment',
    direction: 'inbound',
    authType: 'webhook_secret',
    supportedEvents: ['payment_success', 'payment_failed', 'payment_cancelled'],
    supportedActions: ['mark_booking_paid', 'notify_admin'],
    requiredConfigKeys: ['merchantId', 'secretKey', 'ipnSecretKey'],
    notes: 'Configured in payment settings; IPN updates booking payment state.',
  },
  {
    provider: 'misa_amis',
    name: 'MISA AMIS',
    category: 'erp',
    direction: 'outbound',
    authType: 'api_key',
    supportedEvents: ['booking_confirmed', 'payment_success'],
    supportedActions: ['sync_customer', 'sync_invoice', 'sync_receipt'],
    requiredConfigKeys: ['baseUrl', 'appId', 'accessToken'],
    notes: 'Connector scaffold for customer, invoice, and receipt sync.',
  },
  {
    provider: 'nexterp',
    name: 'NextERP',
    category: 'erp',
    direction: 'outbound',
    authType: 'api_key',
    supportedEvents: ['booking_confirmed', 'payment_success'],
    supportedActions: ['sync_customer', 'sync_order', 'sync_receipt'],
    requiredConfigKeys: ['baseUrl', 'accessToken'],
    notes: 'Connector scaffold for order and accounting sync.',
  },
  {
    provider: 'odoo',
    name: 'Odoo',
    category: 'erp',
    direction: 'bidirectional',
    authType: 'api_key',
    supportedEvents: ['booking_confirmed', 'payment_success', 'booking_cancelled'],
    supportedActions: ['sync_partner', 'sync_sale_order', 'sync_invoice', 'sync_payment'],
    requiredConfigKeys: ['baseUrl', 'database', 'username', 'apiKey'],
    notes: 'Use Odoo JSON-RPC/XML-RPC after version and modules are confirmed.',
  },
  {
    provider: 'vieterp',
    name: 'VietERP',
    category: 'erp',
    direction: 'outbound',
    authType: 'api_key',
    supportedEvents: ['booking_confirmed', 'payment_success'],
    supportedActions: ['sync_customer', 'sync_order', 'sync_invoice'],
    requiredConfigKeys: ['baseUrl', 'accessToken'],
    notes: 'Generic ERP connector scaffold until vendor API details are available.',
  },
  {
    provider: 'generic_webhook',
    name: 'Generic Webhook',
    category: 'webhook',
    direction: 'outbound',
    authType: 'webhook_secret',
    supportedEvents: ['new_lead', 'booking_confirmed', 'payment_success', 'booking_cancelled'],
    supportedActions: ['send_webhook'],
    requiredConfigKeys: ['webhookUrl', 'secret'],
    notes: 'Use this for Zapier, Make, n8n, or custom middleware.',
  },
];
