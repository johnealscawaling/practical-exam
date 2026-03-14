export const environmentConfig = {
  credentials: {
    valid: {
      email: process.env.TEST_EMAIL || 'qa-test@kilde.sg',
      password: process.env.TEST_PASSWORD || 'TestPassword123!',
    },
    invalid: {
      email: 'wrong@email.com',
      password: 'WrongPassword',
    },
  },
};
