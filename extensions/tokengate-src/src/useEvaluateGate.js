import { useMemo, useState, useCallback } from "react";
import {
  getGateContextClient,
} from "@shopify/gate-context-client";
import { API_HOST } from "../config";
import { getGate } from "./helpers/getGate";

const gateContextClient =
  getGateContextClient({
    backingStore: "ajaxApi",
    shopifyGateContextGenerator: async (data) => {
      try {
        const existing = await gateContextClient.read();
        return mergeGateContext(existing, data);
      } catch(e) {
        return data;
      }

      // merges existing gate context entries
      function mergeGateContext(existing, add) {
        const entriesById = existing.reduce((acc, item) => {
          acc[item.id] = item;
          return acc;
        }, {});
        add.forEach(item => entriesById[item.id] = item);
        return Object.keys(entriesById).map(id => entriesById[id]);
      }
    },
  });


export const useEvaluateGate = () => {
  const gate = getGate();
  const [gateEvaluation, setGateEvaluation] = useState();
  const productId = getProductId();
  const evaluateGate = useCallback(
    async ({ address, message, signature }) => {
      try{
        const response = await fetch(`${API_HOST}/public/gateEvaluation`, {
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
            networkId: gate.requirements?.conditions[0]?.networkId || 80001
          }),
        });
        const json = await response.json();   //{gateContext: [getHmac({id: gateConfigurationGid})], unlockingTokens};
        if (!response?.ok) {
          throw new Error(JSON.stringify(json));
        }
        setGateEvaluation(json);
        await gateContextClient.write(json.gateContext)
        .catch(e => {
          console.log(e);
          throw new Error('Failed to write to gate context')
        });
      } catch(err){
        console.log(err);
      }
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


function getShopDomain() {
  return window.Shopify.shop;
}
function getProductId() {
  return document.getElementById("tokengating-example-app").dataset.product_id;
}