// src/utils/printer.ts
import { toPng } from 'html-to-image';
import { invoke } from '@tauri-apps/api/core';
import type { PrintJobOptions } from '@/types/printer';

export const LOCAL_STORAGE_PRINTER_KEY = 'selected_pos_printer';

const isTauriEnvironment = () => {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
};

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

const convertHtmlToImageBase64 = async (
  elementOrHtml: HTMLElement | string
): Promise<string> => {
  return new Promise((resolve, reject) => {
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

    // Waktu tunggu standar untuk pemuatan font & CSS di iframe
    setTimeout(async () => {
      try {
        if (iframe.contentWindow?.document.fonts) {
          await iframe.contentWindow.document.fonts.ready;
        }

        // Render Pertama
        let dataUrl = await toPng(doc.body, {
          pixelRatio: 4,
          backgroundColor: '#ffffff',
        });

        // 🛡️ SOLUSI CETAKAN PERTAMA (Cold Start Guard):
        // Struk bergambar yang valid umumnya memiliki panjang Base64 > 10.000 karakter.
        // Jika panjangnya < 3000, artinya canvas/font di cetak #1 belum siap (putih polos).
        // Kita beri jeda mikro 100ms lalu ekstrak ulang otomatis!
        if (dataUrl.length < 3000) {
          await new Promise((r) => setTimeout(r, 100));
          dataUrl = await toPng(doc.body, {
            pixelRatio: 4,
            backgroundColor: '#ffffff',
          });
        }

        document.body.removeChild(iframe);
        resolve(dataUrl);
      } catch (err) {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
        reject(err);
      }
    }, 250); // Dinaikkan sedikit dari 200ms ke 250ms agar lebih stabil
  });
};

export const executeSilentPrintTauri = async (
  elementOrHtml: HTMLElement | string
) => {
  if (!isTauriEnvironment()) {
    console.warn('⚠️ [Global Printer] Silent Print disimulasikan (bukan di lingkungan Tauri).');
    return;
  }

  // Konversi HTML ke Gambar Base64
  const base64Image = await convertHtmlToImageBase64(elementOrHtml);

  // 🎯 Kosongkan printerName ("") agar Go sidecar otomatis mendeteksi printer default Windows
  await invoke('print_image_silently', {
    printerName: '',
    imageBase64: base64Image,
  });
};

export const executePrint = async (
  elementOrHtml: HTMLElement | string,
  options: PrintJobOptions
) => {
  if (options.mode === 'off') {
    return;
  }

  if (options.mode === 'silent') {
    try {
      await executeSilentPrintTauri(elementOrHtml);
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