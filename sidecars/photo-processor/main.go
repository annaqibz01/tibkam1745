package main

import (
	"bufio"
	"encoding/json"
	"flag"
	"fmt"
	"image"
	"image/draw"
	_ "image/jpeg"
	"image/jpeg"
	_ "image/png"
	"os"
	"path/filepath"
	"runtime"
	"sync"
	"sync/atomic"
)

type CompressJob struct {
	IDPps      string `json:"id_pps"`
	SourcePath string `json:"source_path"`
	OutputPath string `json:"output_path"`
}

type ProgressEvent struct {
	Type    string `json:"type"` // "progress" | "complete" | "error"
	Current int64  `json:"current"`
	Total   int64  `json:"total"`
	Message string `json:"message"`
	Success bool   `json:"success"`
}

func main() {
	jobsJson := flag.String("jobs", "", "JSON array CompressJob")
	filePath := flag.String("file", "", "Path file JSON CompressJob")
	flag.Parse()

	var rawJson []byte
	var err error

	if *filePath != "" {
		rawJson, err = os.ReadFile(*filePath)
		if err != nil {
			sendEvent(ProgressEvent{Type: "error", Message: fmt.Sprintf("Gagal membaca file jobs: %v", err), Success: false})
			return
		}
	} else if *jobsJson != "" {
		rawJson = []byte(*jobsJson)
	} else {
		sendEvent(ProgressEvent{Type: "error", Message: "Argumen --file atau --jobs wajib diisi", Success: false})
		return
	}

	var jobs []CompressJob
	if err := json.Unmarshal(rawJson, &jobs); err != nil {
		sendEvent(ProgressEvent{Type: "error", Message: fmt.Sprintf("Gagal parse JSON: %v", err), Success: false})
		return
	}

	total := int64(len(jobs))
	if total == 0 {
		sendEvent(ProgressEvent{Type: "complete", Total: 0, Current: 0, Message: "Tidak ada foto yang perlu dikompres", Success: true})
		return
	}

	// ⚡ GUNAKAN 100% THREAD CPU UNTUK PERFORMA MAKSIMAL
	numWorkers := runtime.NumCPU()

	jobChan := make(chan CompressJob, total)
	var processedCounter int64
	var wg sync.WaitGroup

	for w := 1; w <= numWorkers; w++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			for job := range jobChan {
				processImageFast(job)
				curr := atomic.AddInt64(&processedCounter, 1)

				// Kirim event UI setiap 50 foto agar IPC Tauri tetap efisien
				if curr%50 == 0 || curr == total {
					sendEvent(ProgressEvent{
						Type:    "progress",
						Current: curr,
						Total:   total,
						Message: fmt.Sprintf("Mengompresi foto %d dari %d (ID PPS: %s)", curr, total, job.IDPps),
					})
				}
			}
		}()
	}

	for _, job := range jobs {
		jobChan <- job
	}
	close(jobChan)

	wg.Wait()

	sendEvent(ProgressEvent{
		Type:    "complete",
		Current: total,
		Total:   total,
		Message: "Kompresi foto selesai 100%",
		Success: true,
	})
}

func processImageFast(job CompressJob) {
	if err := os.MkdirAll(filepath.Dir(job.OutputPath), 0755); err != nil {
		return
	}

	file, err := os.Open(job.SourcePath)
	if err != nil {
		return
	}
	defer file.Close()

	src, _, err := image.Decode(file)
	if err != nil {
		return
	}

	// 1. Center Crop 3:4 Aspect Ratio
	cropped := centerCrop3x4(src)

	// 2. Fast RGBA Conversion via stdlib Assembly
	srcRGBA := drawToRGBA(cropped)

	// 3. Fast Direct Pix Memory Scaling (300 x 400)
	resized := resizeRGBADirect(srcRGBA, 300, 400)

	// 4. Save dengan Buffered I/O
	outFile, err := os.Create(job.OutputPath)
	if err != nil {
		return
	}
	defer outFile.Close()

	bufWriter := bufio.NewWriterSize(outFile, 65536)
	_ = jpeg.Encode(bufWriter, resized, &jpeg.Options{Quality: 75})
	_ = bufWriter.Flush()
}

func centerCrop3x4(src image.Image) image.Image {
	bounds := src.Bounds()
	w, h := bounds.Dx(), bounds.Dy()
	if w == 0 || h == 0 {
		return src
	}

	targetW, targetH := w, h
	if w*4 > h*3 {
		targetW = h * 3 / 4
	} else {
		targetH = w * 4 / 3
	}

	startX := bounds.Min.X + (w-targetW)/2
	startY := bounds.Min.Y + (h-targetH)/2

	cropRect := image.Rect(startX, startY, startX+targetW, startY+targetH)

	type subImager interface {
		SubImage(r image.Rectangle) image.Image
	}

	if si, ok := src.(subImager); ok {
		return si.SubImage(cropRect)
	}

	return src
}

func drawToRGBA(src image.Image) *image.RGBA {
	if rgba, ok := src.(*image.RGBA); ok {
		return rgba
	}
	bounds := src.Bounds()
	dst := image.NewRGBA(image.Rect(0, 0, bounds.Dx(), bounds.Dy()))
	draw.Draw(dst, dst.Bounds(), src, bounds.Min, draw.Src)
	return dst
}

// ⚡ Ultra-fast direct memory slice access (Zero interface overhead)
func resizeRGBADirect(src *image.RGBA, targetW, targetH int) *image.RGBA {
	sw, sh := src.Bounds().Dx(), src.Bounds().Dy()
	if sw == 0 || sh == 0 {
		return image.NewRGBA(image.Rect(0, 0, targetW, targetH))
	}

	dst := image.NewRGBA(image.Rect(0, 0, targetW, targetH))
	sPix := src.Pix
	sStride := src.Stride
	dPix := dst.Pix
	dStride := dst.Stride

	// Precalculate X Mapping Lookup Table
	xMap := make([]int, targetW)
	for x := 0; x < targetW; x++ {
		xMap[x] = (x * sw / targetW) * 4
	}

	for y := 0; y < targetH; y++ {
		sy := y * sh / targetH
		sOffBase := sy * sStride
		dOffBase := y * dStride

		for x := 0; x < targetW; x++ {
			sOff := sOffBase + xMap[x]
			dOff := dOffBase + (x * 4)

			dPix[dOff] = sPix[sOff]         // R
			dPix[dOff+1] = sPix[sOff+1]     // G
			dPix[dOff+2] = sPix[sOff+2]     // B
			dPix[dOff+3] = sPix[sOff+3]     // A
		}
	}
	return dst
}

func sendEvent(evt ProgressEvent) {
	bytes, _ := json.Marshal(evt)
	fmt.Println(string(bytes))
}