import * as crypto from 'crypto';

export async function generateRefreshToken(
  byteLength = 70,
): Promise<string | undefined> {
  try {
    const refreshToken: string = await new Promise((resolve, reject) => {
      crypto.randomBytes(byteLength, (err, buffer) => {
        if (err) {
          reject(err);
        } else {
          resolve(buffer.toString('hex'));
        }
      });
    });

    return refreshToken;
  } catch (error) {
    console.log(`unable to generate refresh token error: ${error}`);
  }

  return undefined;
}
