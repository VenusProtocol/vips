import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";
import { NORMAL_TIMELOCK } from "../../src/vip-framework";

const TREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";
const VAI = "0x4BD17003473389A42DAF6a0a729f6Fdb328BbBd7";
const V2_LP = "0xD94FeFc80a7d10d4708b140c7210569061a7eddb";
const V2_LP_BALANCE = parseUnits("176508.405573652762506292", 18);
const TIMELOCK_VAI_BALANCE = parseUnits("1598.336577715436018042", 18);
const LIQUIDITY_MOVER = "0xcE18DA58f469A2dA9decDf1B168494240430D1D4";

const MIN_VAI = parseUnits("180000", 18);
const MIN_USDT = parseUnits("180000", 18);
const V3_POOL_FEE = 100;
export const MIN_TICK_CENTER = -100;
export const MAX_TICK_CENTER = 100;
export const TICK_SPREAD = 250;

const DEADLINE = 1712790000; // April 10th, 2024, 23:00 UTC

export const vip285 = () => {
  const meta = {
    version: "v1",
    title: "VIP-285 Move from PancakeSwap V2 to PancakeSwap V3 the protocol USDT/VAI liquidity",
    description: `#### Summary

If passed, this VIP will perform the following actions:

* Redeem PancakeSwap v2 LP tokens from the [v2 pool](https://pancakeswap.finance/info/pairs/0xD94FeFc80a7d10d4708b140c7210569061a7eddb?chain=bsc), supplied at [VIP-108](https://app.venus.io/#/governance/proposal/108?chainId=56)
* Deposit the received USDT/VAI to a PCS v3 pool (plus 1,598 VAI held by the Normal Timelock, not used at VIP-108)

#### Specifications

This VIP redeems PancakeSwap v2 LP tokens from the [v2 pool](https://pancakeswap.finance/info/pairs/0xD94FeFc80a7d10d4708b140c7210569061a7eddb?chain=bsc) (previously supplied at [VIP-108](https://app.venus.io/#/governance/proposal/108?chainId=56)) and deposits the received USDT/VAI to a PCS v3 pool. The range is 500 ticks concentrated somewhere between [0.966, 1.036] depending on the current spot price.

* The lowest possible range is if the spot price is 0.990 USDT/VAI, it's equal to [0.966, 1.015]
* The highest possible range is if the spot price is 1.010 USDT/VAI, it's equal to [0.985, 1.035]
* If the spot price is lower than 0.990 USDT/VAI or higher than 1.010 USDT/VAI, the VIP will not be executable until the spot price is back to expected values

This approach allows for maximizing the supplied amount since the tokens are added proportionally and no excess of a single token is required.

The minted NFT token will be sent to the [Normal Timelock](https://bscscan.com/address/0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396). The [Venus Treasury](https://bscscan.com/address/0xf322942f644a996a617bd29c16bd7d231d9f35e9) will receive the surplus liquidity.

This VIP uses a intermediary contract to perform the movement: [LiquidityMover](https://bscscan.com/address/0xcE18DA58f469A2dA9decDf1B168494240430D1D4)

VIP simulation: [https://github.com/VenusProtocol/vips/pull/213](https://github.com/VenusProtocol/vips/pull/213)
`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
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

export default vip285;
