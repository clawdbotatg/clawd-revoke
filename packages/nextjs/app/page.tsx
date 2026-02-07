"use client";

import { useState, useCallback } from "react";
import { useAccount, useSwitchChain } from "wagmi";
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { useClawdApprovals } from "~~/hooks/useClawdApprovals";
import { ApprovalRow } from "~~/components/ApprovalRow";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

export default function Home() {
  const { address: connectedAddress, isConnected, chain } = useAccount();
  const { targetNetwork } = useTargetNetwork();
  const { switchChain } = useSwitchChain();

  const { spenders, isLoading: isScanning, error: scanError } = useClawdApprovals(
    connectedAddress as `0x${string}` | undefined
  );

  const [revokedSpenders, setRevokedSpenders] = useState<Set<string>>(new Set());
  const [isRevokingAll, setIsRevokingAll] = useState(false);
  const { writeContractAsync } = useScaffoldWriteContract({ contractName: "CLAWD" });

  const handleRowRevoked = useCallback((spender: string) => {
    setRevokedSpenders(prev => {
      const next = new Set(prev);
      next.add(spender);
      return next;
    });
  }, []);

  const handleRevokeAll = async () => {
    if (!connectedAddress || spenders.length === 0) return;
    setIsRevokingAll(true);

    for (const spender of spenders) {
      if (revokedSpenders.has(spender)) continue;
      try {
        await writeContractAsync({
          functionName: "approve",
          args: [spender, 0n],
        });
        setRevokedSpenders(prev => {
          const next = new Set(prev);
          next.add(spender);
          return next;
        });
      } catch (err) {
        console.error(`Failed to revoke ${spender}:`, err);
      }
    }

    setIsRevokingAll(false);
  };

  const isWrongNetwork = isConnected && chain && chain.id !== targetNetwork.id;
  const allRevoked = spenders.length > 0 && spenders.every(s => revokedSpenders.has(s));

  return (
    <div className="flex flex-col items-center min-h-screen bg-base-300 px-4 py-8">
      <div className="w-full max-w-3xl">
        {/* Hero */}
        <div className="text-center mb-8">
          <p className="text-lg text-gray-400 mt-2">
            Review and revoke CLAWD token approvals. Take back control of your tokens.
          </p>
        </div>

        {/* Not connected */}
        {!isConnected && (
          <div className="flex flex-col items-center justify-center py-20 gap-6">
            <div className="text-6xl">🔐</div>
            <h2 className="text-2xl font-bold text-gray-200">Connect Your Wallet</h2>
            <p className="text-gray-400 text-center max-w-md">
              Connect your wallet to scan for active CLAWD token approvals and revoke them.
            </p>
            <RainbowKitCustomConnectButton />
          </div>
        )}

        {/* Wrong network */}
        {isWrongNetwork && (
          <div className="flex flex-col items-center justify-center py-20 gap-6">
            <div className="text-6xl">⚠️</div>
            <h2 className="text-2xl font-bold text-yellow-400">Wrong Network</h2>
            <p className="text-gray-400 text-center max-w-md">
              Please switch to {targetNetwork.name} to use CLAWD Revoke.
            </p>
            <button
              onClick={() => switchChain?.({ chainId: targetNetwork.id })}
              className="btn bg-yellow-600 hover:bg-yellow-700 text-white border-none text-lg px-8"
            >
              Switch to {targetNetwork.name}
            </button>
          </div>
        )}

        {/* Connected + correct network */}
        {isConnected && !isWrongNetwork && (
          <div>
            {/* Scanning */}
            {isScanning && (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <span className="loading loading-spinner loading-lg text-primary"></span>
                <p className="text-gray-400 text-lg">Scanning for CLAWD approvals...</p>
              </div>
            )}

            {/* Error */}
            {scanError && !isScanning && (
              <div className="alert alert-error mb-6">
                <span>Error scanning approvals: {scanError}</span>
              </div>
            )}

            {/* No approvals */}
            {!isScanning && !scanError && spenders.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="text-6xl">🎉</div>
                <h2 className="text-2xl font-bold text-green-400">No Active Approvals Found</h2>
                <p className="text-gray-400 text-center">
                  Your wallet has no active CLAWD token approvals. You&apos;re all good!
                </p>
              </div>
            )}

            {/* Approvals table */}
            {!isScanning && !scanError && spenders.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-200">
                    {allRevoked ? (
                      <span className="text-green-400">All Approvals Revoked ✅</span>
                    ) : (
                      <>
                        <span className="text-red-400">{spenders.length}</span>
                        {" "}Active Approval{spenders.length !== 1 ? "s" : ""} Found
                      </>
                    )}
                  </h2>
                  {!allRevoked && spenders.length > 1 && (
                    <button
                      onClick={handleRevokeAll}
                      disabled={isRevokingAll}
                      className="btn bg-red-600 hover:bg-red-700 text-white border-none min-w-[140px]"
                    >
                      {isRevokingAll ? (
                        <>
                          <span className="loading loading-spinner loading-sm"></span>
                          Revoking...
                        </>
                      ) : (
                        "🚫 Revoke All"
                      )}
                    </button>
                  )}
                </div>

                <div className="overflow-x-auto rounded-xl border border-gray-700 bg-base-200">
                  <table className="table w-full">
                    <thead>
                      <tr className="border-b border-gray-700 text-gray-400">
                        <th className="px-4 py-3 text-left">Spender</th>
                        <th className="px-4 py-3 text-left">Allowance</th>
                        <th className="px-4 py-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {spenders.map(spender => (
                        <ApprovalRow
                          key={spender}
                          owner={connectedAddress as `0x${string}`}
                          spender={spender}
                          onRevoked={() => handleRowRevoked(spender)}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-6 text-sm text-gray-500 text-center">
                  <p>Each revoke is a separate on-chain transaction setting the approved amount to 0.</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
