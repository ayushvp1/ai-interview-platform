import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = "AIzaSyCOGKMpjxP--5TOcyXcU01a-IjMbu1uSqU";
const genAI = new GoogleGenerativeAI(apiKey);

async function testModels() {
    // Try the latest naming conventions
    const models = [
        "gemini-2.0-flash-exp",
        "gemini-exp-1206",
        "gemini-1.5-flash-latest",
        "gemini-1.5-pro-latest",
        "gemini-1.5-flash-002",
        "gemini-1.5-pro-002"
    ];

    for (const modelName of models) {
        try {
            console.log(`Testing ${modelName}...`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Say hello");
            const response = await result.response;
            const text = response.text();
            console.log(`✅ ${modelName} WORKS! Response: ${text.substring(0, 50)}...`);
            console.log(`\nUse this model name: ${modelName}`);
            return modelName;
        } catch (e) {
            console.log(`❌ ${modelName} failed: ${e.message.substring(0, 100)}`);
        }
    }
    console.log("\n⚠️ No working model found. Your API key might need to be regenerated or have billing enabled.");
}

testModels();
