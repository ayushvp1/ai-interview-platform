import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = "AIzaSyCOGKMpjxP--5TOcyXcU01a-IjMbu1uSqU";
const genAI = new GoogleGenerativeAI(apiKey);

async function diagnose() {
    try {
        console.log("Testing with gemini-1.5-flash-latest...\n");
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
        const result = await model.generateContent("Hello");
        const response = await result.response;
        console.log("✅ SUCCESS! Response:", response.text());
    } catch (error) {
        console.log("❌ FULL ERROR DETAILS:");
        console.log("Message:", error.message);
        console.log("\nError object:", JSON.stringify(error, null, 2));

        if (error.message.includes("API_KEY_INVALID")) {
            console.log("\n⚠️ Your API key appears to be invalid. Please regenerate it at:");
            console.log("https://aistudio.google.com/app/apikey");
        } else if (error.message.includes("billing") || error.message.includes("quota")) {
            console.log("\n⚠️ Billing or quota issue. You may need to:");
            console.log("1. Enable billing in Google Cloud Console");
            console.log("2. Or use a different API key with billing enabled");
        } else if (error.message.includes("404")) {
            console.log("\n⚠️ Model not found. The Gemini API may have changed.");
            console.log("Try checking: https://ai.google.dev/gemini-api/docs/models/gemini");
        }
    }
}

diagnose();
