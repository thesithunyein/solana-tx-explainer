import { Connection, PublicKey } from "@solana/web3.js";

export interface DiagnosisResult {
  signature: string;
  network: string;
  status: "success" | "failed" | "not_found";
  error?: {
    code: string;
    name: string;
    raw: string;
  };
  rootCause?: string;
  evidence: string[];
  fix?: string;
  fixCode?: string;
  prevention?: string;
  computeUnits?: number;
  fee?: number;
  logs?: string[];
  programId?: string;
}

const ANCHOR_ERRORS: Record<number, string> = {
  0: "InstructionMissing",
  1: "InstructionFallbackNotFound",
  2: "InstructionDidNotDeserialize",
  3: "InstructionDidNotSerialize",
  4: "ImmutableAccount",
  5: "IncorrectProgramId",
  6: "AccountNotSigner",
  7: "AccountNotWritable",
  8: "AccountNotAssociated",
  9: "InsufficientFunds",
  10: "AccountAlreadyInitialized",
  11: "UninitializedAccount",
  12: "NotAssociated",
  13: "AmountExceedsActual",
  14: "ConstraintSeeds",
  15: "ConstraintZero",
  16: "ProgramIdPrefix",
  17: "AccountDiscriminatorAlreadySet",
  18: "AccountDiscriminatorNotFound",
  19: "AccountDiscriminatorMismatch",
  20: "DidNotDeserialize",
  21: "DidNotSerialize",
  22: "InsufficientFundsForRent",
  23: "InvalidAccountOwnership",
};

const SPL_ERRORS: Record<number, string> = {
  1: "InsufficientFunds",
  2: "AccountNotAssociated",
  3: "OwnerMismatch",
  4: "FixedSupply",
  5: "MintMismatch",
  6: "NotInitialized",
  7: "AmountExceedsSupply",
  8: "InvalidInstruction",
  9: "InvalidAccountOwner",
  10: "AccountAlreadyInitialized",
  11: "UninitializedState",
  12: "NotEnoughRent",
};

const TOKEN_2022_EXTRA: Record<number, string> = {
  18: "ExtensionTypeMismatch",
  19: "ExtensionAlreadyInitialized",
  20: "MintCannotFreeze",
  21: "MintHasAuthorityType",
  22: "AccountFrozen",
  23: "InvalidMintForExtension",
  24: "InsufficientFundsForFee",
  25: "ConflictingExtensionTypes",
  26: "ExtensionMismatch",
  27: "InvalidExtensionAccount",
};

const SYSTEM_ERRORS: Record<number, string> = {
  0: "AccountAlreadyInUse",
  1: "ResultWithNegativeLamports",
  2: "InvalidProgramId",
  3: "InvalidAccountDataLength",
  4: "MaxSeedLengthExceeded",
  5: "AddressWitherMismatch",
  6: "NonZeroAccountData",
  7: "UnbalancedInstruction",
  8: "IncorrectProgramId",
  9: "InvalidAccountData",
  10: "MaxAccountsDataAllocationsExceeded",
  11: "MaxAccountsExceeded",
};

const PROGRAM_IDS: Record<string, string> = {
  TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA: "SPL Token",
  TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb: "Token-2022",
  "11111111111111111111111111111111": "System",
  ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL: "Associated Token",
  ComputeBudget111111111111111111111111111111: "Compute Budget",
};

function getRpcUrl(network: string): string {
  const heliusKey = process.env.HELIUS_API_KEY;
  if (heliusKey && heliusKey !== "your_helius_api_key_here") {
    if (network === "devnet") {
      return `https://devnet.helius-rpc.com/?api-key=${heliusKey}`;
    }
    return `https://mainnet.helius-rpc.com/?api-key=${heliusKey}`;
  }
  if (network === "devnet") return "https://api.devnet.solana.com";
  return process.env.NEXT_PUBLIC_RPC_ENDPOINT || "https://api.mainnet-beta.solana.com";
}

