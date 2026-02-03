import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = "AIzaSyCOGKMpjxP--5TOcyXcU01a-IjMbu1uSqU";
const genAI = new GoogleGenerativeAI(apiKey);

async function testModels() {
    const models = [
        "gemini-2.0-flash-exp",
        "gemini-1.5-flash-latest",
        "gemini-1.5-flash-002",
        "gemini-1.5-flash",
        "gemini-1.5-pro-latest",
        "gemini-1.5-pro"
    ];

    for (const modelName of models) {
        try {
            console.log(`\nTrying: ${modelName}...`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Say hi");
            const response = await result.response;
            const text = response.text();
            console.log(`✅ SUCCESS with ${modelName}!`);
            console.log(`Response: ${text}`);
            console.log(`\n🎯 USE THIS MODEL: ${modelName}`);
            return;
        } catch (error) {
            console.log(`❌ Failed: ${error.message.substring(0, 80)}...`);
        }
    }
    console.log("\n⚠️ No models worked. Check your API key at: https://aistudio.google.com/apikey");
}

testModels();
