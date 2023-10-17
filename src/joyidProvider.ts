import {
    EIP1193RequestFn,
    EIP1474Methods,
    http,
    Address,
    Chain,
    Hex,
    isHex,
    bytesToString,
    toBytes,
} from 'viem';
import {
    EvmConfig,
    connect,
    getConnectedAddress,
    initConfig,
    sendTransaction,
    signMessage,
    signTypedData,
} from '@joyid/evm';

function convertHexToUtf8(value: string) {
    if (isHex(value)) {
        return bytesToString(toBytes(value));
    }

    return value;
}

export class JoyIdProvider {
    private chainId: number;

    private rpcUrl: string;

    private account: Address | null = null;

    private chains: Chain[];

    constructor(chains: Chain[], config: EvmConfig) {
        this.chainId = config.network?.chainId || chains[0].id;
        const rpcURL = config.rpcURL || chains[0].rpcUrls.default?.http[0];
        if (rpcURL == null) {
            throw new Error('No rpc url provided');
        }
        this.rpcUrl = rpcURL;
        this.account = getConnectedAddress();
        this.chains = chains;
        initConfig(config);
    }

    public async connect() {
        const account = await connect();
        this.account = account;
        return account;
    }

    request: EIP1193RequestFn<EIP1474Methods> = async (args) => {
        console.log(args);
        switch (args.method) {
            case 'eth_requestAccounts': {
                const account = await this.connect();
                this.account = account;
                return [account] as any;
            }
            case 'eth_accounts':
                return [this.account] as any;
            case 'eth_chainId':
                return this.chainId;
            case 'wallet_switchEthereumChain': {
                const [{ chainId }] = args.params as [
                    chain: { chainId: string }
                ];
                const chain = this.chains.find(
                    (c) => c.id === parseInt(chainId, 10)
                );
                if (chain == null) {
                    throw new Error(
                        `Unsupported chain id: ${chainId}, chainId must be one of ${this.chains
                            .map((c) => c.id)
                            .join(',')}`
                    );
                }
                return undefined;
            }
            case 'personal_sign': {
                const [data, address] = args.params as [
                    /** Data to sign */
                    data: Hex,
                    /** Address to use for signing */
                    address: Address
                ];
                const msg = convertHexToUtf8(data);
                const sig = await signMessage(
                    isHex(msg) ? toBytes(msg) : msg,
                    address
                );
                return sig;
            }
            case 'eth_sendTransaction': {
                const [tx] = args.params as [transaction: any];
                console.log(tx);
                const hash = await sendTransaction(tx);
                return hash;
            }
            case 'eth_signTypedData_v4': {
                const [address, message] = args.params as [
                    /** Address to use for signing */
                    address: Address,
                    /** Message to sign containing type information, a domain separator, and data */
                    message: string
                ];
                const msg = convertHexToUtf8(message);
                const sig = await signTypedData(JSON.parse(msg), address);
                return sig;
            }
            default: {
                const httpProvider = http(this.rpcUrl);
                const chain = this.chains.find((c) => c.id === this.chainId);
                if (chain == null) {
                    throw new Error(
                        `Unsupported chain id: ${
                            this.chainId
                        }, chainId must be one of ${this.chains
                            .map((c) => c.id)
                            .join(',')}`
                    );
                }
                return httpProvider({
                    chain,
                }).request(args);
            }
        }
    };
}
