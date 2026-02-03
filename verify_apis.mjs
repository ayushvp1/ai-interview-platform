// verify_apis.mjs
const BASE_URL = "http://127.0.0.1:3000";

async function testChat() {
    console.log("Testing /api/chat...");
    try {
        const res = await fetch(`${BASE_URL}/api/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                messages: [{ role: "user", content: "Hello, I am ready for the React interview." }],
                type: "Technical"
            })
        });

        if (!res.ok) {
            const text = await res.text();
            throw new Error(`Status ${res.status}: ${text}`);
        }
        const data = await res.json();
        console.log("✅ Chat Response:", JSON.stringify(data, null, 2));
        return data;
    } catch (e) {
        console.error("❌ Chat Failed Details:", e.cause || e);
        return null;
    }
}

async function testEvaluate() {
    console.log("\nTesting /api/evaluate...");
    const mockHistory = [
        { role: "user", content: "Hi" },
        { role: "ai", content: "Hello! Ready for React questions?" },
        { role: "user", content: "Yes, I know React hooks very well." }
    ];

    try {
        const res = await fetch(`${BASE_URL}/api/evaluate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chat_history: mockHistory })
        });

        if (!res.ok) {
            const text = await res.text();
            throw new Error(`Status ${res.status}: ${text}`);
        }
        const data = await res.json();
        console.log("✅ Evaluation Result:", JSON.stringify(data, null, 2));
    } catch (e) {
        console.error("❌ Evaluation Failed Details:", e.cause || e);
    }
}

async function run() {
    // Wait for server to be ready (manual delay or health check usually)
    console.log("Waiting for server...");
    const chatRes = await testChat();
    if (chatRes) await testEvaluate();
}

run();
