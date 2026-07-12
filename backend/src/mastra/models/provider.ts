import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";

const googleAI = createGoogleGenerativeAI({
    apiKey:
        process.env.GOOGLE_API_KEY ??
        process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

const featherless = createOpenAI({
    apiKey: process.env.FEATHERLESS_API_KEY,
    baseURL: "https://api.featherless.ai/v1",
});

export function getModel() {

    if (process.env.LLM_PROVIDER === "featherless") {

        return featherless(
            process.env.FEATHERLESS_MODEL ??
            "deepseek-ai/DeepSeek-V3.2"
        );

    }

    return googleAI(
        process.env.GEMINI_MODEL ??
        "gemini-2.5-flash"
    );

}