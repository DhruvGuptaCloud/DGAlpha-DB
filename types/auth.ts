export interface UserProfile {
  id: string;
  email: string;
  name: string;
  age: number;
  gender: string;
  city: string;
  phone: string;
  income_range: string;
  capital_bucket: string;
  experience_level: string;
  trading_duration: string;
  created_at: string;
}

export interface SignupFormData {
  // Step 1
  email: string;
  password: string;
  confirmPassword: string;
  // Step 2
  name: string;
  age: string;
  gender: string;
  city: string;
  phone: string;
  // Step 3
  income_range: string;
  capital_bucket: string;
  experience_level: string;
  trading_duration: string;
}
