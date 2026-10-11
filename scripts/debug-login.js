const { spawn } = require('child_process');
const http = require('http');

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function test() {
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9223',
    '--user-data-dir=C:\\Projects\\gholipour-dental-clinic\\.chrome-debug',
  ]);

  await sleep(1500);
  const list = await new Promise((res, rej) => {
    http
      .get('http://localhost:9223/json/list', r => {
        let d = '';
        r.on('data', c => (d += c));
        r.on('end', () => res(JSON.parse(d)));
      })
      .on('error', rej);
  });

  const ws = new WebSocket(list[0].webSocketDebuggerUrl);
  await new Promise(r => (ws.onopen = r));
  let id = 0;
  function send(method, params = {}) {
    return new Promise(resolve => {
      const curId = ++id;
      const handler = event => {
        const msg = JSON.parse(event.data);
        if (msg.id === curId) {
          ws.removeEventListener('message', handler);
          resolve(msg.result);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id: curId, method, params }));
    });
  }

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Page.navigate', { url: 'http://localhost:3000/admin' });
  await sleep(2500);

  // Wait for login form
  for (let i = 0; i < 20; i++) {
    const hasInput = await send('Runtime.evaluate', {
      expression: 'Boolean(document.querySelector("#admin-pwd"))',
      returnByValue: true,
    });
    if (hasInput.result.value) break;
    await sleep(500);
  }

  // Type password
  await send('Runtime.evaluate', {
    expression: `(() => {
      const pwd = document.querySelector('#admin-pwd');
      const proto = window.HTMLInputElement.prototype;
      const setter = Object.getOwnPropertyDescriptor(proto, 'value').set;
      setter.call(pwd, 'gholipour1405');
      pwd.dispatchEvent(new Event('input', { bubbles: true }));
      pwd.dispatchEvent(new Event('change', { bubbles: true }));
    })()`,
  });

  // Await React state update
  await sleep(500);

  // Submit form
  await send('Runtime.evaluate', {
    expression: `document.querySelector('button[type="submit"]').click()`,
  });

  await sleep(3000);

  const afterText = await send('Runtime.evaluate', {
    expression: 'document.body.innerText',
    returnByValue: true,
  });
  console.log('=== PAGE TEXT AFTER SUBMISSION ===');
  console.log(afterText.result?.value?.substring(0, 400));

  ws.close();
  chrome.kill();
}
test().catch(console.error);
