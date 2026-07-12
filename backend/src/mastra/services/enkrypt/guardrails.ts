import "dotenv/config";
import { LEGAL_POLICY } from "./policy";
import { callEnkrypt } from "./client";

export async function checkPrompt(prompt: string) {
  console.log("\n==============================");
  console.log("🛡️ Enkrypt Prompt Guard");
  console.log("==============================");

  try {
    const response = await callEnkrypt("/guardrails/detect", {
  text: prompt,

  detectors: {
    injection_attack: {
      enabled: true,
    },

    toxicity: {
      enabled: true,
    },

    pii: {
      enabled: true,
      entities: [
        "pii",
        "secrets",
        "ip_address",
        "url",
      ],
    },

    keyword_detector: {
      enabled: true,
      banned_keywords: [
        "bomb",
        "terrorist",
      ],
    },
  },
});

    console.log("Status:", response.status);

    if (!response.ok) {
      const error = response.data ?? { message: "Enkrypt returned an error" };

      console.error("❌ Enkrypt Error");
      console.error(error);

      return {
        safe: true,
        message: "Enkrypt unavailable",
      };
    }

    const result = response.data;

    console.log(result);

    const summary = result.summary ?? {};

    const keywordDetected =
      summary.keyword_detected === 1;

    const toxic =
      Array.isArray(summary.toxicity) &&
      summary.toxicity.length > 0;

    const blocked = keywordDetected || toxic;

    if (blocked) {
      console.log("❌ Prompt Blocked");
    } else {
      console.log("✅ Prompt Safe");
    }

    return {
      safe: !blocked,
      message: blocked
        ? result.result_message ??
          "Prompt blocked by Enkrypt."
        : "Prompt passed safety check.",
      result,
    };

  } catch (err) {
    console.error("❌ Enkrypt Exception");
    console.error(err);

    return {
      safe: true,
      message:
        "Enkrypt unavailable. Continuing safely.",
    };
  }
}