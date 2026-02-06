import { supabase } from "@/integrations/supabase/client";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface CallEdgeFunctionOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: Record<string, unknown>;
  headers?: Record<string, string>;
}

/**
 * Helper centralizado para chamar Edge Functions com autenticação
 * Centraliza tratamento de erros e autenticação
 */
export async function callEdgeFunction<T = unknown>(
  functionName: string,
  options: CallEdgeFunctionOptions = {}
): Promise<T> {
  const { method = "POST", body, headers = {} } = options;

  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token;

  if (!token) {
    throw new ApiError("Usuário não autenticado", 401, "UNAUTHENTICATED");
  }

  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${functionName}`;

  const response = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    let errorMessage = "Erro na requisição";
    let errorCode: string | undefined;

    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorData.message || errorMessage;
      errorCode = errorData.code;
    } catch {
      errorMessage = await response.text();
    }

    throw new ApiError(errorMessage, response.status, errorCode);
  }

  // Handle empty responses
  const text = await response.text();
  if (!text) {
    return {} as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    return text as unknown as T;
  }
}

/**
 * Helper para requisições GET com query params
 */
export async function callEdgeFunctionGet<T = unknown>(
  functionName: string,
  params?: Record<string, string | number | boolean>
): Promise<T> {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token;

  if (!token) {
    throw new ApiError("Usuário não autenticado", 401, "UNAUTHENTICATED");
  }

  let url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${functionName}`;
  
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    let errorMessage = "Erro na requisição";
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorData.message || errorMessage;
    } catch {
      errorMessage = await response.text();
    }
    throw new ApiError(errorMessage, response.status);
  }

  const text = await response.text();
  if (!text) {
    return {} as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    return text as unknown as T;
  }
}
