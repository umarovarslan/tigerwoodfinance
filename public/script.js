const interestData = {
    2023: {
        September: 19.62,
        October: 22.45,
        November: -1.92,
        December: 28.34
    },
    2024: {
        January: 13.84,
        February: 26.17,
        March: 23.58,
        April: 7.37,
        May: 9.41,
        June: 8.5,
        July: 6.0,
        August: 7.88
    }
};

// ROI data for comparison assets
const roiData = {
    2023: {
        September: { bitcoin: -0.13, sp500: -2.72, gold: -2.90 },
        October: { bitcoin: 15.0, sp500: 1.13, gold: 4.78 },
        November: { bitcoin: 25.0, sp500: 5.04, gold: 2.81 },
        December: { bitcoin: -0.9, sp500: 3.53, gold: 1.21 }
    },
    2024: {
        January: { bitcoin: 3.88, sp500: 4.94, gold: 0.35 },
        February: { bitcoin: 60.0, sp500: 2.47, gold: 7.19 },
        March: { bitcoin: -4.11, sp500: 1.55, gold: 7.32 },
        April: { bitcoin: -19.52, sp500: -0.27, gold: -1.33 },
        May: { bitcoin: 23.88, sp500: 3.44, gold: 0.13 },
        June: { bitcoin: -18.36, sp500: 4.0, gold: 2.07 },
        July: { bitcoin: -11.13, sp500: -4.52, gold: 2.92 },
        August: { bitcoin: -14.22, sp500: 2.86, gold: 3.30 }
    }
};

let investmentChart;

function calculate() {
    const investmentAmount = parseFloat(document.getElementById("investmentAmount").value);
    const startYear = parseInt(document.getElementById("yearSelect").value);
    const startMonth = document.getElementById("monthSelect").value;
    const interestType = document.getElementById("compoundInterest").value;

    if (isNaN(investmentAmount) || investmentAmount <= 0) {
        document.getElementById("result").innerHTML = "Please enter a valid investment amount.";
        return;
    }

    // Reset progress bar animation
    const progressBar = document.getElementById("progressBar");
    progressBar.style.width = "0";
    setTimeout(() => {
        progressBar.style.width = "100%";
    }, 100);

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonthIndex = currentDate.getMonth(); // JavaScript months are 0-indexed

    const monthsOrder = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    const traderShare = 0.35;
    const investorShare = 0.65;

    let totalInvestment = investmentAmount;
    let monthlyBreakdown = [];
    let interestDetail = '';

    for (let year = startYear; year <= currentYear; year++) {
        let monthStartIndex = (year === startYear) ? monthsOrder.indexOf(startMonth) : 0;
        let monthEndIndex = (year === currentYear) ? currentMonthIndex : 11;

        for (let monthIndex = monthStartIndex; monthIndex <= monthEndIndex; monthIndex++) {
            const month = monthsOrder[monthIndex];
            let interestRate = interestData[year]?.[month];

            if (interestRate !== undefined) {
                const netInterestRate = interestRate * investorShare / 100;

                if (interestType === "compound") {
                    totalInvestment *= (1 + netInterestRate);
                } else {
                    totalInvestment += investmentAmount * netInterestRate;
                }

                monthlyBreakdown.push({
                    year,
                    month,
                    totalInvestment: totalInvestment.toFixed(2)
                });
            }
        }
    }

    document.getElementById("result").innerHTML = `
        Total Investment by Current Date: $${totalInvestment.toFixed(2)}<br>
    `;

    // Create or update investment growth chart
    createOrUpdateChart(monthlyBreakdown, investmentAmount);

    // Update comparison table
    updateComparisonTable(investmentAmount, totalInvestment);
}

function createOrUpdateChart(data, initialInvestment) {
    const ctx = document.getElementById('investmentChart').getContext('2d');
    const labels = data.map(entry => `${entry.month} ${entry.year}`);
    const investmentData = data.map(entry => parseFloat(entry.totalInvestment));

    // Data for comparison assets
    let bitcoinData = [initialInvestment];
    let sp500Data = [initialInvestment];
    let goldData = [initialInvestment];
    for (const entry of data) {
        const { year, month } = entry;
        const roi = roiData[year][month];
        if (roi) {
            bitcoinData.push(bitcoinData[bitcoinData.length - 1] * (1 + roi.bitcoin / 100));
            sp500Data.push(sp500Data[sp500Data.length - 1] * (1 + roi.sp500 / 100));
            goldData.push(goldData[goldData.length - 1] * (1 + roi.gold / 100));
        }
    }

    if (investmentChart) {
        investmentChart.destroy();
    }

    investmentChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Our Strategy ($)',
                    data: investmentData,
                    borderColor: '#0bc827',
                    backgroundColor: 'rgba(212, 175, 55, 0.2)',
                    borderWidth: 2,
                    pointRadius: 3,
                },
                {
                    label: 'Bitcoin ($)',
                    data: bitcoinData,
                    borderColor: '#ff5733',
                    borderWidth: 2,
                    pointRadius: 3,
                },
                {
                    label: 'S&P 500 ($)',
                    data: sp500Data,
                    borderColor: '#33c1ff',
                    borderWidth: 2,
                    pointRadius: 3,
                },
                {
                    label: 'Gold ($)',
                    data: goldData,
                    borderColor: '#ffd700',
                    borderWidth: 2,
                    pointRadius: 3,
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    grid: {
                        color: '#444',
                    }
                },
                y: {
                    grid: {
                        color: '#444',
                    }
                }
            }
        }
    });
}

