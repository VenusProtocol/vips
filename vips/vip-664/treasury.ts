import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { Command } from "src/types";

import { MIGRATOR, STACKS } from "../vip-650/addresses/bscmainnet";

export { MIGRATOR };
export const TREASURY_SNAPSHOT_BLOCK = 124482582;
const { VTREASURY, NORMAL_TIMELOCK } = NETWORK_ADDRESSES.bscmainnet;

// Full Treasury balances at the snapshot block: assets have 18 decimals, vTokens 8.
// Exact withdrawals leave any later Treasury income in Treasury. Migrator deposits the actual
// redemption proceeds (including accrued interest), not a snapshot of the underlying amount.
const balances = {
  USDT: {
    assetAmount: "738684512559003748986493",
    vTokenAmount: "13779578716278",
    minShares: "3623910772948666848816908484",
  },
  USDC: {
    assetAmount: "91884384017371969374252",
    vTokenAmount: "3050026458872009",
    minShares: "807102480688135350728549721920",
  },
  U: { assetAmount: "288921382312112220008143", vTokenAmount: "9000000000", minShares: "90009204632770313786381342" },
};

// minShares is 99.5% of each Hub's convertToShares(vToken balance * exchangeRateStored / 1e18)
// at the snapshot block. A larger deterioration reverts the entire VIP instead of accepting it.
export const TREASURY_MIGRATIONS = STACKS.map(stack => ({
  ...stack,
  ...balances[stack.key as keyof typeof balances],
}));

export const treasuryMigrationCommands = (): Command[] =>
  TREASURY_MIGRATIONS.flatMap(({ asset, vToken, hub, assetAmount, vTokenAmount, minShares }) => [
    {
      target: VTREASURY,
      signature: "withdrawTreasuryBEP20(address,uint256,address)",
      params: [asset, assetAmount, NORMAL_TIMELOCK],
    },
    { target: asset, signature: "approve(address,uint256)", params: [hub, assetAmount] },
    { target: hub, signature: "deposit(uint256,address)", params: [assetAmount, VTREASURY] },
    { target: asset, signature: "approve(address,uint256)", params: [hub, 0] },
    {
      target: VTREASURY,
      signature: "withdrawTreasuryBEP20(address,uint256,address)",
      params: [vToken, vTokenAmount, NORMAL_TIMELOCK],
    },
    { target: vToken, signature: "approve(address,uint256)", params: [MIGRATOR, vTokenAmount] },
    {
      target: MIGRATOR,
      signature: "migrateFromCore(address,uint256,address,address,uint256)",
      params: [vToken, vTokenAmount, hub, VTREASURY, minShares],
    },
    { target: vToken, signature: "approve(address,uint256)", params: [MIGRATOR, 0] },
  ]);
