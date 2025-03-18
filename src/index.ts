/**
 * react-form-shield
 *
 * A comprehensive anti-spam solution for React forms.
 *
 * @module react-form-shield
 */

// Re-export everything from client
export * from './client';

// Export server-side functionality separately
// This allows tree-shaking to work properly
// Users can import server-side functionality with:
// import { formShieldMiddleware } from 'react-form-shield/server';
