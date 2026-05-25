interface MessageInput {
  subject: string;
  body: string;
}

interface Seller {
  id: string;
  name: string;
  email: string;
}

const ADMIN_API_URL = process.env.ADMIN_API_URL || 'http://localhost:3002';
const ADMIN_INTERNAL_SECRET = process.env.ADMIN_INTERNAL_SECRET || 'dev-internal-secret';

export class MessageService {
  public async sendMessage(seller: Seller, input: MessageInput): Promise<void> {
    const response = await fetch(`${ADMIN_API_URL}/admin/api/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Internal-Secret': ADMIN_INTERNAL_SECRET,
      },
      body: JSON.stringify({
        sellerId: seller.id,
        sellerName: seller.name,
        sellerEmail: seller.email,
        subject: input.subject,
        body: input.body,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to send message: ${response.statusText}`);
    }
  }
}
