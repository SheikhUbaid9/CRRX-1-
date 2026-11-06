// A real, text-selectable five-page PDF generated without a fixture dependency.
export function pdfFixture() {
  let result = "%PDF-1.4\n";
  const offsets = [];
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [4 0 R 6 0 R 8 0 R 10 0 R 12 0 R] /Count 5 >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];
  for (let page = 1; page <= 5; page++) {
    objects.push(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 400 550] /Resources << /Font << /F1 3 0 R >> >> /Contents ${5 + (page - 1) * 2} 0 R >>`,
    );
    const stream = `BT /F1 24 Tf 40 460 Td (Chapter ${page}) Tj /F1 14 Tf 0 -40 Td (A quiet place to read.) Tj ET`;
    objects.push(
      `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
    );
  }
  objects.forEach((object, i) => {
    offsets.push(Buffer.byteLength(result));
    result += `${i + 1} 0 obj\n${object}\nendobj\n`;
  });
  const start = Buffer.byteLength(result);
  result +=
    `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n` +
    offsets
      .map((offset) => String(offset).padStart(10, "0") + " 00000 n \n")
      .join("") +
    `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${start}\n%%EOF`;
  return Buffer.from(result);
}
