import * as pdfjsLib from "pdfjs-dist";
import PdfJsWorker from "pdfjs-dist/build/pdf.worker.min.mjs?worker&inline";

let isPdfWorkerConfigured = false;

export function configurePdfJsWorker() {
  if (isPdfWorkerConfigured) {
    return;
  }

  pdfjsLib.GlobalWorkerOptions.workerPort = new PdfJsWorker();
  isPdfWorkerConfigured = true;
}
