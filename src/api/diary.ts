import http from './http';

export interface DiaryEvent {
  id: string;
  title: string;
  date: string;
  description?: string;
  [key: string]: any;
}

export interface CreateDiaryEventDto {
  title: string;
  date: string;
  description?: string;
}

export async function getDiaryEvents(): Promise<DiaryEvent[]> {
  const response = await http.get('/diary-events');
  return response.data;
}

export async function createDiaryEvent(data: CreateDiaryEventDto): Promise<DiaryEvent> {
  const response = await http.post('/diary-events', data);
  return response.data;
}
