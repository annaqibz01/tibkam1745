// src/utils/errorHandler.ts
export const parsePocketBaseError = (error: any): string => {
  if (!error) return "Terjadi kesalahan yang tidak diketahui.";

  if (typeof error === "string") return error;

  // Tangkap error message bawaan PocketBase Client / ClientResponseError
  if (error?.response?.message) {
    return error.response.message;
  }

  if (error?.data?.message) {
    return error.data.message;
  }

  if (error?.message) {
    return error.message;
  }

  return "Gagal memproses permintaan ke server.";
};