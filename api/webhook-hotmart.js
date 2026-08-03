const crypto = require('crypto');

const PIXEL_ID = '966466459429153';
const APPROVED_STATUSES = ['APPROVED', 'COMPLETE'];

function sha256(value) {
  return crypto.createHash('sha256').update(String(value).trim().toLowerCase()).digest('hex');
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method_not_allowed' });
    return;
  }

  const body = req.body || {};

  // Se HOTMART_HOTTOK estiver configurada, valida a origem do webhook.
  const expectedHottok = process.env.HOTMART_HOTTOK;
  if (expectedHottok && body.hottok !== expectedHottok) {
    res.status(401).json({ error: 'invalid_hottok' });
    return;
  }

  const purchase = (body.data && body.data.purchase) || {};
  const status = String(purchase.status || '').toUpperCase();

  if (!APPROVED_STATUSES.includes(status)) {
    res.status(200).json({ received: true, sent: false, reason: `status_${status || 'missing'}_ignored` });
    return;
  }

  const accessToken = process.env.META_ACCESS_TOKEN;
  if (!accessToken) {
    console.error('webhook-hotmart: META_ACCESS_TOKEN não configurado');
    res.status(200).json({ received: true, sent: false, reason: 'missing_access_token' });
    return;
  }

  const buyer = (body.data && body.data.buyer) || {};
  const value = (purchase.price && purchase.price.value) || 27.0;
  const currency = (purchase.price && purchase.price.currency_value) || 'BRL';
  const transactionId = purchase.transaction || body.id || `${Date.now()}`;

  const userData = {};
  if (buyer.email) userData.em = [sha256(buyer.email)];
  const phone = buyer.checkout_phone || buyer.phone;
  if (phone) userData.ph = [sha256(String(phone).replace(/\D/g, ''))];

  const forwardedFor = req.headers['x-forwarded-for'];
  if (forwardedFor) userData.client_ip_address = String(forwardedFor).split(',')[0].trim();
  if (req.headers['user-agent']) userData.client_user_agent = req.headers['user-agent'];

  const capiPayload = {
    data: [
      {
        event_name: 'Purchase',
        event_time: Math.floor(Date.now() / 1000),
        event_id: String(transactionId),
        action_source: 'website',
        event_source_url: 'https://tiktok-shop-revelado-site.vercel.app/',
        user_data: userData,
        custom_data: { value, currency },
      },
    ],
  };

  try {
    const fbRes = await fetch(
      `https://graph.facebook.com/v21.0/${PIXEL_ID}/events?access_token=${accessToken}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(capiPayload),
      }
    );
    const fbData = await fbRes.json();

    if (!fbRes.ok) {
      console.error('webhook-hotmart: erro na Conversions API', fbData);
      res.status(200).json({ received: true, sent: false, error: fbData });
      return;
    }

    res.status(200).json({ received: true, sent: true, transactionId, result: fbData });
  } catch (err) {
    console.error('webhook-hotmart: falha ao chamar Conversions API', err);
    res.status(200).json({ received: true, sent: false, error: 'capi_request_failed' });
  }
};
