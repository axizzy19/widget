import jwt from 'jsonwebtoken';

export class AuthService {
  generateToken(role: 'consumer' | 'admin', payload: any = {}) {
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    const expiresIn = '24h';

    return jwt.sign(
      {
        ...payload,
        role,
        iat: Math.floor(Date.now() / 1000),
      },
      secret,
      { expiresIn },
    );
  }

  getConsumerToken() {
    return this.generateToken('consumer', { type: 'api_consumer' });
  }

  getAdminToken() {
    return this.generateToken('admin', { type: 'administrator' });
  }
}