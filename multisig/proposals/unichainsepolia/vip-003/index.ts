import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES, ZERO_ADDRESS } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { unichainsepolia } = NETWORK_ADDRESSES;

export const ACM = "0x854C064EA6b503A97980F481FA3B7279012fdeDd";
export const COMPTROLLER_CORE = "0xFeD3eAA668a6179c9E5E1A84e3A7d6883F06f7c1";

export const cbBTC = "0x2979ef1676bb28192ac304173C717D7322b3b586";
export const WETH = "0x4200000000000000000000000000000000000006";
export const USDT = "0x7bc1b67fde923fd3667Fde59684c6c354C8EbFdA";
export const USDC = "0xf16d4774893eB578130a645d5c69E9c4d183F3A5";

export const VcbBTC_CORE = "0x7d39496Ac9FdA5a336CB2A96FD5Eaa022Fd6Fb05";
export const VWETH_CORE = "0x3dEAcBe87e4B6333140a46aBFD12215f4130B132";
export const VUSDC_CORE = "0x0CA7edfcCF5dbf8AFdeAFB2D918409d439E3320A";
export const VUSDT_CORE = "0x2d8814e1358D71B6B271295893F7409E3127CBBf";

export const cbBTC_INITIAL_SUPPLY = parseUnits("0.08", 8);
export const WETH_INITIAL_SUPPLY = parseUnits("2", 18);
export const USDT_INITIAL_SUPPLY = parseUnits("5000", 6);
export const USDC_INITIAL_SUPPLY = parseUnits("5000", 6);

