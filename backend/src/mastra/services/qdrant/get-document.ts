import { qdrant } from "./client";

export async function getEntireContract() {
  try {
    const result = await qdrant.scroll("legal-documents", {
      limit: 100,
      with_payload: true,
      with_vector: false,
    });

    const contract = result.points
      .sort(
        (a, b) =>
          Number(a.payload?.chunkNumber) -
          Number(b.payload?.chunkNumber)
      )
      .map((point) => String(point.payload?.text ?? ""))
      .join("\n\n");

    return contract;
  } catch (error) {
    console.error("❌ Failed to retrieve contract from Qdrant:", error);
    return "";
  }
}