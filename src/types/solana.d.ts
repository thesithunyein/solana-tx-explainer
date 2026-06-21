declare module "@solana/web3.js" {
  export class Connection {
    constructor(endpoint: string, commitment?: string);
    getTransaction(
      signature: string,
      config?: { maxSupportedTransactionVersion?: boolean; commitment?: string }
    ): Promise<any>;
    getLatestBlockhash(): Promise<{ blockhash: string; lastValidBlockHeight: number }>;
    getBalance(publickey: any): Promise<number>;
    getMinimumBalanceForRentExemption(dataLength: number): Promise<number>;
  }
  export class PublicKey {
    constructor(value: string | Uint8Array);
    toBuffer(): Buffer;
    toBase58(): string;
    equals(other: PublicKey): boolean;
    static findProgramAddressSync(
      seeds: (Buffer | Uint8Array)[],
      programId: PublicKey
    ): [PublicKey, number];
  }
}
