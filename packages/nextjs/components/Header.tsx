"use client";

import React from "react";
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";

export const Header = () => {
  return (
    <div className="sticky top-0 z-20 navbar bg-base-200 border-b border-gray-700 min-h-0 px-4 py-2">
      <div className="navbar-start">
        <div className="flex items-center gap-2">
          <span className="text-xl">🚫</span>
          <span className="font-bold text-lg">CLAWD Revoke</span>
        </div>
      </div>
      <div className="navbar-end flex gap-2">
        <RainbowKitCustomConnectButton />
      </div>
    </div>
  );
};
