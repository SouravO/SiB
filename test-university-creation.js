/**
 * University Creation Test Script
 * 
 * Run this in your browser console to test university creation
 * 
 * Usage:
 * 1. Open browser console (F12)
 * 2. Copy and paste this entire script
 * 3. Replace CITY_ID with a valid city ID from your database
 * 4. Run the script
 */

async function testUniversityCreation() {
    console.log('=== University Creation Test ===\n');
    
    // TODO: Replace with a valid city ID from your database
    const TEST_CITY_ID = 'PUT_YOUR_CITY_ID_HERE';
    const TEST_UNIVERSITY_NAME = `Test University ${new Date().getTime()}`;
    
    console.log('Test Parameters:');
    console.log(`- University Name: ${TEST_UNIVERSITY_NAME}`);
    console.log(`- City ID: ${TEST_CITY_ID}`);
    console.log('');
    
    // Step 1: Check if city exists
    console.log('Step 1: Checking if city exists...');
    try {
        const cityResponse = await fetch(`/api/test-city?id=${TEST_CITY_ID}`);
        const cityData = await cityResponse.json();
        
        if (!cityData.exists) {
            console.error('❌ City does not exist! Please add a city first.');
            console.log('Available cities:', cityData.availableCities);
            return;
        }
        console.log(`✓ City found: ${cityData.city.name}`);
    } catch (error) {
        console.error('Error checking city:', error);
    }
    
    // Step 2: Try to create university
    console.log('\nStep 2: Attempting to create university...');
    try {
        const response = await fetch('/api/test-create-university', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: TEST_UNIVERSITY_NAME,
                cityId: TEST_CITY_ID
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            console.log('✓ University created successfully!');
            console.log('Created university:', result.university);
        } else {
            console.error('❌ University creation failed!');
            console.error('Error:', result.error);
            console.error('Details:', result.details);
        }
    } catch (error) {
        console.error('Error creating university:', error);
    }
    
    console.log('\n=== Test Complete ===');
}

// Run the test
testUniversityCreation();
