const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const USER_DATA_DIR = path.join(__dirname, '..', '.chrome-admin-test');
const SCREENSHOTS_DIR = path.join(__dirname, '..', 'admin-verification-screenshots');

if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getJson(url) {
  return new Promise((resolve, reject) => {
    http
      .get(url, res => {
        let data = '';
        res.on('data', c => (data += c));
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(e);
          }
        });
      })
      .on('error', reject);
  });
}

async function waitFor(fn, timeoutMs = 20000, stepMs = 500) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const val = await fn();
      if (val) return val;
    } catch {}
    await sleep(stepMs);
  }
  throw new Error(`Timeout waiting for condition after ${timeoutMs}ms`);
}

class CdpClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.ws = null;
    this.id = 0;
    this.pending = new Map();
  }

  async connect() {
    this.ws = new WebSocket(this.wsUrl);
    await new Promise((resolve, reject) => {
      this.ws.onopen = resolve;
      this.ws.onerror = reject;
    });

    this.ws.onmessage = event => {
      const msg = JSON.parse(event.data);
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        if (msg.error) {
          reject(new Error(msg.error.message || JSON.stringify(msg.error)));
        } else {
          resolve(msg.result);
        }
      }
    };
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = ++this.id;
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async evaluate(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      awaitPromise: true,
      returnByValue: true,
    });
    if (res.exceptionDetails) {
      throw new Error(JSON.stringify(res.exceptionDetails));
    }
    return res.result?.value;
  }

  async captureScreenshot(filename) {
    const res = await this.send('Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(res.data, 'base64');
    const fullPath = path.join(SCREENSHOTS_DIR, filename);
    fs.writeFileSync(fullPath, buffer);
    console.log(`📸 Screenshot saved: ${filename}`);
  }

  close() {
    if (this.ws) {
      this.ws.close();
    }
  }
}

