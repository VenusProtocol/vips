import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";
import { NORMAL_TIMELOCK } from "../../src/vip-framework";

const TREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";
const VAI = "0x4BD17003473389A42DAF6a0a729f6Fdb328BbBd7";
const V2_LP = "0xD94FeFc80a7d10d4708b140c7210569061a7eddb";
const V2_LP_BALANCE = parseUnits("176508.405573652762506292", 18);
const TIMELOCK_VAI_BALANCE = parseUnits("1598.336577715436018042", 18);
const LIQUIDITY_MOVER = "0x6F9947f15896169C122EaF621628C437B7d3583e";

const MIN_VAI = parseUnits("180000", 18);
const MIN_USDT = parseUnits("180000", 18);
const V3_POOL_FEE = 100;
export const MIN_TICK_CENTER = -100;
export const MAX_TICK_CENTER = 100;
export const TICK_SPREAD = 250;

// @todo: the deadline needs to be updated before proposing
const DEADLINE = 1717423729; // June, 3, 2024

export const vip255 = () => {
  const meta = {
    version: "v1",
    title: "VIP-255: Move VAI liquidity to PCSv3",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with this proposal",
  };

  return makeProposal(
    [
      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [V2_LP, V2_LP_BALANCE, LIQUIDITY_MOVER],
      },
      {
        target: VAI,
        signature: "transfer(address,uint256)",
        params: [LIQUIDITY_MOVER, TIMELOCK_VAI_BALANCE],
      },
      {
        target: LIQUIDITY_MOVER,
        signature: "moveLiquidity((address,uint256,uint256,uint24,int24,int24,int24,address,address,uint256))",
        params: [
          [
            V2_LP,
            MIN_VAI,
            MIN_USDT,
            V3_POOL_FEE,
            MIN_TICK_CENTER,
            MAX_TICK_CENTER,
            TICK_SPREAD,
            NORMAL_TIMELOCK,
            TREASURY,
            DEADLINE,
          ],
        ],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip255;
