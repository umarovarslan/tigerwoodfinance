document.getElementById('logoutButton').addEventListener('click', function() {
    // Clear the JWT token from localStorage
    localStorage.removeItem('token');
    
    // Redirect to the login page
    window.location.href = '/login.html';
});

function fetchUserInvestments() {
    const token = localStorage.getItem('token');

    if (!token) {
        // No token, redirect to login
        window.location.href = '/login.html';
        return;
    }

    // Send the token in the Authorization header
    fetch('/investments', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(data => {
        // Display the user's investments in the dashboard
        const investmentContainer = document.getElementById('investmentData');
        let investmentHTML = '<h3>Your Investments:</h3>';

        if (data.length === 0) {
            investmentHTML += '<p>No investments found.</p>';
        } else {
            data.forEach(investment => {
                investmentHTML += `<p>Amount: $${investment.amount}, Growth Rate: ${investment.growth_rate * 100}%</p>`;
            });
        }

        investmentContainer.innerHTML = investmentHTML;
    })
    .catch(error => {
        console.error('Error fetching investments:', error);
    });
}

// Call the function to fetch and display the user's investments
fetchUserInvestments();
