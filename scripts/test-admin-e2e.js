const http = require('http');

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, res => {
      let body = '';
      res.on('data', chunk => (body += chunk));
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body,
        });
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }
    req.end();
  });
}

async function run() {
  console.log('=== Step 1: Admin Login ===');
  const loginRes = await request(
    {
      hostname: 'localhost',
      port: 3000,
      path: '/api/admin/auth',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { password: 'gholipour1405' }
  );

  console.log('Login status:', loginRes.statusCode);
  const loginJson = JSON.parse(loginRes.body);
  console.log('Login success:', loginJson.success);

  const cookieHeader = loginRes.headers['set-cookie'];
  const cookie = Array.isArray(cookieHeader) ? cookieHeader[0].split(';')[0] : '';
  console.log('Auth Cookie obtained:', !!cookie);

  console.log('\n=== Step 2: Fetch Articles via Admin Panel API ===');
  const articlesRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/admin/articles',
    method: 'GET',
    headers: { Cookie: cookie },
  });

  const articlesData = JSON.parse(articlesRes.body);
  console.log('Total articles found in admin panel:', articlesData.articles?.length);

  const baseArticle = articlesData.articles.find(a => a.slug === 'primary-baby-teeth-guide');
  if (!baseArticle) {
    throw new Error('Base article primary-baby-teeth-guide not found!');
  }
  console.log('Found base article:', baseArticle.title, 'sections:', baseArticle.sections.length);

  console.log('\n=== Step 3: Create Clone via Admin Panel Tool with New Title & URL ===');
  const newArticle = JSON.parse(JSON.stringify(baseArticle));
  newArticle.id = ''; // New ID will be assigned by admin API
  newArticle.title = 'راهنمای مراقبت و حفظ دندان‌های شیری کودکان؛ عصب‌کشی، روکش و پیشگیری';
  newArticle.seoTitle = 'راهنمای مراقبت از دندان شیری کودکان';
  newArticle.slug = 'pediatric-baby-teeth-care-guide';

  const saveRes = await request(
    {
      hostname: 'localhost',
      port: 3000,
      path: '/api/admin/articles',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookie,
      },
    },
    { article: newArticle, isNew: true }
  );

  console.log('Save response status:', saveRes.statusCode);
  const saveJson = JSON.parse(saveRes.body);
  console.log('Save message:', saveJson.message);
  console.log('Created article assigned ID:', saveJson.article?.id);

  console.log('\n=== Step 4: Verify Article in Admin Panel Articles List ===');
  const listRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/admin/articles',
    method: 'GET',
    headers: { Cookie: cookie },
  });

  const updatedArticles = JSON.parse(listRes.body).articles;
  const verifiedArt = updatedArticles.find(a => a.slug === 'pediatric-baby-teeth-care-guide');
  if (!verifiedArt) {
    throw new Error('Newly created article not found in articles list!');
  }
  console.log('Verified article in admin list! ID:', verifiedArt.id, 'Title:', verifiedArt.title);
  console.log('Sections count:', verifiedArt.sections.length);
  console.log('FAQs count:', verifiedArt.faqs.length);
  console.log('Citations count:', verifiedArt.citations.length);

  console.log('\n=== Step 5: Verify Article Page Renders on Public Site ===');
  const pageRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/articles/pediatric-baby-teeth-care-guide',
    method: 'GET',
  });

  console.log('Public page HTTP status:', pageRes.statusCode);
  if (pageRes.statusCode === 200) {
    console.log('SUCCESS! Article page loaded with HTTP 200 OK.');
    const hasTitle = pageRes.body.includes(newArticle.title);
    const hasDoctorComment = pageRes.body.includes('نکته بالینی دکتر مهدی محمدنژاد');
    const hasCitations = pageRes.body.includes('American Academy of Pediatric Dentistry');
    console.log('Contains new title:', hasTitle);
    console.log('Contains doctor commentary:', hasDoctorComment);
    console.log('Contains scientific citations:', hasCitations);
  } else {
    console.error('Page render failed with status:', pageRes.statusCode);
  }
}

run().catch(err => {
  console.error('Error running test:', err);
  process.exit(1);
});
