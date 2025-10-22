// Test Communities API
const http = require('http');

async function testAPI() {
  return new Promise((resolve, reject) => {
    console.log('🔍 Testing GET /api/communities...\n');
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/communities',
      method: 'GET',
      headers: {
        'Cookie': process.argv[2] || '' // Pass cookie as argument
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      console.log('📡 Status:', res.statusCode);
      console.log('📋 Headers:', JSON.stringify(res.headers, null, 2));
      console.log('');

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          console.log('✅ Response:');
          console.log(JSON.stringify(json, null, 2));
          
          if (json.success && json.data) {
            console.log('\n🏘️  Communities count:', json.data.length);
          }
        } catch (e) {
          console.log('❌ Failed to parse JSON:', data);
        }
        resolve();
      });
    });

    req.on('error', (e) => {
      console.error('❌ Request error:', e.message);
      reject(e);
    });

    req.end();
  });
}

testAPI();
