import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const USDT_CHAINLINK_ORACLE = "0x188b608544Fa32D313DE3BBB0480a238c0906e2a";
export const EXISTING_USDE_MAIN_ORACLE = NETWORK_ADDRESSES.bsctestnet.REDSTONE_ORACLE;
export const EXISTING_USDE_FALLBACK_ORACLE = NETWORK_ADDRESSES.bsctestnet.CHAINLINK_ORACLE;

export const BOUND_VALIDATOR = "0x2842140e4Ad3a92e9af30e27e290300dd785076d";
export const USDe = "0x986C30591f5aAb401ea3aa63aFA595608721B1B9";
export const vsUSDe = "0x8c8A1a0b6e1cb8058037F7bF24de6b79Aca5B7B0";
export const vUSDe = "0x86f8DfB7CA84455174EE9C3edd94867b51Da46BD";
export const vPT_USDe_30Oct2025 = "0x86a94290f2B8295daA3e53bA1286f2Ff21199143";

export const PRICE_LOWER_BOUND = parseUnits("0.94", 18);
export const PRICE_UPPER_BOUND = parseUnits("1.06", 18);
export const MAIN_ORACLE_ROLE = 0;
export const PIVOT_ORACLE_ROLE = 1;
export const FALLBACK_ORACLE_ROLE = 2;
export const MAX_STALE_PERIOD = 86400n;

export const vip666 = () => {
  const meta = {
    version: "v2",
    title: "Update the USDe oracle configuration",
    description: "WIP",
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: NETWORK_ADDRESSES.bsctestnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [
          USDT_CHAINLINK_ORACLE,
          "setDirectPrice(address,uint256)",
          NETWORK_ADDRESSES.bsctestnet.NORMAL_TIMELOCK,
        ],
      },
      {
        target: NETWORK_ADDRESSES.bsctestnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [
          USDT_CHAINLINK_ORACLE,
          "setDirectPrice(address,uint256)",
          NETWORK_ADDRESSES.bsctestnet.FAST_TRACK_TIMELOCK,
        ],
      },
      {
        target: NETWORK_ADDRESSES.bsctestnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [
          USDT_CHAINLINK_ORACLE,
          "setDirectPrice(address,uint256)",
          NETWORK_ADDRESSES.bsctestnet.CRITICAL_TIMELOCK,
        ],
      },
      {
        target: NETWORK_ADDRESSES.bsctestnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [USDT_CHAINLINK_ORACLE, "setTokenConfig(TokenConfig)", NETWORK_ADDRESSES.bsctestnet.NORMAL_TIMELOCK],
      },
      {
        target: NETWORK_ADDRESSES.bsctestnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [
          USDT_CHAINLINK_ORACLE,
          "setTokenConfig(TokenConfig)",
          NETWORK_ADDRESSES.bsctestnet.FAST_TRACK_TIMELOCK,
        ],
      },
      {
        target: NETWORK_ADDRESSES.bsctestnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [USDT_CHAINLINK_ORACLE, "setTokenConfig(TokenConfig)", NETWORK_ADDRESSES.bsctestnet.CRITICAL_TIMELOCK],
      },
      {
        target: USDT_CHAINLINK_ORACLE,
        signature: "acceptOwnership()",
        params: [],
      },
      {
        target: USDT_CHAINLINK_ORACLE,
        signature: "setTokenConfig((address,address,uint256))",
        params: [[USDe, NETWORK_ADDRESSES.bsctestnet.USDT_CHAINLINK_FEED, MAX_STALE_PERIOD]],
      },
      {
        target: BOUND_VALIDATOR,
        signature: "setValidateConfig((address,uint256,uint256))",
        params: [[USDe, PRICE_UPPER_BOUND, PRICE_LOWER_BOUND]],
      },
      {
        target: NETWORK_ADDRESSES.bsctestnet.RESILIENT_ORACLE,
        signature: "setOracle(address,address,uint8)",
        params: [USDe, USDT_CHAINLINK_ORACLE, MAIN_ORACLE_ROLE],
      },
      {
        target: NETWORK_ADDRESSES.bsctestnet.RESILIENT_ORACLE,
        signature: "setOracle(address,address,uint8)",
        params: [USDe, EXISTING_USDE_MAIN_ORACLE, PIVOT_ORACLE_ROLE],
      },
      {
        target: NETWORK_ADDRESSES.bsctestnet.RESILIENT_ORACLE,
        signature: "setOracle(address,address,uint8)",
        params: [USDe, EXISTING_USDE_MAIN_ORACLE, FALLBACK_ORACLE_ROLE],
      },
      {
        target: NETWORK_ADDRESSES.bsctestnet.UNITROLLER,
        signature: "setCollateralFactor(uint96,address,uint256,uint256)",
        params: [1, vsUSDe, parseUnits("0.895", 18), parseUnits("0.915", 18)],
      },
      {
        target: NETWORK_ADDRESSES.bsctestnet.UNITROLLER,
        signature: "setCollateralFactor(uint96,address,uint256,uint256)",
        params: [1, vUSDe, parseUnits("0.90", 18), parseUnits("0.925", 18)],
      },
      {
        target: NETWORK_ADDRESSES.bsctestnet.UNITROLLER,
        signature: "setCollateralFactor(uint96,address,uint256,uint256)",
        params: [1, vPT_USDe_30Oct2025, parseUnits("0.905", 18), parseUnits("0.925", 18)],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
