function login(event) {
    event.preventDefault(); // Prevent form submission

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const loginResult = document.getElementById('loginResult');

    // Clear previous result
    loginResult.innerHTML = '';

    // Basic validation
    if (!email || !password) {
        loginResult.innerHTML = 'Please enter both email and password.';
        return;
    }

    // Send login request to the backend
    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.token) {
            // Store the JWT token in localStorage for future requests
            localStorage.setItem('token', data.token);
            
            // Redirect to the dashboard
            window.location.href = '/dashboard.html';
        } else {
            loginResult.innerHTML = `Error: ${data.error}`;
        }
    })
    .catch(error => {
        loginResult.innerHTML = 'Error logging in. Please try again later.';
        console.error('Login error:', error);
    });
}
