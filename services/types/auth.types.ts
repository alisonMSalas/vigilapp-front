// Tipos de TypeScript para autenticación - Backend Spring Boot

/**
 * Usuario retornado por el backend
 */
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role?: 'ADMIN' | 'USER' | 'VIEWER';
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Credenciales para login
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Datos necesarios para el registro
 * Incluye fotos de cédula y selfie
 */
export interface RegisterCredentials {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  fotoCedula: ImageAsset | null;
  selfie: ImageAsset | null;
}

/**
 * Representación de una imagen seleccionada
 */
export interface ImageAsset {
  uri: string;
  type: string;
  name: string;
  fileSize?: number;
}

/**
 * Respuesta del backend para registro
 */
export interface RegisterResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role?: string;
  createdAt?: string;
}

/**
 * Respuesta del backend para login
 * Spring Boot devuelve el token como string directo
 */
export interface LoginResponse {
  token: string;
}

/**
 * Estado de autenticación en la aplicación
 */
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

/**
 * Contexto de autenticación para React Context API
 */
export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (userData: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}
