import fs from "fs";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

export async function extractPdfText(filePath: string) {
  // Read PDF into memory
  const data = new Uint8Array(fs.readFileSync(filePath));

  // Load PDF
  const loadingTask = pdfjsLib.getDocument({ data });

  const pdf = await loadingTask.promise;

  let text = "";

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);

    const content = await page.getTextContent();

    const pageText = content.items
      .map((item: any) => item.str)
      .join(" ");

    text += pageText + "\n";
  }

  return text;
}