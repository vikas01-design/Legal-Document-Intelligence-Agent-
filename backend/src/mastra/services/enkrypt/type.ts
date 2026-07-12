export interface GuardResult {
  safe: boolean;
  message: string;
  riskScore?: number;
  raw?: any;
}