function decodeError(err: any, programId?: string): { code: string; name: string; raw: string } | undefined {
  if (!err) return undefined;

  if (typeof err === "string") {
    return { code: "N/A", name: err, raw: err };
  }

  if (err.InstructionError) {
    const [index, detail] = err.InstructionError;
    if (typeof detail === "object" && detail.Custom !== undefined) {
      const decimalCode = detail.Custom;
      const hexCode = "0x" + decimalCode.toString(16);
      const anchorOffset = 0x1000;

      if (decimalCode >= anchorOffset) {
        const anchorIndex = decimalCode - anchorOffset;
        const name = ANCHOR_ERRORS[anchorIndex] ?? `Custom Anchor error #${anchorIndex}`;
        return { code: hexCode, name, raw: `Instruction #${index}: ${name} (${hexCode})` };
      }

      const programName = programId ? PROGRAM_IDS[programId] : undefined;
      if (programName === "SPL Token") {
        const name = SPL_ERRORS[decimalCode] ?? `Unknown SPL error`;
        return { code: hexCode, name, raw: `Instruction #${index}: ${name} (${hexCode})` };
      }
      if (programName === "Token-2022") {
        const name = TOKEN_2022_EXTRA[decimalCode] ?? SPL_ERRORS[decimalCode] ?? `Unknown Token-2022 error`;
        return { code: hexCode, name, raw: `Instruction #${index}: ${name} (${hexCode})` };
      }
      if (programName === "System") {
        const name = SYSTEM_ERRORS[decimalCode] ?? `Unknown System error`;
        return { code: hexCode, name, raw: `Instruction #${index}: ${name} (${hexCode})` };
      }

      return { code: hexCode, name: `Custom program error`, raw: `Instruction #${index}: custom error ${hexCode}` };
    }
    const typeName = typeof detail === "string" ? detail : JSON.stringify(detail);
    return { code: "N/A", name: typeName, raw: `Instruction #${index}: ${typeName}` };
  }

  if (err.TransactionError) {
    return { code: "N/A", name: err.TransactionError, raw: err.TransactionError };
  }

  return { code: "N/A", name: JSON.stringify(err), raw: JSON.stringify(err) };
}

function findFailingProgram(logs: string[]): string | undefined {
  for (let i = logs.length - 1; i >= 0; i--) {
    const match = logs[i].match(/^Program (\S+) failed/);
    if (match) return match[1];
  }
  return undefined;
}

