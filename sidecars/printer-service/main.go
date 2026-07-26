package main

import (
	"bytes"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"image"
	_ "image/jpeg"
	_ "image/png"
	"io"
	"os"
	"strings"
	"syscall"
	"unsafe"
)

// Structural Payload STDIN dari Rust
type Payload struct {
	PrinterName string `json:"printerName"`
	ImageBase64 string `json:"imageBase64"`
}

// Windows Win32 API DLLs
var (
	modgdi32      = syscall.NewLazyDLL("gdi32.dll")
	modwinspool   = syscall.NewLazyDLL("winspool.drv")

	procCreateDCW         = modgdi32.NewProc("CreateDCW")
	procDeleteDC          = modgdi32.NewProc("DeleteDC")
	procGetDeviceCaps     = modgdi32.NewProc("GetDeviceCaps")
	procStartDocW         = modgdi32.NewProc("StartDocW")
	procEndDoc            = modgdi32.NewProc("EndDoc")
	procStartPage         = modgdi32.NewProc("StartPage")
	procEndPage           = modgdi32.NewProc("EndPage")
	procStretchDIBits     = modgdi32.NewProc("StretchDIBits")
	procGetDefaultPrinter = modwinspool.NewProc("GetDefaultPrinterW")
)

// Win32 Constants
const (
	HORZRES        = 8
	VERTRES        = 10
	LOGPIXELSX     = 88
	LOGPIXELSY     = 90
	DIB_RGB_COLORS = 0
	SRCCOPY        = 0x00CC0020
)

type DOCINFOW struct {
	CbSize      int32
	DocName     *uint16
	OutputFile  *uint16
	Datatype    *uint16
	Type        uint32
}

type BITMAPINFOHEADER struct {
	BiSize          uint32
	BiWidth         int32
	BiHeight        int32
	BiPlanes        uint16
	BiBitCount      uint16
	BiCompression   uint32
	BiSizeImage     uint32
	BiXPelsPerMeter int32
	BiYPelsPerMeter int32
	BiClrUsed       uint32
	BiClrImportant  uint32
}

type BITMAPINFO struct {
	Header BITMAPINFOHEADER
	Colors [1]uint32
}

// Ambil printer default Windows jika parameter kosong
func getDefaultPrinter() (string, error) {
	var bufSize uint32 = 512
	buf := make([]uint16, bufSize)
	ret, _, err := procGetDefaultPrinter.Call(
		uintptr(unsafe.Pointer(&buf[0])),
		uintptr(unsafe.Pointer(&bufSize)),
	)
	if ret == 0 {
		return "", fmt.Errorf("gagal mendapatkan printer default: %v", err)
	}
	return syscall.UTF16ToString(buf), nil
}

