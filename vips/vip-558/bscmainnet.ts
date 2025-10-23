import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const RISK_FUND = "0xdF31a28D68A2AB381D42b380649Ead7ae2A76E42";
export const BSCMAINNET_USDT = "0x55d398326f99059ff775485246999027b3197955";

export const REPAYMENTS = [
  {
    user: "0x563617b87d8bb3f2f14bb5a581f2e19f80b52008",
    amount: parseUnits("2022088.53", 18),
  },
  {
    user: "0x448ca4Bc5e3407Ce67bC9D7185cEf5B34C3ADEf8",
    amount: parseUnits("283762.92", 18),
  },
  {
    user: "0x3577385c7b5a52d8FbA230AC88C416cd97fA3ccc",
    amount: parseUnits("253666.5257", 18),
  },
  {
    user: "0x711a114519eF264A9FDd4262b7bc6A8F524F9493",
    amount: parseUnits("240169.9647", 18),
  },
  {
    user: "0xC0442a99C8b0E656986f20C9519cDbCbD52e8C5f",
    amount: parseUnits("186716.05", 18),
  },
  {
    user: "0x252BEa6e56A8C070e7CfCae3bFa5b2687B65C177",
    amount: parseUnits("78940.13775", 18),
  },
  {
    user: "0x905E02c15760507075DCf7e3CD8fAEdfda0D0048",
    amount: parseUnits("67267.06025", 18),
  },
  {
    user: "0xddbf9868d960fd2433ba762faf46024881cd9916",
    amount: parseUnits("60004.33669", 18),
  },
  {
    user: "0xF82E0BA858CC47ABE3d3a2C7FB7a6Bf37b64Ca02",
    amount: parseUnits("40179.61462", 18),
  },
  {
    user: "0xaFB53315e65dB1372658752134B04fE84dCb9D15",
    amount: parseUnits("44624.61357", 18),
  },
  {
    user: "0xCd9CC264A2AA847f1CD354Ceaf631aB952cAc669",
    amount: parseUnits("16737.02055", 18),
  },
  {
    user: "0xd550F635b26aaEa77387cf5f5479a913AA079006",
    amount: parseUnits("11113.11086", 18),
  },
  {
    user: "0xf5eC92db4882b44865408A27364d0d330CF7B4E1",
    amount: parseUnits("526906.43", 18),
  },
  {
    user: "0xe4f683b80e8E141313dd5F2D0066F66e454A57BF",
    amount: parseUnits("27064.5", 18),
  },
  {
    user: "0x7273cda21b54A7C5A0a49e83155e78848a8e78B0",
    amount: parseUnits("84224.11", 18),
  },
  {
    user: "0x4AeF52FF082FeFbE36cd2eD8F184601023095B3D",
    amount: parseUnits("24095.619", 18),
  },
  {
    user: "0xbEaF3936b36bb2692065372816da3C58a693F9C2",
    amount: parseUnits("342.056", 18),
  },
];

export const vip558 = () => {
  const meta = {
    version: "v2",
    title: "VIP-558 [BNB Chain] Wave 1 Compensation for Users Affected by the WBETH Depeg",
    description: `If passed, this VIP will transfer compensation from the [Risk Fund](https://bscscan.com/address/0xdF31a28D68A2AB381D42b380649Ead7ae2A76E42) to users who were liquidated during the WBETH price oracle depeg on October 10, 2025. This proposal covers the first wave of affected users identified by the Venus Labs analysis.

Eligibility criteria, calculation methodology, and complete details are outlined in the [Venus Labs Community Post](https://community.venus.io/).

**Addresses and compensation amounts**

- 0x563617b87d8bb3f2f14bb5a581f2e19f80b52008: 2,022,088.53 USDT
- 0xf5eC92db4882b44865408A27364d0d330CF7B4E1: 526,906.43 USDT
- 0x448ca4Bc5e3407Ce67bC9D7185cEf5B34C3ADEf8: 283,762.92 USDT
- 0x3577385c7b5a52d8FbA230AC88C416cd97fA3ccc: 253,666.52 USDT
- 0x711a114519eF264A9FDd4262b7bc6A8F524F9493: 240,169.96 USDT
- 0xC0442a99C8b0E656986f20C9519cDbCbD52e8C5f: 186,716.05 USDT
- 0x7273cda21b54A7C5A0a49e83155e78848a8e78B0: 84,224.11 USDT
- 0x252BEa6e56A8C070e7CfCae3bFa5b2687B65C177: 78,940.13 USDT
- 0x905E02c15760507075DCf7e3CD8fAEdfda0D0048: 67,267.06 USDT
- 0xddbf9868d960fd2433ba762faf46024881cd9916: 60,004.33 USDT
- 0xaFB53315e65dB1372658752134B04fE84dCb9D15: 44,624.61 USDT
- 0xF82E0BA858CC47ABE3d3a2C7FB7a6Bf37b64Ca02: 40,179.61 USDT
- 0xe4f683b80e8E141313dd5F2D0066F66e454A57BF: 27,064.50 USDT
- 0x4AeF52FF082FeFbE36cd2eD8F184601023095B3D: 24,095.61 USDT
- 0xCd9CC264A2AA847f1CD354Ceaf631aB952cAc669: 16,737.02 USDT
- 0xd550F635b26aaEa77387cf5f5479a913AA079006: 11,113.11 USDT
- 0xbEaF3936b36bb2692065372816da3C58a693F9C2: 342.05 USDT

**Voting options**

- **For** — Execute this proposal
- **Against** — Do not execute this proposal
- **Abstain** — Indifferent to execution`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      ...REPAYMENTS.map(({ user, amount }) => ({
        target: RISK_FUND,
        signature: "sweepTokenFromPool(address,address,address,uint256)",
        params: [BSCMAINNET_USDT, NETWORK_ADDRESSES.bscmainnet.UNITROLLER, user, amount],
      })),
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip558;
