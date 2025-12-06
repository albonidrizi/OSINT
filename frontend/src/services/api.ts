import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

export interface ScanRequest {
  domain: string;
  tool: 'THEHARVESTER' | 'AMASS';
  limit?: number;
  sources?: string;
}

export interface ScanResponse {
  id: number;
  domain: string;
  tool: 'THEHARVESTER' | 'AMASS';
  startTime: string;
  endTime: string | null;
  status: 'RUNNING' | 'COMPLETED' | 'FAILED';
  results: string | null;
  errorMessage: string | null;
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const scanApi = {
  initiateScan: async (request: ScanRequest): Promise<ScanResponse> => {
    const response = await api.post<ScanResponse>('/scans', request);
    return response.data;
  },

  getAllScans: async (): Promise<ScanResponse[]> => {
    const response = await api.get<ScanResponse[]>('/scans');
    return response.data;
  },

  getScanById: async (id: number): Promise<ScanResponse> => {
    const response = await api.get<ScanResponse>(`/scans/${id}`);
    return response.data;
  },

  clearHistory: async (): Promise<void> => {
    await api.delete('/scans');
  },
};

