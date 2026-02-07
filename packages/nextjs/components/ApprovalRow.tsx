"use client";

import { useState } from "react";
import { AddressDisplay } from "~~/components/AddressDisplay";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { formatUnits } from "viem";

interface ApprovalRowProps {
  owner: `0x${string}`;
  spender: `0x${string}`;
  onRevoked?: () => void;
}

const UNLIMITED_THRESHOLD = BigInt("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff");

export function ApprovalRow({ owner, spender, onRevoked }: ApprovalRowProps) {
  const [revoked, setRevoked] = useState(false);
  const [txError, setTxError] = useState<string | null>(null);

  // Read current allowance — each row gets its own hook instance
  const { data: rawAllowance, isLoading: isLoadingAllowance } = useScaffoldReadContract({
    contractName: "CLAWD",
    functionName: "allowance",
    args: [owner, spender],
  });

  const allowance = rawAllowance as bigint | undefined;

  // Write hook — each row gets its own instance = independent isMining state
  const { writeContractAsync, isMining } = useScaffoldWriteContract({ contractName: "CLAWD" });

  const handleRevoke = async () => {
    setTxError(null);
    try {
      await writeContractAsync({
        functionName: "approve",
        args: [spender, 0n],
      });
      setRevoked(true);
      onRevoked?.();
    } catch (err: unknown) {
      if (err instanceof Error) {
        if (err.message.includes("User rejected") || err.message.includes("denied")) {
          setTxError("Transaction rejected");
        } else {
          setTxError("Transaction failed");
        }
      } else {
        setTxError("Transaction failed");
      }
      console.error("Revoke error:", err);
    }
  };

  const formatAllowance = (value: bigint | undefined): string => {
    if (value === undefined) return "...";
    if (value === 0n) return "0";
    if (value >= UNLIMITED_THRESHOLD) return "Unlimited ⚠️";
    const formatted = formatUnits(value, 18);
    const num = parseFloat(formatted);
    if (num > 1_000_000) return `${(num / 1_000_000).toFixed(2)}M`;
    if (num > 1_000) return `${(num / 1_000).toFixed(2)}K`;
    return num.toFixed(4);
  };

  const isZeroAllowance = allowance === 0n;
  const isActive = !revoked && !isZeroAllowance && allowance !== undefined;
  const showAsRevoked = revoked || (allowance !== undefined && isZeroAllowance);

  // Hide rows where allowance was already 0 before we touched it
  if (!isLoadingAllowance && isZeroAllowance && !revoked) {
    return null;
  }

  return (
    <tr className={`border-b border-gray-700 ${showAsRevoked ? "bg-green-900/20" : "bg-red-900/10"}`}>
      <td className="px-4 py-3">
        <AddressDisplay address={spender} />
      </td>
      <td className="px-4 py-3">
        {isLoadingAllowance ? (
          <span className="text-gray-400 animate-pulse">Loading...</span>
        ) : showAsRevoked ? (
          <span className="text-green-400">0</span>
        ) : (
          <span className={allowance && allowance >= UNLIMITED_THRESHOLD ? "text-red-400 font-bold" : "text-yellow-400"}>
            {formatAllowance(allowance)}
          </span>
        )}
      </td>
      <td className="px-4 py-3 text-right">
        {showAsRevoked ? (
          <span className="text-green-400 font-medium">✅ Revoked</span>
        ) : txError ? (
          <div className="flex flex-col items-end gap-1">
            <span className="text-red-400 text-sm">{txError}</span>
            <button
              onClick={handleRevoke}
              disabled={isMining || !isActive}
              className="btn btn-sm bg-red-600 hover:bg-red-700 text-white border-none disabled:opacity-50"
            >
              Retry
            </button>
          </div>
        ) : (
          <button
            onClick={handleRevoke}
            disabled={isMining || !isActive}
            className="btn btn-sm bg-red-600 hover:bg-red-700 text-white border-none disabled:opacity-50 min-w-[100px]"
          >
            {isMining ? <span className="loading loading-spinner loading-sm"></span> : "Revoke"}
          </button>
        )}
      </td>
    </tr>
  );
}
