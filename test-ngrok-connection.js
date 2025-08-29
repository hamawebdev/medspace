// Test script to verify ngrok connection
import axios from 'axios'
const API_BASE_URL = 'https://a254c5f0e38a.ngrok-free.app/api/v1';

async function testNgrokConnection() {
  console.log('🔍 Testing ngrok connection...');

  try {
    const response = await axios.get(`${API_BASE_URL}/universities`, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });

    if (response.status >= 200 && response.status < 300) {
      console.log('✅ API is working');
    } else {
      console.log('❌ API is not working');
    }

  } catch (error) {
    console.log('❌ API is not working');
  }
}

testNgrokConnection();
