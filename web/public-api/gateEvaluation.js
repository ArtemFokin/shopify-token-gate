import Web3 from "web3";

import { getContractAddressesFromGate } from "../api/gates.js";
import { getUserTokenForContract } from "./helpers/getUserTokensFromContract.js";
import { getHmac } from "./helpers/getHmac.js";

const web3 = new Web3();

export const gateEvaluation = async (req, res) => {
  // evaluate the gate, message, and signature
  const { shopDomain, productGid, address, message, signature, gateConfigurationGid, networkId } = req.body;

  // not shown: verify the content of the message

  // verify signature
  const recoveredAddress = web3.eth.accounts.recover(message, signature);
  if (recoveredAddress !== address) {
    res.status(403).send("Invalid signature");
    return;
  }
  
  // retrieve relevant contract addresses from gates
  const requiredContractAddresses = await getContractAddressesFromGate({shopDomain, productGid});
  
  // now lookup nfts
  const unlockingTokens = await getUserTokenForContract({
    address,
    contractAddresses: requiredContractAddresses,
    networkId
  });
  if (unlockingTokens.length === 0) {
    res.status(403).send("No unlocking tokens");
    return;
  }

  const payload = {
    id: gateConfigurationGid
  };

  const response = {gateContext: [getHmac(payload)], unlockingTokens};
  res.status(200).send(response);
}