function updateComparisonTable(initialInvestment, finalInvestment) {
    const comparisonTableBody = document.getElementById("comparisonTableBody");
    const fixedDepositRate = 0.03; // 3% annual
    const realEstateRate = 0.05; // 5% annual

    const yearsElapsed = 1.5; // Assuming we are comparing for 1.5 years

    const fixedDepositReturn = initialInvestment * Math.pow((1 + fixedDepositRate), yearsElapsed);
    const realEstateReturn = initialInvestment * Math.pow((1 + realEstateRate), yearsElapsed);
    const bitcoinReturn = bitcoinData[bitcoinData.length - 1];
    const sp500Return = sp500Data[sp500Data.length - 1];
    const goldReturn = goldData[goldData.length - 1];

    comparisonTableBody.innerHTML = `
        <tr>
            <td>Investment in Calculator</td>
            <td>$${finalInvestment.toFixed(2)}</td>
        </tr>
        <tr>
            <td>Bitcoin</td>
            <td>$${bitcoinReturn.toFixed(2)}</td>
        </tr>
        <tr>
            <td>S&P 500</td>
            <td>$${sp500Return.toFixed(2)}</td>
        </tr>
        <tr>
            <td>Gold</td>
            <td>$${goldReturn.toFixed(2)}</td>
        </tr>`;
}


function fetchCryptoPrices() {
    const tickerContent1 = document.getElementById('tickerContent1');
    const tickerContent2 = document.getElementById('tickerContent2');

    // Fetching cryptocurrency data from CoinGecko API
    fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,tether,dogecoin,solana,binancecoin,shiba-inu&vs_currencies=usd')
        .then(response => response.json())
        .then(data => {
            // Prepare cryptocurrency data
            const btcPrice = `Bitcoin (BTC): $${data.bitcoin.usd.toLocaleString()}`;
            const ethPrice = `Ethereum (ETH): $${data.ethereum.usd.toLocaleString()}`;
            const usdtPrice = `Tether (USDT): $${data.tether.usd.toFixed(2)}`;
            const dogePrice = `Dogecoin (DOGE): $${data.dogecoin.usd.toFixed(4)}`;
            const solPrice = `Solana (SOL): $${data.solana.usd.toLocaleString()}`;
            const bnbPrice = `Binance Coin (BNB): $${data.binancecoin.usd.toLocaleString()}`;
            const shibPrice = `Shiba Inu (SHIB): $${(data["shiba-inu"].usd * 1000000).toFixed(2)} per million`;

            // Construct the ticker HTML content
            const tickerHtml = `
                <span class="ticker-item">${btcPrice}</span>
                <span class="ticker-item">${ethPrice}</span>
                <span class="ticker-item">${usdtPrice}</span>
                <span class="ticker-item">${dogePrice}</span>
                <span class="ticker-item">${solPrice}</span>
                <span class="ticker-item">${bnbPrice}</span>
                <span class="ticker-item">${shibPrice}</span>
            `;

            // Update the ticker content
            tickerContent1.innerHTML = tickerHtml;
            tickerContent2.innerHTML = tickerHtml; // Duplicate for seamless scrolling
        })
        .catch(error => {
            console.error('Error fetching crypto prices:', error);
        });
}

// Fetch prices initially and set an interval to refresh every 30 seconds
fetchCryptoPrices();
setInterval(fetchCryptoPrices, 5000);

function login() {
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

function checkAuth() {
    const token = localStorage.getItem('token');
    
    if (!token) {
        // No token found, redirect to login page
        window.location.href = '/login.html';
    }
}

checkAuth(); // Call this on pages that require authentication

// Check if the crypto price ticker exists on the page
if (document.getElementById('tickerContent1')) {
    fetchCryptoPrices();
    setInterval(fetchCryptoPrices, 5000);
}