function getFix(errorName: string, error?: { code: string; name: string }): { fix: string; fixCode: string; prevention: string } {
  const fixes: Record<string, { fix: string; fixCode: string; prevention: string }> = {
    AccountNotSigner: {
      fix: "The account marked as Signer in the Anchor accounts struct was not passed as a signer. Add it to the signers array.",
      fixCode: `await program.methods.myInstruction()\n  .accounts({ authority: wallet.publicKey })\n  .signers([wallet])\n  .rpc();`,
      prevention: "Always verify signer requirements match your Anchor #[derive(Accounts)] struct.",
    },
    AccountDiscriminatorMismatch: {
      fix: "The account passed doesn't match the expected Anchor account type. Verify the 8-byte discriminator matches sha256('account:<TypeName>')[0..8].",
      fixCode: `const expectedDisc = Buffer.from(\n  createHash('sha256').update('account:MyType').digest().slice(0, 8)\n);\nconst accountInfo = await connection.getAccountInfo(pda);\nif (!accountInfo!.data.slice(0, 8).equals(expectedDisc)) {\n  throw new Error("Wrong account type");\n}`,
      prevention: "Always check account discriminators before passing accounts to instructions.",
    },
    ConstraintSeeds: {
      fix: "The PDA derived from seeds doesn't match the account passed. Verify your seed values and encoding.",
      fixCode: `const [expectedPda] = PublicKey.findProgramAddressSync(\n  [Buffer.from("my_seed"), authority.toBuffer()],\n  programId\n);\n// Use expectedPda, not the account you were passing`,
      prevention: "Double-check PDA seed encoding (Buffer.from vs TextEncoder vs bs58).",
    },
    InsufficientFundsForRent: {
      fix: "The account balance would fall below rent-exempt minimum. Fund the account first.",
      fixCode: `const rentExempt = await connection.getMinimumBalanceForRentExemption(ACCOUNT_SIZE);\nconst fundIx = SystemProgram.transfer({\n  fromPubkey: payer,\n  toPubkey: targetAccount,\n  lamports: rentExempt,\n});`,
      prevention: "Always calculate and fund rent-exempt minimums before account operations.",
    },
    UninitializedAccount: {
      fix: "The account exists but hasn't been initialized. Call the initialize instruction first.",
      fixCode: `const accountInfo = await connection.getAccountInfo(pda);\nif (!accountInfo || accountInfo.data.length === 0) {\n  await program.methods.initialize()\n    .accounts({ pda, authority: wallet.publicKey, systemProgram: SystemProgram.programId })\n    .rpc();\n}`,
      prevention: "Check account initialization state before calling instructions that require it.",
    },
    InsufficientFunds: {
      fix: "The token account doesn't have enough balance. Check the amount before transferring.",
      fixCode: `const tokenAccount = await getAccount(connection, tokenAccountAddress);\nif (tokenAccount.amount < transferAmount) {\n  throw new Error(\`Insufficient: have \${tokenAccount.amount}, need \${transferAmount}\`);\n}`,
      prevention: "Always verify token balances before transfer instructions.",
    },
    OwnerMismatch: {
      fix: "The signer is not the owner or delegate of the token account. Verify ownership before transferring.",
      fixCode: `const tokenAccount = await getAccount(connection, sourceAccount);\nif (!tokenAccount.owner.equals(wallet.publicKey)) {\n  throw new Error("Wallet is not the owner");\n}`,
      prevention: "Check token account ownership before any transfer or burn operation.",
    },
    NotInitialized: {
      fix: "The token account hasn't been initialized. Create an Associated Token Account first.",
      fixCode: `const ataIx = createAssociatedTokenAccountIdempotentInstruction(\n  payer, ata, owner, mint,\n);\nconst tx = new Transaction().add(ataIx, transferIx);`,
      prevention: "Use createAssociatedTokenAccountIdempotentInstruction to handle existing ATAs gracefully.",
    },
    AccountFrozen: {
      fix: "The token account has been frozen by the mint's freeze authority. Only the freeze authority can unfreeze it.",
      fixCode: `await thawAccount(\n  connection, freezeAuthority, tokenAccount, mint, [], undefined, TOKEN_2022_PROGRAM_ID,\n);`,
      prevention: "Check isFrozen status before token operations on Token-2022 accounts.",
    },
    ResultWithNegativeLamports: {
      fix: "A SystemProgram.transfer would leave the source with negative lamports. Ensure sufficient SOL balance.",
      fixCode: `const balance = await connection.getBalance(source);\nif (balance < transferAmount) {\n  // Fund the account or reduce the transfer amount\n}`,
      prevention: "Always check SOL balance before SystemProgram.transfer.",
    },
    UnbalancedInstruction: {
      fix: "Total lamports in ≠ total lamports out. SOL cannot be created or destroyed in a System instruction.",
      fixCode: `// Ensure sum(inputs) == sum(outputs)\nconst balance = await connection.getBalance(source);\nconst ix = SystemProgram.transfer({\n  fromPubkey: source,\n  toPubkey: destination,\n  lamports: balance - 5000, // leave enough for fee\n});`,
      prevention: "Verify lamport conservation in all System program instructions.",
    },
    BlockhashNotFound: {
      fix: "The blockhash is expired. Fetch a fresh blockhash before signing.",
      fixCode: `const { blockhash } = await connection.getLatestBlockhash();\ntransaction.recentBlockhash = blockhash;`,
      prevention: "Use a transaction sender that auto-refreshes blockhashes.",
    },
  };

  return fixes[errorName] ?? {
    fix: "Check the program's source code or IDL to decode this custom error. The error code maps to an index in the program's error enum.",
    fixCode: `// Look up the program's #[error_code] enum\n// For Anchor: index = hex_code - 0x1000\n// Check the program's IDL or source on Solana Explorer`,
    prevention: "Familiarize yourself with the program's error codes before integrating.",
  };
}

