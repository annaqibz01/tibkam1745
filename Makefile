# =============================================================================
# VARIABLES & DYNAMIC SIDECAR DISCOVERY
# =============================================================================
BIN_DIR       := src-tauri/bin
SIDECAR_DIR   := sidecars
SIDECAR_DIRS  := $(wildcard $(SIDECAR_DIR)/*)
SIDECAR_NAMES := $(notdir $(SIDECAR_DIRS))

.PHONY: help dev tauri sidecars sidecar-printer-service typegen check build clean

# -----------------------------------------------------------------------------
# MENU BANTUAN LENGKAP & SAFE UNTUK WINDOWS
# -----------------------------------------------------------------------------
help:
	@echo "================================================================="
	@echo "                TIBKAM 1745 - MAKEFILE COMMANDS                  "
	@echo "================================================================="
	@echo "  make dev                 : Jalankan Vite Dev Server (Frontend)"
	@echo "  make tauri               : Jalankan Tauri Desktop (Dev Mode)"
	@echo "  make sidecars            : Build SEMUA sidecar Go secara otomatis"
	@echo "  make sidecar-printer-service : Build sidecar printer_service.exe"
	@echo "  make typegen             : Generate TypeScript types dari PocketBase"
	@echo "  make check               : Cek error kompilasi Rust (cargo check)"
	@echo "  make build               : Build installer production (.exe)"
	@echo "  make clean               : Bersihkan dist & build artifacts"
	@echo "================================================================="
	@echo "  Sidecar terdeteksi saat ini : $(SIDECAR_NAMES)"
	@echo "================================================================="

# 🚀 DEVELOPMENT
dev:
	npm run dev

tauri:
	npx tauri dev

# 🖨️ SIDECAR BUILDERS
sidecars: sidecar-printer-service
	@echo "✅ Semua sidecar berhasil dikompilasi ke $(BIN_DIR)/"

sidecar-printer-service:
	@echo "🔨 Compiling Go Printer Service..."
	cd sidecars/printer-service && go build -ldflags="-H windowsgui -s -w" -o ../../$(BIN_DIR)/printer_service.exe main.go
	@echo "✅ Done: $(BIN_DIR)/printer_service.exe"

# 🧬 POCKETBASE & RUST
typegen:
	npm run typegen

check:
	cd src-tauri && cargo check

# 📦 PRODUCTION BUILD (Otomatis compile semua sidecar dulu)
build: sidecars
	@echo "🚀 Building Production Application..."
	npx tauri build

# 🧹 CLEANUP OPTIONS

# Clean ringan (hanya frontend dist, kompilasi Rust tetap instan)
clean:
	@echo "🧹 Removing frontend build artifacts..."
	@if exist dist rmdir /s /q dist
	@echo "✅ Frontend dist cleared."

# Clean pintar Rust menggunakan cargo-sweep (jika terinstall)
sweep:
	@echo "🧹 Sweeping old Rust build artifacts (>7 days)..."
	cd src-tauri && cargo sweep --time 7

# Clean total Rust (hanya jalankan saat SSD benar-benar penuh)
clean-rust:
	@echo "🔥 Purging entire Rust target directory..."
	cd src-tauri && cargo clean
	@echo "⚠️ Target cleared. Next build will be a cold build."