const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
  throw new Error('JWT_SECRET must be set in the environment. Copy .env.example to .env and configure it.');
}

export default jwtSecret;