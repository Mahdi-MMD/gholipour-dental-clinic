const http = require('http');

const PORT = process.env.TEST_PORT || 3088;

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
  console.log(`=== Starting E2E Reservations Test Suite on port ${PORT} ===\n`);

  // 1. Validation tests on POST /api/reservations
  console.log('--- Test 1: Empty input validation (POST /api/reservations) ---');
  const emptyRes = await request(
    {
      hostname: 'localhost',
      port: PORT,
      path: '/api/reservations',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    {}
  );
  console.log('Status:', emptyRes.statusCode);
  const emptyJson = JSON.parse(emptyRes.body);
  console.log('Response:', emptyJson);
  if (emptyRes.statusCode !== 400 || emptyJson.success !== false) {
    throw new Error('Test 1 Failed: Expected status 400 for empty request');
  }
  console.log('✓ Test 1 passed\n');

  // 2. Missing phone validation
  console.log('--- Test 2: Missing phone validation (POST /api/reservations) ---');
  const noPhoneRes = await request(
    {
      hostname: 'localhost',
      port: PORT,
      path: '/api/reservations',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { name: 'علی رضایی' }
  );
  if (noPhoneRes.statusCode !== 400) {
    throw new Error('Test 2 Failed: Expected 400 when phone is missing');
  }
  console.log('✓ Test 2 passed\n');

  // 3. Valid creation
  console.log('--- Test 3: Create valid reservation (POST /api/reservations) ---');
  const createRes = await request(
    {
      hostname: 'localhost',
      port: PORT,
      path: '/api/reservations',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    {
      name: 'سارا احمدی',
      phone: '۰۹۱۲۹۸۷۶۵۴۳',
      service: 'ارتودنسی نامرئی',
      visitedBefore: 'no',
      proposedDate: '۱۴۰۳/۰۹/۱۰',
      notes: 'تست یکپارچه رزرواسیون با یادداشت بیمار',
    }
  );
  console.log('Status:', createRes.statusCode);
  const createJson = JSON.parse(createRes.body);
  console.log('Created Reservation ID:', createJson.reservation?.id);
  if (createRes.statusCode !== 200 || !createJson.success || !createJson.reservation?.id) {
    throw new Error('Test 3 Failed: Reservation creation did not succeed');
  }
  const createdId = createJson.reservation.id;
  console.log('✓ Test 3 passed\n');

  // 4. Admin fetch all reservations
  console.log('--- Test 4: Admin GET all reservations (GET /api/admin/reservations) ---');
  const allRes = await request({
    hostname: 'localhost',
    port: PORT,
    path: '/api/admin/reservations',
    method: 'GET',
  });
  console.log('Status:', allRes.statusCode);
  const allJson = JSON.parse(allRes.body);
  const foundItem = allJson.reservations?.find(r => r.id === createdId);
  if (!foundItem) {
    throw new Error(`Test 4 Failed: Created reservation ${createdId} not found in admin list`);
  }
  console.log(`Found item in list. Name: ${foundItem.patientName}, Service: ${foundItem.service}`);
  console.log('✓ Test 4 passed\n');

  // 5. Admin fetch single reservation by ID
  console.log(
    '--- Test 5: Admin GET single reservation by ID (GET /api/admin/reservations?id=...) ---'
  );
  const singleRes = await request({
    hostname: 'localhost',
    port: PORT,
    path: `/api/admin/reservations?id=${encodeURIComponent(createdId)}`,
    method: 'GET',
  });
  console.log('Status:', singleRes.statusCode);
  const singleJson = JSON.parse(singleRes.body);
  if (singleRes.statusCode !== 200 || singleJson.reservation?.id !== createdId) {
    throw new Error('Test 5 Failed: Single reservation lookup failed');
  }
  console.log('✓ Test 5 passed\n');

  // 6. Admin fetch non-existent ID returns 404
  console.log('--- Test 6: Non-existent ID returns 404 ---');
  const notFoundRes = await request({
    hostname: 'localhost',
    port: PORT,
    path: '/api/admin/reservations?id=definitely-nonexistent-id-999',
    method: 'GET',
  });
  console.log('Status:', notFoundRes.statusCode);
  if (notFoundRes.statusCode !== 404) {
    throw new Error('Test 6 Failed: Expected 404 for non-existent ID');
  }
  console.log('✓ Test 6 passed\n');

  // 7. Update status: Confirm / review checkmark
  console.log('--- Test 7: Toggle status to confirmed (PATCH /api/admin/reservations) ---');
  const patchConfirmRes = await request(
    {
      hostname: 'localhost',
      port: PORT,
      path: '/api/admin/reservations',
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
    },
    { id: createdId, isConfirmed: true }
  );
  console.log('Status:', patchConfirmRes.statusCode);
  const patchConfirmJson = JSON.parse(patchConfirmRes.body);
  if (
    patchConfirmRes.statusCode !== 200 ||
    !patchConfirmJson.success ||
    !patchConfirmJson.reservation?.isConfirmed
  ) {
    throw new Error('Test 7 Failed: Failed to confirm reservation');
  }
  console.log('✓ Test 7 passed (isConfirmed is now true)\n');

  // 8. Toggle status back to pending
  console.log('--- Test 8: Toggle status back to pending (PATCH /api/admin/reservations) ---');
  const patchPendingRes = await request(
    {
      hostname: 'localhost',
      port: PORT,
      path: '/api/admin/reservations',
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
    },
    { id: createdId, isConfirmed: false }
  );
  const patchPendingJson = JSON.parse(patchPendingRes.body);
  if (patchPendingRes.statusCode !== 200 || patchPendingJson.reservation?.isConfirmed !== false) {
    throw new Error('Test 8 Failed: Failed to toggle reservation back to pending');
  }
  console.log('✓ Test 8 passed (isConfirmed is now false)\n');

  // 9. Full view page route
  console.log('--- Test 9: Full view page route (/admin/reservations/[id]) ---');
  const pageRes = await request({
    hostname: 'localhost',
    port: PORT,
    path: `/admin/reservations/${encodeURIComponent(createdId)}`,
    method: 'GET',
  });
  console.log('Status:', pageRes.statusCode);
  if (pageRes.statusCode !== 200 && pageRes.statusCode !== 307) {
    throw new Error(`Test 9 Failed: Full view route returned ${pageRes.statusCode}`);
  }
  console.log('✓ Test 9 passed\n');

  // 10. Delete reservation
  console.log('--- Test 10: Delete reservation (DELETE /api/admin/reservations?id=...) ---');
  const deleteRes = await request({
    hostname: 'localhost',
    port: PORT,
    path: `/api/admin/reservations?id=${encodeURIComponent(createdId)}`,
    method: 'DELETE',
  });
  console.log('Status:', deleteRes.statusCode);
  const deleteJson = JSON.parse(deleteRes.body);
  if (deleteRes.statusCode !== 200 || !deleteJson.success) {
    throw new Error('Test 10 Failed: Delete returned non-success');
  }

  // Verify deletion
  const verifyDeleteRes = await request({
    hostname: 'localhost',
    port: PORT,
    path: `/api/admin/reservations?id=${encodeURIComponent(createdId)}`,
    method: 'GET',
  });
  if (verifyDeleteRes.statusCode !== 404) {
    throw new Error('Test 10 Failed: Deleted item still found');
  }
  console.log('✓ Test 10 passed (Item deleted and confirmed gone)\n');

  // 11. Deleting non-existent reservation returns 404
  console.log('--- Test 11: Deleting non-existent reservation returns 404 ---');
  const delNonExistentRes = await request({
    hostname: 'localhost',
    port: PORT,
    path: '/api/admin/reservations?id=non-existent-999',
    method: 'DELETE',
  });
  if (delNonExistentRes.statusCode !== 404) {
    throw new Error('Test 11 Failed: Expected 404 when deleting non-existent item');
  }
  console.log('✓ Test 11 passed\n');

  console.log('============================================');
  console.log('ALL 11 END-TO-END RESERVATION TESTS PASSED!');
  console.log('============================================');
}

run().catch(err => {
  console.error('\n❌ Test Suite Failed:', err);
  process.exit(1);
});
