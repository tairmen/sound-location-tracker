// Test script to demonstrate the Sound Location Tracker system
// This simulates multiple devices detecting sounds at different locations

const BASE_URL = 'http://localhost:3777/api';

// Test devices at different locations (New York area)
const testDevices = [
    {
        deviceId: 'mobile-001',
        latitude: 40.7580,
        longitude: -73.9855,
        name: 'Times Square Device'
    },
    {
        deviceId: 'mobile-002',
        latitude: 40.7614,
        longitude: -73.9776,
        name: 'Central Park Device'
    },
    {
        deviceId: 'mobile-003',
        latitude: 40.7489,
        longitude: -73.9680,
        name: 'UN Headquarters Device'
    }
];

// Helper function to make API requests
async function apiRequest(endpoint, method = 'GET', body = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json'
        }
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    return await response.json();
}

// Simulate device starting sound detection
async function startDetection(device, soundPower) {
    console.log(`\n🎵 Starting detection for ${device.name}...`);
    const result = await apiRequest('/detection/start', 'POST', {
        deviceId: device.deviceId,
        latitude: device.latitude,
        longitude: device.longitude,
        soundPower: soundPower
    });
    console.log(`   ✅ Detection started: ID ${result.data?.id}`);
    return result;
}

// Simulate updating sound power
async function updatePower(deviceId, soundPower) {
    console.log(`\n📊 Updating power for ${deviceId}...`);
    const result = await apiRequest('/detection/update', 'PUT', {
        deviceId: deviceId,
        soundPower: soundPower
    });
    console.log(`   ✅ Power updated to ${soundPower} dB`);
    return result;
}

// Simulate ending detection
async function endDetection(deviceId) {
    console.log(`\n🔇 Ending detection for ${deviceId}...`);
    const result = await apiRequest('/detection/end', 'POST', {
        deviceId: deviceId
    });
    console.log(`   ✅ Detection ended`);
    return result;
}

// Get all devices
async function getAllDevices() {
    console.log(`\n📱 Fetching all devices...`);
    const result = await apiRequest('/devices');
    console.log(`   ✅ Found ${result.count} devices`);
    return result;
}

// Run the test scenario
async function runTest() {
    console.log('='.repeat(60));
    console.log('🧪 SOUND LOCATION TRACKER - TEST SCENARIO');
    console.log('='.repeat(60));

    try {
        // Scenario 1: Device 1 starts detecting
        await startDetection(testDevices[0], 75.5);
        await sleep(1000);

        // Scenario 2: Device 2 starts detecting
        await startDetection(testDevices[1], 82.3);
        await sleep(1000);

        // Scenario 3: Device 1 updates power (sound getting louder)
        await updatePower(testDevices[0].deviceId, 78.2);
        await sleep(500);
        await updatePower(testDevices[0].deviceId, 81.5);
        await sleep(1000);

        // Scenario 4: Device 3 starts detecting
        await startDetection(testDevices[2], 70.1);
        await sleep(1000);

        // Scenario 5: Device 2 updates power
        await updatePower(testDevices[1].deviceId, 85.7);
        await sleep(1000);

        // Scenario 6: Device 1 stops detecting
        await endDetection(testDevices[0].deviceId);
        await sleep(1000);

        // Scenario 7: Get all devices status
        const devices = await getAllDevices();

        console.log('\n' + '='.repeat(60));
        console.log('📊 CURRENT STATUS:');
        console.log('='.repeat(60));
        devices.data.forEach(device => {
            const status = device.is_active ? '🟢 ACTIVE' : '⚫ INACTIVE';
            const power = device.sound_power ? `${device.sound_power} dB` : 'N/A';
            console.log(`\n${device.device_id}:`);
            console.log(`   Status: ${status}`);
            console.log(`   Location: (${device.latitude}, ${device.longitude})`);
            console.log(`   Sound Power: ${power}`);
        });

        console.log('\n' + '='.repeat(60));
        console.log('✅ TEST COMPLETED SUCCESSFULLY!');
        console.log('🌐 Open http://localhost:3000 to view the map interface');
        console.log('='.repeat(60));

    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        console.log('\n💡 Make sure:');
        console.log('   1. PostgreSQL is running');
        console.log('   2. Database is migrated (npm run db:migrate)');
        console.log('   3. Server is running (npm run dev)');
    }
}

// Helper function to sleep
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Run the test
runTest();
