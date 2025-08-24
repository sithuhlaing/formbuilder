
export type ValidationType = "none" | "email" | "number" | "custom";

export interface ValidationRule {
  type: ValidationType;
  message?: string;
  pattern?: string;
  min?: number;
  max?: number;
  required?: boolean;
}
