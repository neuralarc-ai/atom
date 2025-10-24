// Server-side Supabase authentication helpers
// These functions communicate with the server's auth endpoints

// Helper function to check if user is authenticated
export async function isAuthenticated() {
  try {
    const response = await fetch('/api/auth/me', {
      credentials: 'include'
    });
    return response.ok;
  } catch {
    return false;
  }
}

// Helper function to get current user
export async function getCurrentUser() {
  try {
    console.log('Fetching /api/auth/me...');
    const response = await fetch('/api/auth/me', {
      credentials: 'include'
    });
    console.log('Response status:', response.status);
    if (response.ok) {
      const userData = await response.json();
      console.log('User data from server:', userData);
      return userData;
    }
    console.log('Response not ok, returning null');
    return null;
  } catch (error) {
    console.error('Error in getCurrentUser:', error);
    return null;
  }
}

// Helper function to sign in
export async function signIn(email: string, password: string) {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Login failed');
  }
  
  return data;
}

// Helper function to sign out
export async function signOut() {
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
  } catch (error) {
    console.error('Logout error:', error);
  }
}

// Helper function to sign up
export async function signUp(email: string, password: string, name: string) {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ email, password, name }),
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Registration failed');
  }
  
  return data;
}

