import { parseUnits } from "ethers/lib/utils";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const RESILIENT_ORACLE = "0x3cD69251D04A28d887Ac14cbe2E14c52F3D57823";
export const USDT_CHAINLINK_ORACLE = "0x188b608544Fa32D313DE3BBB0480a238c0906e2a";
export const EXISTING_USDE_MAIN_ORACLE = "0x0Af51d1504ac5B711A9EAFe2fAC11A51d32029Ad";
export const EXISTING_USDE_FALLBACK_ORACLE = "0xCeA29f1266e880A1482c06eD656cD08C148BaA32";

export const BOUND_VALIDATOR = "0x2842140e4Ad3a92e9af30e27e290300dd785076d";
export const ACM = "0x45f8a08F534f34A97187626E05d4b6648Eeaa9AA";
export const USDe = "0x986C30591f5aAb401ea3aa63aFA595608721B1B9";

// https://docs.chain.link/data-feeds/price-feeds/addresses?page=1&testnetPage=1&network=bnb-chain&testnetSearch=usdt&search=
export const CHAINLINK_USDT_FEED = "0xEca2605f0BCF2BA5966372C99837b1F182d3D620";

export const NORMAL_TIMELOCK = "0xce10739590001705F7FF231611ba4A48B2820327";
export const FAST_TRACK_TIMELOCK = "0x3CFf21b7AF8390fE68799D58727d3b4C25a83cb6";
export const CRITICAL_TIMELOCK = "0x23B893a7C45a5Eb8c8C062b9F32d0D2e43eD286D";

export const UNITROLLER = "0x94d1820b2D1c7c7452A163983Dc888CEC546b77D";

export const PRICE_LOWER_BOUND = parseUnits("0.94", 18);
export const PRICE_UPPER_BOUND = parseUnits("1.06", 18);
export const MAIN_ORACLE_ROLE = 0;
export const PIVOT_ORACLE_ROLE = 1;
export const FALLBACK_ORACLE_ROLE = 2;
export const MAX_STALE_PERIOD = 86400n;

export const vsUSDe = "0x8c8A1a0b6e1cb8058037F7bF24de6b79Aca5B7B0";
export const vUSDe = "0x86f8DfB7CA84455174EE9C3edd94867b51Da46BD"
export const vPT_USDe_30Oct2025 = "0x86a94290f2B8295daA3e53bA1286f2Ff21199143";


export const vip666 = () => {
  const meta = {
    version: "v2",
    title: "Update the USDe oracle configuration",
    description:
      "WIP",
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
        params: [
          1,
          vsUSDe,
          parseUnits("0.895", 18),
          parseUnits("0.915", 18),
        ],
      },
      {
        target: UNITROLLER,
        signature: "setCollateralFactor(uint96,address,uint256,uint256)",
        params: [
          1,
          vUSDe,
          parseUnits("0.90", 18),
          parseUnits("0.925", 18),
        ],
      },
      {
        target: UNITROLLER,
        signature: "setCollateralFactor(uint96,address,uint256,uint256)",
        params: [
          1,
          vPT_USDe_30Oct2025,
          parseUnits("0.905", 18),
          parseUnits("0.925", 18),
        ],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
