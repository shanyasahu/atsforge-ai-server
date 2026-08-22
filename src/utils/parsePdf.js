const { PDFParse } = require("pdf-parse");

async function parsePdfBuffer(buffer) {
  if (!buffer) throw new Error("PDF buffer is required");

  const parser = new PDFParse({ data: buffer });
  const result = await parser.getText();
  return (result.text || "").trim();
}

module.exports = parsePdfBuffer;
