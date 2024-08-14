import { parseUnits } from "ethers/lib/utils";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const vUSDT = "0xfD5840Cd36d94D7229439859C0112a4185BC0255";
const vUSDC = "0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8";
const vDAI = "0x334b3eCB4DCa3593BCCC3c7EBD1A1C1d1780FBF1";
const vTUSD = "0xBf762cd5991cA1DCdDaC9ae5C638F5B5Dc3Bee6E";
const vTUSD_OLD = "0x08CEB3F4a7ed3500cA0982bcd0FC7816688084c3";
const vUSDT_Stablecoins_IR = "0x7dc969122450749A8B0777c0e324522d67737988";
const COMPTROLLER = "0x3344417c9360b963ca93A4e8305361AEde340Ab9";
const vPLANET_DEFI = "0xFf1112ba7f88a53D4D23ED4e14A117A2aE17C6be";
const vPLANET_NEW_SUPPLY_CAP = parseUnits("2000000000", 18);
const vPLANET_NEW_BORROW_CAP = parseUnits("1000000000", 18);

const CORE_POOL_NEW_IR = "0x8c2651590ECE4FFe8E722ef6F80cc7407f537bBa";
const ZERO_RATE_MODEL = "0x93FBc248e83bc8931141ffC7f457EC882595135A";

export const vip205 = () => {
  const meta = {
    version: "v2",
    title: "VIP-205 Risk Parameters Adjustments (Stablecoins and PLANET)",
    description: `This VIP will perform the following Risk Parameter actions as per Chaos Labs’ latest recommendations in this Venus community forum publication: [Risk Parameter Updates 11/14/2023](https://community.venus.io/t/chaos-labs-risk-parameter-updates-11-14-2023/3900).

- **Stablecoin IR Curve Recommendations**
    - Multiplier Parameter Adjustment: Increase the multiplier parameter (until 6.875% yearly) to reflect a 5.5% borrow rate at the 80% utilization kink point for USDT, USDC, DAI, and TUSD in the Core Pool and USDT in the Stablecoins Pool.
- **PLANET (DeFi Pool)**
    - **Increase supply cap to 2,000,000,000 PLANET**
    - **Increase borrow cap to 1,000,000,000 PLANET**
- **TUSDOLD Borrow Rate**
    - **Reduce borrow rate to 0**

Complete analysis and details of these recommendations are available in the above publication.

VIP simulation: https://github.com/VenusProtocol/vips/pull/110`,

    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: vUSDT,
        signature: "_setInterestRateModel(address)",
        params: [CORE_POOL_NEW_IR],
      },

      {
        target: vUSDC,
        signature: "_setInterestRateModel(address)",
        params: [CORE_POOL_NEW_IR],
      },

      {
        target: vDAI,
        signature: "_setInterestRateModel(address)",
        params: [CORE_POOL_NEW_IR],
      },

      {
        target: vTUSD,
        signature: "_setInterestRateModel(address)",
        params: [CORE_POOL_NEW_IR],
      },

      {
        target: vUSDT_Stablecoins_IR,
        signature: "updateJumpRateModel(uint256,uint256,uint256,uint256)",
        params: [0, "68750000000000000", "2500000000000000000", "800000000000000000"],
      },

      {
        target: COMPTROLLER,
        signature: "setMarketBorrowCaps(address[],uint256[])",
        params: [[vPLANET_DEFI], [vPLANET_NEW_BORROW_CAP]],
      },

      {
        target: COMPTROLLER,
        signature: "setMarketSupplyCaps(address[],uint256[])",
        params: [[vPLANET_DEFI], [vPLANET_NEW_SUPPLY_CAP]],
      },

      {
        target: vTUSD_OLD,
        signature: "_setInterestRateModel(address)",
        params: [ZERO_RATE_MODEL],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
