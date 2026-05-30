import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import EmailIcon from '@mui/icons-material/Email';
import sql from '@/lib/db';

export default async function SellerMessagesPage() {
  const messages = await sql<{
    id: string;
    seller_name: string;
    seller_email: string;
    subject: string;
    body: string;
    created_at: Date;
  }[]>`
    SELECT id, seller_name, seller_email, subject, body, created_at
    FROM seller_messages
    ORDER BY created_at DESC
  `;

  return (
    <Paper
      elevation={0}
      sx={{ borderRadius: 2, p: 4, border: '1px solid #e5e7eb', bgcolor: '#fff' }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <EmailIcon color="primary" fontSize="large" />
        <Typography variant="h4" fontWeight={700}>
          Seller Messages
        </Typography>
      </Box>

      {messages.length === 0 ? (
        <Typography color="text.secondary">No messages yet.</Typography>
      ) : (
        messages.map((msg) => (
          <Paper key={msg.id} variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
              <Typography fontWeight={600}>{msg.subject}</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ ml: 2, flexShrink: 0 }}>
                {new Date(msg.created_at).toLocaleString()}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" mb={1}>
              From: {msg.seller_name} ({msg.seller_email})
            </Typography>
            <Typography variant="body1">{msg.body}</Typography>
          </Paper>
        ))
      )}
    </Paper>
  );
}
