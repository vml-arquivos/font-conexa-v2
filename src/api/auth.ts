import http from './http';

export interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
}

export interface User {
  id: string;
  email: string;
  roles?: string[];
  [key: string]: any;
}

export interface MeResponse {
  user: User;
}

/**
 * Parsing tolerante do login response
 * Aceita: accessToken | access_token | token
 * Aceita: refreshToken | refresh_token (se existir)
 */
function parseLoginResponse(data: any): LoginResponse {
  const accessToken = data.accessToken || data.access_token || data.token;
  const refreshToken = data.refreshToken || data.refresh_token;

  if (!accessToken) {
    console.error('Login response inválido:', data);
    throw new Error(
      `Não foi possível encontrar token de acesso na resposta. Resposta recebida: ${JSON.stringify(data)}`
    );
  }

  return {
    accessToken,
    refreshToken,
  };
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const response = await http.post('/auth/login', { email, password });
  return parseLoginResponse(response.data);
}

export async function loadMe(): Promise<MeResponse> {
  const response = await http.get('/example/protected');
  return response.data;
}
