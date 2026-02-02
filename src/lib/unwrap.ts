import type { AxiosResponse } from "axios";
import type { ApiResponse } from "./apiTypes";

export async function unwrap<T>(p: Promise<AxiosResponse<ApiResponse<T>>>) {
  const res = await p;
  return res.data;
}
