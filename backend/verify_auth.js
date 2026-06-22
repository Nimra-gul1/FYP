import axios from 'axios';

const API_BASE = 'http://localhost:5001';

async function test() {
  console.log('--- Testing Signup ---');
  try {
    const signup = await axios.post(`${API_BASE}/api/auth/signup`, {
      name: 'Nimra Admin',
      email: 'nimragul981@gmail.com',
      password: 'TestPassword123'
    });
    console.log('✅ Signup Success:', signup.data);
  } catch (err) {
    if (err.response?.data?.message === 'Email already in use') {
      console.log('ℹ️ Email already exists, proceeding to login test.');
    } else {
      console.error('❌ Signup Failed:', err.response?.data || err.message);
    }
  }

  console.log('\n--- Testing Login ---');
  try {
    const login = await axios.post(`${API_BASE}/api/auth/login`, {
      email: 'nimragul981@gmail.com',
      password: 'TestPassword123'
    });
    console.log('✅ Login Success:', login.data);
    if (login.data.role === 'admin') {
      console.log('🌟 Confirmed Admin Role returned!');
    } else {
      console.warn('⚠️ Warning: Role is ', login.data.role);
    }
  } catch (err) {
    console.error('❌ Login Failed:', err.response?.data || err.message);
  }
}

test();
