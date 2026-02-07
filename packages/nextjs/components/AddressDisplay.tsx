"use client";

import { BlockieAvatar } from "~~/components/scaffold-eth";

interface AddressDisplayProps {
  address: `0x${string}`;
}

/**
 * Simple address display with blockie avatar + truncated address + copy + explorer link.
 * Replaces scaffold-eth's <Address/> component which isn't in this SE2 version.
 */
export function AddressDisplay({ address }: AddressDisplayProps) {
  const truncated = `${address.slice(0, 6)}...${address.slice(-4)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(address);
  };

  return (
    <div className="flex items-center gap-2">
      <BlockieAvatar address={address} size={24} />
      <a
        href={`https://basescan.org/address/${address}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-400 hover:text-blue-300 font-mono text-sm"
        title={address}
      >
        {truncated}
      </a>
      <button
        onClick={handleCopy}
        className="btn btn-ghost btn-xs text-gray-500 hover:text-gray-300"
        title="Copy address"
      >
        📋
      </button>
    </div>
  );
}
