import { ProposalType } from "../src/types";
import { makeProposal } from "../src/utils";

const ANY_TARGET_CONTRACT = "0x0000000000000000000000000000000000000000";

const ACCESS_CONTROL_MANAGER = "0x4788629ABc6cFCA10F9f969efdEAa1cF70c23555";
const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
const FAST_TRACK_TIMELOCK = "0x555ba73dB1b006F3f2C7dB7126d6e4343aDBce02";
const CRITICAL_TIMELOCK = "0x213c446ec11e45b15a6E29C1C1b402B8897f606d";

const RISK_MANAGER_MULTISIG = "0x7B1AE5Ea599bC56734624b95589e7E8E64C351c9";
const PAUSE_GUARDIAN_MULTISIG = "0x1C2CAc6ec528c20800B2fe734820D87b581eAA6B";

const RESILIENT_ORACLE = "0x6592b5DE802159F3E74B2486b091D11a8256ab8A";
const POOL_REGISTRY = "0x9F7b01A536aFA00EF10310A162877fd792cD0666";
const COMPTROLLER_STABLECOINS = "0x94c1495cD4c557f1560Cbd68EAB0d197e6291571";
const SWAP_ROUTER_STABLECOINS = "0x50d8ac56FC8525dcA9F41b12De0dbc6bDf7771e3";
const TREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";

const HAY = "0x0782b6d8c4551B9760e74c0545a9bCD90bdc41E5";
const USDT = "0x55d398326f99059fF775485246999027B3197955";
const USDD = "0xd17479997F34dd9156Deef8F95A52D81D265be9c";
const VHAY_STABLECOINS = "0xCa2D81AA7C09A1a025De797600A7081146dceEd9";
const VUSDT_STABLECOINS = "0x5e3072305F9caE1c7A82F6Fe9E38811c74922c3B";
const VUSDD_STABLECOINS = "0xc3a45ad8812189cAb659aD99E64B1376f6aCD035";

const VHAY_RECEIVER = "0x09702Ea135d9D707DD51f530864f2B9220aAD87B";
const VUSDD_RECEIVER = "0x3DdfA8eC3052539b6C9549F12cEA2C295cfF5296";

