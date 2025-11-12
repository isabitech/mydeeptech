// encryption.ts
export class Encryption {
  private static encoder = new TextEncoder();
  private static decoder = new TextDecoder();

  private static async getKey(): Promise<CryptoKey> {
    // Pad or trim the secret key to 32 bytes for AES-256
    const secret = import.meta.env.VITE_PUBLIC_SECRET_KEY || "default_secret";
    const keyMaterial = this.encoder.encode(secret.padEnd(32, "0").slice(0, 32));

    return crypto.subtle.importKey(
      "raw",
      keyMaterial,
      { name: "AES-GCM" },
      false,
      ["encrypt", "decrypt"]
    );
  }

  static async encrypt(value: string): Promise<{ data: string; iv: string }> {
    const key = await this.getKey();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoded = this.encoder.encode(value);

    const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoded);
    return {
      data: this.arrayBufferToBase64(encrypted),
      iv: this.arrayBufferToBase64(iv),
    };
  }

  static async decrypt(base64Data: string, base64Iv: string): Promise<string> {
    const key = await this.getKey();
    const encrypted = this.base64ToArrayBuffer(base64Data);
    const iv = new Uint8Array(this.base64ToArrayBuffer(base64Iv));

    const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, encrypted);
    return this.decoder.decode(decrypted);
  }

  // --- Helpers ---
  private static arrayBufferToBase64(buffer: ArrayBuffer): string {
    return btoa(String.fromCharCode(...new Uint8Array(buffer)));
  }

  private static base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }
}
