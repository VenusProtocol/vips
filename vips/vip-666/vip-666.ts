import { parseUnits } from "ethers/lib/utils";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const RESILIENT_ORACLE = "0x6592b5DE802159F3E74B2486b091D11a8256ab8A";

// TODO: update to the correct address
export const USDT_CHAINLINK_ORACLE = "TODO";
export const EXISTING_USDE_MAIN_ORACLE = "0x8455EFA4D7Ff63b8BFD96AdD889483Ea7d39B70a";
export const EXISTING_USDE_FALLBACK_ORACLE = "0x1B2103441A0A108daD8848D8F5d790e4D402921F";

export const BOUND_VALIDATOR = "0x6E332fF0bB52475304494E4AE5063c1051c7d735";
export const ACM = "0x4788629ABc6cFCA10F9f969efdEAa1cF70c23555";
export const USDe = "0x5d3a1Ff2b6BAb83b63cd9AD0787074081a52ef34";

export const CHAINLINK_USDT_FEED = "0xB97Ad0E74fa7d920791E90258A6E2085088b4320";

export const UNITROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";

export const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
export const FAST_TRACK_TIMELOCK = "0x555ba73dB1b006F3f2C7dB7126d6e4343aDBce02";
export const CRITICAL_TIMELOCK = "0x213c446ec11e45b15a6E29C1C1b402B8897f606d";

export const PRICE_LOWER_BOUND = parseUnits("0.94", 18);
export const PRICE_UPPER_BOUND = parseUnits("1.06", 18);
export const MAIN_ORACLE_ROLE = 0;
export const PIVOT_ORACLE_ROLE = 1;
export const FALLBACK_ORACLE_ROLE = 2;
export const MAX_STALE_PERIOD = 86400;

export const vsUSDe = "0x699658323d58eE25c69F1a29d476946ab011bD18";
export const vUSDe = "0x74ca6930108F775CC667894EEa33843e691680d7";
export const vPT_USDe_30Oct2025 = "0x6D0cDb3355c93A0cD20071aBbb3622731a95c73E";

export const vip666 = () => {
  const meta = {
    version: "v2",
    title: "Update the USDe oracle configuration",
    description: `#### Summary`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [USDT_CHAINLINK_ORACLE, "setDirectPrice(address,uint256)", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [USDT_CHAINLINK_ORACLE, "setDirectPrice(address,uint256)", FAST_TRACK_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [USDT_CHAINLINK_ORACLE, "setDirectPrice(address,uint256)", CRITICAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [USDT_CHAINLINK_ORACLE, "setTokenConfig(TokenConfig)", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [USDT_CHAINLINK_ORACLE, "setTokenConfig(TokenConfig)", FAST_TRACK_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [USDT_CHAINLINK_ORACLE, "setTokenConfig(TokenConfig)", CRITICAL_TIMELOCK],
      },
      {
        target: USDT_CHAINLINK_ORACLE,
        signature: "acceptOwnership()",
        params: [],
      },
      {
        target: USDT_CHAINLINK_ORACLE,
        signature: "setTokenConfig((address,address,uint256))",
        params: [[USDe, CHAINLINK_USDT_FEED, MAX_STALE_PERIOD]],
      },
      {
        target: BOUND_VALIDATOR,
        signature: "setValidateConfig((address,uint256,uint256))",
        params: [[USDe, PRICE_UPPER_BOUND, PRICE_LOWER_BOUND]],
      },
      {
        target: RESILIENT_ORACLE,
        signature: "setOracle(address,address,uint8)",
        params: [USDe, USDT_CHAINLINK_ORACLE, MAIN_ORACLE_ROLE],
      },
      {
        target: RESILIENT_ORACLE,
        signature: "setOracle(address,address,uint8)",
        params: [USDe, EXISTING_USDE_MAIN_ORACLE, PIVOT_ORACLE_ROLE],
      },
      {
        target: RESILIENT_ORACLE,
        signature: "setOracle(address,address,uint8)",
        params: [USDe, EXISTING_USDE_MAIN_ORACLE, FALLBACK_ORACLE_ROLE],
      },
      {
        target: UNITROLLER,
        signature: "setCollateralFactor(uint96,address,uint256,uint256)",
        params: [1, vsUSDe, parseUnits("0.895", 18), parseUnits("0.915", 18)],
      },
      {
        target: UNITROLLER,
        signature: "setCollateralFactor(uint96,address,uint256,uint256)",
        params: [1, vUSDe, parseUnits("0.90", 18), parseUnits("0.925", 18)],
      },
      {
        target: UNITROLLER,
        signature: "setCollateralFactor(uint96,address,uint256,uint256)",
        params: [1, vPT_USDe_30Oct2025, parseUnits("0.905", 18), parseUnits("0.925", 18)],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
