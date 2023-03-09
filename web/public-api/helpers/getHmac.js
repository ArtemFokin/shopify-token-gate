import { createHmac } from "crypto";

export const getHmac = (payload) => {
  const hmacMessage = payload.id;
  // secret-key will be embedded in the code
  const hmac = createHmac("sha256", "secret-key");
  hmac.update(hmacMessage);
  const hmacDigest = hmac.digest("hex");
  return {
    id: payload.id,
    hmac: hmacDigest,
  };
}