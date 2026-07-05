import dns from 'dns';
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {
  console.warn('Failed to set public DNS servers, using system default.');
}

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();
