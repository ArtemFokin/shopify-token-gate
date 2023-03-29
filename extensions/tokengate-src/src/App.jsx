import React, { useEffect } from "react";
import { Tokengate } from "@shopify/tokengate";
import {
  ConnectButton,
  ConnectWalletProvider,
  useConnectWallet,
} from "@shopify/connect-wallet";
import { getDefaultConnectors } from "@shopify/connect-wallet";
import { configureChains, createClient, WagmiConfig } from "wagmi";
import { polygon, mainnet, polygonMumbai, goerli } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";
import { useEvaluateGate } from './useEvaluateGate';
import { getGate } from "./helpers/getGate";
import { displayGatedBlocks, hideGatedBlocks } from "./helpers/toggleGatedBlocks";



const _App = () => {
  const { isLocked, unlockingTokens, evaluateGate } = useEvaluateGate();
  const { requirements, reaction } = getGate();
  const gateRequired = requirements && reaction;
  const { wallet } = useConnectWallet({
    onConnect: (wallet) => {
      evaluateGate({
        address: wallet.address, 
        message: wallet.message, 
        signature: wallet.signature, 
      });
    },
  });
  useEffect(()=>{
    if(isLocked && gateRequired){
      hideGatedBlocks();
    } else {
      displayGatedBlocks();
    }
  }, [isLocked, gateRequired])
  
  if(!gateRequired) return null;
  return (
    <div style={{maxWidth: '600px', margin:"0 auto"}}>
      <Tokengate
        isConnected={Boolean(wallet)}
        connectButton={<ConnectButton />}
        isLoading={false}
        requirements={requirements}
        // reaction={reaction}
        reaction={{
          type:"exclusive_access",
        }}
        isLocked={isLocked}
        unlockingTokens={unlockingTokens}
      />
    </div>
  );
};

export const App = () => {
  return (
    <WagmiConfig client={client}>
      <ConnectWalletProvider chains={chains}>
        <_App />
      </ConnectWalletProvider>
    </WagmiConfig>
  );
};

const { chains, provider, webSocketProvider } = configureChains(
  [polygon, mainnet, polygonMumbai, goerli],
  [publicProvider()]
);

const { connectors } = getDefaultConnectors({ chains });

const client = createClient({
  autoConnect: true,
  connectors,
  provider,
  webSocketProvider,
});
