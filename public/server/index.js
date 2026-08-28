require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const app = express();
const PORT = process.env.PORT || 3000;

const API_KEY = process.env.WHOP_API_KEY;
const COMPANY_ID = process.env.WHOP_COMPANY_ID;
const SANDBOX = process.env.WHOP_SANDBOX === 'true';
const API_BASE = SANDBOX
  ? 'https://sandbox-api.whop.com/api/v1'
  : 'https://api.whop.com/api/v1';

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

function authHeaders() {
  return {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json',
  };
}

// Create Lead via Whop API
app.post('/api/leads', async (req, res) => {
  try {
    const payload = {
      company_id: COMPANY_ID,
      email: req.body.email,
      metadata: {
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        phone: req.body.phone || '',
        address: req.body.address,
        city: req.body.city,
        state: req.body.state,
        postal_code: req.body.postal_code,
        property_type: req.body.property_type,
      },
    };

    const response = await fetch(`${API_BASE}/leads`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    res.status(200).json({ success: true, lead: data });
  } catch (err) {
    console.error('[Lead Error]', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Health check
app.get('/api/config', (req, res) => {
  res.json({
    success: true,
    companyId: COMPANY_ID,
    environment: SANDBOX ? 'sandbox' : 'production',
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Running on port ${PORT}`);
  console.log(`   Company: ${COMPANY_ID}`);
  console.log(`   Mode: ${SANDBOX ? 'SANDBOX' : 'PRODUCTION'}`);
});
    
