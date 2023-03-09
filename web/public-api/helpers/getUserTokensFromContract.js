import { Alchemy, Network } from "alchemy-sdk";
import { ALCHEMY_API_KEY } from "../../constants.js";

const NETWORK_ID_TO_ALCHEMY = {
  1: Network.ETH_MAINNET,
  137: Network.MATIC_MAINNET,
  5: Network.ETH_GOERLI,
  80001: Network.MATIC_MUMBAI,
}

export async function getUserTokenForContract({
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