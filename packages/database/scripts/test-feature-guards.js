const axios = require('axios');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const API_URL = 'http://127.0.0.1:3001';

async function testFeatureGuards() {
    console.log('🔒 Testing Feature & Kost Limits (Pro vs Basic)...');

    // 1. Login as Owner (Currently Pro Plan)
    let token;
    let tenantId;
    let headers;

    try {
        console.log('\n👉 1. Logging in as Owner (Expect Pro)...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'owner@demo.com',
            password: 'owner123',
        });
        token = loginRes.data.access_token;
        tenantId = loginRes.data.user.tenantId;
        headers = { Authorization: `Bearer ${token}` };
        console.log('✅ Login successful.');
    } catch (error) {
        console.error('❌ Login Failed:', error.message);
        return;
    }

    // 2. Test Finance Access (Should Succeed for Pro)
    try {
        console.log('\n👉 2. Testing /finance (Pro Plan - Should SUCCEED)...');
        await axios.get(`${API_URL}/finance/summary`, { headers });
        console.log('✅ Accessed /finance/summary (Allowed)');
    } catch (error) {
        console.error('❌ Finance Access Failed (Unexpected):', error.response?.status);
    }

    // 3. Test Multi-Kost Creation (Should Succeed for Pro - Limit 100)
    try {
        console.log('\n👉 3. Testing Kost Creation (Pro Plan - Should SUCCEED)...');
        const res = await axios.post(`${API_URL}/kosts`, {
            name: `Pro Branch ${Date.now()}`,
            description: "Additional Branch",
        }, { headers });
        console.log('✅ Created 2nd Kost:', res.data.id);
    } catch (error) {
        console.error('❌ Kost Creation Failed (Unexpected):', error.response?.data);
    }

    // 4. DOWNGRADE to Basic Plan
    console.log('\n⬇️ Downgrading Plan to BASIC...');
    const basicPlan = await prisma.plan.findFirst({ where: { name: 'Basic' } });
    console.log('   Basic Plan Details:', JSON.stringify(basicPlan, null, 2));
    const userSubscription = await prisma.subscription.findFirst({ where: { tenantId, status: 'ACTIVE' } });

    // Backup original plan to restore later
    const originalPlanId = userSubscription.planId;

    if (basicPlan && userSubscription) {
        await prisma.subscription.update({
            where: { id: userSubscription.id },
            data: { planId: basicPlan.id }
        });
        console.log('✅ Plan changed to BASIC.');
    } else {
        console.error('❌ Could not find Basic Plan or Subscription.');
        return;
    }

    // 5. Test Finance Access (Should FAIL for Basic)
    try {
        console.log('\n👉 5. Testing /finance (Basic Plan - Should FAIL 403)...');
        await axios.get(`${API_URL}/finance/summary`, { headers });
        console.error('❌ Finance Access SUCCEEDED (Should have failed!)');
    } catch (error) {
        if (error.response?.status === 403) {
            console.log('✅ BLOCKED: 403 Forbidden (Correct)');
        } else {
            console.error(`❌ Failed with wrong status: ${error.response?.status}`);
        }
    }

    // 6. Test Multi-Kost Creation (Should FAIL for Basic - Limit 1)
    try {
        console.log('\n👉 6. Testing Kost Creation (Basic Plan - Should FAIL 403)...');
        await axios.post(`${API_URL}/kosts`, {
            name: `Basic Branch ${Date.now()}`,
            description: "Should Fail",
        }, { headers });
        console.error('❌ Kost Creation SUCCEEDED (Should have failed!)');
    } catch (error) {
        if (error.response?.status === 403) {
            console.log('✅ BLOCKED: 403 Forbidden (Correct)');
            console.log('   Message:', error.response.data.message);
        } else {
            console.error(`❌ Failed with wrong status: ${error.response?.status}`);
            console.error('   Data:', error.response?.data);
        }
    }

    // 7. RESTORE Plan
    console.log('\n⬆️ Restoring Plan to PRO...');
    await prisma.subscription.update({
        where: { id: userSubscription.id },
        data: { planId: originalPlanId }
    });
    console.log('✅ Plan restored.');

    await prisma.$disconnect();
}

testFeatureGuards();
