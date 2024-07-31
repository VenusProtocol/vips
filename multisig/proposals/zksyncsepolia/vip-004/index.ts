import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES, ZERO_ADDRESS } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { zksyncsepolia } = NETWORK_ADDRESSES;

export const ACM = "0xD07f543d47c3a8997D6079958308e981AC14CD01";
export const COMPTROLLER_CORE = "0xC527DE08E43aeFD759F7c0e6aE85433923064669";

export const MOCK_WBTC = "0xeF891B3FA37FfD83Ce8cC7b682E4CADBD8fFc6F0";
export const MOCK_WETH = "0x53F7e72C7ac55b44c7cd73cC13D4EF4b121678e6";
export const MOCK_USDT = "0x9Bf62C9C6AaB7AB8e01271f0d7A401306579709B";
export const MOCK_USDC_e = "0xF98780C8a0843829f98e624d83C3FfDDf43BE984";
export const MOCK_ZK = "0x8A2E9048F5d658E88D6eD89DdD1F3B5cA0250B9F";

export const VWBTC_CORE = "0x9c2379ed8ab06B44328487f61873C7c44BD6E87D";
export const VWETH_CORE = "0x31eb7305f9fE281027028D0ba0d7f57ddA836d49";
export const VUSDC_e_CORE = "0x58b0b248BB11DCAA9336bBf8a81914201fD49461";
export const VUSDT_CORE = "0x7Bfd185eF8380a72027bF65bFEEAb0242b147778";
export const VZK_CORE = "0x92f4BD794303c0BD0791B350Be5531DB38414f47";

export const PSR = "0x5722B43BD91fAaDC4E7f384F4d6Fb32456Ec5ffB";

