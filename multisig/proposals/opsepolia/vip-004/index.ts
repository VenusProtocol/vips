import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES, ZERO_ADDRESS } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { opsepolia } = NETWORK_ADDRESSES;

export const ACM = "0x1652E12C8ABE2f0D84466F0fc1fA4286491B3BC1";
export const COMPTROLLER_CORE = "0x59d10988974223B042767aaBFb6D926863069535";

export const MOCK_WBTC = "0x9f5039a86AF12AB10Ff16659eA0885bb4C04d013";
export const WETH = "0x4200000000000000000000000000000000000006";
export const MOCK_USDT = "0x9AD0542c71c09B764cf58d38918892F3Ae7ecc63";
export const MOCK_USDC = "0x71B49d40B10Aa76cc44954e821eB6eA038Cf196F";
export const MOCK_OP = "0xEC5f6eB84677F562FC568B89121C5E5C19639776";

export const VWBTC_CORE = "0x6149eFAd7671f496C900B3BeC16Ba31Aed60BE4b";
export const VWETH_CORE = "0x4E610626BeF901EEE22D558b2ed19e6f7B87cf51";
export const VUSDC_CORE = "0x2419606690B08060ebFd7581e0a6Ae45f1915ee9";
export const VUSDT_CORE = "0xC23D18536E7069f924B3717B2710CA6A09e53ea9";
export const VOP_CORE = "0x49cceCdd0b399C1b13260452893A3A835bDad5DC";

export const PSR = "0x0F021c29283c47DF8237741dD5a0aA22952aFc88";