// IL configuration
const vip003 = () => {
  return makeProposal([
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setCollateralFactor(address,uint256,uint256)", unichainsepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setMarketSupplyCaps(address[],uint256[])", unichainsepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setMarketBorrowCaps(address[],uint256[])", unichainsepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setLiquidationIncentive(uint256)", unichainsepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setCloseFactor(uint256)", unichainsepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setMinLiquidatableCollateral(uint256)", unichainsepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setActionsPaused(address[],uint256[],bool)", unichainsepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setForcedLiquidation(address,bool)", unichainsepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [
        unichainsepolia.POOL_REGISTRY,
        "addPool(string,address,uint256,uint256,uint256)",
        unichainsepolia.GUARDIAN,
      ],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [unichainsepolia.POOL_REGISTRY, "setPoolName(address,string)", unichainsepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [
        unichainsepolia.POOL_REGISTRY,
        "updatePoolMetadata(address,VenusPoolMetaData)",
        unichainsepolia.GUARDIAN,
      ],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setProtocolSeizeShare(uint256)", unichainsepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setReserveFactor(uint256)", unichainsepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setInterestRateModel(address)", unichainsepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "updateJumpRateModel(uint256,uint256,uint256,uint256)", unichainsepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setRewardTokenSpeeds(address[],uint256[],uint256[])", unichainsepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setLastRewardingBlock(address[],uint32[],uint32[])", unichainsepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setCollateralFactor(address,uint256,uint256)", unichainsepolia.POOL_REGISTRY],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [unichainsepolia.POOL_REGISTRY, "addMarket(AddMarketInput)", unichainsepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setReduceReservesBlockDelta(uint256)", unichainsepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setMarketSupplyCaps(address[],uint256[])", unichainsepolia.POOL_REGISTRY],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setMarketBorrowCaps(address[],uint256[])", unichainsepolia.POOL_REGISTRY],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setLiquidationIncentive(uint256)", unichainsepolia.POOL_REGISTRY],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setCloseFactor(uint256)", unichainsepolia.POOL_REGISTRY],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setMinLiquidatableCollateral(uint256)", unichainsepolia.POOL_REGISTRY],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "supportMarket(address)", unichainsepolia.POOL_REGISTRY],
    },
    { target: unichainsepolia.POOL_REGISTRY, signature: "acceptOwnership()", params: [] },
    { target: COMPTROLLER_CORE, signature: "acceptOwnership()", params: [] },
    {
      target: COMPTROLLER_CORE,
      signature: "setPriceOracle(address)",
      params: [unichainsepolia.RESILIENT_ORACLE],
    },
    {
      target: unichainsepolia.POOL_REGISTRY,
      signature: "addPool(string,address,uint256,uint256,uint256)",
      params: ["Core", COMPTROLLER_CORE, parseUnits("0.5", 18), parseUnits("1.1", 18), parseUnits("100", 18)],
    },
    {
      target: unichainsepolia.VTREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [cbBTC, cbBTC_INITIAL_SUPPLY, unichainsepolia.GUARDIAN],
    },
    {
      target: cbBTC,
      signature: "approve(address,uint256)",
      params: [unichainsepolia.POOL_REGISTRY, 0],
    },
    {
      target: cbBTC,
      signature: "approve(address,uint256)",
      params: [unichainsepolia.POOL_REGISTRY, cbBTC_INITIAL_SUPPLY],
    },
    {
      target: VcbBTC_CORE,
      signature: "setReduceReservesBlockDelta(uint256)",
      params: ["86400"],
    },
    {
      target: unichainsepolia.POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [
        [
          VcbBTC_CORE,
          parseUnits("0.75", 18), // CF
          parseUnits("0.80", 18), // LT
          cbBTC_INITIAL_SUPPLY, // initial supply
          unichainsepolia.VTREASURY,
          parseUnits("900", 8), // supply cap
          parseUnits("500", 8), // borrow cap
        ],
      ],
    },
    {
      target: unichainsepolia.VTREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [WETH, WETH_INITIAL_SUPPLY, unichainsepolia.GUARDIAN],
    },
    {
      target: WETH,
      signature: "approve(address,uint256)",
      params: [unichainsepolia.POOL_REGISTRY, 0],
    },
    {
      target: WETH,
      signature: "approve(address,uint256)",
      params: [unichainsepolia.POOL_REGISTRY, WETH_INITIAL_SUPPLY],
    },
    {
      target: VWETH_CORE,
      signature: "setReduceReservesBlockDelta(uint256)",
      params: ["86400"],
    },
    {
      target: unichainsepolia.POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [
        [
          VWETH_CORE,
          parseUnits("0.75", 18), // CF
          parseUnits("0.80", 18), // LT
          WETH_INITIAL_SUPPLY, // initial supply
          unichainsepolia.VTREASURY,
          parseUnits("26000", 18), // supply cap
          parseUnits("23500", 18), // borrow cap
        ],
      ],
    },
    {
      target: unichainsepolia.VTREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [USDC, USDC_INITIAL_SUPPLY, unichainsepolia.GUARDIAN],
    },
    {
      target: USDC,
      signature: "approve(address,uint256)",
      params: [unichainsepolia.POOL_REGISTRY, 0],
    },
    {
      target: USDC,
      signature: "approve(address,uint256)",
      params: [unichainsepolia.POOL_REGISTRY, USDC_INITIAL_SUPPLY],
    },
    {
      target: VUSDC_CORE,
      signature: "setReduceReservesBlockDelta(uint256)",
      params: ["86400"],
    },
    {
      target: unichainsepolia.POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [
        [
          VUSDC_CORE,
          parseUnits("0.78", 18), // CF
          parseUnits("0.80", 18), // LT
          USDC_INITIAL_SUPPLY, // initial supply
          unichainsepolia.VTREASURY,
          parseUnits("20000000", 6), // supply cap
          parseUnits("18000000", 6), // borrow cap
        ],
      ],
    },
    {
      target: unichainsepolia.VTREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [USDT, USDT_INITIAL_SUPPLY, unichainsepolia.GUARDIAN],
    },
    {
      target: USDT,
      signature: "approve(address,uint256)",
      params: [unichainsepolia.POOL_REGISTRY, 0],
    },
    {
      target: USDT,
      signature: "approve(address,uint256)",
      params: [unichainsepolia.POOL_REGISTRY, USDT_INITIAL_SUPPLY],
    },
    {
      target: VUSDT_CORE,
      signature: "setReduceReservesBlockDelta(uint256)",
      params: ["86400"],
    },
    {
      target: unichainsepolia.POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [
        [
          VUSDT_CORE,
          parseUnits("0.78", 18), // CF
          parseUnits("0.80", 18), // LT
          USDT_INITIAL_SUPPLY, // initial supply
          unichainsepolia.VTREASURY,
          parseUnits("20000000", 6), // supply cap
          parseUnits("18000000", 6), // borrow cap
        ],
      ],
    },
  ]);
};

export default vip003;
