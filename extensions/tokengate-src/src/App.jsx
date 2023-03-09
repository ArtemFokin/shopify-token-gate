import { useEffect, useState } from "react";
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

const _App = () => {
  const { isLocked, unlockingTokens, evaluateGate, gateEvaluation } = useEvaluateGate();
  const { wallet } = useConnectWallet({
    onConnect: (wallet) => {
      evaluateGate({
        address: wallet.address, 
        message: wallet.message, 
        signature: wallet.signature, 
      });
    },
  });
  const { requirements, reaction } = getGate();
  return (
    <div style={{maxWidth: '600px', margin:"0 auto"}}>
      <Tokengate
        isConnected={Boolean(wallet)}
        connectButton={<ConnectButton />}
        isLoading={false}
        requirements={requirements}
        reaction={reaction}
        isLocked={isLocked}
        unlockingTokens={unlockingTokens}
      />
    </div>
  );
};

export const App = () => {
  return (
    <WagmiConfig client={client}>
      <ConnectWalletProvider chains={chains} wallet={undefined}>
        <_App />
      </ConnectWalletProvider>
    </WagmiConfig>
  );
};

const getGate = () => window.myAppGates?.[0] || {};

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
