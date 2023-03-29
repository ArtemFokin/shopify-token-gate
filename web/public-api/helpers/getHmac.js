import { createHmac } from "crypto";

export const getHmac = (message) => {
  // secret-key will be embedded in the code
  const hmac = createHmac("sha256", "secret-key");
  hmac.update(message);
  return hmac.digest("hex");
}