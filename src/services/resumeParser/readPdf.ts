/**
 * Step 1: Read PDF and extract text items
 * Based on OpenResume's read-pdf.ts
 * Reference: https://github.com/xitanggg/open-resume/blob/main/src/app/lib/parse-resume-from-pdf/read-pdf.ts
 */

// Getting pdfjs to work - configure worker
import * as pdfjs from "pdfjs-dist";

// Configure PDF.js worker from CDN
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

import type { TextItem as PdfjsTextItem } from "pdfjs-dist/types/src/display/api";
import type { TextItem, TextItems } from "@/types/resume";

/**
 * Read PDF and output textItems by concatenating results from each page.
 * 
 * Returns a new TextItem type which removes unused attributes (dir, transform),
 * adds x and y positions, and replaces loaded font name with original font name.
 * 
 * @example
 * const onFileChange = async (e) => {
 *     const fileUrl = URL.createObjectURL(e.target.files[0]);
 *     const textItems = await readPdf(fileUrl);
 * }
 */
export const readPdf = async (fileUrl: string): Promise<TextItems> => {
  const pdfFile = await pdfjs.getDocument(fileUrl).promise;
  let textItems: TextItems = [];

  for (let i = 1; i <= pdfFile.numPages; i++) {
    // Parse each page into text content
    const page = await pdfFile.getPage(i);
    const textContent = await page.getTextContent();

    // Wait for font data to be loaded
    await page.getOperatorList();
    const commonObjs = page.commonObjs;

    // Convert Pdfjs TextItem type to new TextItem type
    const pageTextItems = textContent.items.map((item) => {
      const {
        str: text,
        dir, // Remove text direction
        transform,
        fontName: pdfFontName,
        ...otherProps
      } = item as PdfjsTextItem;

      // Extract x, y position of text item from transform.
      // Origin (0, 0) is bottom left.
      const x = transform[4];
      const y = transform[5];

      // Get original font name instead of pdfjs loaded font name (e.g., g_d0_f1 -> Calibri)
      let fontName = pdfFontName;
      if (commonObjs.has(pdfFontName)) {
        const obj = commonObjs.get(pdfFontName);
        // FontName can be in format "/Arial-BoldMT" or just "Arial-Bold"
        fontName = obj.name.replace(/^\//, "");
      }

      const textItem: TextItem = {
        ...otherProps,
        text,
        x,
        y,
        fontName,
      };

      return textItem;
    });

    textItems.push(...pageTextItems);
  }

  return textItems;
};
