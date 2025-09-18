// @ts-nocheck
/**
 * Smoke test for /auth/refresh endpoint to ensure proper API connectivity
 * and that we receive a valid HTTP response structure.
 */

import fs from 'fs';
import axios from 'axios';

async function main() {
  try {
    const env = fs.readFileSync('.env.local', 'utf8');
    const match = env.match(/NEXT_PUBLIC_API_BASE_URL=(.+)/);
    if (!match) {
      console.error('Could not read NEXT_PUBLIC_API_BASE_URL from .env.local');
      process.exit(2);
    }
    const baseURL = match[1].trim();
    const url = `${baseURL.replace(/\/+$/, '')}/auth/refresh`;

    const client = axios.create({
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'MedSpace-Refresh-Test/1.0'
      }
    });

    console.log('POST', url, 'with dummy invalid refresh token');
    try {
      const resp = await client.post(url, { refreshToken: 'invalid' });
      console.log('HTTP', resp.status, resp.statusText);
      console.log('Body:', JSON.stringify(resp.data));
      // If success, exit 0
      process.exit(0);
    } catch (e) {
      if (e.response) {
        console.log('HTTP', e.response.status, e.response.statusText);
        console.log('Body:', JSON.stringify(e.response.data));
        // Receiving a structured error response from server is success for this smoke test
        process.exit(0);
      } else {
        console.error('Network/Transport error:', e.code || e.message);
        process.exit(1);
      }
    }
  } catch (err) {
    console.error('Unexpected failure:', err.message);
    process.exit(3);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

