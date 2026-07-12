import "dotenv/config";

const response = await fetch(
  "https://api.enkryptai.com/guardrails/health",
  {
    headers: {
      apikey: process.env.ENKRYPT_API_KEY!,
    },
  }
);

console.log(await response.json());