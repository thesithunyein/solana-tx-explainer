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

// Anchor framework ErrorCode values are plain decimals (NOT offset by 0x1000).
// User-defined #[error_code] errors start at 6000. Source: anchor_lang::error::ErrorCode.
const ANCHOR_ERRORS: Record<number, string> = {
  // Instruction errors (100)
  100: "InstructionMissing",
  101: "InstructionFallbackNotFound",
  102: "InstructionDidNotDeserialize",
  103: "InstructionDidNotSerialize",
  // Constraint errors (2000)
  2000: "ConstraintMut",
  2001: "ConstraintHasOne",
  2002: "ConstraintSigner",
  2003: "ConstraintRaw",
  2004: "ConstraintOwner",
  2005: "ConstraintRentExempt",
  2006: "ConstraintSeeds",
  2007: "ConstraintExecutable",
  2008: "ConstraintState",
  2009: "ConstraintAssociated",
  2010: "ConstraintAssociatedInit",
  2011: "ConstraintClose",
  2012: "ConstraintAddress",
  2013: "ConstraintZero",
  2014: "ConstraintTokenMint",
  2015: "ConstraintTokenOwner",
  2019: "ConstraintSpace",
  // require! errors (2500)
  2500: "RequireViolated",
  2501: "RequireEqViolated",
  2502: "RequireKeysEqViolated",
  2503: "RequireNeqViolated",
  2505: "RequireGtViolated",
  // Account errors (3000)
  3000: "AccountDiscriminatorAlreadySet",
  3001: "AccountDiscriminatorNotFound",
  3002: "AccountDiscriminatorMismatch",
  3003: "AccountDidNotDeserialize",
  3004: "AccountDidNotSerialize",
  3005: "AccountNotEnoughKeys",
  3006: "AccountNotMutable",
  3007: "AccountOwnedByWrongProgram",
  3008: "InvalidProgramId",
  3009: "InvalidProgramExecutable",
  3010: "AccountNotSigner",
  3011: "AccountNotSystemOwned",
  3012: "AccountNotInitialized",
  3013: "AccountNotProgramData",
  3014: "AccountNotAssociatedTokenAccount",
  // Miscellaneous (4100)
  4100: "DeclaredProgramIdMismatch",
  4101: "TryingToInitPayerAsProgramAccount",
  4102: "InvalidNumericConversion",
};

// SPL Token (spl_token::error::TokenError). Token-2022 shares these base codes.
const SPL_ERRORS: Record<number, string> = {
  0: "NotRentExempt",
  1: "InsufficientFunds",
  2: "InvalidMint",
  3: "MintMismatch",
  4: "OwnerMismatch",
  5: "FixedSupply",
  6: "AlreadyInUse",
  7: "InvalidNumberOfProvidedSigners",
  8: "InvalidNumberOfRequiredSigners",
  9: "UninitializedState",
  10: "NativeNotSupported",
  11: "NonNativeHasBalance",
  12: "InvalidInstruction",
  13: "InvalidState",
  14: "Overflow",
  15: "AuthorityTypeNotSupported",
  16: "MintCannotFreeze",
  17: "AccountFrozen",
  18: "MintDecimalsMismatch",
  19: "NonNativeNotSupported",
};

// System program (solana_sdk::system_instruction::SystemError).
const SYSTEM_ERRORS: Record<number, string> = {
  0: "AccountAlreadyInUse",
  1: "ResultWithNegativeLamports",
  2: "InvalidProgramId",
  3: "InvalidAccountDataLength",
  4: "MaxSeedLengthExceeded",
  5: "AddressWithSeedMismatch",
  6: "NonceNoRecentBlockhashes",
  7: "NonceBlockhashNotExpired",
  8: "NonceUnexpectedBlockhashValue",
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
      const programName = programId ? PROGRAM_IDS[programId] : undefined;

      // Native programs use their own small error enums (raw decimal code).
      if (programName === "SPL Token" || programName === "Token-2022") {
        const name = SPL_ERRORS[decimalCode] ?? `Unknown SPL/Token-2022 error`;
        return { code: hexCode, name, raw: `Instruction #${index}: ${name} (${hexCode})` };
      }
      if (programName === "System") {
        const name = SYSTEM_ERRORS[decimalCode] ?? `Unknown System error`;
        return { code: hexCode, name, raw: `Instruction #${index}: ${name} (${hexCode})` };
      }

      // Otherwise assume an Anchor program. Framework codes are fixed decimals;
      // user-defined #[error_code] errors start at 6000 (no 0x1000 offset).
      if (decimalCode >= 6000) {
        const name = `Custom #[error_code] #${decimalCode - 6000}`;
        return { code: hexCode, name, raw: `Instruction #${index}: ${name} (${hexCode})` };
      }
      const anchorName = ANCHOR_ERRORS[decimalCode];
      if (anchorName) {
        return { code: hexCode, name: anchorName, raw: `Instruction #${index}: ${anchorName} (${hexCode})` };
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
    ConstraintRentExempt: {
      fix: "The account balance would fall below rent-exempt minimum. Fund the account first.",
      fixCode: `const rentExempt = await connection.getMinimumBalanceForRentExemption(ACCOUNT_SIZE);\nconst fundIx = SystemProgram.transfer({\n  fromPubkey: payer,\n  toPubkey: targetAccount,\n  lamports: rentExempt,\n});`,
      prevention: "Always calculate and fund rent-exempt minimums before account operations.",
    },
    AccountNotInitialized: {
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
    UninitializedState: {
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
    fixCode: `// Look up the program's #[error_code] enum\n// Anchor user errors: index = decimalCode - 6000 (e.g. 6000 = your 1st custom error)\n// Check the program's IDL or source on Solana Explorer`,
    prevention: "Familiarize yourself with the program's error codes before integrating.",
  };
}

export async function diagnoseTransaction(
  signature: string,
  network: string = "mainnet"
): Promise<DiagnosisResult> {
  const BASE58_RE = /^[1-9A-HJ-NP-Za-km-z]{43,90}$/;
  if (!BASE58_RE.test(signature)) {
    return {
      signature,
      network,
      status: "not_found",
      evidence: [
        "That doesn't look like a valid transaction signature.",
        "A Solana signature is an 87–88 character base58 string (no 0, O, I, or l).",
      ],
    };
  }

  const rpcUrl = getRpcUrl(network);
  const connection = new Connection(rpcUrl, "confirmed");

  let tx: any = null;
  try {
    // maxSupportedTransactionVersion must be a number (0) at runtime for web3.js;
    // cast because this install ships incomplete type declarations.
    tx = await connection.getTransaction(signature, {
      maxSupportedTransactionVersion: 0,
      commitment: "confirmed",
    } as any);
  } catch (rpcErr) {
    const msg = rpcErr instanceof Error ? rpcErr.message : "RPC request failed";
    return {
      signature,
      network,
      status: "not_found",
      evidence: [
        "Could not fetch this transaction from the RPC.",
        msg.includes("429") || msg.toLowerCase().includes("rate")
          ? "The public RPC is rate-limited. Add a Helius API key for reliable results."
          : msg,
      ],
    };
  }

  if (!tx) {
    return {
      signature,
      network,
      status: "not_found",
      evidence: ["Transaction not found — it may be unconfirmed, expired beyond RPC history, or on a different network. Try switching networks."],
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
