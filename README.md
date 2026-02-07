# 🚫 CLAWD Revoke

**Scan and revoke $CLAWD token approvals on Base.**

A focused approval management tool for [$CLAWD](https://basescan.org/token/0x9f86dB9fc6f7c9408e8Fda3Ff8ce4e78ac7a6b07) holders. Connect your wallet, see who has access to your tokens, revoke with one click. Built with [Scaffold-ETH 2](https://scaffoldeth.io).

🌐 **Live on IPFS:** [Open App](https://bafybeib7tsisziuso4zestzpdi5fx4yevfhw4gpl6ggvwvrm6kdgljvtxe.ipfs.dweb.link)

## What It Does

Every time you interact with a DEX or DeFi protocol, you approve it to spend your tokens. Those approvals persist forever — even after you're done. CLAWD Revoke lets you:

1. **Scan** — Reads all `Approval` events for your wallet from the CLAWD token contract
2. **Review** — Shows each spender address, their current allowance, and blockie avatars
3. **Revoke** — Sets allowance to 0 for any spender, individually or all at once

## Features

- 🔍 **Full Approval Scan** — Fetches every historical Approval event for your wallet
- 💰 **Live Allowances** — Reads current on-chain allowance for each spender
- ⚠️ **Unlimited Warnings** — Flags MAX_UINT256 approvals with "Unlimited ⚠️"
- 🗑️ **One-Click Revoke** — Per-row revoke with independent loading states
- 💥 **Revoke All** — Bulk revoke every active approval in one flow
- 🌑 **Dark Mode** — Locked dark theme for security tool aesthetic
- 🎭 **Blockie Avatars** — Visual identity for spender addresses
- ⛽ **Cheap** — Less than $0.01 per revoke on Base

## Quickstart

```bash
git clone https://github.com/clawdbotatg/clawd-revoke.git
cd clawd-revoke
yarn install
yarn start
```

Open [http://localhost:3000](http://localhost:3000) — connect your wallet and start scanning.

> No contract deployment needed. The app reads directly from the existing CLAWD token on Base.

## How It Works

**Scanning:** Uses viem's `getLogs` to fetch all `Approval(owner, spender, value)` events where `owner` matches the connected wallet. Extracts unique spenders, reads current `allowance(owner, spender)` on-chain. Only non-zero allowances are shown.

**Revoking:** Calls `approve(spender, 0)` on the CLAWD token. Each revoke is a single Base transaction costing < $0.01. "Revoke All" sends them sequentially.

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | [Scaffold-ETH 2](https://scaffoldeth.io) |
| Frontend | [Next.js](https://nextjs.org/) |
| Wallet | [RainbowKit](https://www.rainbowkit.com/) + [wagmi](https://wagmi.sh/) |
| Chain | [Base](https://base.org/) |
| Hosting | [IPFS](https://ipfs.io/) via BuidlGuidl |

## CLAWD Token

| | |
|---|---|
| **Contract** | [`0x9f86dB9fc6f7c9408e8Fda3Ff8ce4e78ac7a6b07`](https://basescan.org/token/0x9f86dB9fc6f7c9408e8Fda3Ff8ce4e78ac7a6b07) |
| **Chain** | Base |
| **Standard** | ERC-20 |

## Links

- 🌐 [App (IPFS)](https://bafybeib7tsisziuso4zestzpdi5fx4yevfhw4gpl6ggvwvrm6kdgljvtxe.ipfs.dweb.link)
- 💻 [GitHub](https://github.com/clawdbotatg/clawd-revoke)
- 🐾 [CLAWD on Basescan](https://basescan.org/token/0x9f86dB9fc6f7c9408e8Fda3Ff8ce4e78ac7a6b07)
- 🐦 [@clawdbotatg](https://twitter.com/clawdbotatg)

---

Built by [Clawd](https://twitter.com/clawdbotatg) 🐾 — AI agent building onchain.
