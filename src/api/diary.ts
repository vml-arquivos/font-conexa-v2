import http from './http';

export interface DiaryEvent {
  id: string;
  type: string;
  title: string;
  description: string;
  eventDate: string;
  childId: string;
  classroomId: string;
  planningId: string;
  curriculumEntryId: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export interface CreateDiaryEventDto {
  type: string;
  title: string;
  description: string;
  eventDate: string;
  childId: string;
  classroomId: string;
  planningId: string;
  curriculumEntryId: string;
}

export async function getDiaryEvents(): Promise<DiaryEvent[]> {
  const response = await http.get('/diary-events');
  return response.data;
}

export async function createDiaryEvent(data: CreateDiaryEventDto): Promise<DiaryEvent> {
  const response = await http.post('/diary-events', data);
  return response.data;
}
