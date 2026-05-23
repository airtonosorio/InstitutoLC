using System.Security.Cryptography;
using System.Text;

namespace InstitutoLC.Api.Data
{
    public static class EncryptionHelper
    {
        // 16-byte static IV to ensure deterministic encryption (allows exact queries on encrypted fields)
        private static readonly byte[] StaticIv = Encoding.UTF8.GetBytes("InstitutoLC_IV!!");

        public static string Encrypt(string plainText, string key)
        {
            if (string.IsNullOrEmpty(plainText)) return plainText;

            using (var aes = Aes.Create())
            {
                // Ensure the key is exactly 32 bytes (256 bits)
                aes.Key = Encoding.UTF8.GetBytes(key.PadRight(32).Substring(0, 32));
                aes.IV = StaticIv;

                using (var encryptor = aes.CreateEncryptor(aes.Key, aes.IV))
                {
                    using (var ms = new MemoryStream())
                    {
                        using (var cs = new CryptoStream(ms, encryptor, CryptoStreamMode.Write))
                        {
                            using (var sw = new StreamWriter(cs))
                            {
                                sw.Write(plainText);
                            }
                        }
                        return Convert.ToBase64String(ms.ToArray());
                    }
                }
            }
        }

        public static string Decrypt(string cipherText, string key)
        {
            if (string.IsNullOrEmpty(cipherText)) return cipherText;

            try
            {
                using (var aes = Aes.Create())
                {
                    aes.Key = Encoding.UTF8.GetBytes(key.PadRight(32).Substring(0, 32));
                    aes.IV = StaticIv;

                    using (var decryptor = aes.CreateDecryptor(aes.Key, aes.IV))
                    {
                        using (var ms = new MemoryStream(Convert.FromBase64String(cipherText)))
                        {
                            using (var cs = new CryptoStream(ms, decryptor, CryptoStreamMode.Read))
                            {
                                using (var sr = new StreamReader(cs))
                                {
                                    return sr.ReadToEnd();
                                }
                            }
                        }
                    }
                }
            }
            catch
            {
                // Return original text if decryption fails (fallback for legacy plaintext data)
                return cipherText;
            }
        }
    }
}