// IL configuration
const vip004 = () => {
  return makeProposal([
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setCollateralFactor(address,uint256,uint256)", opsepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setMarketSupplyCaps(address[],uint256[])", opsepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setMarketBorrowCaps(address[],uint256[])", opsepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setLiquidationIncentive(uint256)", opsepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setCloseFactor(uint256)", opsepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setMinLiquidatableCollateral(uint256)", opsepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setActionsPaused(address[],uint256[],bool)", opsepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "addPool(string,address,uint256,uint256,uint256)", opsepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setPoolName(address,string)", opsepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "updatePoolMetadata(address,VenusPoolMetaData)", opsepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setProtocolSeizeShare(uint256)", opsepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setReserveFactor(uint256)", opsepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setInterestRateModel(address)", opsepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "updateJumpRateModel(uint256,uint256,uint256,uint256)", opsepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setRewardTokenSpeeds(address[],uint256[],uint256[])", opsepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setLastRewardingBlock(address[],uint32[],uint32[])", opsepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setCollateralFactor(address,uint256,uint256)", opsepolia.POOL_REGISTRY],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [opsepolia.POOL_REGISTRY, "addMarket(AddMarketInput)", opsepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setReduceReservesBlockDelta(uint256)", opsepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setMarketSupplyCaps(address[],uint256[])", opsepolia.POOL_REGISTRY],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setMarketBorrowCaps(address[],uint256[])", opsepolia.POOL_REGISTRY],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setLiquidationIncentive(uint256)", opsepolia.POOL_REGISTRY],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setCloseFactor(uint256)", opsepolia.POOL_REGISTRY],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setMinLiquidatableCollateral(uint256)", opsepolia.POOL_REGISTRY],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "supportMarket(address)", opsepolia.POOL_REGISTRY],
    },
    { target: opsepolia.POOL_REGISTRY, signature: "acceptOwnership()", params: [] },
    { target: COMPTROLLER_CORE, signature: "acceptOwnership()", params: [] },
    {
      target: COMPTROLLER_CORE,
      signature: "setPriceOracle(address)",
      params: [opsepolia.RESILIENT_ORACLE],
    },
    {
      target: opsepolia.POOL_REGISTRY,
      signature: "addPool(string,address,uint256,uint256,uint256)",
      params: ["Core", COMPTROLLER_CORE, parseUnits("0.5", 18), parseUnits("1.1", 18), parseUnits("100", 18)],
    },
    {
      target: opsepolia.VTREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [MOCK_WBTC, "3553143", opsepolia.GUARDIAN],
    },
    {
      target: MOCK_WBTC,
      signature: "approve(address,uint256)",
      params: [opsepolia.POOL_REGISTRY, 0],
    },
    {
      target: MOCK_WBTC,
      signature: "approve(address,uint256)",
      params: [opsepolia.POOL_REGISTRY, "3553143"],
    },
    {
      target: VWBTC_CORE,
      signature: "setReduceReservesBlockDelta(uint256)",
      params: ["86400"],
    },
    {
      target: VWBTC_CORE,
      signature: "setProtocolShareReserve(address)",
      params: [PSR],
    },
    {
      target: opsepolia.POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [
        [
          VWBTC_CORE,
          parseUnits("0.7", 18),
          parseUnits("0.75", 18),
          "3553143",
          opsepolia.VTREASURY,
          parseUnits("1", 8),
          parseUnits(".55", 8),
        ],
      ],
    },
    {
      target: opsepolia.VTREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [WETH, "610978879332136515", opsepolia.GUARDIAN],
    },
    {
      target: WETH,
      signature: "approve(address,uint256)",
      params: [opsepolia.POOL_REGISTRY, 0],
    },
    {
      target: WETH,
      signature: "approve(address,uint256)",
      params: [opsepolia.POOL_REGISTRY, "610978879332136515"],
    },
    {
      target: VWETH_CORE,
      signature: "setReduceReservesBlockDelta(uint256)",
      params: ["86400"],
    },
    {
      target: VWETH_CORE,
      signature: "setProtocolShareReserve(address)",
      params: [PSR],
    },
    {
      target: opsepolia.POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [
        [
          VWETH_CORE,
          parseUnits("0.7", 18),
          parseUnits("0.75", 18),
          "610978879332136515",
          opsepolia.VTREASURY,
          parseUnits("25", 18),
          parseUnits("16", 18),
        ],
      ],
    },
    {
      target: opsepolia.VTREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [MOCK_USDC, parseUnits("1800", 6), opsepolia.GUARDIAN],
    },
    {
      target: MOCK_USDC,
      signature: "approve(address,uint256)",
      params: [opsepolia.POOL_REGISTRY, 0],
    },
    {
      target: MOCK_USDC,
      signature: "approve(address,uint256)",
      params: [opsepolia.POOL_REGISTRY, parseUnits("1800", 6)],
    },
    {
      target: VUSDC_CORE,
      signature: "setReduceReservesBlockDelta(uint256)",
      params: ["86400"],
    },
    {
      target: VUSDC_CORE,
      signature: "setProtocolShareReserve(address)",
      params: [PSR],
    },
    {
      target: opsepolia.POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [
        [
          VUSDC_CORE,
          parseUnits("0.75", 18),
          parseUnits("0.77", 18),
          parseUnits("1800", 6),
          opsepolia.VTREASURY,
          parseUnits("150000", 6),
          parseUnits("130000", 6),
        ],
      ],
    },
    {
      target: opsepolia.VTREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [MOCK_USDT, parseUnits("1800", 6), opsepolia.GUARDIAN],
    },
    {
      target: MOCK_USDT,
      signature: "approve(address,uint256)",
      params: [opsepolia.POOL_REGISTRY, 0],
    },
    {
      target: MOCK_USDT,
      signature: "approve(address,uint256)",
      params: [opsepolia.POOL_REGISTRY, parseUnits("1800", 6)],
    },
    {
      target: VUSDT_CORE,
      signature: "setReduceReservesBlockDelta(uint256)",
      params: ["86400"],
    },
    {
      target: VUSDT_CORE,
      signature: "setProtocolShareReserve(address)",
      params: [PSR],
    },
    {
      target: opsepolia.POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [
        [
          VUSDT_CORE,
          parseUnits("0.75", 18),
          parseUnits("0.77", 18),
          parseUnits("1800", 6),
          opsepolia.VTREASURY,
          parseUnits("150000", 6),
          parseUnits("130000", 6),
        ],
      ],
    },
    {
      target: opsepolia.VTREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [MOCK_OP, "610978879332136515", opsepolia.GUARDIAN],
    },
    {
      target: MOCK_OP,
      signature: "approve(address,uint256)",
      params: [opsepolia.POOL_REGISTRY, 0],
    },
    {
      target: MOCK_OP,
      signature: "approve(address,uint256)",
      params: [opsepolia.POOL_REGISTRY, "610978879332136515"],
    },
    {
      target: VOP_CORE,
      signature: "setReduceReservesBlockDelta(uint256)",
      params: ["86400"],
    },
    {
      target: VOP_CORE,
      signature: "setProtocolShareReserve(address)",
      params: [PSR],
    },
    {
      target: opsepolia.POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [
        [
          VOP_CORE,
          parseUnits("0.7", 18),
          parseUnits("0.75", 18),
          "610978879332136515",
          opsepolia.VTREASURY,
          parseUnits("25", 18),
          parseUnits("16", 18),
        ],
      ],
    },
  ]);
};

export default vip004;
