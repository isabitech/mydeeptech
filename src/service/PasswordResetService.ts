import { endpoints } from '../store/api/endpoints';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

class PasswordResetService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      console.log(`📡 Password Reset API: ${options.method || 'GET'} ${url}`);
      
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`❌ Password Reset API Error:`, error);
      throw error;
    }
  }

  /**
   * Request password reset for DTUsers
   */
  async requestDTUserPasswordReset(email: string): Promise<ApiResponse> {
    return this.request(endpoints.authDT.forgotPassword, {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  /**
   * Reset password for DTUsers with token
   */
  async resetDTUserPassword(
    token: string, 
    password: string, 
    confirmPassword: string
  ): Promise<ApiResponse> {
    return this.request(endpoints.authDT.resetPasswordWithToken, {
      method: 'POST',
      body: JSON.stringify({ token, password, confirmPassword }),
    });
  }

  /**
   * Verify reset token validity for DTUsers
   */
  async verifyResetToken(token: string): Promise<ApiResponse> {
    return this.request(`${endpoints.authDT.verifyResetToken}/${token}?type=dtuser`);
  }
}

export const passwordResetService = new PasswordResetService();
export default passwordResetService;