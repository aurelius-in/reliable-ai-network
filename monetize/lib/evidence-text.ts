const MAX_EXCERPT = 8000;
const MAX_BYTES = 2_000_000;

const TEXT_MIMES = new Set([
  "text/plain",
  "text/markdown",
  "text/csv",
  "text/x-markdown",
  "application/json",
  "application/xml",
  "text/xml",
]);

const TEXT_EXT = /\.(txt|md|markdown|csv|json|xml|yml|yaml|tsv)$/i;
const PDF_EXT = /\.pdf$/i;

export function canExtractEvidenceText(name: string, mime: string): boolean {
  if (mime === "application/pdf" || PDF_EXT.test(name)) return true;
  if (TEXT_MIMES.has(mime) || mime.startsWith("text/")) return true;
  return TEXT_EXT.test(name);
}

async function extractPdfText(buffer: Buffer): Promise<string> {
  const { PDFParse } = await import("pdf-parse");
  const parser = new PDFParse({ data: new Uint8Array(buffer) });
  try {
    const result = await parser.getText();
    return String(result?.text ?? "").trim();
  } finally {
    await parser.destroy().catch(() => undefined);
  }
}

/** Pull a UTF-8 text excerpt for prompt context. Supports text + PDF. */
export async function extractEvidenceExcerpt(
  file: File
): Promise<{ name: string; mime: string; text_excerpt: string }> {
  if (file.size > MAX_BYTES) {
    throw new Error("File too large. Keep evidence under ~2MB.");
  }
  const name = file.name || "upload.txt";
  const mime = file.type || "text/plain";
  if (!canExtractEvidenceText(name, mime)) {
    throw new Error(
      "Upload evidence as .txt, .md, .csv, .json, or .pdf. Paste key excerpts if a file will not parse."
    );
  }

  let text_excerpt = "";
  if (mime === "application/pdf" || PDF_EXT.test(name)) {
    const buf = Buffer.from(await file.arrayBuffer());
    try {
      text_excerpt = (await extractPdfText(buf)).slice(0, MAX_EXCERPT);
    } catch (err) {
      throw new Error(
        err instanceof Error
          ? `Could not parse PDF: ${err.message}`
          : "Could not parse PDF"
      );
    }
  } else {
    const raw = await file.text();
    text_excerpt = raw.replace(/\u0000/g, "").trim().slice(0, MAX_EXCERPT);
  }

  if (!text_excerpt) {
    throw new Error("That file looked empty.");
  }
  return {
    name,
    mime: mime || (PDF_EXT.test(name) ? "application/pdf" : "text/plain"),
    text_excerpt,
  };
}
