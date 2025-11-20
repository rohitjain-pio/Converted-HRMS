import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on('console', msg => console.log('[PAGE]', msg.type(), msg.text()));
  page.on('pageerror', err => console.error('[PAGE ERROR]', err));

  // Try possible dev server ports (5174, 5175, 5173) and pick the first that responds
  const ports = [5174, 5175, 5173, 5176, 5172];
  let base = null;
  for (const p of ports) {
    try {
      // perform a lightweight fetch via Node to check
      const res = await fetch(`http://localhost:${p}`, { method: 'HEAD', redirect: 'manual' , timeout: 2000 }).catch(() => null);
      if (res && (res.status === 200 || res.status === 302 || res.status === 304 || res.status === 0)) {
        base = `http://localhost:${p}`;
        console.log('Detected dev server at', base);
        break;
      }
    } catch (e) {
      // ignore
    }
  }
  if (!base) {
    console.error('Could not detect running dev server on ports', ports);
    await browser.close();
    return;
  }

  // Perform internal login first
  const loginUrl = `${base}/internal-login`;
  console.log('Navigating to login page', loginUrl);
  await page.goto(loginUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(500);

  // Fill credentials (internal login)
  await page.fill('input[type="email"], input[name="email"]', 'rohit.jain@programmers.io');
  await page.fill('input[type="password"], input[name="password"]', 'password');
  // Submit the login form - try clicking primary button
  const loginBtn = page.getByRole('button', { name: /login|sign in|internal login/i }).first();
  try {
    await loginBtn.click();
  } catch (e) {
    // fallback: press Enter
    await page.keyboard.press('Enter');
  }

  // Wait for navigation to finish or dashboard to load
  await page.waitForTimeout(2000);
  // At this point we should be logged in or redirected to dashboard

  const url = 'http://localhost:5174/employees/1';
  console.log('Navigating to', url);
  await page.goto(url, { waitUntil: 'domcontentloaded' });

  // Grab some fields
  const selectors = {
    name: 'h2.employee-name, .employee-basic-info h2',
    employeeCode: 'v-chip:has-text("EMP")',
    email: 'div:has-text("Official Email") + div, .info-field:has-text("Official Email") .value, .info-field:has-text("Email") .value',
    dob: '.info-field:has-text("Date of Birth") .value',
    pan: '.info-field:has-text("PAN Number") .value',
    aadhaar: '.info-field:has-text("Aadhaar Number") .value',
    joining: '.info-field:has-text("Joining Date") .value',
    criminal: '.info-field:has-text("Criminal Verification") .value'
  };

  for (const [k, sel] of Object.entries(selectors)) {
    try {
      const el = await page.locator(sel).first();
      const text = await el.textContent();
      console.log(k, '=>', text && text.trim());
    } catch (err) {
      console.log(k, '=> not found');
    }
  }

  // Print window employee object if present
  try {
    const emp = await page.evaluate(() => window.__EMPLOYEE_DEBUG__ || null);
    console.log('window.__EMPLOYEE_DEBUG__ =>', emp);
  } catch (err) {
    console.log('Could not read window debug object');
  }

  // keep browser open for manual inspection
})();