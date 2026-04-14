import { test, expect } from '@playwright/test';

test('End-to-End Recruitment Flow', async ({ page }) => {
    // --- PART 1: CANDIDATE FLOW ---
    console.log('➜ Starting Candidate Flow...');
    await page.goto('/');
    await expect(page).toHaveTitle(/AI Interview Platform/);

    // Click Start Interview in Navbar
    await page.getByRole('button', { name: 'Start Interview' }).first().click();

    // Fill out the Lead Form
    const uniqueEmail = `test-${Date.now()}@example.com`;
    await page.getByPlaceholder('John Doe').fill('Automation Ghost');
    await page.getByPlaceholder('john@example.com').fill(uniqueEmail);
    await page.getByPlaceholder('+1 (555) 000-0000').fill('1234567890');

    // Submit Lead and wait for confirmation
    const responsePromise = page.waitForResponse(resp => resp.url().includes('/candidates') && resp.status() === 201);
    await page.getByRole('button', { name: 'Start Interview' }).last().click();
    await responsePromise;

    // Wait for the modal to be removed from the DOM
    await expect(page.getByText("Candidate Information")).not.toBeVisible();

    // Verify we are at the interview types
    await expect(page.getByRole('heading', { name: 'Choose Your Interview Type' })).toBeVisible();

    // Debug: Ensure storage is set
    const storageData = await page.evaluate(() => localStorage.getItem("interview_user_info"));
    console.log(`➜ LocalStorage Status: ${storageData ? '✅ SET' : '❌ EMPTY'}`);

    // Select Technical Interview
    await page.getByRole('link', { name: 'Text' }).first().click();

    // Verify Chat Page loads
    await expect(page.getByRole('heading', { name: "Technical Interview" })).toBeVisible();
    await expect(page.getByText(/Hello!/i)).toBeVisible();
    console.log('✅ Candidate Flow Successful!');

    // --- PART 2: ADMIN VERIFICATION ---
    console.log('➜ Starting Admin Verification...');
    await page.goto('/admin/login');

    // Sign in (credentials should be auto-filled by default)
    await page.getByRole('button', { name: /Sign In/i }).click();

    // Wait for Dashboard
    await page.waitForURL('**/admin');
    await expect(page.getByText('Admin Console')).toBeVisible();

    // Switch to Candidate Leads tab
    await page.getByRole('button', { name: 'Candidate Leads' }).click();

    // Verify the NEW lead is in the table (with a longer timeout for sync)
    await expect(page.getByText(uniqueEmail)).toBeVisible({ timeout: 10000 });
    console.log('✅ Admin Verification Successful!');

    console.log('✨ FULL MASTER FLOW PASSED!');
});
