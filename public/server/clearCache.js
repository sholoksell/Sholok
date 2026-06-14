const http = require('http');

const SERVER_URL = 'localhost';
const SERVER_PORT = 5001;

async function clearServerCache() {
  try {
    console.log('🔄 Clearing server cache...\n');
    
    const options = {
      hostname: SERVER_URL,
      port: SERVER_PORT,
      path: '/categories/clear-cache',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.success) {
            console.log('✅ Server cache cleared successfully!');
            console.log('📢', response.message);
          } else {
            console.log('⚠️ Cache clear response:', response);
          }
        } catch (e) {
          console.log('⚠️ Response:', data);
        }
        
        console.log('\n✨ Now refresh your browser to see all categories!');
        console.log('   Press Ctrl+Shift+R (hard refresh) to clear browser cache too.');
      });
    });

    req.on('error', (error) => {
      if (error.code === 'ECONNREFUSED') {
        console.log('❌ Server is not running!');
        console.log('   Please start the server first:');
        console.log('   cd server && npm start');
      } else {
        console.error('❌ Error:', error.message);
      }
    });

    req.end();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

clearServerCache();
