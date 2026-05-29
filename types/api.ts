/**
 * types/api.ts
 * Mirrors the backend DTO shapes used in robot-recommendation-api.
 */

/* ─── Common wrappers ─────────────────────────────────────────────────────── */

export interface ApiResponse<T> {
  success: boolean;
  message: string | null;
  data: T;
}

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}

/* ─── Auth ────────────────────────────────────────────────────────────────── */

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  user: UserResponse;
}

export interface UserResponse {
  id: string;
  email: string;
  fullName: string;
  role: 'ADMIN' | 'SPECIALIST';
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

/* ─── File upload ─────────────────────────────────────────────────────────── */

export interface FileUploadResponse {
  id: string;
  originalFileName: string;
  storedFileName: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
  uploadedById: string;
}

/* ─── Requirements ────────────────────────────────────────────────────────── */

export type RobotType = 'CLEANING' | 'DELIVERY' | 'CONCIERGE';

export interface RequirementResponse {
  id: string;
  robotType: RobotType;
  rawInput: string | null;
  extractedData: Record<string, unknown> | null;
  sourceFileId: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

/* ─── Robots ──────────────────────────────────────────────────────────────── */

export type TestStatus = 'VERIFIED' | 'PENDING' | 'REJECTED';
export type BudgetBand = 'LOW' | 'MEDIUM' | 'HIGH' | 'PREMIUM';

export interface RobotResponse {
  id: string;
  brand: string;
  model: string;
  robotType: RobotType;
  testStatus: TestStatus;
  priceBand: BudgetBand;
  imageUrl: string | null;
  datasheetUrl: string | null;
  createdAt: string;
  spec: RobotSpecResponse | null;
}

export interface RobotSpecResponse {
  id: string;
  robotId: string;
  lengthMm: number | null;
  widthMm: number | null;
  heightMm: number | null;
  robotWeightKg: number | null;
  widthCleaningMm: number | null;
  brushPressureKg: number | null;
  vacuumPressureKpa: number | null;
  speedMs: number | null;
  noiseLevelDb: number | null;
  workStation: boolean | null;
  dockCharge: boolean | null;
  manualCharge: boolean | null;
  cleaningEfficiencySweepSqmH: number | null;
  cleaningEfficiencyScrubSqmH: number | null;
  cleaningEfficiencyMopSqmH: number | null;
  tankCapacityCleanL: number | null;
  tankCapacityWasteL: number | null;
  batteryType: string | null;
  batteryChargingTimeHr: number | null;
  batteryWorkTimeSweepHr: number | null;
  batteryWorkTimeScrubHr: number | null;
  minimumPassableWidthMm: number | null;
  minimumTurnWidthMm: number | null;
  maximumStepHeightMm: number | null;
  slopeAngleDeg: number | null;
  navigationLidar2d: boolean | null;
  navigationLidar3d: boolean | null;
  navigationCameraVslam: boolean | null;
  ipRating: string | null;
  hepa: boolean | null;
  outdoorIndoor: string | null;
  spotAi: boolean | null;
  createdAt: string;
  updatedAt: string;
}

/* ─── Recommendations ─────────────────────────────────────────────────────── */

export type RecommendationStatus = 'PENDING' | 'COMPLETED' | 'FAILED';

export interface RecommendationItemResponse {
  id: string;
  recommendationId: string;
  robot: RobotResponse;
  rankPosition: number;
  totalScore: number | null;
  aiReasoning: string | null;
  fitLevel: string | null;
  proposalTitle: string | null;
  proposalSummary: string | null;
  whyRecommended: string | null;
  matchedRequirements: string | null;
  businessValue: string | null;
  limitations: string | null;
  missingInformation: string | null;
  suggestedNextStep: string | null;
  createdAt: string;
}

export interface RecommendationResponse {
  id: string;
  requirementId: string;
  status: RecommendationStatus;
  aiExplanation: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  options: RecommendationItemResponse[];
}

/* ─── Proposals ───────────────────────────────────────────────────────────── */

export type ProposalStatus = 'DRAFT' | 'FINAL';

export interface GenerateProposalRequest {
  recommendationId: string;
  selectedRobotId: string;
}

export interface GeneratedProposalResponse {
  id: string;
  recommendationId: string;
  selectedRobotId: string;
  selectedRobotName: string;
  content: string | null;
  status: ProposalStatus;
  generatedById: string;
  createdAt: string;
  updatedAt: string;
}
