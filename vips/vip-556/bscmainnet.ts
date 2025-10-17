import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const USDT_CHAINLINK_ORACLE = "0x22Dc2BAEa32E95AB07C2F5B8F63336CbF61aB6b8";
export const EXISTING_USDE_MAIN_ORACLE = NETWORK_ADDRESSES.bscmainnet.REDSTONE_ORACLE;
export const EXISTING_USDE_FALLBACK_ORACLE = NETWORK_ADDRESSES.bscmainnet.CHAINLINK_ORACLE;

export const BOUND_VALIDATOR = "0x6E332fF0bB52475304494E4AE5063c1051c7d735";
export const USDe = "0x5d3a1Ff2b6BAb83b63cd9AD0787074081a52ef34";
export const sUSDe = "0x211Cc4DD073734dA055fbF44a2b4667d5E5fE5d2";

export const vsUSDe = "0x699658323d58eE25c69F1a29d476946ab011bD18";
export const vUSDe = "0x74ca6930108F775CC667894EEa33843e691680d7";
export const vPT_USDe_30Oct2025 = "0x6D0cDb3355c93A0cD20071aBbb3622731a95c73E";

export const GUARDIAN3 = "0x3a3284dc0faffb0b5f0d074c4c704d14326c98cf";

export const PRICE_LOWER_BOUND = parseUnits("0.94", 18);
export const PRICE_UPPER_BOUND = parseUnits("1.06", 18);
export const MAIN_ORACLE_ROLE = 0;
export const PIVOT_ORACLE_ROLE = 1;
export const FALLBACK_ORACLE_ROLE = 2;
export const MAX_STALE_PERIOD = 86400;

