const axios = require('axios');

// CONFIGURATION
const API_URL = 'http://127.0.0.1:3001'; // Use IPv4 explicitly
const OWNER_EMAIL = 'owner@demo.com';
const OWNER_PASSWORD = 'owner123';

async function testLimits() {
    console.log('🔒 Testing Subscription Limits (PlanLimitGuard)...');

    try {
        // 1. Login as Owner
        console.log('\n👉 Logging in as Owner...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: OWNER_EMAIL,
            password: OWNER_PASSWORD
        }, { timeout: 5000 }); // 5s timeout

        const token = loginRes.data.access_token;
        const tenantId = loginRes.data.user.tenantId;
        console.log('✅ Login successful. Tenant ID:', tenantId);
        console.log('👤 User Roles:', JSON.stringify(loginRes.data.user.roles, null, 2));

        const config = { headers: { Authorization: `Bearer ${token}` } };

        // 2. Check Current Plan
        console.log('\n👉 Checking Current Plan...');
        const planRes = await axios.get(`${API_URL}/subscription/current`, config);
        console.log(`   Active Plan: ${planRes.data.name}`);
        console.log(`   Max Rooms: ${planRes.data.maxRooms}`);
        console.log(`   Current Usage: ${planRes.data.usage.rooms}`);

        // 2. Fetch Kost and RoomType to use valid IDs
        console.log('👉 Fetching Kosts...');
        const kostRes = await axios.get(`${API_URL}/kosts`, config);
        const kostId = kostRes.data[0]?.id;
        if (!kostId) throw new Error('No Kost found. Seed db?');
        console.log('✅ Found Kost ID:', kostId);

        console.log('👉 Fetching RoomTypes...');
        const rtRes = await axios.get(`${API_URL}/room-types`, config);
        const roomTypeId = rtRes.data[0]?.id;
        if (!roomTypeId) throw new Error('No RoomType found. Seed db?');
        console.log('✅ Found RoomType ID:', roomTypeId);


        // 3. Loop create rooms
        for (let i = 0; i < 10; i++) {
            const roomNum = `TEST-${Date.now()}-${i}`;
            console.log(`\n👉 Attempting to create Room ${roomNum}...`);

            try {
                await axios.post(`${API_URL}/rooms`, {
                    name: roomNum, // Room name/number
                    roomNumber: roomNum,
                    roomTypeId: roomTypeId,
                    kostId: kostId,
                    price: 500000,
                }, config);

                console.log('✅ Room created.');
            } catch (error) {
                if (error.response) {
                    if (error.response.status === 403) {
                        console.log('🛑 BLOCKED BY GUARD: 403 Forbidden');
                        console.log('   Message:', error.response.data.message);
                        console.log('\n✅ SUCCESS: Plan Limit Logic is working!');
                        return; // Test passed
                    } else if (error.response.status === 400) {
                        console.log('⚠️ Bad Request (Expected if dummy data), but Guard passed.');
                    } else {
                        console.log(`❌ Error ${error.response.status}:`, error.response.data);
                    }
                } else {
                    console.log('❌ Network Error:', error.message);
                    if (error.code) console.log('   Code:', error.code);
                    if (error.cause) console.log('   Cause:', error.cause);
                }
            }
        }

    } catch (error) {
        console.log('❌ Test Failed:', error.message);
        if (error.response) {
            console.log('   Status:', error.response.status);
            console.log('   Data:', error.response.data);
        } else {
            console.log('   No response received.');
            console.log('   Code:', error.code);
        }
    }
}

testLimits();
