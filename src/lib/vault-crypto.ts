import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto"

const ALGORITHM = "aes-256-gcm"
const LEGACY_FALLBACK_KEY_SHA256 = Buffer.from(
  "e7e045bdb1d08766398eb509cabc2452b4df6751a60f36b2ca0bf0298d6c1249",
  "hex",
)

function getVaultKey() {
  const material =
    process.env.VAULT_ENCRYPTION_KEY ||
    process.env.JWT_SECRET ||
    "novapratalabs-vault-fallback-key"

  return createHash("sha256").update(material).digest()
}

export function encryptVaultSecret(secret: string) {
  const iv = randomBytes(12)
  const key = getVaultKey()
  const cipher = createCipheriv(ALGORITHM, key, iv)
  const encrypted = Buffer.concat([cipher.update(secret, "utf8"), cipher.final()])
  const tag = cipher.getAuthTag()

  return [iv.toString("base64"), tag.toString("base64"), encrypted.toString("base64")].join(".")
}

export function decryptVaultSecret(payload: string) {
  const [ivB64, tagB64, dataB64] = payload.split(".")
  if (!ivB64 || !tagB64 || !dataB64) {
    throw new Error("Encrypted vault payload is invalid")
  }

  const iv = Buffer.from(ivB64, "base64")
  const tag = Buffer.from(tagB64, "base64")
  const encrypted = Buffer.from(dataB64, "base64")
  const key = getVaultKey()

  try {
    const decipher = createDecipheriv(ALGORITHM, key, iv)
    decipher.setAuthTag(tag)
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()])
    return decrypted.toString("utf8")
  } catch (error) {
    const usingFallback =
      !process.env.VAULT_ENCRYPTION_KEY &&
      !process.env.JWT_SECRET &&
      process.env.NODE_ENV !== "production"

    if (!usingFallback) {
      throw error
    }

    const decipherLegacy = createDecipheriv(ALGORITHM, LEGACY_FALLBACK_KEY_SHA256, iv)
    decipherLegacy.setAuthTag(tag)
    const decryptedLegacy = Buffer.concat([decipherLegacy.update(encrypted), decipherLegacy.final()])
    return decryptedLegacy.toString("utf8")
  }
}
