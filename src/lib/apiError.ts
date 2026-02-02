import axios from "axios";

export function getApiErrorMessage(err: unknown): string {
  if (!axios.isAxiosError(err)) return "Có lỗi xảy ra";

  const data: any = err.response?.data;

  // ưu tiên message trong chuẩn BE
  const msg = data?.message ?? data?.error ?? err.message;

  if (Array.isArray(msg)) return msg.join(", ");
  if (typeof msg === "string") return msg;

  return "Có lỗi xảy ra";
}
