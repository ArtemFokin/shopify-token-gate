import { useMemo, useState, useCallback } from "react";
export const host = "https://65ca-109-75-34-216.eu.ngrok.io";
export const useEvaluateGate = () => {
  const gate = getGate();
  const [gateEvaluation, setGateEvaluation] = useState();
  const productId = getProductId();
  const evaluateGate = useCallback(
    async ({ address, message, signature, networkId }) => {
      const response = await fetch(`${host}/public/gateEvaluation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          productGid: `gid://shopify/Product/${productId}`,
          gateConfigurationGid: `gid://shopify/GateConfiguration/${gate.id}`,
          shopDomain: getShopDomain(),
          address,
          message,
          signature,
          networkId,
        }),
      });
      const json = await response.json();
      setGateEvaluation(json);
    },
    [setGateEvaluation, gate]
  );

  const {unlockingTokens, isLocked} = useMemo(() => {
    const {unlockingTokens} = gateEvaluation || {};
    const isLocked = !Boolean(unlockingTokens?.length);

    return {
      unlockingTokens,
      isLocked,
    }
  }, [gateEvaluation])

  return {
    evaluateGate,
    gateEvaluation,
    unlockingTokens,
    isLocked,
  };
};

// This function also present in App.jsx
const getGate = () => window.myAppGates?.[0] || {}
function getShopDomain() {
  return window.Shopify.shop;
}
function getProductId() {
  return document.getElementById("tokengating-example-app").dataset.product_id;
}