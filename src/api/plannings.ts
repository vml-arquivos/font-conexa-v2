import http from './http';

export interface Planning {
  id: string;
  title: string;
  description?: string;
  [key: string]: any;
}

export async function getPlannings(): Promise<Planning[]> {
  const response = await http.get('/plannings');
  return response.data;
}
