import { qdrant } from "./client";

async function main() {
  await qdrant.createCollection("legal-documents", {
    vectors: {
      size: 3072,
      distance: "Cosine",
    },
  });

  console.log("✅ Collection created!");
}

main();