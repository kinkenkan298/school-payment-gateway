export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type FraudAlertStatus = 'open' | 'reviewing' | 'resolved' | 'false_positive';

export interface FraudCheckResult {
  paymentId: string;
  merchantId: string;
  riskScore: number; // 0-100
  riskLevel: RiskLevel;
  reasons: string[];
  approved: boolean;
}

export interface FraudAlert {
  id: string;
  paymentId: string;
  merchantId: string;
  riskScore: number;
  riskLevel: RiskLevel;
  reasons: string[];
  status: FraudAlertStatus;
  createdAt: Date;
  updatedAt: Date;
}
