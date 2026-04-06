import bcrypt from "bcryptjs";

export async function verifyCredentials(
  username: string,
  password: string
): Promise<boolean> {
  const envUsername = process.env.AUTH_USERNAME;
  const envPasswordHash = process.env.AUTH_PASSWORD_HASH;

  if (!envUsername || !envPasswordHash) {
    return false;
  }

  if (username !== envUsername) {
    return false;
  }

  return bcrypt.compare(password, envPasswordHash);
}
