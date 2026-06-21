import { NextRequest, NextResponse } from "next/server";
import { diagnoseTransaction } from "@/lib/diagnose";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { signature, network } = body;

    if (!signature || typeof signature !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid 'signature' field" },
        { status: 400 }
      );
    }

    const validNetworks = ["mainnet", "devnet", "testnet"];
    const net = validNetworks.includes(network) ? network : "mainnet";

    const result = await diagnoseTransaction(signature, net);

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to diagnose transaction", details: message },
      { status: 500 }
    );
  }
}
