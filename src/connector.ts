/* eslint-disable class-methods-use-this */
import {
    initConfig,
    connect,
    EvmConfig,
    disconnect,
    getConnectedAddress,
} from '@joyid/evm';
import { Chain, Connector } from 'wagmi';
import { UserRejectedRequestError, custom, createWalletClient } from 'viem';
import { JoyIdProvider } from './joyidProvider';

interface JoyIdConnectorOptions {
    chains: Chain[];
    options: EvmConfig;
}

export class JoyIdConnector extends Connector<JoyIdProvider, EvmConfig> {
    public id: string = 'joyid';

    public name: string = 'JoyID';

    public ready: boolean = true;

    private chainId: number;

    private provider: JoyIdProvider;

    constructor({ chains, options }: JoyIdConnectorOptions) {
        super({ chains, options });
        initConfig(options);
        this.chainId = options.network?.chainId || chains?.[0].id;
        this.provider = new JoyIdProvider(chains, options);
    }

    public async connect(options?: { chainId?: number }) {
        const account = getConnectedAddress();
        if (account) {
            const chainId = options?.chainId || this.chains[0].id;
            this.chainId = chainId;
            return {
                account,
                chain: {
                    id: chainId,
                    unsupported: false,
                },
            };
        }
        try {
            const account = await connect();
            const chainId = options?.chainId || this.chains[0].id;
            this.chainId = chainId;
            return {
                account,
                chain: {
                    id: chainId,
                    unsupported: false,
                },
            };
        } catch (error) {
            if (
                error instanceof Error &&
                error?.message.includes('User rejected')
            ) {
                throw new UserRejectedRequestError(error);
            }
            throw error;
        }
    }

    async getWalletClient() {
        const chain = this.chains.find((x) => x.id === this.chainId);
        const account = await this.getAccount();
        if (chain == null) {
            throw new Error(`Unsupported chain id: ${this.chainId}`);
        }
        if (account == null) {
            throw new Error(`No connected account`);
        }
        return createWalletClient({
            account: account!,
            chain,
            transport: custom(this.provider),
        });
    }

    public disconnect(): Promise<void> {
        return new Promise<void>((resolve) => {
            disconnect();
            resolve();
        });
    }

    public isAuthorized(): Promise<boolean> {
        return Promise.resolve(getConnectedAddress() !== null);
    }

    public getAccount() {
        const address = getConnectedAddress();
        if (address == null) {
            throw new Error('No connected account');
        }
        return Promise.resolve(address);
    }

    public switchChain(chainId: number): Promise<Chain> {
        const chain = this.chains.find((c) => c.id === chainId);
        if (chain == null) {
            throw new Error(
                `Unsupported chain id: ${chainId}, chainId must be one of ${this.chains
                    .map((c) => c.id)
                    .join(',')}`
            );
        }
        const config = initConfig({
            rpcURL: chain.rpcUrls.default.http[0],
            network: {
                chainId: chain.id,
                name: chain.name,
            },
        });
        this.chainId = chainId;
        this.provider = new JoyIdProvider(this.chains, config);
        return Promise.resolve(chain);
    }

    public getChainId() {
        return Promise.resolve(this.chainId);
    }

    public getProvider(_config?: { chainId?: number }): Promise<JoyIdProvider> {
        return Promise.resolve(this.provider);
    }

    protected onDisconnect() {
        //
    }

    protected onChainChanged(_chainId: number) {
        //
    }

    protected onAccountsChanged(_accounts: `0x${string}`[]): void {
        //
    }
}
