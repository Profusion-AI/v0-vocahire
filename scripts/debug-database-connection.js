#!/usr/bin/env node

/**
 * Database Connection Debug Script
 * Run with: node scripts/debug-database-connection.js
 */

const { PrismaClient } = require('@prisma/client');

async function debugDatabaseConnection() {
  console.log('🔍 Database Connection Debug Tool\n');
  
  // Check environment variables
  console.log('1. Environment Variables Check:');
  console.log('   DATABASE_URL:', process.env.DATABASE_URL ? '✅ Set' : '❌ Missing');
  console.log('   MIGRATE_DATABASE_URL:', process.env.MIGRATE_DATABASE_URL ? '✅ Set' : '❌ Missing');
  console.log('   NODE_ENV:', process.env.NODE_ENV || 'not set');
  
  if (process.env.DATABASE_URL) {
    const url = new URL(process.env.DATABASE_URL);
    console.log('   Database Host:', url.hostname);
    console.log('   Database Name:', url.pathname.slice(1));
    console.log('   Connection Mode:', url.searchParams.get('pgbouncer') ? 'Pooled' : 'Direct');
  }
  
  console.log('\n2. Prisma Client Test:');
  
  let prisma;
  try {
    // Initialize Prisma Client
    prisma = new PrismaClient({
      log: ['query', 'info', 'warn', 'error'],
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });
    
    console.log('   ✅ Prisma Client initialized');
    
    // Test connection
    console.log('\n3. Connection Test:');
    const startTime = Date.now();
    
    try {
      await prisma.$connect();
      console.log('   ✅ Connected to database');
      
      // Test query
      const result = await prisma.$queryRaw`SELECT 1 as test, NOW() as timestamp`;
      const duration = Date.now() - startTime;
      console.log('   ✅ Test query successful');
      console.log('   Connection time:', duration, 'ms');
      console.log('   Server time:', result[0].timestamp);
      
      // Check tables
      console.log('\n4. Database Tables:');
      const tables = await prisma.$queryRaw`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name
      `;
      
      if (tables.length === 0) {
        console.log('   ⚠️  No tables found - migrations may not have run');
      } else {
        console.log('   Found', tables.length, 'tables:');
        tables.forEach(t => console.log('   -', t.table_name));
      }
      
      // Check User table
      console.log('\n5. User Table Check:');
      try {
        const userCount = await prisma.user.count();
        console.log('   ✅ User table accessible');
        console.log('   Total users:', userCount);
      } catch (error) {
        console.log('   ❌ User table error:', error.message);
      }
      
      // Check connection pool
      console.log('\n6. Connection Pool Status:');
      const poolStatus = await prisma.$queryRaw`
        SELECT 
          numbackends as active_connections,
          (SELECT setting::int FROM pg_settings WHERE name='max_connections') as max_connections
        FROM pg_stat_database 
        WHERE datname = current_database()
      `;
      
      if (poolStatus[0]) {
        console.log('   Active connections:', poolStatus[0].active_connections);
        console.log('   Max connections:', poolStatus[0].max_connections);
        console.log('   Utilization:', 
          Math.round((poolStatus[0].active_connections / poolStatus[0].max_connections) * 100) + '%'
        );
      }
      
    } catch (error) {
      console.log('   ❌ Connection failed');
      console.log('   Error code:', error.code);
      console.log('   Error message:', error.message);
      
      if (error.code === 'P1001') {
        console.log('\n   💡 Suggestion: Check if database server is running');
      } else if (error.code === 'P1002') {
        console.log('\n   💡 Suggestion: Connection timeout - check network/firewall');
      } else if (error.code === 'P1003') {
        console.log('\n   💡 Suggestion: Database does not exist');
      }
    }
    
  } catch (error) {
    console.log('   ❌ Failed to initialize Prisma Client');
    console.log('   Error:', error.message);
  } finally {
    if (prisma) {
      await prisma.$disconnect();
      console.log('\n✅ Disconnected from database');
    }
  }
  
  // Additional checks
  console.log('\n7. Additional Diagnostics:');
  
  // Check if running in Docker/Cloud Run
  if (process.env.K_SERVICE) {
    console.log('   Running in Cloud Run');
    console.log('   Service:', process.env.K_SERVICE);
    console.log('   Revision:', process.env.K_REVISION);
  }
  
  // Memory usage
  const used = process.memoryUsage();
  console.log('\n8. Memory Usage:');
  for (let key in used) {
    console.log(`   ${key}: ${Math.round(used[key] / 1024 / 1024 * 100) / 100} MB`);
  }
}

// Run the debug
debugDatabaseConnection().catch(console.error);