export async function diagnoseTransaction(
  signature: string,
  network: string = "mainnet"
): Promise<DiagnosisResult> {
  const rpcUrl = getRpcUrl(network);
  const connection = new Connection(rpcUrl, "confirmed");

  const tx = await connection.getTransaction(signature, {
    maxSupportedTransactionVersion: true,
    commitment: "confirmed",
  });

  if (!tx) {
    return {
      signature,
      network,
      status: "not_found",
      evidence: ["Transaction not found — may be unconfirmed, expired, or on a different network."],
    };
  }

  const meta = tx.meta;
  const logs: string[] = meta?.logMessages ?? [];
  const computeUnits = meta?.computeUnitsConsumed;
  const fee = meta?.fee;
  const err = meta?.err;
  const programId = findFailingProgram(logs);

  if (!err) {
    return {
      signature,
      network,
      status: "success",
      computeUnits,
      fee,
      logs,
      programId,
      evidence: ["Transaction succeeded (meta.err is null)."],
    };
  }

  const decoded = decodeError(err, programId);
  const errorName = decoded?.name ?? "Unknown";
  const fixInfo = getFix(errorName, decoded);

  const evidence: string[] = [];
  if (decoded) evidence.push(`Error: ${decoded.raw}`);
  if (programId) {
    const programName = PROGRAM_IDS[programId] ?? "Unknown program";
    evidence.push(`Failing program: ${programName} (${programId})`);
  }
  if (computeUnits !== undefined && computeUnits !== null) {
    evidence.push(`Compute units consumed: ${computeUnits.toLocaleString()}`);
  }
  const failedLogs = logs.filter((l) => l.includes("failed") || l.includes("Error") || l.includes("error"));
  evidence.push(...failedLogs.slice(-5));

  return {
    signature,
    network,
    status: "failed",
    error: decoded,
    rootCause: getRootCause(errorName, logs),
    evidence,
    fix: fixInfo.fix,
    fixCode: fixInfo.fixCode,
    prevention: fixInfo.prevention,
    computeUnits,
    fee,
    logs,
    programId,
  };
}

function getRootCause(errorName: string, logs: string[]): string {
  const rootCauses: Record<string, string> = {
    AccountNotSigner: "An account required to be a signer was not passed as a signer in the transaction.",
    AccountDiscriminatorMismatch: "The account's 8-byte discriminator doesn't match the expected Anchor account type.",
    ConstraintSeeds: "The PDA derived from the provided seeds doesn't match the account passed to the instruction.",
    InsufficientFundsForRent: "The account's lamport balance would fall below the rent-exempt minimum after this operation.",
    UninitializedAccount: "The account exists but has not been initialized (data is empty or discriminator is zeroed).",
    InsufficientFunds: "The token account has insufficient balance for the requested transfer.",
    OwnerMismatch: "The signer is not the owner or delegate of the token account being modified.",
    NotInitialized: "The token account has not been initialized — it needs to be created first.",
    AccountFrozen: "The token account has been frozen by the mint's freeze authority.",
    ResultWithNegativeLamports: "A SystemProgram.transfer would result in a negative SOL balance for the source account.",
    UnbalancedInstruction: "Total lamports in ≠ total lamports out — SOL cannot be created or destroyed.",
    BlockhashNotFound: "The blockhash used in the transaction has expired (older than ~150 slots).",
  };

  return rootCauses[errorName] ?? "See the error details and logs below for the root cause.";
}
