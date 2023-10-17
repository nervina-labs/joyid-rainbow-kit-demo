import { Chain, Wallet } from '@rainbow-me/rainbowkit';
import { EvmConfig } from '@joyid/evm';
import { JoyIdConnector } from './connector';

export interface JoyIdWalletOptions {
    chains: Chain[];
    options: EvmConfig;
}

export const JoyIdWallet = ({
    chains,
    options,
}: JoyIdWalletOptions): Wallet => ({
    id: 'joyid',
    name: 'JoyID',
    iconUrl: 'https://joy.id/logo.png',
    iconBackground: '#fff',
    downloadUrls: {
        browserExtension: 'https://unipass.id',
    },
    createConnector: () => {
        const connector = new JoyIdConnector({
            chains,
            options,
        });

        return {
            connector,
            // mobile: {
            //     getUri: async () => {
            //         try {
            //             await connector.connect();
            //         } catch (e) {
            //             console.error('Failed to connect');
            //         }
            //         return '';
            //     },
            // },
            // desktop: {
            //     getUri: async () => {
            //         try {
            //             await connector.connect();
            //         } catch (e) {
            //             console.error('Failed to connect');
            //         }
            //         return '';
            //     },
            // },
        };
    },
});
