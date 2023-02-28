import { useEffect, useState } from "react";
import { Tokengate } from "@shopify/tokengate";
import {
  ConnectButton,
  ConnectWalletProvider,
  useConnectWallet,
} from "@shopify/connect-wallet";
import { getDefaultConnectors } from "@shopify/connect-wallet";
import { configureChains, createClient, WagmiConfig } from "wagmi";
import { polygon } from "wagmi/chains";
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
        networkId: 137
      });
    },
  });
  const { requirements, reaction } = getGate();
  return (
    <Tokengate
      isConnected={Boolean(wallet)}
      connectButton={<ConnectButton />}
      isLoading={false}
      requirements={requirements}
      reaction={reaction}
      isLocked={isLocked}
      unlockingTokens={unlockingTokens}
    />
  );
};

export const App = () => {
  return (
    <WagmiConfig client={client}>
      <ConnectWalletProvider chains={chains} wallet={undefined}>
        <_App />
        version 4
      </ConnectWalletProvider>
    </WagmiConfig>
  );
};

const getGate = () => window.myAppGates?.[0] || {};

const { chains, provider, webSocketProvider } = configureChains(
  [polygon],
  [publicProvider()]
);

const { connectors } = getDefaultConnectors({ chains });

const client = createClient({
  autoConnect: true,
  connectors,
  provider,
  webSocketProvider,
});
