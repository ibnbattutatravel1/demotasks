// Test script to check communities in database
const mysql = require('mysql2/promise');

async function testDB() {
  try {
    console.log('🔗 Connecting to database...');
    
    const connection = await mysql.createConnection({
      host: 'srv557.hstgr.io',
      user: 'u744630877_tasks',
      password: '###Taskstasks123',
      database: 'u744630877_tasks',
      port: 3306,
      ssl: { rejectUnauthorized: false }
    });

    console.log('✅ Connected successfully!\n');

    // Check if communities table exists
    console.log('📊 Checking tables...');
    const [tables] = await connection.query("SHOW TABLES LIKE 'communit%'");
    console.log('Tables found:', tables.length);
    tables.forEach(t => console.log('  -', Object.values(t)[0]));
    console.log('');

    // Check if there are any communities
    console.log('🏘️  Checking communities...');
    const [communities] = await connection.query('SELECT id, name, visibility, created_at, is_archived FROM communities LIMIT 10');
    console.log('Total communities:', communities.length);
    console.log('');

    if (communities.length > 0) {
      console.log('📋 Communities found:');
      communities.forEach(c => {
        console.log(`  - ${c.id}: ${c.name} (${c.visibility}) - Archived: ${c.is_archived}`);
      });
    } else {
      console.log('⚠️  No communities found in database!');
      console.log('💡 You need to create one first.');
    }

    await connection.end();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
  }
}

testDB();
