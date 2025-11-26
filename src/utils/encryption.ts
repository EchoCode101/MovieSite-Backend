import crypto from "crypto";
import bcrypt from "bcrypt";
import createError from "http-errors";
import config from "../config/env.js";

const encryptionKey = config.encryptionKey;
if (!encryptionKey || Buffer.from(encryptionKey, "utf8").length !== 32) {
  throw new Error(
    "Encryption key must be 32 bytes long. Check your .env file."
  );
}



/**
 * Hash a password using bcrypt
 * @param password - Plain text password
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Compare a plain text password with a hashed password
 * @param password - Plain text password
 * @param hashedPassword - Hashed password to compare against
 * @returns True if passwords match, false otherwise
 */
export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

/**
 * Encrypt text using AES-256-CBC
 * @param text - Plain text to encrypt
 * @returns Encrypted text in format "iv:encrypted"
 */
export async function encrypt(text: string): Promise<string> {
  const iv = Buffer.from(config.iv, "utf8");
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(encryptionKey),
    iv
  );
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
}

/**
 * Decrypt encrypted text using AES-256-CBC
 * @param encryptedText - Encrypted text in format "iv:encrypted"
 * @returns Decrypted plain text
 */
export async function decrypt(encryptedText: string): Promise<string> {
  try {
    const [ivHex, encryptedHex] = encryptedText.split(":");
    if (!ivHex || !encryptedHex) {
      throw createError(401, "Invalid encrypted text format");
    }
    const iv = Buffer.from(ivHex, "hex");
    const decipher = crypto.createDecipheriv(
      "aes-256-cbc",
      Buffer.from(encryptionKey),
      iv
    );
    let decrypted = decipher.update(encryptedHex, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (error: any) {
    // If it's already an http-error, re-throw it
    if (error?.status || error?.statusCode) {
      throw error;
    }
    // Otherwise, wrap it in an http-error
    throw createError(401, `Decryption failed: ${error?.message || "Unknown error"}`);
  }
}


