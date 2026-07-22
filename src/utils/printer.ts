// src/utils/printer.ts
import { toPng } from 'html-to-image';
import { invoke } from '@tauri-apps/api/core';
import type { PrintJobOptions } from '@/types/printer';

export const LOCAL_STORAGE_PRINTER_KEY = 'selected_pos_printer';

export const executeAutoPrintDialog = (htmlContent: string) => {
  const existingIframe = document.getElementById('global-print-iframe');
  if (existingIframe) document.body.removeChild(existingIframe);

  const iframe = document.createElement('iframe');
  iframe.id = 'global-print-iframe';
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0px';
  iframe.style.height = '0px';
  iframe.style.border = 'none';
  iframe.style.visibility = 'hidden';

  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) return;

  doc.open();
  doc.write(htmlContent);
  doc.close();

  setTimeout(() => {
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
  }, 150);
};

/**
 * 📸 Helper Pixel-Perfect dengan Isolasi Iframe Total
 */
const convertHtmlToImageBase64 = async (
  elementOrHtml: HTMLElement | string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Gunakan iframe terisolasi agar CSS TIDAK BOCOR ke UI utama
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.left = '-9999px';
    iframe.style.top = '0';
    iframe.style.width = '380px';
    iframe.style.height = '1000px';
    iframe.style.border = 'none';

    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      document.body.removeChild(iframe);
      return reject(new Error('Gagal mengakses iframe document'));
    }

    const htmlStr =
      typeof elementOrHtml === 'string'
        ? elementOrHtml
        : elementOrHtml.outerHTML;

    doc.open();
    doc.write(htmlStr);
    doc.close();

    setTimeout(async () => {
      try {
        if (iframe.contentWindow?.document.fonts) {
          await iframe.contentWindow.document.fonts.ready;
        }

        // Snapshot isi iframe document.body
        const dataUrl = await toPng(doc.body, {
          pixelRatio: 8,
          backgroundColor: '#ffffff',
        });

        document.body.removeChild(iframe);
        resolve(dataUrl);
      } catch (err) {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
        reject(err);
      }
    }, 200);
  });
};

export const executeSilentPrintTauri = async (
  elementOrHtml: HTMLElement | string,
  printerName?: string
) => {
  const targetPrinter =
    printerName ||
    localStorage.getItem(LOCAL_STORAGE_PRINTER_KEY) ||
    '';

  console.log(`📸 [Global Printer] Merender HTML via iframe (Pixel-Perfect)...`);
  const base64Image = await convertHtmlToImageBase64(elementOrHtml);

  console.log(`🚀 [Global Printer] Mengirim gambar piksel ke Python Sidecar via Rust...`);
  
  await invoke('print_image_silently', {
    printerName: targetPrinter,
    imageBase64: base64Image,
  });
};

export const executePrint = async (
  elementOrHtml: HTMLElement | string,
  options: PrintJobOptions
) => {
  if (options.mode === 'off') {
    console.log('ℹ️ [Global Printer] Mode Off - Diabaikan.');
    return;
  }

  if (options.mode === 'silent') {
    try {
      await executeSilentPrintTauri(elementOrHtml, options.printerName);
    } catch (err) {
      console.error('❌ [Silent Print Error]:', err);
    }
  } else if (options.mode === 'auto') {
    const htmlStr =
      typeof elementOrHtml === 'string'
        ? elementOrHtml
        : elementOrHtml.outerHTML;
    executeAutoPrintDialog(htmlStr);
  }
};