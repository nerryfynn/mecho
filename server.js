const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files (if any, though everything is embedded)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// In-memory "database" for user portfolios (admin dashboard data)
const userPortfolios = {
  'Becky Stough': { investment: 5000, profit: 500, balance: 5500, status: 'Active' },
  'Michael Chen': { investment: 12400, profit: 1240, balance: 13640, status: 'Active' },
  'Sarah Johnson': { investment: 8200, profit: 820, balance: 9020, status: 'Active' },
  'David Kim': { investment: 22000, profit: 2200, balance: 24200, status: 'Active' }
};

// Admin credentials check endpoint (for login validation)
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'pass123') {
    res.json({ success: true, role: 'admin', message: 'Admin login successful' });
  } else if (username === 'user' && password === 'userpass') {
    res.json({ success: true, role: 'user', message: 'User login successful' });
  } else {
    res.json({ success: false, message: 'Invalid credentials. Use user/userpass or admin/pass123' });
  }
});

// Endpoint to get admin dashboard data (actual portfolio data)
app.get('/api/admin/data', (req, res) => {
  const stats = {
    totalInvestors: 1284,
    totalAUM: 6.42,
    avgROI: 10.2,
    activeSessions: 347,
    tslaData: [245, 258, 272, 268, 290, 305, 327],
    allocation: [78, 15, 7],
    portfolios: userPortfolios
  };
  res.json(stats);
});

// Endpoint to get user dashboard data
app.get('/api/user/data', (req, res) => {
  res.json({
    userName: 'Becky Stough',
    investment: 5000,
    profit: 500,
    balance: 5500,
    roi: 10.00,
    shares: 15.3,
    avgPrice: 359,
    activityLog: [
      { action: 'Initial deposit + TSLA purchase', amount: '+$5,000.00', time: 'Today' },
      { action: 'Market appreciation (TSLA +10%)', amount: '+$500.00', time: 'Unrealized gain' },
      { action: 'Current TSLA shares', amount: '$5,500', shares: '~15.3 shares @ $359 avg' }
    ]
  });
});

