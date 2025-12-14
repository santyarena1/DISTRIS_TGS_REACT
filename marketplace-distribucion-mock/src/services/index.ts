/**
 * Punto de entrada para los servicios
 * Exporta la implementación mock actual
 * Más adelante, cambiar esta exportación para usar la implementación HTTP real
 */

import { mockApi } from './mock/mockApi';
import { ApiClient } from './apiClient';

// Por ahora usamos la implementación mock
export const apiClient: ApiClient = mockApi;

// Placeholder para futura implementación HTTP
// export const apiClient: ApiClient = httpApi;