// Cetak gambar via Windows GDI
func printImageGDI(printerName string, img image.Image) error {
	var err error
	if strings.TrimSpace(printerName) == "" {
		printerName, err = getDefaultPrinter()
		if err != nil || printerName == "" {
			return fmt.Errorf("tidak ada printer yang ditemukan di sistem Windows")
		}
	}

	driverW, _ := syscall.UTF16PtrFromString("WINSPOOL")
	printerW, _ := syscall.UTF16PtrFromString(printerName)

	// 1. Buat Device Context Printer
	hdc, _, _ := procCreateDCW.Call(
		uintptr(unsafe.Pointer(driverW)),
		uintptr(unsafe.Pointer(printerW)),
		0, 0,
	)
	if hdc == 0 {
		return fmt.Errorf("gagal membuat Printer DC untuk: %s", printerName)
	}
	defer procDeleteDC.Call(hdc)

	// 2. Baca Device Caps
	printableWidthPx, _, _ := procGetDeviceCaps.Call(hdc, uintptr(HORZRES))
	printableHeightPx, _, _ := procGetDeviceCaps.Call(hdc, uintptr(VERTRES))
	dpiX, _, _ := procGetDeviceCaps.Call(hdc, uintptr(LOGPIXELSX))
	dpiY, _, _ := procGetDeviceCaps.Call(hdc, uintptr(LOGPIXELSY))

	// Standar 72mm (~2.8346 inci) untuk kertas 80mm
	targetWidthInches := 2.8346
	targetWidthPx := int(float64(dpiX) * targetWidthInches)

	// Protection 1: Kertas kecil (58mm)
	if targetWidthPx > int(printableWidthPx) {
		targetWidthPx = int(printableWidthPx)
	}

	bounds := img.Bounds()
	w := bounds.Dx()
	h := bounds.Dy()

	// 🛡️ PROTEKSI: Tolak jika gambar berukuran 0 piksel
	if w <= 0 || h <= 0 {
		return fmt.Errorf("dimensi gambar tidak valid (%dx%d px)", w, h)
	}

	scaleRatio := float64(targetWidthPx) / float64(w)
	targetHeightPx := int(float64(h) * scaleRatio)

	// Protection 2: Tinggi melewati batas cetak
	if targetHeightPx > int(printableHeightPx) {
		targetHeightPx = int(printableHeightPx) - int(float64(dpiY)*0.1)
		targetWidthPx = int(float64(targetHeightPx) * (float64(w) / float64(h)))
	}

	// Alignment Horizontal di Tengah & Top Margin Safety (2% DPI)
	xOffset := 0
	if int(printableWidthPx) > targetWidthPx {
		xOffset = (int(printableWidthPx) - targetWidthPx) / 2
	}
	yOffset := int(float64(dpiY) * 0.02)

	// 3. Konversi Gambar ke Pixel Buffer BGRA (Top-Down DIB)
	pix := make([]byte, w*h*4)
	idx := 0
	for y := bounds.Min.Y; y < bounds.Max.Y; y++ {
		for x := bounds.Min.X; x < bounds.Max.X; x++ {
			r, g, b, a := img.At(x, y).RGBA()
			pix[idx] = byte(b >> 8)   // Blue
			pix[idx+1] = byte(g >> 8) // Green
			pix[idx+2] = byte(r >> 8) // Red
			pix[idx+3] = byte(a >> 8) // Alpha
			idx += 4
		}
	}

	bmi := BITMAPINFO{
		Header: BITMAPINFOHEADER{
			BiSize:        uint32(unsafe.Sizeof(BITMAPINFOHEADER{})),
			BiWidth:       int32(w),
			BiHeight:      -int32(h), // Minus menunjukkan Top-Down DIB
			BiPlanes:      1,
			BiBitCount:    32,
			BiCompression: 0, // BI_RGB
		},
	}

	docNameW, _ := syscall.UTF16PtrFromString("TIBKAM 1745 Struk Print")
	docInfo := DOCINFOW{
		CbSize:  int32(unsafe.Sizeof(DOCINFOW{})),
		DocName: docNameW,
	}

	// 4. Eksekusi Cetak GDI
	res, _, _ := procStartDocW.Call(hdc, uintptr(unsafe.Pointer(&docInfo)))
	if int32(res) <= 0 {
		return fmt.Errorf("gagal memulai dokumen cetak (StartDocW)")
	}

	procStartPage.Call(hdc)

	procStretchDIBits.Call(
		hdc,
		uintptr(xOffset),
		uintptr(yOffset),
		uintptr(targetWidthPx),
		uintptr(targetHeightPx),
		0, 0,
		uintptr(w),
		uintptr(h),
		uintptr(unsafe.Pointer(&pix[0])),
		uintptr(unsafe.Pointer(&bmi)),
		uintptr(DIB_RGB_COLORS),
		uintptr(SRCCOPY),
	)

	procEndPage.Call(hdc)
	procEndDoc.Call(hdc)

	return nil
}

func main() {
	inputData, err := io.ReadAll(os.Stdin)
	if err != nil || len(bytes.TrimSpace(inputData)) == 0 {
		fmt.Println("ERROR: Data masukan STDIN kosong!")
		os.Exit(1)
	}

	var payload Payload
	if err := json.Unmarshal(inputData, &payload); err != nil {
		fmt.Printf("ERROR: Gagal unmarshal JSON: %v\n", err)
		os.Exit(1)
	}

	if payload.ImageBase64 == "" {
		fmt.Println("ERROR: Payload imageBase64 kosong!")
		os.Exit(1)
	}

	// Clean Base64 Data URL Header
	b64Data := payload.ImageBase64
	if idx := strings.Index(b64Data, ","); idx != -1 {
		b64Data = b64Data[idx+1:]
	}

	imgBytes, err := base64.StdEncoding.DecodeString(b64Data)
	if err != nil {
		fmt.Printf("ERROR: Gagal decode Base64: %v\n", err)
		os.Exit(1)
	}

	img, _, err := image.Decode(bytes.NewReader(imgBytes))
	if err != nil {
		fmt.Printf("ERROR: Gagal decode Gambar: %v\n", err)
		os.Exit(1)
	}

	if err := printImageGDI(payload.PrinterName, img); err != nil {
		fmt.Printf("ERROR: %v\n", err)
		os.Exit(1)
	}

	fmt.Println("SUCCESS")
}