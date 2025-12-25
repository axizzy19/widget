export const JWT_CONFIG = {
  SECRET: process.env.JWT_SECRET || '8ab09c2a28b76f5e56520c5f73096d12ec2af7cd7b2ecd6735ccad2afb8d7a01',
  EXPIRES_IN: '24h',
  ALGORITHM: 'HS256',
} as const;

export interface JwtPayload {
  role: 'consumer' | 'admin';
  type: 'api_consumer' | 'administrator';
  iat: number;
  exp: number;
}