// IL configuration
const vip004 = () => {
  return makeProposal([
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setCollateralFactor(address,uint256,uint256)", zksyncsepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setMarketSupplyCaps(address[],uint256[])", zksyncsepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setMarketBorrowCaps(address[],uint256[])", zksyncsepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setLiquidationIncentive(uint256)", zksyncsepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setCloseFactor(uint256)", zksyncsepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setMinLiquidatableCollateral(uint256)", zksyncsepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setActionsPaused(address[],uint256[],bool)", zksyncsepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "addPool(string,address,uint256,uint256,uint256)", zksyncsepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setPoolName(address,string)", zksyncsepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "updatePoolMetadata(address,VenusPoolMetaData)", zksyncsepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setProtocolSeizeShare(uint256)", zksyncsepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setReserveFactor(uint256)", zksyncsepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setInterestRateModel(address)", zksyncsepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "updateJumpRateModel(uint256,uint256,uint256,uint256)", zksyncsepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setRewardTokenSpeeds(address[],uint256[],uint256[])", zksyncsepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setLastRewardingBlock(address[],uint32[],uint32[])", zksyncsepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setCollateralFactor(address,uint256,uint256)", zksyncsepolia.POOL_REGISTRY],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [zksyncsepolia.POOL_REGISTRY, "addMarket(AddMarketInput)", zksyncsepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setReduceReservesBlockDelta(uint256)", zksyncsepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setMarketSupplyCaps(address[],uint256[])", zksyncsepolia.POOL_REGISTRY],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setMarketBorrowCaps(address[],uint256[])", zksyncsepolia.POOL_REGISTRY],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setLiquidationIncentive(uint256)", zksyncsepolia.POOL_REGISTRY],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setCloseFactor(uint256)", zksyncsepolia.POOL_REGISTRY],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setMinLiquidatableCollateral(uint256)", zksyncsepolia.POOL_REGISTRY],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "supportMarket(address)", zksyncsepolia.POOL_REGISTRY],
    },
    { target: zksyncsepolia.POOL_REGISTRY, signature: "acceptOwnership()", params: [] },
    { target: COMPTROLLER_CORE, signature: "acceptOwnership()", params: [] },
    {
      target: COMPTROLLER_CORE,
      signature: "setPriceOracle(address)",
      params: [zksyncsepolia.RESILIENT_ORACLE],
    },
    {
      target: zksyncsepolia.POOL_REGISTRY,
      signature: "addPool(string,address,uint256,uint256,uint256)",
      params: ["Core", COMPTROLLER_CORE, parseUnits("0.5", 18), parseUnits("1.1", 18), parseUnits("100", 18)],
    },
    {
      target: zksyncsepolia.VTREASURY, // Will remove once vip-000 will be executed on zksyns sepolia
      signature: "acceptOwnership()",
      params: [],
    },
    {
      target: zksyncsepolia.VTREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [MOCK_WBTC, parseUnits("0.075", 8), zksyncsepolia.GUARDIAN],
    },
    {
      target: MOCK_WBTC,
      signature: "approve(address,uint256)",
      params: [zksyncsepolia.POOL_REGISTRY, 0],
    },
    {
      target: MOCK_WBTC,
      signature: "approve(address,uint256)",
      params: [zksyncsepolia.POOL_REGISTRY, parseUnits("0.075", 8)],
    },
    {
      target: VWBTC_CORE,
      signature: "setReduceReservesBlockDelta(uint256)",
      params: ["86400"],
    },
    {
      target: zksyncsepolia.POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [
        [
          VWBTC_CORE,
          parseUnits("0.75", 18), // CF
          parseUnits("0.80", 18), // LT
          parseUnits("0.075", 8), // initial supply
          zksyncsepolia.VTREASURY,
          parseUnits("900", 8), // supply cap
          parseUnits("500", 8), // borrow cap
        ],
      ],
    },
    {
      target: zksyncsepolia.VTREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [MOCK_WETH, parseUnits("1.5", 18), zksyncsepolia.GUARDIAN],
    },
    {
      target: MOCK_WETH,
      signature: "approve(address,uint256)",
      params: [zksyncsepolia.POOL_REGISTRY, 0],
    },
    {
      target: MOCK_WETH,
      signature: "approve(address,uint256)",
      params: [zksyncsepolia.POOL_REGISTRY, parseUnits("1.5", 18)],
    },
    {
      target: VWETH_CORE,
      signature: "setReduceReservesBlockDelta(uint256)",
      params: ["86400"],
    },
    {
      target: zksyncsepolia.POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [
        [
          VWETH_CORE,
          parseUnits("0.75", 18), // CF
          parseUnits("0.80", 18), // LT
          parseUnits("1.5", 18), // initial supply
          zksyncsepolia.VTREASURY,
          parseUnits("26000", 18), // supply cap
          parseUnits("23500", 18), // borrow cap
        ],
      ],
    },
    {
      target: zksyncsepolia.VTREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [MOCK_USDC_e, parseUnits("5000", 6), zksyncsepolia.GUARDIAN],
    },
    {
      target: MOCK_USDC_e,
      signature: "approve(address,uint256)",
      params: [zksyncsepolia.POOL_REGISTRY, 0],
    },
    {
      target: MOCK_USDC_e,
      signature: "approve(address,uint256)",
      params: [zksyncsepolia.POOL_REGISTRY, parseUnits("5000", 6)],
    },
    {
      target: VUSDC_e_CORE,
      signature: "setReduceReservesBlockDelta(uint256)",
      params: ["86400"],
    },
    {
      target: zksyncsepolia.POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [
        [
          VUSDC_e_CORE,
          parseUnits("0.78", 18), // CF
          parseUnits("0.80", 18), // LT
          parseUnits("5000", 6), // initial supply
          zksyncsepolia.VTREASURY,
          parseUnits("54000000", 6), // supply cap
          parseUnits("49000000", 6), // borrow cap
        ],
      ],
    },
    {
      target: zksyncsepolia.VTREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [MOCK_USDT, parseUnits("5000", 6), zksyncsepolia.GUARDIAN],
    },
    {
      target: MOCK_USDT,
      signature: "approve(address,uint256)",
      params: [zksyncsepolia.POOL_REGISTRY, 0],
    },
    {
      target: MOCK_USDT,
      signature: "approve(address,uint256)",
      params: [zksyncsepolia.POOL_REGISTRY, parseUnits("5000", 6)],
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
      target: zksyncsepolia.POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [
        [
          VUSDT_CORE,
          parseUnits("0.78", 18), // CF
          parseUnits("0.80", 18), // LT
          parseUnits("5000", 6), // initial supply
          zksyncsepolia.VTREASURY,
          parseUnits("20000000", 6), // supply cap
          parseUnits("18000000", 6), // borrow cap
        ],
      ],
    },
    {
      target: zksyncsepolia.VTREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [MOCK_ZK, parseUnits("25000", 18), zksyncsepolia.GUARDIAN],
    },
    {
      target: MOCK_ZK,
      signature: "approve(address,uint256)",
      params: [zksyncsepolia.POOL_REGISTRY, 0],
    },
    {
      target: MOCK_ZK,
      signature: "approve(address,uint256)",
      params: [zksyncsepolia.POOL_REGISTRY, parseUnits("25000", 18)],
    },
    {
      target: VZK_CORE,
      signature: "setReduceReservesBlockDelta(uint256)",
      params: ["86400"],
    },
    {
      target: zksyncsepolia.POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [
        [
          VZK_CORE,
          parseUnits("0.75", 18), // CF
          parseUnits("0.80", 18), // LT
          parseUnits("25000", 18), // initial suply
          zksyncsepolia.VTREASURY,
          parseUnits("2500000", 18), // supply cap
          parseUnits("2350000", 18), // borrow cap
        ],
      ],
    },
  ]);
};

export default vip004;
