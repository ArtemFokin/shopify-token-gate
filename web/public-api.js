import { createHmac } from "crypto";
import cors from "cors";
import Web3 from "web3";
import { Alchemy, Network } from "alchemy-sdk";

import { getContractAddressesFromGate } from "./api/gates.js";

const web3 = new Web3();

const ALCHEMY_API_KEY = "bSe3N2xxqL0Uuev82vvSXG4jTyJvj-8e";

export function configurePublicApi(app) {
  // this should be limited to app domains that have your app installed
  const corsOptions = {
    origin: "*",
  };

  // Configure CORS to allow requests to /public from any origin
  // enables pre-flight requests
  app.options("/public/*", cors(corsOptions));

  app.post("/public/gateEvaluation", cors(corsOptions), async (req, res) => {
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
    console.log({unlockingTokens})
    if (unlockingTokens.length === 0) {
      res.status(403).send("No unlocking tokens");
      return;
    }

    const payload = {
      id: gateConfigurationGid
    };

    const response = {gateContext: [getHmac(payload)], unlockingTokens};
    res.status(200).send(response);
  });
}

function getHmac(payload) {
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

const NETWORK_ID_TO_ALCHEMY = {
  1: Network.ETH_MAINNET,
  137: Network.MATIC_MAINNET,
  5: Network.ETH_GOERLI,
  80001: Network.MATIC_MUMBAI,
}

async function getUserTokenForContract({
  address,
  contractAddresses,
  networkId,
}) {
  // this could be some lookup against some node or a 3rd party service like Alchemy

  if(!NETWORK_ID_TO_ALCHEMY[networkId]) return [];

  const config = {
    apiKey: ALCHEMY_API_KEY,
    network: NETWORK_ID_TO_ALCHEMY[networkId],
  };
  const alchemy = new Alchemy(config);

  // Get owner of NFT
  console.log(config, address, contractAddresses)
  const {ownedNfts} = await alchemy.nft.getNftsForOwner(address, {
    contractAddresses,
    pageSize: 1
  });
  console.log({ownedNfts})
  return ownedNfts;
}