async function run() {
  console.log('🚀 Starting Chrome in headless mode with remote debugging...');
  const chromeProc = spawn(CHROME_PATH, [
    '--headless=new',
    '--remote-debugging-port=9222',
    `--user-data-dir=${USER_DATA_DIR}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--window-size=1400,900',
  ]);

  let cdp;
  try {
    // Wait for Chrome debugging endpoint
    let targets = null;
    for (let i = 0; i < 20; i++) {
      await sleep(500);
      try {
        targets = await getJson('http://localhost:9222/json/list');
        if (targets && targets.length > 0) break;
      } catch {}
    }

    if (!targets || targets.length === 0) {
      throw new Error('Failed to connect to Chrome debugging endpoint');
    }

    const pageTarget = targets.find(t => t.type === 'page') || targets[0];
    console.log('✅ Connected to target page:', pageTarget.url);

    cdp = new CdpClient(pageTarget.webSocketDebuggerUrl);
    await cdp.connect();
    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');
    await cdp.send('DOM.enable');

    // 1. Navigate to /admin
    console.log('\n--- Step 1: Navigate to http://localhost:3000/admin ---');
    await cdp.send('Page.navigate', { url: 'http://localhost:3000/admin' });
    await sleep(2500);
    await cdp.captureScreenshot('01-login-screen.png');

    // 2. Perform Login via UI inputs
    console.log('\n--- Step 2: Logging in via UI Form ---');
    await waitFor(async () => {
      const hasInput = await cdp.evaluate(`Boolean(document.querySelector('#admin-pwd'))`);
      return hasInput;
    }, 10000);

    await cdp.evaluate(`(() => {
      const pwd = document.querySelector('#admin-pwd');
      const proto = window.HTMLInputElement.prototype;
      const setter = Object.getOwnPropertyDescriptor(proto, 'value').set;
      setter.call(pwd, 'gholipour1405');
      pwd.dispatchEvent(new Event('input', { bubbles: true }));
      pwd.dispatchEvent(new Event('change', { bubbles: true }));
    })()`);

    // Give React time to update password state before submitting
    await sleep(500);

    await cdp.evaluate(`(() => {
      const btn = document.querySelector('button[type="submit"]');
      if (btn) btn.click();
    })()`);

    // 3. Verify Articles Table Loaded
    console.log('\n--- Step 3: Checking Articles Table in Admin UI ---');
    await waitFor(async () => {
      const count = await cdp.evaluate(`(() => {
        const rows = Array.from(document.querySelectorAll('.admin-table tbody tr'));
        const isEmpty = document.body.innerText.includes('مقاله‌ای مطابق با جستجوی شما یافت نشد');
        return !isEmpty && rows.length > 0 ? rows.length : 0;
      })()`);
      return count > 0;
    }, 20000);

    await sleep(1000);
    await cdp.captureScreenshot('02-dashboard-table.png');

    const tableInfo = await cdp.evaluate(`(() => {
      const rows = Array.from(document.querySelectorAll('.admin-table tbody tr'));
      return {
        rowCount: rows.length,
        firstTitle: rows[0]?.querySelector('td:nth-child(2)')?.innerText?.trim(),
      };
    })()`);
    console.log('Admin Table Rows:', tableInfo.rowCount);
    console.log('First article in table:', tableInfo.firstTitle);

    // 4. Find the base article (primary-baby-teeth-guide) and click "📋 کپی/شبیه‌سازی"
    console.log('\n--- Step 4: Clicking Duplicate (📋 کپی/شبیه‌سازی) in Table ---');
    const duplicateResult = await cdp.evaluate(`(() => {
      const rows = Array.from(document.querySelectorAll('.admin-table tbody tr'));
      let targetRow = rows.find(r => r.innerText.includes('primary-baby-teeth-guide') || r.innerText.includes('دندان‌های شیری'));
      if (!targetRow && rows.length > 0) targetRow = rows[0];
      if (targetRow) {
        const dupBtn = Array.from(targetRow.querySelectorAll('button')).find(b => b.innerText.includes('کپی') || b.innerText.includes('شبیه‌سازی'));
        if (dupBtn) {
          dupBtn.click();
          return true;
        }
      }
      return false;
    })()`);
    console.log('Duplicate button clicked:', duplicateResult);
    if (!duplicateResult) {
      throw new Error('Failed to find or click duplicate button in admin table');
    }

    // 5. Verify Split Screen and Live Preview side panel
    console.log('\n--- Step 5: Verifying Split Screen & Live Preview ---');
    await waitFor(async () => {
      const hasPreview = await cdp.evaluate(
        `Boolean(document.querySelector('.admin-preview-wrapper'))`
      );
      return hasPreview;
    }, 10000);

    await sleep(1000);
    await cdp.captureScreenshot('03-editor-split-view-initial.png');

    const editorState = await cdp.evaluate(`(() => {
      const previewWrapper = document.querySelector('.admin-preview-wrapper');
      const previewTitle = previewWrapper?.querySelector('h1')?.innerText?.trim();
      const previewSections = previewWrapper?.querySelectorAll('section')?.length || 0;
      const previewFaqs = previewWrapper?.querySelectorAll('#faq-section-preview > div > div')?.length || 0;
      return {
        hasPreview: Boolean(previewWrapper),
        previewTitle,
        previewSections,
        previewFaqs,
      };
    })()`);
    console.log('Editor State:', editorState);

    // 6. Change Title and URL in the Admin Panel Form
    console.log('\n--- Step 6: Modifying Title & Slug in Admin Inputs ---');
    const newTitle = 'راهنمای مراقبت و حفظ دندان‌های شیری کودکان؛ عصب‌کشی، روکش و پیشگیری';
    const newSeoTitle = 'راهنمای مراقبت از دندان شیری کودکان';
    const newSlug = 'pediatric-baby-teeth-care-guide';

    await cdp.evaluate(`(() => {
      const inputs = Array.from(document.querySelectorAll('.admin-input'));
      const proto = window.HTMLInputElement.prototype;
      const setter = Object.getOwnPropertyDescriptor(proto, 'value').set;

      const titleInp = inputs.find(i => i.closest('.admin-input-group')?.querySelector('label')?.innerText?.includes('عنوان اصلی'));
      if (titleInp) {
        setter.call(titleInp, ${JSON.stringify(newTitle)});
        titleInp.dispatchEvent(new Event('input', { bubbles: true }));
        titleInp.dispatchEvent(new Event('change', { bubbles: true }));
      }
    })()`);
    await sleep(400);

    await cdp.evaluate(`(() => {
      const inputs = Array.from(document.querySelectorAll('.admin-input'));
      const proto = window.HTMLInputElement.prototype;
      const setter = Object.getOwnPropertyDescriptor(proto, 'value').set;

      const seoInp = inputs.find(i => i.closest('.admin-input-group')?.querySelector('label')?.innerText?.includes('سئو'));
      if (seoInp) {
        setter.call(seoInp, ${JSON.stringify(newSeoTitle)});
        seoInp.dispatchEvent(new Event('input', { bubbles: true }));
        seoInp.dispatchEvent(new Event('change', { bubbles: true }));
      }
    })()`);
    await sleep(400);

    await cdp.evaluate(`(() => {
      const inputs = Array.from(document.querySelectorAll('.admin-input'));
      const proto = window.HTMLInputElement.prototype;
      const setter = Object.getOwnPropertyDescriptor(proto, 'value').set;

      const slugInp = inputs.find(i => i.closest('.admin-input-group')?.querySelector('label')?.innerText?.includes('Slug'));
      if (slugInp) {
        setter.call(slugInp, ${JSON.stringify(newSlug)});
        slugInp.dispatchEvent(new Event('input', { bubbles: true }));
        slugInp.dispatchEvent(new Event('change', { bubbles: true }));
      }
    })()`);
    await sleep(1000);

    // 7. Verify Live Preview updated dynamically
    console.log('\n--- Step 7: Verifying Dynamic Live Preview Update ---');
    const updatedPreview = await cdp.evaluate(`(() => {
      const h1 = document.querySelector('.admin-preview-wrapper h1')?.innerText?.trim();
      const previewText = document.querySelector('.admin-preview-wrapper')?.innerText || '';
      return { h1, hasNewSlugInPreview: previewText.includes(${JSON.stringify(newSlug)}) };
    })()`);
    console.log('Preview updated H1:', updatedPreview.h1);
    console.log('Preview has new slug in badge:', updatedPreview.hasNewSlugInPreview);
    if (updatedPreview.h1 !== newTitle) {
      throw new Error(`Preview H1 did not match new title! Got: ${updatedPreview.h1}`);
    }
    console.log('✅ Live Preview dynamically reflected new title instantly!');
    await cdp.captureScreenshot('04-editor-after-input-changes.png');

    // 8. Click Save Button in UI
    console.log('\n--- Step 8: Clicking "💾 ذخیره در سایت" in Admin UI ---');
    const saveClicked = await cdp.evaluate(`(() => {
      const saveBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('ذخیره در سایت'));
      if (saveBtn) {
        saveBtn.click();
        return true;
      }
      return false;
    })()`);
    console.log('Save button clicked in UI:', saveClicked);

    // 9. Wait for Save Success Message in UI
    await waitFor(async () => {
      const isSuccess = await cdp.evaluate(`(() => {
        const bodyText = document.body.innerText;
        return bodyText.includes('تغییرات با موفقیت') || bodyText.includes('ذخیره شد');
      })()`);
      return isSuccess;
    }, 15000);

    console.log('✅ Save success message confirmed in Admin UI!');
    await cdp.captureScreenshot('05-save-completed.png');

    // 10. Direct Browser Navigation to Published Article URL
    console.log('\n--- Step 9: Navigating Browser to Published Article Page ---');
    await cdp.send('Page.navigate', { url: `http://localhost:3000/articles/${newSlug}` });
    await sleep(3500);
    await cdp.captureScreenshot('06-published-article-browser.png');

    const publicArticleCheck = await cdp.evaluate(`(() => {
      return {
        pageTitle: document.title,
        h1: document.querySelector('h1')?.innerText?.trim(),
        sectionsCount: document.querySelectorAll('section').length,
        hasDoctorComment: Boolean(document.querySelector('aside')),
        hasFaqs: Boolean(document.body.innerText.includes('پرسش‌های متداول')),
        hasCitations: Boolean(document.body.innerText.includes('منابع و مقالات')),
      };
    })()`);
    console.log('Public Article Verification:');
    console.log('  Page Title:', publicArticleCheck.pageTitle);
    console.log('  H1 Heading:', publicArticleCheck.h1);
    console.log('  Sections Count:', publicArticleCheck.sectionsCount);
    console.log('  Doctor Comment Present:', publicArticleCheck.hasDoctorComment);
    console.log('  FAQs Present:', publicArticleCheck.hasFaqs);
    console.log('  Citations Present:', publicArticleCheck.hasCitations);

    if (!publicArticleCheck.h1 || !publicArticleCheck.h1.includes('راهنمای مراقبت')) {
      throw new Error('Public article H1 does not match expected title!');
    }

    console.log('\n🎉 ALL REAL BROWSER ADMIN UI WORKFLOW STEPS COMPLETED SUCCESSFULLY!');
  } finally {
    if (cdp) cdp.close();
    chromeProc.kill();
    console.log('🧹 Cleaned up Chrome process.');
  }
}

run().catch(err => {
  console.error('❌ Browser Test Error:', err);
  process.exit(1);
});
