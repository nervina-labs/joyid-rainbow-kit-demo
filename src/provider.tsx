import { WagmiConfig, createConfig, configureChains } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';
import { sepolia, polygonMumbai } from 'wagmi/chains';
import {
    connectorsForWallets,
    RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { JoyIdWallet } from '@joyid/rainbowkit'
import { injectedWallet, coinbaseWallet } from '@rainbow-me/rainbowkit/wallets';
import '@rainbow-me/rainbowkit/styles.css';

export const { chains, publicClient } = configureChains(
    [sepolia, polygonMumbai],
    [publicProvider()]
);

const connectors = connectorsForWallets([
    {
        groupName: 'Recommended',
        wallets: [
            JoyIdWallet({
                chains,
                options: {
                    name: 'JoyID RainbowKit demo',
                    logo: 'https://fav.farm/🆔',
                    joyidAppURL: 'https://testnet.joyid.dev',
                },
            }),
            injectedWallet({ chains, shimDisconnect: true }),
            coinbaseWallet({ chains, appName: 'JoyID Demo' }),
            // rainbowWallet({ chains, shimDisconnect: true }),
        ],
    },
]);

const config = createConfig({
    autoConnect: true,
    publicClient,
    connectors,
});

export const Provider: React.FC<React.PropsWithChildren> = ({ children }) => {
    return (
        <WagmiConfig config={config}>
            <RainbowKitProvider chains={chains}>{children}</RainbowKitProvider>
        </WagmiConfig>
    );
};