export const vip556 = () => {
  const meta = {
    version: "v2",
    title: "[BNB Chain] USDe oracle configuration and Stablecoins E-Mode parameters",
    description: `If passed, this VIP will perform the changes recommended by Chaos Labs in [this Venus community forum publication](https://community.venus.io/t/e-mode-and-liquidation-threshold-in-the-bnb-chain-core-pool/5339/10):

- Resilient Oracle configuration for [USDe](https://bscscan.com/address/0x5d3a1ff2b6bab83b63cd9ad0787074081a52ef34)
    - MAIN oracle: use the [USDT/USD Chainlink price feed](https://bscscan.com/address/0xB97Ad0E74fa7d920791E90258A6E2085088b4320#code)
    - PIVOT and FALLBACK: use the [USDe/USD Chainlink price feed](https://bscscan.com/address/0x10402B01cD2E6A9ed6DBe683CbC68f78Ff02f8FC)
    - Set the validation bounds between the main and pivot/fallback oracles at 0.94–1.06
- Risk parameters on the Stablecoins E-Mode group:
    - [USDe](https://app.venus.io/#/pool/0xfD36E2c2a6789Db23113685031d7F16329158384/market/0x74ca6930108F775CC667894EEa33843e691680d7?chainId=56&tab=supply): increase the Liquidation Threshold, from 92% to 92.5%
    - [sUSDe](https://app.venus.io/#/pool/0xfD36E2c2a6789Db23113685031d7F16329158384/market/0x699658323d58eE25c69F1a29d476946ab011bD18?chainId=56&tab=supply):
        - increase the Collateral Factor, from 89% to 89.5%
        - increase the Liquidation Threshold, from 91% to 91.5%
    - [PT-sUSDe-30OCT2025](https://app.venus.io/#/pool/0xfD36E2c2a6789Db23113685031d7F16329158384/market/0x6D0cDb3355c93A0cD20071aBbb3622731a95c73E?chainId=56&tab=supply):
        - increase the Collateral Factor, from 90% to 90.5%
        - increase the Liquidation Threshold, from 92% to 92.5%

Complete analysis and details of these recommendations are available in the above publication.`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: NETWORK_ADDRESSES.bscmainnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [
          USDT_CHAINLINK_ORACLE,
          "setDirectPrice(address,uint256)",
          NETWORK_ADDRESSES.bscmainnet.NORMAL_TIMELOCK,
        ],
      },
      {
        target: NETWORK_ADDRESSES.bscmainnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [
          USDT_CHAINLINK_ORACLE,
          "setDirectPrice(address,uint256)",
          NETWORK_ADDRESSES.bscmainnet.FAST_TRACK_TIMELOCK,
        ],
      },
      {
        target: NETWORK_ADDRESSES.bscmainnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [
          USDT_CHAINLINK_ORACLE,
          "setDirectPrice(address,uint256)",
          NETWORK_ADDRESSES.bscmainnet.CRITICAL_TIMELOCK,
        ],
      },
      {
        target: NETWORK_ADDRESSES.bscmainnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [USDT_CHAINLINK_ORACLE, "setDirectPrice(address,uint256)", GUARDIAN3],
      },
      {
        target: NETWORK_ADDRESSES.bscmainnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [USDT_CHAINLINK_ORACLE, "setTokenConfig(TokenConfig)", NETWORK_ADDRESSES.bscmainnet.NORMAL_TIMELOCK],
      },
      {
        target: NETWORK_ADDRESSES.bscmainnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [
          USDT_CHAINLINK_ORACLE,
          "setTokenConfig(TokenConfig)",
          NETWORK_ADDRESSES.bscmainnet.FAST_TRACK_TIMELOCK,
        ],
      },
      {
        target: NETWORK_ADDRESSES.bscmainnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [USDT_CHAINLINK_ORACLE, "setTokenConfig(TokenConfig)", NETWORK_ADDRESSES.bscmainnet.CRITICAL_TIMELOCK],
      },
      {
        target: NETWORK_ADDRESSES.bscmainnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [USDT_CHAINLINK_ORACLE, "setTokenConfig(TokenConfig)", GUARDIAN3],
      },
      {
        target: USDT_CHAINLINK_ORACLE,
        signature: "acceptOwnership()",
        params: [],
      },
      {
        target: USDT_CHAINLINK_ORACLE,
        signature: "setTokenConfig((address,address,uint256))",
        params: [[USDe, NETWORK_ADDRESSES.bscmainnet.USDT_CHAINLINK_FEED, MAX_STALE_PERIOD]],
      },
      {
        target: BOUND_VALIDATOR,
        signature: "setValidateConfig((address,uint256,uint256))",
        params: [[USDe, PRICE_UPPER_BOUND, PRICE_LOWER_BOUND]],
      },
      {
        target: NETWORK_ADDRESSES.bscmainnet.RESILIENT_ORACLE,
        signature: "setOracle(address,address,uint8)",
        params: [USDe, USDT_CHAINLINK_ORACLE, MAIN_ORACLE_ROLE],
      },
      {
        target: NETWORK_ADDRESSES.bscmainnet.RESILIENT_ORACLE,
        signature: "setOracle(address,address,uint8)",
        params: [USDe, EXISTING_USDE_FALLBACK_ORACLE, PIVOT_ORACLE_ROLE],
      },
      {
        target: NETWORK_ADDRESSES.bscmainnet.RESILIENT_ORACLE,
        signature: "setOracle(address,address,uint8)",
        params: [USDe, EXISTING_USDE_FALLBACK_ORACLE, FALLBACK_ORACLE_ROLE],
      },
      {
        target: NETWORK_ADDRESSES.bscmainnet.UNITROLLER,
        signature: "setCollateralFactor(uint96,address,uint256,uint256)",
        params: [1, vsUSDe, parseUnits("0.895", 18), parseUnits("0.915", 18)],
      },
      {
        target: NETWORK_ADDRESSES.bscmainnet.UNITROLLER,
        signature: "setCollateralFactor(uint96,address,uint256,uint256)",
        params: [1, vUSDe, parseUnits("0.90", 18), parseUnits("0.925", 18)],
      },
      {
        target: NETWORK_ADDRESSES.bscmainnet.UNITROLLER,
        signature: "setCollateralFactor(uint96,address,uint256,uint256)",
        params: [1, vPT_USDe_30Oct2025, parseUnits("0.905", 18), parseUnits("0.925", 18)],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip556;
