import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: 'http://localhost:3000', // Vite dev server
  credentials: true
}));

app.use(express.json());

// Basic health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// MDRRMO SMS Gateway Endpoint for Automated Responder Alerts
interface SmsDispatchPayload {
  caseId: string;
  message: string;
  dispatches: Array<{
    recipientName: string;
    recipientPhone: string;
    recipientRole: string;
    status: string;
  }>;
  timestamp: string;
  isResend?: boolean;
  resendCount?: number;
}

const smsDispatchHistory: SmsDispatchPayload[] = [];

app.post('/api/sms/broadcast-alert', (req, res) => {
  const { caseId, message, dispatches, timestamp, isResend, resendCount } = req.body as SmsDispatchPayload;
  
  const header = isResend
    ? `🚨 [MDRRMO SMS RE-SEND BROADCAST #${resendCount || 1}] Case #${caseId || 'N/A'} (UNACKNOWLEDGED - RECURRING WARNING)`
    : `🚨 [MDRRMO SMS BROADCAST DISPATCHED] Case #${caseId || 'N/A'}`;

  console.log(`\n======================================================`);
  console.log(header);
  console.log(`⏰ Timestamp: ${timestamp || new Date().toISOString()}`);
  console.log(`📨 Message Payload:\n${message}`);
  console.log(`📱 MDRRMO Account Dispatch (${dispatches?.length || 0}):`);
  if (Array.isArray(dispatches)) {
    dispatches.forEach((d, i) => {
      console.log(`   [${i + 1}] ${d.recipientName} (${d.recipientRole}) -> ${d.recipientPhone} [STATUS: ${d.status || 'SENT'}]`);
    });
  }
  console.log(`======================================================\n`);

  smsDispatchHistory.unshift({ caseId, message, dispatches: dispatches || [], timestamp: timestamp || new Date().toISOString(), isResend, resendCount });
  
  res.json({
    success: true,
    message: isResend
      ? `Automated SMS interval alert #${resendCount || 1} re-transmitted to MDRRMO account.`
      : `Automated SMS broadcast transmitted to MDRRMO account.`,
    sentCount: dispatches?.length || 0,
    isResend: !!isResend,
    resendCount: resendCount || 0,
    deliveredAt: new Date().toISOString()
  });
});

app.get('/api/sms/logs', (req, res) => {
  res.json({ logs: smsDispatchHistory.slice(0, 50) });
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
