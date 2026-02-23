import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { bscmainnet } = NETWORK_ADDRESSES;
export const PSR = "0xCa01D5A9A248a830E9D93231e791B1afFed7c446";
export const USDT_PRIME_CONVERTER = "0xD9f101AA67F3D72662609a2703387242452078C3";
export const USDC_PRIME_CONVERTER = "0xa758c9C215B6c4198F0a0e3FA46395Fa15Db691b";
export const PRIME_LIQUIDITY_PROVIDER = "0x23c4F844ffDdC6161174eB32c770D4D8C07833F2";
export const USDC = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";
export const USDT = "0x55d398326f99059fF775485246999027B3197955";

/// assume 192000 blocks per Day
/// 0.00855654761904762 * (192000 * 28 days) = 46,000 USD
export const NEW_PRIME_SPEED_FOR_USDT = parseUnits("0.00855654761904762", 18);
export const USDC_TOKENS_TO_SWAP = parseUnits("20000", 18);
export const USDT_TOKENS_TO_RECEIVE = parseUnits("19950", 18);

export const UNISWAP_SWAP_ROUTER = "0x1b81D678ffb9C0263b24A97847620C99d213eB14";

export const vU = "0x3d5E269787d562b74aCC55F18Bd26C5D09Fa245E";

export const EMODE_POOL_SPECS = {
  label: "Stablecoins",
  id: 1,
  markets: [vU],
  marketsConfig: {
    vU: {
      address: vU,
      collateralFactor: parseUnits("0", 18),
      liquidationThreshold: parseUnits("0", 18),
      liquidationIncentive: parseUnits("1", 18),
      borrowAllowed: true,
    },
  },
};

export const vip589 = () => {
  const meta = {
    version: "v2",
    title: "VIP-589 [BNB Chain] U Stablecoin E-Mode Listing and February 2026 Prime Rewards Adjustment",
    description: `**Description :**

This proposal consolidates two governance initiatives discussed in the Venus community into a single VIP for on-chain execution:

1. **Addition of U as a borrow-only asset in the Stablecoin E-Mode group**, as outlined in the community forum post: [**Add U Asset to Stablecoin E-Mode Group](https://community.venus.io/t/add-u-asset-to-stablecoin-e-mode-group/5665)**

The U market proposal enables additional borrowing flexibility by listing U within the Stablecoin E-Mode group as a **borrow-only asset**, with all collateral and liquidation-related parameters set to **0%**, ensuring no additional liquidation or systemic risk is introduced.

2. **Adjustment of Prime Rewards allocation on BNB Chain for February 2026**, as described in
    
    [**[BNB Chain] Adjust Prime Rewards Allocation for Feb 2026**](https://community.venus.io/t/bnb-chain-adjust-prime-rewards-allocation-for-feb-2026/5667)
    
    The Prime Rewards adjustment redistributes protocol revenue generated in January 2026 into February 2026 Prime Rewards, with incentives focused exclusively on **USDT suppliers**, based on observed liquidity contribution and reserve generation.
    

**Action :**

1. **U Stablecoin E-Mode Listing**
- Add **U** as a market in the **Stablecoin E-Mode** group
- Enable borrowing for U
- Disable collateral usage for U
- Set collateral factor to **0%**
- Set liquidation threshold to **0%**
- Set liquidation incentive to **0%**
1. **February 2026 Prime Rewards Adjustment**
- Allocate **$46,000 in Prime Rewards** on BNB Chain for February 2026 while maintaining a **20% buffer** in the Prime budget to account for market volatility
- Distribute **100% of Prime Rewards to USDT suppliers**
- Apply rewards exclusively to the **supply side**, with no borrow-side incentives

If approved, this VIP authorises the execution of both the **U Stablecoin E-Mode listing** and the **February 2026 Prime Rewards allocation adjustment** on BNB Chain.`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      // Add market to Stablecoins emode
      {
        target: bscmainnet.UNITROLLER,
        signature: "addPoolMarkets(uint96[],address[])",
        params: [Array(EMODE_POOL_SPECS.markets.length).fill(EMODE_POOL_SPECS.id), EMODE_POOL_SPECS.markets],
      },
      {
        target: bscmainnet.UNITROLLER,
        signature: "setLiquidationIncentive(uint96,address,uint256)",
        params: [
          EMODE_POOL_SPECS.id,
          EMODE_POOL_SPECS.marketsConfig.vU.address,
          EMODE_POOL_SPECS.marketsConfig.vU.liquidationIncentive,
        ],
      },
      {
        target: bscmainnet.UNITROLLER,
        signature: "setIsBorrowAllowed(uint96,address,bool)",
        params: [
          EMODE_POOL_SPECS.id,
          EMODE_POOL_SPECS.marketsConfig.vU.address,
          EMODE_POOL_SPECS.marketsConfig.vU.borrowAllowed,
        ],
      },

      // Adjust Prime Rewards Distributions
      {
        target: PSR,
        signature: "addOrUpdateDistributionConfigs((uint8,uint16,address)[])",
        params: [
          [
            [0, 2000, USDT_PRIME_CONVERTER],
            [0, 0, USDC_PRIME_CONVERTER],
          ],
        ],
      },
      {
        target: PRIME_LIQUIDITY_PROVIDER,
        signature: "setTokensDistributionSpeed(address[],uint256[])",
        params: [
          [USDT, USDC],
          [NEW_PRIME_SPEED_FOR_USDT, 0],
        ],
      },

      // Swap USDC to USDT
      {
        target: PRIME_LIQUIDITY_PROVIDER,
        signature: "sweepToken(address,address,uint256)",
        params: [USDC, NETWORK_ADDRESSES.bscmainnet.NORMAL_TIMELOCK, USDC_TOKENS_TO_SWAP],
      },
      {
        target: USDC,
        signature: "approve(address,uint256)",
        params: [UNISWAP_SWAP_ROUTER, USDC_TOKENS_TO_SWAP],
      },
      {
        target: UNISWAP_SWAP_ROUTER,
        signature: "exactInputSingle((address,address,uint24,address,uint256,uint256,uint256,uint160))",
        params: [
          [
            USDC,
            USDT,
            100,
            bscmainnet.NORMAL_TIMELOCK,
            Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 14, // 14 days from now
            USDC_TOKENS_TO_SWAP,
            USDT_TOKENS_TO_RECEIVE,
            0n,
          ],
        ],
      },
      {
        target: USDT,
        signature: "transfer(address,uint256)",
        params: [PRIME_LIQUIDITY_PROVIDER, USDT_TOKENS_TO_RECEIVE],
      },
      {
        target: USDC,
        signature: "approve(address,uint256)",
        params: [UNISWAP_SWAP_ROUTER, 0],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip589;
