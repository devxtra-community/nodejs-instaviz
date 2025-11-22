import crypto from 'crypto';

export const hashToken = (token: string): string => {
<<<<<<< HEAD
  return crypto.createHash('sha256').update(token).digest('hex');
=======
  return crypto.createHash("sha256").update(token).digest("hex"); //always converts input into a 64-character hexadecimal string
>>>>>>> riyas
};
