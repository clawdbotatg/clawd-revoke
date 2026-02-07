"use client";

import { useEffect, useState } from "react";
import { usePublicClient } from "wagmi";
import { parseAbiItem } from "viem";

const CLAWD_ADDRESS = "0x9f86dB9fc6f7c9408e8Fda3Ff8ce4e78ac7a6b07";

const APPROVAL_EVENT = parseAbiItem(
  "event Approval(address indexed owner, address indexed spender, uint256 value)"
);

const BLOCK_RANGE = 100_000n;

/**
 * Scans all historical CLAWD Approval events for the given owner.
 * Returns deduplicated list of spender addresses.
 * Tries full range first, falls back to paginated scanning.
 */
export function useClawdApprovals(ownerAddress: `0x${string}` | undefined) {
  const publicClient = usePublicClient();
  const [spenders, setSpenders] = useState<`0x${string}`[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ownerAddress || !publicClient) {
      setSpenders([]);
      return;
    }

    let cancelled = false;

    const scan = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const currentBlock = await publicClient.getBlockNumber();
        const spenderSet = new Set<`0x${string}`>();

        // Try full range first (Alchemy often supports this)
        try {
          const logs = await publicClient.getLogs({
            address: CLAWD_ADDRESS,
            event: APPROVAL_EVENT,
            args: { owner: ownerAddress },
            fromBlock: 0n,
            toBlock: currentBlock,
          });

          for (const log of logs) {
            if (log.args.spender) {
              spenderSet.add(log.args.spender as `0x${string}`);
            }
          }
        } catch {
          // Full range failed — paginate
          let fromBlock = 0n;
          while (fromBlock <= currentBlock) {
            if (cancelled) return;
            const toBlock = fromBlock + BLOCK_RANGE > currentBlock ? currentBlock : fromBlock + BLOCK_RANGE;

            try {
              const logs = await publicClient.getLogs({
                address: CLAWD_ADDRESS,
                event: APPROVAL_EVENT,
                args: { owner: ownerAddress },
                fromBlock,
                toBlock,
              });

              for (const log of logs) {
                if (log.args.spender) {
                  spenderSet.add(log.args.spender as `0x${string}`);
                }
              }
            } catch (pageErr) {
              console.error(`Error scanning blocks ${fromBlock}-${toBlock}:`, pageErr);
            }

            fromBlock = toBlock + 1n;
          }
        }

        if (!cancelled) {
          setSpenders(Array.from(spenderSet));
        }
      } catch (err) {
        console.error("Error scanning approvals:", err);
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to scan approvals");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    scan();

    return () => {
      cancelled = true;
    };
  }, [ownerAddress, publicClient]);

  return { spenders, isLoading, error };
}