export const vip134 = () => {
  const meta = {
    version: "v2",
    title: "Isolated lending, phase 1",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with IL Phase 1",
    againstDescription: "I do not think that Venus Protocol should proceed with IL Phase 1",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with IL Phase 1",
  };

  return makeProposal(
    [
      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [ANY_TARGET_CONTRACT, "setCollateralFactor(address,uint256,uint256)", POOL_REGISTRY],
      },
      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [ANY_TARGET_CONTRACT, "setMarketSupplyCaps(address[],uint256[])", POOL_REGISTRY],
      },
      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [ANY_TARGET_CONTRACT, "setMarketBorrowCaps(address[],uint256[])", POOL_REGISTRY],
      },
      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [ANY_TARGET_CONTRACT, "setLiquidationIncentive(uint256)", POOL_REGISTRY],
      },
      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [ANY_TARGET_CONTRACT, "setCloseFactor(uint256)", POOL_REGISTRY],
      },
      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [ANY_TARGET_CONTRACT, "setMinLiquidatableCollateral(uint256)", POOL_REGISTRY],
      },
      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [ANY_TARGET_CONTRACT, "supportMarket(address)", POOL_REGISTRY],
      },
      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [ANY_TARGET_CONTRACT, "setCloseFactor(uint256)", NORMAL_TIMELOCK],
      },
      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [ANY_TARGET_CONTRACT, "setCollateralFactor(address,uint256,uint256)", NORMAL_TIMELOCK],
      },
      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [ANY_TARGET_CONTRACT, "setLiquidationIncentive(uint256)", NORMAL_TIMELOCK],
      },
      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [ANY_TARGET_CONTRACT, "setMarketBorrowCaps(address[],uint256[])", NORMAL_TIMELOCK],
      },
      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [ANY_TARGET_CONTRACT, "setMarketSupplyCaps(address[],uint256[])", NORMAL_TIMELOCK],
      },
      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [ANY_TARGET_CONTRACT, "setActionsPaused(address[],uint256[],bool)", NORMAL_TIMELOCK],
      },
      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [ANY_TARGET_CONTRACT, "setMinLiquidatableCollateral(uint256)", NORMAL_TIMELOCK],
      },
      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [ANY_TARGET_CONTRACT, "addPool(string,address,uint256,uint256,uint256)", NORMAL_TIMELOCK],
      },
      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [ANY_TARGET_CONTRACT, "addMarket(AddMarketInput)", NORMAL_TIMELOCK],
      },
      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [ANY_TARGET_CONTRACT, "setPoolName(address,string)", NORMAL_TIMELOCK],
      },
      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [ANY_TARGET_CONTRACT, "updatePoolMetadata(address,VenusPoolMetaData)", NORMAL_TIMELOCK],
      },
      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [ANY_TARGET_CONTRACT, "setProtocolSeizeShare(uint256)", NORMAL_TIMELOCK],
      },
      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [ANY_TARGET_CONTRACT, "setReserveFactor(uint256)", NORMAL_TIMELOCK],
      },
      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [ANY_TARGET_CONTRACT, "setInterestRateModel(address)", NORMAL_TIMELOCK],
      },
      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [ANY_TARGET_CONTRACT, "setRewardTokenSpeeds(address[],uint256[],uint256[])", NORMAL_TIMELOCK],
      },
      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [ANY_TARGET_CONTRACT, "updateJumpRateModel(uint256,uint256,uint256,uint256)", NORMAL_TIMELOCK],
      },
      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [ANY_TARGET_CONTRACT, "setCollateralFactor(address,uint256,uint256)", FAST_TRACK_TIMELOCK],
      },
      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [ANY_TARGET_CONTRACT, "setMarketBorrowCaps(address[],uint256[])", FAST_TRACK_TIMELOCK],
      },
      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [ANY_TARGET_CONTRACT, "setMarketSupplyCaps(address[],uint256[])", FAST_TRACK_TIMELOCK],
      },
      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [ANY_TARGET_CONTRACT, "setActionsPaused(address[],uint256[],bool)", FAST_TRACK_TIMELOCK],
      },
      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [ANY_TARGET_CONTRACT, "setCollateralFactor(address,uint256,uint256)", CRITICAL_TIMELOCK],
      },
      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [ANY_TARGET_CONTRACT, "setMarketBorrowCaps(address[],uint256[])", CRITICAL_TIMELOCK],
      },
      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [ANY_TARGET_CONTRACT, "setMarketSupplyCaps(address[],uint256[])", CRITICAL_TIMELOCK],
      },
      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [ANY_TARGET_CONTRACT, "setActionsPaused(address[],uint256[],bool)", CRITICAL_TIMELOCK],
      },
      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [ANY_TARGET_CONTRACT, "setCollateralFactor(address,uint256,uint256)", RISK_MANAGER_MULTISIG],
      },
      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [ANY_TARGET_CONTRACT, "setMarketSupplyCaps(address[],uint256[])", RISK_MANAGER_MULTISIG],
      },
      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [ANY_TARGET_CONTRACT, "setMarketBorrowCaps(address[],uint256[])", RISK_MANAGER_MULTISIG],
      },
      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [ANY_TARGET_CONTRACT, "setActionsPaused(address[],uint256[],bool)", PAUSE_GUARDIAN_MULTISIG],
      },
      {
        target: POOL_REGISTRY,
        signature: "acceptOwnership()",
        params: [],
      },
      {
        target: COMPTROLLER_STABLECOINS,
        signature: "acceptOwnership()",
        params: [],
      },
      {
        target: SWAP_ROUTER_STABLECOINS,
        signature: "acceptOwnership()",
        params: [],
      },
      {
        target: COMPTROLLER_STABLECOINS,
        signature: "setPriceOracle(address)",
        params: [RESILIENT_ORACLE],
      },
      {
        target: POOL_REGISTRY,
        signature: "addPool(string,address,uint256,uint256,uint256)",
        params: [
          "Stablecoins",
          COMPTROLLER_STABLECOINS,
          "500000000000000000",
          "1100000000000000000",
          "100000000000000000000",
        ],
      },
      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [HAY, "25000000000000000000000", NORMAL_TIMELOCK],
      },
      {
        target: HAY,
        signature: "approve(address,uint256)",
        params: [POOL_REGISTRY, "0"],
      },
      {
        target: HAY,
        signature: "approve(address,uint256)",
        params: [POOL_REGISTRY, "25000000000000000000000"],
      },
      {
        target: POOL_REGISTRY,
        signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
        params: [
          [
            VHAY_STABLECOINS,
            "650000000000000000",
            "700000000000000000",
            "25000000000000000000000",
            VHAY_RECEIVER,
            "500000000000000000000000",
            "200000000000000000000000",
          ],
        ],
      },
      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT, "10000000000000000000000", NORMAL_TIMELOCK],
      },
      {
        target: USDT,
        signature: "approve(address,uint256)",
        params: [POOL_REGISTRY, "0"],
      },
      {
        target: USDT,
        signature: "approve(address,uint256)",
        params: [POOL_REGISTRY, "10000000000000000000000"],
      },
      {
        target: POOL_REGISTRY,
        signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
        params: [
          [
            VUSDT_STABLECOINS,
            "800000000000000000",
            "880000000000000000",
            "10000000000000000000000",
            TREASURY, // vTokenReceiver
            "1000000000000000000000000",
            "400000000000000000000000",
          ],
        ],
      },
      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDD, "10000000000000000000000", NORMAL_TIMELOCK],
      },
      {
        target: USDD,
        signature: "approve(address,uint256)",
        params: [POOL_REGISTRY, "0"],
      },
      {
        target: USDD,
        signature: "approve(address,uint256)",
        params: [POOL_REGISTRY, "10000000000000000000000"],
      },
      {
        target: POOL_REGISTRY,
        signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
        params: [
          [
            VUSDD_STABLECOINS,
            "650000000000000000",
            "700000000000000000",
            "10000000000000000000000",
            VUSDD_RECEIVER,
            "1000000000000000000000000",
            "400000000000000000000000",
          ],
        ],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
