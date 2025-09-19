import * as bcrypt from 'bcryptjs';

/**
 * Porovná heslo s jeho hashem
 * @param password Heslo v čistém textu
 * @param hash Hash hesla
 * @returns true pokud heslo odpovídá hashi
 */
export async function comparePasswords(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

/**
 * Vytvoří hash z hesla
 * @param password Heslo v čistém textu
 * @returns Hash hesla
 */
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}