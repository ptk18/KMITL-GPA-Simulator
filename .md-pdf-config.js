module.exports = {
  pdf_options: {
    format: "A4",
    margin: {
      top: "20mm",
      bottom: "25mm",
      left: "20mm",
      right: "20mm"
    },
    displayHeaderFooter: true,
    headerTemplate: "<span></span>",
    footerTemplate: "<div style='width: 100%; font-size: 10px; text-align: center; color: #666; padding-top: 5px;'><span class='pageNumber'></span></div>"
  },
  stylesheet: [],
  css: `
    body { font-family: "Times New Roman", Times, serif; font-size: 16px; line-height: 1.6; }
    h1 { font-size: 28px; text-align: center; margin-bottom: 30px; }
    h2 { font-size: 22px; page-break-before: always; }
    h2:nth-of-type(1), h2:nth-of-type(2) { page-break-before: avoid; }
    h2:nth-of-type(10) { page-break-before: avoid; }
    h3 { font-size: 18px; }
    table { width: 100%; border-collapse: collapse; margin: 15px 0; }
    th, td { padding: 8px 12px; border: 1px solid #ddd; }
    th { background-color: #f5f5f5; }
    img { max-width: 70%; height: auto; display: block; margin: 15px auto; }
    figure { text-align: center; margin: 20px 0; page-break-inside: avoid; }
    figcaption { font-size: 14px; color: #666; margin-top: 8px; }
    blockquote { background: #f9f9f9; border-left: 4px solid #ccc; padding: 10px 15px; margin: 15px 0; }
    code { background: #f4f4f4; padding: 2px 6px; }
    pre { background: #f4f4f4; padding: 10px; }
  `
};
