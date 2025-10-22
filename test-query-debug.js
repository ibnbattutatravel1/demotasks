// Test to see what the query returns
const mysql = require('mysql2/promise');

async function testQuery() {
  try {
    const connection = await mysql.createConnection({
      host: 'srv557.hstgr.io',
      user: 'u744630877_tasks',
      password: '###Taskstasks123',
      database: 'u744630877_tasks',
      port: 3306,
      ssl: { rejectUnauthorized: false }
    });

    console.log('✅ Connected\n');

    // Get a sample admin user
    const [users] = await connection.query("SELECT id, name, role FROM users WHERE role = 'admin' LIMIT 1");
    
    if (users.length === 0) {
      console.log('❌ No admin user found!');
      await connection.end();
      return;
    }

    const userId = users[0].id;
    const userRole = users[0].role;
    
    console.log('👤 Testing with user:', {
      id: userId,
      name: users[0].name,
      role: userRole
    });
    console.log('');

    // Test the exact query from the API
    const query = `
      SELECT DISTINCT
        c.*,
        cm.role as user_role,
        cm.joined_at as user_joined_at,
        u.name as creator_name,
        u.avatar as creator_avatar
      FROM communities c
      LEFT JOIN community_members cm ON c.id = cm.community_id AND cm.user_id = ?
      LEFT JOIN users u ON c.created_by = u.id
      WHERE 
        (cm.user_id = ? OR c.visibility = 'public' OR ? = 'admin')
        AND c.is_archived = FALSE
      ORDER BY 
        CASE WHEN cm.user_id IS NOT NULL THEN 0 ELSE 1 END,
        c.created_at DESC
    `;

    console.log('🔍 Running query...\n');
    const [results] = await connection.query(query, [userId, userId, userRole]);
    
    console.log('📊 Results:', results.length, 'communities found\n');
    
    results.forEach((c, i) => {
      console.log(`${i + 1}. ${c.id}`);
      console.log(`   Name: ${c.name}`);
      console.log(`   Visibility: ${c.visibility}`);
      console.log(`   User Role: ${c.user_role || 'none'}`);
      console.log(`   Created By: ${c.created_by}`);
      console.log(`   Archived: ${c.is_archived}`);
      console.log('');
    });

    // Also check all communities
    console.log('📋 All communities in DB:');
    const [allComms] = await connection.query('SELECT id, name, visibility, is_archived FROM communities');
    allComms.forEach(c => {
      console.log(`  - ${c.name} (${c.visibility}) - Archived: ${c.is_archived}`);
    });

    await connection.end();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testQuery();
