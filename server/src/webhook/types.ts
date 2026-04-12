/**
 * Subset of Meta WhatsApp Cloud API webhook JSON.
 * @see https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/components
 */
export interface WhatsAppWebhookBody {
  object?: string;
  entry?: Array<{
    id?: string;
    changes?: Array<{
      field?: string;
      value?: {
        messaging_product?: string;
        metadata?: {
          display_phone_number?: string;
          phone_number_id?: string;
        };
        messages?: unknown[];
        statuses?: unknown[];
        contacts?: unknown[];
        errors?: unknown[];
      };
    }>;
  }>;
}
