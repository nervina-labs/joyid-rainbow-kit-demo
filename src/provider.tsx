import { WagmiConfig, createConfig, configureChains } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';
import { sepolia, polygonMumbai } from 'wagmi/chains';
import {
    connectorsForWallets,
    RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { injectedWallet } from '@rainbow-me/rainbowkit/wallets';
import { JoyIdWallet } from './rainbow';
import '@rainbow-me/rainbowkit/styles.css';

export const { chains, publicClient } = configureChains(
    [sepolia, polygonMumbai],
    [publicProvider()]
);

const connectors = connectorsForWallets([
    {
        groupName: 'Recommended',
        wallets: [
            injectedWallet({ chains, shimDisconnect: true }),
            JoyIdWallet({
                chains,
                options: {
                    name: 'JoyID demo',
                    logo: 'https://fav.farm/🆔',
                    joyidAppURL: 'https://testnet.joyid.dev',
                },
            }),
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