// The main route serving the HTML with embedded UI (exact same as original)
app.get('/', (req, res) => {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=yes, viewport-fit=cover">
  <title>Tesla Investment</title>
  <!-- Google Fonts + Font Awesome 6 -->
  <link href="https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,400;14..32,500;14..32,600;14..32,700;14..32,800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
  <!-- Chart.js for admin dashboard -->
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      background: #f0f2f8;
      font-family: 'Inter', sans-serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .hero-header {
      text-align: center;
      padding: 2rem 1rem 1.5rem 1rem;
      background: #f0f2f8;
    }

    .floating-title {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 14px;
      background: white;
      padding: 0.7rem 1.8rem;
      border-radius: 100px;
      box-shadow: 0 12px 28px -10px rgba(0, 0, 0, 0.12), 0 2px 4px rgba(0,0,0,0.02);
      border: 1px solid #e9edf4;
    }

    .floating-title i {
      font-size: 1.8rem;
      color: #e82127;
    }

    .floating-title h1 {
      font-size: 1.7rem;
      font-weight: 800;
      color: #0a2a3b;
      letter-spacing: -0.5px;
    }

    .sticky-nav {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      background: #f0f2f8;
      z-index: 1000;
      transform: translateY(-100%);
      transition: transform 0.3s cubic-bezier(0.2, 0.9, 0.4, 1.1);
      padding: 0.7rem 1rem;
    }

    .sticky-nav.visible {
      transform: translateY(0);
      box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
    }

    .sticky-inner {
      max-width: 860px;
      margin: 0 auto;
      display: flex;
      justify-content: center;
    }

    .sticky-title {
      display: inline-flex;
      align-items: center;
      gap: 12px;
      background: white;
      padding: 0.4rem 1.5rem;
      border-radius: 60px;
      border: 1px solid #e2e8f0;
    }

    .sticky-title i {
      font-size: 1.3rem;
      color: #e82127;
    }

    .sticky-title span {
      font-size: 1.2rem;
      font-weight: 700;
      color: #0a2a3b;
    }

    .main-container {
      max-width: 860px;
      margin: 0 auto;
      padding: 0 1rem 1rem 1rem;
      flex: 1;
    }

    .user-card {
      background: white;
      border-radius: 32px;
      padding: 1.2rem 1.5rem;
      margin: 1rem 0 1.5rem 0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 1rem;
      box-shadow: 0 8px 20px -8px rgba(0, 0, 0, 0.04);
      border: 1px solid #eef2f8;
    }

    .user-avatar {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .avatar-icon {
      background: #1e3a4d;
      width: 48px;
      height: 48px;
      border-radius: 50px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 1.2rem;
      font-weight: 600;
    }

    .user-text h3 {
      font-size: 1.3rem;
      font-weight: 700;
      color: #0f2f40;
    }

    .user-text p {
      color: #5f7d98;
      font-size: 0.7rem;
      display: flex;
      align-items: center;
      gap: 5px;
      margin-top: 4px;
    }

    .date-badge {
      background: #eef3fc;
      padding: 6px 14px;
      border-radius: 40px;
      font-size: 0.7rem;
      font-weight: 500;
      color: #1c6488;
      font-family: monospace;
    }

    .stats-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
      gap: 1rem;
      margin-bottom: 1.8rem;
    }

    .stat-card {
      background: white;
      border-radius: 28px;
      padding: 1.2rem;
      border: 1px solid #edf2f7;
      box-shadow: 0 6px 12px -6px rgba(0,0,0,0.03);
    }

    .stat-title {
      font-size: 0.65rem;
      text-transform: uppercase;
      font-weight: 700;
      letter-spacing: 1px;
      color: #5982a0;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .stat-number {
      font-size: 2.1rem;
      font-weight: 800;
      color: #102b39;
      line-height: 1.1;
    }

    .stat-footer {
      font-size: 0.65rem;
      color: #6c8faa;
      margin-top: 10px;
    }

    .profit-chip {
      background: #e6f7ed;
      color: #1e9b4a;
      padding: 2px 8px;
      border-radius: 40px;
      font-weight: 700;
      font-size: 0.65rem;
      display: inline-block;
    }

    .tesla-detail {
      background: white;
      border-radius: 32px;
      padding: 1.4rem 1.5rem;
      margin-bottom: 1.5rem;
      border: 1px solid #ecf3f9;
    }

    .section-head {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 1.2rem;
      border-left: 4px solid #e82127;
      padding-left: 1rem;
    }

    .section-head i {
      font-size: 1.4rem;
      color: #e82127;
    }

    .section-head h3 {
      font-size: 1.2rem;
      font-weight: 700;
      color: #1c4c6e;
    }

    .today-add-banner {
      background: #fef9e6;
      border-left: 3px solid #f5b042;
      padding: 0.6rem 0.8rem;
      border-radius: 18px;
      font-size: 0.8rem;
      margin-bottom: 1.2rem;
    }

    .details-list {
      display: flex;
      flex-direction: column;
      gap: 0.7rem;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      padding: 0.65rem 0;
      border-bottom: 1px solid #f0f4fa;
    }

    .detail-label {
      font-weight: 500;
      color: #617e99;
      font-size: 0.85rem;
    }

    .detail-value {
      font-weight: 700;
      color: #1f425b;
      font-size: 0.9rem;
    }

    .green-txt {
      color: #1a9b4a;
      font-weight: 800;
    }

    .activity-log {
      background: white;
      border-radius: 28px;
      padding: 1.2rem;
      border: 1px solid #ecf3f9;
    }

    .activity-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      margin-bottom: 1rem;
    }

    .activity-header span {
      font-weight: 600;
      font-size: 0.85rem;
    }

    .refresh-btn {
      background: transparent;
      border: 1px solid #cbdce9;
      padding: 5px 14px;
      border-radius: 30px;
      font-family: 'Inter', sans-serif;
      font-size: 0.7rem;
      font-weight: 600;
      cursor: pointer;
      color: #2b6a8f;
    }

    .refresh-btn:hover {
      background: #e82127;
      border-color: #e82127;
      color: white;
    }

    .activity-item {
      display: flex;
      justify-content: space-between;
      padding: 0.7rem 0;
      border-bottom: 1px solid #f0f4fa;
    }
    .activity-item:last-child {
      border-bottom: none;
    }

    .site-footer {
      background: white;
      border-top: 1px solid #e4ecf3;
      padding: 1rem 1rem;
      position: sticky;
      bottom: 0;
      width: 100%;
      z-index: 999;
      box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.03);
      margin-top: 1.5rem;
    }

    .footer-content {
      max-width: 860px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
    }

    .footer-links {
      display: flex;
      gap: 24px;
    }

    .footer-link {
      background: none;
      border: none;
      font-size: 0.75rem;
      font-weight: 500;
      color: #5f8bb0;
      cursor: pointer;
      font-family: 'Inter', sans-serif;
      transition: color 0.2s;
    }

    .footer-link:hover {
      color: #e82127;
    }

    .copyright {
      font-size: 0.7rem;
      color: #8aa9c2;
    }

    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(4px);
      z-index: 2000;
      display: flex;
      align-items: center;
      justify-content: center;
      visibility: hidden;
      opacity: 0;
      transition: visibility 0.2s, opacity 0.2s;
    }

    .modal-overlay.active {
      visibility: visible;
      opacity: 1;
    }

    .modal-container {
      background: white;
      border-radius: 32px;
      max-width: 480px;
      width: 90%;
      padding: 1.8rem;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      transform: scale(0.95);
      transition: transform 0.2s;
    }

    .modal-overlay.active .modal-container {
      transform: scale(1);
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.2rem;
      padding-bottom: 0.8rem;
      border-bottom: 2px solid #eef2f8;
    }

    .modal-header h3 {
      font-size: 1.3rem;
      font-weight: 700;
      color: #0f2f40;
    }

    .close-modal {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: #8aaec9;
    }

    .close-modal:hover {
      color: #e82127;
    }

    .faq-item {
      margin-bottom: 1rem;
      padding-bottom: 0.8rem;
      border-bottom: 1px solid #f0f4fa;
    }

    .faq-question {
      font-weight: 700;
      font-size: 0.9rem;
      color: #1c4c6e;
      margin-bottom: 6px;
    }

    .faq-answer {
      font-size: 0.8rem;
      color: #617e99;
      line-height: 1.4;
    }

    .customer-care-info {
      text-align: center;
    }

    .care-option {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 0.8rem 0;
      border-bottom: 1px solid #eef2f8;
    }

    .care-option i {
      width: 32px;
      color: #e82127;
      font-size: 1.2rem;
    }

    .care-option span {
      font-size: 0.9rem;
      color: #2c5777;
    }

    @media (max-width: 560px) {
      .floating-title h1 {
        font-size: 1.3rem;
      }
      .floating-title i {
        font-size: 1.4rem;
      }
      .stat-number {
        font-size: 1.5rem;
      }
      .user-text h3 {
        font-size: 1.1rem;
      }
      .footer-content {
        flex-direction: column;
        text-align: center;
      }
    }

    .login-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.85);
      backdrop-filter: blur(10px);
      z-index: 5000;
      display: flex;
      align-items: center;
      justify-content: center;
      visibility: visible;
      opacity: 1;
      transition: 0.2s;
    }
    .login-overlay.hidden {
      visibility: hidden;
      opacity: 0;
      pointer-events: none;
    }
    .login-card {
      background: white;
      border-radius: 48px;
      padding: 2rem;
      width: 90%;
      max-width: 400px;
      text-align: center;
    }
    .login-card h2 {
      margin: 1rem 0 0.5rem;
      color: #0a2a3b;
    }
    .login-card input {
      width: 100%;
      padding: 14px 18px;
      margin: 12px 0;
      border: 2px solid #e2e8f0;
      border-radius: 60px;
      font-family: 'Inter', sans-serif;
      font-size: 1rem;
    }
    .login-card input:focus {
      border-color: #e82127;
      outline: none;
    }
    .login-card button {
      background: #e82127;
      color: white;
      border: none;
      padding: 14px;
      width: 100%;
      border-radius: 60px;
      font-weight: 700;
      font-size: 1rem;
      cursor: pointer;
      margin-top: 8px;
    }
    .login-error {
      color: #e82127;
      font-size: 0.75rem;
      margin-top: 8px;
    }
    .login-note {
      margin-top: 16px;
      font-size: 0.7rem;
      color: #8aa9c2;
    }

    .admin-dashboard {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: #0a111a;
      z-index: 4000;
      overflow-y: auto;
      font-family: 'Inter', sans-serif;
    }
    .admin-dashboard.active {
      display: block;
    }
    .client-view.hide-client {
      display: none;
    }
    .admin-wrapper {
      max-width: 1400px;
      margin: 0 auto;
      padding: 1.5rem;
    }
    .admin-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      background: rgba(255,255,255,0.03);
      backdrop-filter: blur(10px);
      padding: 1rem 2rem;
      border-radius: 40px;
      margin-bottom: 2rem;
      border: 1px solid rgba(255,255,255,0.1);
    }
    .admin-header h2 {
      color: white;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .logout-btn {
      background: #e82127;
      border: none;
      padding: 10px 28px;
      border-radius: 40px;
      color: white;
      font-weight: 600;
      cursor: pointer;
    }
    .dashboard-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }
    .admin-stat-card {
      background: #111c2a;
      border-radius: 28px;
      padding: 1.5rem;
      border: 1px solid #1e2f3f;
    }
    .admin-stat-card h4 {
      color: #8aaec9;
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 0.8rem;
    }
    .admin-stat-card .value {
      font-size: 2.2rem;
      font-weight: 800;
      color: white;
    }
    .chart-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 1.8rem;
      margin-bottom: 2rem;
    }
    .chart-card {
      background: #111c2a;
      border-radius: 28px;
      padding: 1.2rem;
      border: 1px solid #1e2f3f;
    }
    .chart-card h3 {
      color: white;
      font-size: 1.1rem;
      margin-bottom: 1rem;
    }
    canvas { max-height: 280px; width: 100%; }
    .user-table {
      background: #111c2a;
      border-radius: 28px;
      padding: 1.2rem;
      overflow-x: auto;
    }
    .user-table h3 {
      color: white;
      margin-bottom: 1rem;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      color: #ddd;
    }
    th, td {
      text-align: left;
      padding: 12px 8px;
      border-bottom: 1px solid #1e2f3f;
    }
    th { color: #8aaec9; font-weight: 600; }
    .badge-active {
      background: #1e9b4a;
      padding: 4px 10px;
      border-radius: 40px;
      font-size: 0.7rem;
      font-weight: 600;
    }
    @media (max-width: 760px) {
      .chart-grid { grid-template-columns: 1fr; }
      .admin-header { flex-direction: column; gap: 1rem; }
    }
  </style>
</head>
<body>

<div id="loginOverlay" class="login-overlay">
  <div class="login-card">
    <i class="fab fa-tesla" style="font-size: 3rem; color:#e82127;"></i>
    <h2>Tesla Investment</h2>
    <p style="color:#5f7d98; margin-bottom: 1rem;">Sign in to your account</p>
    <input type="text" id="loginUsername" placeholder="Username">
    <input type="password" id="loginPassword" placeholder="Password">
    <button id="loginBtn">Login</button>
    <div id="loginErrorMessage" class="login-error"></div>
    <div class="login-note">
      <i class="fas fa-info-circle"></i> User: user / userpass &nbsp;|&nbsp; Admin: admin / pass123
    </div>
  </div>
</div>

<div id="clientView" class="client-view hide-client">
  <div class="hero-header">
    <div class="floating-title">
      <i class="fab fa-tesla"></i>
      <h1>Tesla Investment</h1>
    </div>
  </div>

  <div class="sticky-nav" id="stickyHeaderBar">
    <div class="sticky-inner">
      <div class="sticky-title">
        <i class="fab fa-tesla"></i>
        <span>Tesla Investment</span>
      </div>
    </div>
  </div>

  <div class="main-container">
    <div class="user-card">
      <div class="user-avatar">
        <div class="avatar-icon">BS</div>
        <div class="user-text">
          <h3 id="userName">Becky Stough</h3>
          <p><i class="fas fa-check-circle" style="color:#1e9b4a;"></i> Verified account · Active investor</p>
        </div>
      </div>
      <div class="date-badge" id="realTimeClock">
        <i class="far fa-calendar-alt"></i> <span id="clockDisplay">--</span>
      </div>
    </div>

    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-title"><i class="fas fa-coins"></i> TOTAL INVESTMENT</div>
        <div class="stat-number" id="totalInvestment">$5,000</div>
        <div class="stat-footer">Initial deposit (cost basis)</div>
      </div>
      <div class="stat-card">
        <div class="stat-title"><i class="fas fa-chart-line"></i> TOTAL PROFIT</div>
        <div class="stat-number" id="totalProfit">$500</div>
        <div class="stat-footer"><span class="profit-chip"><i class="fas fa-arrow-up"></i> <span id="roiPercent">+10.00%</span> ROI</span> unrealized gain</div>
      </div>
      <div class="stat-card">
        <div class="stat-title"><i class="fas fa-wallet"></i> CURRENT BALANCE</div>
        <div class="stat-number" id="currentBalance">$5,500</div>
        <div class="stat-footer">Investment value + profit</div>
      </div>
    </div>

    <div class="tesla-detail">
      <div class="section-head">
        <i class="fab fa-tesla"></i>
        <h3>Tesla position · details</h3>
      </div>
      <div class="today-add-banner">
        <i class="fas fa-plus-circle" style="color:#e68a2e;"></i> <strong>Portfolio:</strong> Initial deposit $5,000 · Current profit $500
      </div>
      <div class="details-list">
        <div class="detail-row"><span class="detail-label"><i class="fas fa-chart-simple"></i> Total investment (cost basis)</span><span class="detail-value" id="detailInvestment"><strong>$5,000.00</strong></span></div>
        <div class="detail-row"><span class="detail-label"><i class="fas fa-chart-line"></i> Current market value (TSLA)</span><span class="detail-value green-txt" id="detailValue">$5,500.00</span></div>
        <div class="detail-row"><span class="detail-label"><i class="fas fa-chart-line"></i> Total unrealized profit</span><span class="detail-value green-txt" id="detailProfit">+$500.00</span></div>
        <div class="detail-row"><span class="detail-label"><i class="fas fa-percent"></i> Return on investment (ROI)</span><span class="detail-value green-txt" id="detailROI">+10.00%</span></div>
      </div>
    </div>

    <div class="activity-log">
      <div class="activity-header">
        <span><i class="fas fa-history"></i> Recent activity</span>
        <button class="refresh-btn" id="refreshBtn"><i class="fas fa-sync-alt"></i> Refresh</button>
      </div>
      <div id="activityItems"></div>
      <div id="liveTimestamp" style="font-size: 0.6rem; text-align: right; margin-top: 12px; color:#7c9bb5;">
        <i class="far fa-clock"></i> Last update: just now
      </div>
    </div>
  </div>

  <footer class="site-footer">
    <div class="footer-content">
      <div class="footer-links">
        <button class="footer-link" id="faqBtn">FAQs</button>
        <button class="footer-link" id="careBtn">Customer Care</button>
      </div>
      <div class="copyright">© 2026 · Tesla Investment</div>
    </div>
  </footer>
</div>

<div id="adminDashboard" class="admin-dashboard">
  <div class="admin-wrapper">
    <div class="admin-header">
      <h2><i class="fab fa-tesla" style="color:#e82127;"></i> Tesla Investment · Admin Console</h2>
      <button class="logout-btn" id="logoutAdminBtn"><i class="fas fa-sign-out-alt"></i> Exit Admin</button>
    </div>
    <div class="dashboard-stats" id="adminStats">
      <div class="admin-stat-card"><h4><i class="fas fa-users"></i> Total Investors</h4><div class="value" id="totalInvestors">--</div></div>
      <div class="admin-stat-card"><h4><i class="fas fa-chart-line"></i> Total AUM</h4><div class="value" id="totalAUM">--</div></div>
      <div class="admin-stat-card"><h4><i class="fas fa-arrow-trend-up"></i> Avg ROI (TSLA)</h4><div class="value" id="avgROI">--</div></div>
      <div class="admin-stat-card"><h4><i class="fas fa-clock"></i> Active Sessions</h4><div class="value" id="activeSessions">--</div></div>
    </div>
    <div class="chart-grid">
      <div class="chart-card"><h3><i class="fas fa-chart-line"></i> TSLA Performance (30d)</h3><canvas id="tslaChart"></canvas></div>
      <div class="chart-card"><h3><i class="fas fa-pie-chart"></i> Asset Allocation</h3><canvas id="allocationChart"></canvas></div>
    </div>
    <div class="user-table">
      <h3><i class="fas fa-list-ul"></i> User Portfolio Data</h3>
      <table id="adminUserTable">
        <thead><tr><th>Investor</th><th>Investment</th><th>Profit</th><th>Balance</th><th>Status</th></tr></thead>
        <tbody id="adminTableBody"></tbody>
      </table>
    </div>
  </div>
</div>

<div id="faqModal" class="modal-overlay">
  <div class="modal-container">
    <div class="modal-header">
      <h3><i class="fas fa-question-circle" style="color:#e82127;"></i> Frequently Asked Questions</h3>
      <button class="close-modal" data-modal="faqModal">×</button>
    </div>
    <div class="faq-item">
      <div class="faq-question">How do I add funds to my Tesla Investment account?</div>
      <div class="faq-answer">You can add funds directly from your dashboard using the "Add funds" button. Bank transfer and card options are available.</div>
    </div>
    <div class="faq-item">
      <div class="faq-question">Is my investment protected?</div>
      <div class="faq-answer">Yes, all investments are securely held and insured up to applicable limits. Your assets are segregated from operational funds.</div>
    </div>
    <div class="faq-item">
      <div class="faq-question">How are profits calculated?</div>
      <div class="faq-answer">Profits reflect real-time TSLA market performance. Your ROI is updated instantly based on current share price.</div>
    </div>
    <div class="faq-item">
      <div class="faq-question">Can I withdraw my funds anytime?</div>
      <div class="faq-answer">Yes, you can request a withdrawal at any time. Settlements typically take 1-3 business days.</div>
    </div>
  </div>
</div>

<div id="careModal" class="modal-overlay">
  <div class="modal-container">
    <div class="modal-header">
      <h3><i class="fas fa-headset" style="color:#e82127;"></i> Customer Care</h3>
      <button class="close-modal" data-modal="careModal">×</button>
    </div>
    <div class="customer-care-info">
      <div class="care-option"><i class="fas fa-envelope"></i><span>support@teslainvestment.com</span></div>
      <div class="care-option"><i class="fas fa-phone-alt"></i><span>+1 (888) 555-0123</span></div>
      <div class="care-option"><i class="fas fa-comment-dots"></i><span>Live chat: 9AM - 6PM EST</span></div>
      <div class="care-option"><i class="fas fa-clock"></i><span>24/7 support</span></div>
    </div>
  </div>
</div>

<script>
  // REAL TIME CLOCK
  function updateRealTimeClock() {
    const now = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true };
    const clockSpan = document.getElementById('clockDisplay');
    if (clockSpan) clockSpan.textContent = now.toLocaleString('en-US', options);
  }
  updateRealTimeClock();
  setInterval(updateRealTimeClock, 1000);

  // Sticky header
  const stickyBar = document.getElementById('stickyHeaderBar');
  const floatingHeader = document.querySelector('.hero-header');
  function updateSticky() {
    if (!floatingHeader) return;
    const rect = floatingHeader.getBoundingClientRect();
    if (rect.bottom <= 0) stickyBar.classList.add('visible');
    else stickyBar.classList.remove('visible');
  }
  window.addEventListener('scroll', updateSticky);
  window.addEventListener('resize', updateSticky);

  // Modal functions
  function openModal(modalId) { document.getElementById(modalId)?.classList.add('active'); }
  function closeModal(modalId) { document.getElementById(modalId)?.classList.remove('active'); }
  document.getElementById('faqBtn')?.addEventListener('click', () => openModal('faqModal'));
  document.getElementById('careBtn')?.addEventListener('click', () => openModal('careModal'));
  document.querySelectorAll('.close-modal').forEach(btn => {
    btn.addEventListener('click', (e) => { closeModal(btn.getAttribute('data-modal')); });
  });
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.classList.remove('active'); });
  });

  let tslaChart, allocationChart;
  
  async function loadAdminData() {
    try {
      const res = await fetch('/api/admin/data');
      const data = await res.json();
      document.getElementById('totalInvestors').innerText = data.totalInvestors.toLocaleString();
      document.getElementById('totalAUM').innerText = '$' + data.totalAUM + 'M';
      document.getElementById('avgROI').innerText = '+' + data.avgROI + '%';
      document.getElementById('activeSessions').innerText = data.activeSessions.toLocaleString();
      
      const tbody = document.getElementById('adminTableBody');
      tbody.innerHTML = '';
      for (const [name, portfolio] of Object.entries(data.portfolios)) {
        tbody.innerHTML += `<tr><td>${name}</td><td>$${portfolio.investment.toLocaleString()}</td><td class="green-txt">+$${portfolio.profit.toLocaleString()}</td><td>$${portfolio.balance.toLocaleString()}</td><td><span class="badge-active">${portfolio.status}</span></td></tr>`;
      }
      
      const tslaCtx = document.getElementById('tslaChart')?.getContext('2d');
      const allocCtx = document.getElementById('allocationChart')?.getContext('2d');
      if (tslaCtx) {
        if (tslaChart) tslaChart.destroy();
        tslaChart = new Chart(tslaCtx, {
          type: 'line',
          data: { labels: ['Apr 1','Apr 5','Apr 10','Apr 15','Apr 20','Apr 25','Today'], datasets: [{ label: 'TSLA Price ($)', data: data.tslaData, borderColor: '#e82127', backgroundColor: 'rgba(232,33,39,0.05)', tension: 0.3, fill: true }] },
          options: { responsive: true, maintainAspectRatio: true, plugins: { legend: { labels: { color: '#ccc' } } }, scales: { y: { grid: { color: '#1e2f3f' }, ticks: { color: '#aaa' } }, x: { ticks: { color: '#aaa' } } } }
        });
      }
      if (allocCtx) {
        if (allocationChart) allocationChart.destroy();
        allocationChart = new Chart(allocCtx, {
          type: 'doughnut',
          data: { labels: ['Tesla Inc', 'Cash Reserve', 'Energy Bonds'], datasets: [{ data: data.allocation, backgroundColor: ['#e82127', '#2c6e9e', '#f5b042'], borderWidth: 0 }] },
          options: { responsive: true, plugins: { legend: { position: 'bottom', labels: { color: '#ccc' } } } }
        });
      }
    } catch(e) { console.error(e); }
  }
  
  async function loadUserData() {
    try {
      const res = await fetch('/api/user/data');
      const data = await res.json();
      document.getElementById('userName').innerText = data.userName;
      document.getElementById('totalInvestment').innerText = '$' + data.investment.toLocaleString();
      document.getElementById('totalProfit').innerText = '$' + data.profit.toLocaleString();
      document.getElementById('currentBalance').innerText = '$' + data.balance.toLocaleString();
      document.getElementById('roiPercent').innerText = '+' + data.roi.toFixed(2) + '%';
      document.getElementById('detailInvestment').innerHTML = '<strong>$' + data.investment.toFixed(2) + '</strong>';
      document.getElementById('detailValue').innerText = '$' + data.balance.toFixed(2);
      document.getElementById('detailProfit').innerText = '+$' + data.profit.toFixed(2);
      document.getElementById('detailROI').innerText = '+' + data.roi.toFixed(2) + '%';
      
      const activityDiv = document.getElementById('activityItems');
      activityDiv.innerHTML = '';
      data.activityLog.forEach(item => {
        if (item.shares) {
          activityDiv.innerHTML += \`<div class="activity-item"><div><i class="fas fa-charging-station"></i> <strong>\${item.action}</strong><br><span style="font-size: 0.65rem; color:#6b8dab;">\${item.shares}</span></div><div><strong>\${item.amount}</strong></div></div>\`;
        } else {
          activityDiv.innerHTML += \`<div class="activity-item"><div><i class="fas fa-plus-circle" style="color:#1e9b4a;"></i> <strong>\${item.action}</strong><br><span style="font-size: 0.65rem; color:#6b8dab;">\${item.time}</span></div><div class="green-txt">\${item.amount}</div></div>\`;
        }
      });
    } catch(e) { console.error(e); }
  }
  
  // Refresh button
  const refreshBtn = document.getElementById('refreshBtn');
  const timestampDiv = document.getElementById('liveTimestamp');
  function updateTimestamp() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute:'2-digit', second:'2-digit' });
    if (timestampDiv) timestampDiv.innerHTML = `<i class="far fa-clock"></i> Last update: ${timeStr}`;
    loadUserData();
    document.querySelectorAll('.stat-card, .tesla-detail').forEach(card => {
      card.style.backgroundColor = '#fffffffa';
      setTimeout(() => { if(card.style) card.style.backgroundColor = ''; }, 150);
    });
  }
  refreshBtn?.addEventListener('click', updateTimestamp);
  setInterval(() => {
    const now = new Date();
    if (timestampDiv && !document.querySelector('.admin-dashboard.active')) {
      timestampDiv.innerHTML = `<i class="far fa-clock"></i> Last update: ${now.toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit', second:'2-digit' })}`;
    }
  }, 60000);
  
  // LOGIN LOGIC
  const loginOverlay = document.getElementById('loginOverlay');
  const clientViewDiv = document.getElementById('clientView');
  const adminDashboardDiv = document.getElementById('adminDashboard');
  const loginBtn = document.getElementById('loginBtn');
  const loginErrorSpan = document.getElementById('loginErrorMessage');
  
  async function showClientDashboard() {
    clientViewDiv.classList.remove('hide-client');
    adminDashboardDiv.classList.remove('active');
    loginOverlay.classList.add('hidden');
    document.body.style.background = "#f0f2f8";
    updateSticky();
    await loadUserData();
    updateTimestamp();
  }
  
  async function showAdminDashboard() {
    clientViewDiv.classList.add('hide-client');
    adminDashboardDiv.classList.add('active');
    loginOverlay.classList.add('hidden');
    document.body.style.background = "#0a111a";
    await loadAdminData();
  }
  
  loginBtn.addEventListener('click', async () => {
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    
    if (data.success) {
      loginErrorSpan.innerText = '';
      if (data.role === 'admin') {
        await showAdminDashboard();
      } else {
        await showClientDashboard();
      }
    } else {
      loginErrorSpan.innerText = data.message;
    }
  });
  
  document.getElementById('loginPassword')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') loginBtn.click();
  });
  
  document.getElementById('logoutAdminBtn')?.addEventListener('click', () => {
    loginOverlay.classList.remove('hidden');
    clientViewDiv.classList.add('hide-client');
    adminDashboardDiv.classList.remove('active');
    document.getElementById('loginUsername').value = '';
    document.getElementById('loginPassword').value = '';
    loginErrorSpan.innerText = '';
  });
  
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'A') {
      e.preventDefault();
      loginOverlay.classList.remove('hidden');
      clientViewDiv.classList.add('hide-client');
      adminDashboardDiv.classList.remove('active');
      document.getElementById('loginUsername').value = '';
      document.getElementById('loginPassword').value = '';
    }
  });
</script>
</body>
</html>`;
  res.send(html);
});

app.listen(PORT, () => {
  console.log(`🚀 Tesla Investment server running on http://localhost:${PORT}`);
  console.log(`   User login: user / userpass`);
  console.log(`   Admin login: admin / pass123`);
  console.log(`   Hidden hotkey: Ctrl+Shift+A to return to login screen`);
});
