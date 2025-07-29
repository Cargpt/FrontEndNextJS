type Method = "GET" | "POST" | "PUT" | "DELETE";

interface RequestConfig {
  headers?: Record<string, string>;
  timeout?: number;
  params?: Record<string, string | number>; // for GET query params
}

interface ErrorResponse {
  status: number;
  statusText: string;
  data?: any;
}

function serializeParams(params: Record<string, string | number>): string {
  return new URLSearchParams(
    Object.entries(params).map(([key, val]) => [key, String(val)])
  ).toString();
}

function getTokenFromCookies(): string | null {
  const name = "token=";
  const decodedCookie = decodeURIComponent(document.cookie);
  const cookies = decodedCookie.split(";");

  for (let cookie of cookies) {
    cookie = cookie.trim();
    if (cookie.startsWith(name)) {
      return cookie.substring(name.length);
    }
  }

  return null;
}

function createAxiosLike(
  baseURL = "",
  getHeaders?: () => Record<string, string>
) {
  const defaultHeaders = {
    "Content-Type": "application/json",
  };

  async function request<T = any>(
    method: Method,
    url: string,
    data?: any,
    config: RequestConfig = {}
  ): Promise<T> {
    const controller = new AbortController();
    const timeout = config.timeout ?? 5000000;

    // Handle GET params
    if (method === "GET" && config.params) {
      const queryString = serializeParams(config.params);
      url += (url.includes("?") ? "&" : "?") + queryString;
    }

    const headers: Record<string, string> = {
      ...defaultHeaders,
      ...getHeaders?.(),
      ...config.headers,
    };

    const options: RequestInit = {
      method,
      headers,
      signal: controller.signal,
    };

    if (data && method !== "GET") {
      options.body = JSON.stringify(data);
    }

    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(baseURL + url, options);
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error: ErrorResponse = {
          status: response.status,
          statusText: response.statusText,
          data: errorData,
        };
        throw error;
      }

      const contentType = response.headers.get("Content-Type") ?? "";
      if (contentType.includes("application/json")) {
        return (await response.json()) as T;
      }
      return (await response.text()) as unknown as T;
    } catch (error: any) {
      console.error("Request failed:", error);
      if (error.name === "AbortError") {
        throw { message: "Request timed out", timeout: true };
      }
      throw error;
    }
  }

  return {
    get: <T = any>(url: string, config?: RequestConfig) =>
      request<T>("GET", url, undefined, config),
    post: <T = any>(url: string, data?: any, config?: RequestConfig) =>
      request<T>("POST", url, data, config),
    put: <T = any>(url: string, data?: any, config?: RequestConfig) =>
      request<T>("PUT", url, data, config),
    delete: <T = any>(url: string, config?: RequestConfig) =>
      request<T>("DELETE", url, undefined, config),
  };
}

// Base URL from environment variable
const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

// Axios-like instance without token
const axiosInstance = createAxiosLike(baseURL);

const axiosInstance1 = createAxiosLike(baseURL, () => {
  const token = getTokenFromCookies();
  if (token) {
    return { Authorization: `Bearer ${token}` } as Record<string, string>;
  }
  return {} as Record<string, string>;
});
export { axiosInstance, axiosInstance1 };
