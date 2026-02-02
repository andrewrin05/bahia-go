async function testAPI() {
  try {
    console.log('Testing backend API...');
    
    // Test boats endpoint
    const boatsResponse = await fetch('http://localhost:3000/boats');
    console.log('Boats endpoint:', boatsResponse.status);
    const boatsData = await boatsResponse.json();
    console.log('Number of boats:', boatsData.length);
    
    // Test auth request-otp
    const otpResponse = await fetch('http://localhost:3000/auth/request-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: 'test@example.com' }),
    });
    console.log('OTP request:', otpResponse.status);
    
    console.log('API tests passed!');
  } catch (error) {
    console.error('API test failed:', error.message);
  }
}

testAPI();