// Test script to verify production API connection
import axios from 'axios'
const API_BASE_URL = 'https://med-cortex.com/api/v1';

async function testProductionConnection() {
  console.log('🔍 Testing production API connection...');

  try {
    const response = await axios.get(`${API_BASE_URL}/universities`, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'MedSpace-Web-Client/1.0'
      },
      timeout: 10000,
    });

    if (response.status >= 200 && response.status < 300) {
      console.log('✅ Production API is working');
    } else {
      console.log('❌ Production API is not working');
    }

  } catch (error) {
    console.log('❌ Production API is not working');
  }
}

testProductionConnection();
