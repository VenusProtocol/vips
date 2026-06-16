import { parseUnits } from "ethers/lib/utils";
import { LzChainId } from "src/types";

// ─────────────────────────────────────────────────────────────────────────────
// Phase-4 market deprecation: RF → 100%, repoint to the per-chain push-out IRM,
// and close leftover Phase-1 cap / CF gaps. 87 markets across 8 chains.
//
// Source of truth for the per-market data below is the Phase-4 parameter table
// (community forum: deprecate-venus-core-on-opbnb-optimism-unichain-isolated-pools
// + may-2026-risk-parameter-update-asset-off-boarding). All values are on-chain
// reads dated 2026-06-16.
// ─────────────────────────────────────────────────────────────────────────────

// 100% reserve factor.
export const RF_FULL = parseUnits("1", 18);

// Liquidation threshold (unchanged) passed as the 3rd arg of setCollateralFactor
// when zeroing the collateral factor of the two BNB Liquid Staked ETH markets.
const LIQ_THRESHOLD_93 = parseUnits("0.93", 18);

// ─────────────────────────────────────────────────────────────────────────────
// Push-out interest-rate models — one per chain (deprecation curve:
// base 300% / slope1 0% / jump 363.64% / kink 0.45).
//
// Isolated-pools JumpRateModelV2 deployments (incl. Ethereum, which covers
// ETH Core + Curve + LSEth): VenusProtocol/isolated-pools#555.
// BNB Core uses a dedicated legacy JumpRateModel (3-arg getBorrowRate ABI):
// VenusProtocol/venus-protocol#682.
// ─────────────────────────────────────────────────────────────────────────────
export const PUSHOUT_IRM = {
  bscIsolated: "0x29d0f5503525df271880CB8Da84651405E545d6b", // JumpRateModelV2 (isolated-pools)
  bscCore: "0xc255352947ef3594C45b0Fe8bcB690e51C3D744A", // legacy JumpRateModel (venus-protocol)
  ethereum: "0xbEd8AAf2Ce423428ECeabfbdCdA92D961B7BE901", // covers ETH Core + Curve + LSEth
  opbnb: "0xDA141Df6D89B83Db101F13C24174C2a3B6308962",
  optimism: "0x00a7e1641077Bd0e70A87cA9b631523E1D4B7A91",
  unichain: "0xf67b35d5201E48960D1262b043A815B3cb8AfAb7",
  arbitrum: "0x2f58C87418d0F0E87922B4e915E1e968cE79B6F5",
  base: "0xDd22bBbCC37d59483b7D42b040d435E1A0ee0E22",
  zksync: "0x1f6e343B528B1374d1370E0F9dE99290AD3a22A9",
} as const;

type IrmKey = keyof typeof PUSHOUT_IRM;

export interface Mkt {
  symbol: string;
  vToken: string;
  // true when RF is already 100% on-chain (RF command is a no-op and is skipped).
  rfAlready100?: boolean;
  // true for markets where the IRM repoint is omitted (PLANET, stkBNB — ~$0 borrows).
  skipIrm?: boolean;
  // leftover Phase-1 gaps to close → 0.
  supplyCapGap?: boolean;
  borrowCapGap?: boolean;
  // CF gap → 0, preserving the existing liquidation threshold.
  cfGapLiqThreshold?: string;
}

export interface PoolDef {
  label: string;
  comptroller: string;
  irmKey: IrmKey;
  // BNB Core (legacy Unitroller / VBep20) uses the underscore-prefixed setters.
  legacy?: boolean;
  // omitted for BNB-local pools; set for remote chains routed via LayerZero.
  dstChainId?: LzChainId;
  markets: Mkt[];
}

// ─────────────────────────────────────────────────────────────────────────────
// BNB-local isolated pools (normal setter signatures)
// ─────────────────────────────────────────────────────────────────────────────

export const BNB_BTC: PoolDef = {
  label: "BNB BTC pool",
  comptroller: "0x9DF11376Cf28867E2B0741348044780FbB7cb1d6",
  irmKey: "bscIsolated",
  markets: [
    { symbol: "BTCB", vToken: "0x8F2AE20b25c327714248C95dFD3b02815cC82302", supplyCapGap: true, borrowCapGap: true },
  ],
};

export const BNB_DEFI: PoolDef = {
  label: "BNB DeFi pool",
  comptroller: "0x3344417c9360b963ca93A4e8305361AEde340Ab9",
  irmKey: "bscIsolated",
  markets: [
    { symbol: "ALPACA", vToken: "0x02c5Fb0F26761093D297165e902e96D08576D344" },
    { symbol: "ANKR", vToken: "0x19CE11C8817a1828D1d357DFBF62dCf5b0B2A362" },
    { symbol: "ankrBNB", vToken: "0x53728FD51060a85ac41974C6C3Eb1DaE42776723" },
    { symbol: "BSW", vToken: "0x8f657dFD3a1354DEB4545765fE6840cc54AFd379" },
    { symbol: "PLANET", vToken: "0xFf1112ba7f88a53D4D23ED4e14A117A2aE17C6be", rfAlready100: true, skipIrm: true },
    { symbol: "TWT", vToken: "0x736bf1D21A28b5DC19A1aC8cA71Fc2856C23c03F" },
    { symbol: "USDD", vToken: "0xA615467caE6B9E0bb98BC04B4411d9296fd1dFa0" },
    { symbol: "USDT", vToken: "0x1D8bBDE12B6b34140604E18e9f9c6e14deC16854" },
  ],
};

export const BNB_GAMEFI: PoolDef = {
  label: "BNB GameFi pool",
  comptroller: "0x1b43ea8622e76627B81665B1eCeBB4867566B963",
  irmKey: "bscIsolated",
  markets: [
    { symbol: "FLOKI", vToken: "0xc353B7a1E13dDba393B5E120D4169Da7185aA2cb" },
    { symbol: "RACA", vToken: "0xE5FE5527A5b76C75eedE77FdFA6B80D52444A465" },
    { symbol: "USDD", vToken: "0x9f2FD23bd0A5E08C5f2b9DD6CF9C96Bfb5fA515C" },
    { symbol: "USDT", vToken: "0x4978591f17670A846137d9d613e333C38dc68A37" },
  ],
};

export const BNB_LIQUID_STAKED_BNB: PoolDef = {
  label: "BNB Liquid Staked BNB pool",
  comptroller: "0xd933909A4a2b7A4638903028f44D1d38ce27c352",
  irmKey: "bscIsolated",
  markets: [
    { symbol: "ankrBNB", vToken: "0xBfe25459BA784e70E2D7a718Be99a1f3521cA17f" },
    { symbol: "asBNB", vToken: "0x4A50a0a1c832190362e1491D5bB464b1bc2Bd288" },
    { symbol: "BNBx", vToken: "0x5E21bF67a6af41c74C1773E4b473ca5ce8fd3791" },
    { symbol: "PT-clisBNB-24APR2025", vToken: "0xA537ACf381b12Bbb91C58398b66D1D220f1C77c8" },
    { symbol: "slisBNB", vToken: "0xd3CC9d8f3689B83c91b7B59cAB4946B063EB894A" },
    { symbol: "stkBNB", vToken: "0xcc5D9e502574cda17215E70bC0B4546663785227", rfAlready100: true, skipIrm: true },
    { symbol: "WBNB", vToken: "0xe10E80B7FD3a29fE46E16C30CC8F4dd938B742e2" },
  ],
};

export const BNB_LIQUID_STAKED_ETH: PoolDef = {
  label: "BNB Liquid Staked ETH pool",
  comptroller: "0xBE609449Eb4D76AD8545f957bBE04b596E8fC529",
  irmKey: "bscIsolated",
  markets: [
    { symbol: "ETH", vToken: "0xeCCACF760FEA7943C5b0285BD09F601505A29c05", supplyCapGap: true, borrowCapGap: true },
    {
      symbol: "weETH",
      vToken: "0xc5b24f347254bD8cF8988913d1fd0F795274900F",
      supplyCapGap: true,
      cfGapLiqThreshold: LIQ_THRESHOLD_93.toString(),
    },
    {
      symbol: "wstETH",
      vToken: "0x94180a3948296530024Ef7d60f60B85cfe0422c8",
      supplyCapGap: true,
      cfGapLiqThreshold: LIQ_THRESHOLD_93.toString(),
    },
  ],
};

export const BNB_MEME: PoolDef = {
  label: "BNB Meme pool",
  comptroller: "0x33B6fa34cd23e5aeeD1B112d5988B026b8A5567d",
  irmKey: "bscIsolated",
  markets: [
    {
      symbol: "BabyDoge",
      vToken: "0x52eD99Cd0a56d60451dD4314058854bc0845bbB5",
      supplyCapGap: true,
      borrowCapGap: true,
    },
    { symbol: "USDT", vToken: "0x4a9613D06a241B76b81d3777FCe3DDd1F61D4Bd0", supplyCapGap: true, borrowCapGap: true },
  ],
};

export const BNB_STABLECOINS: PoolDef = {
  label: "BNB Stablecoins pool",
  comptroller: "0x94c1495cD4c557f1560Cbd68EAB0d197e6291571",
  irmKey: "bscIsolated",
  markets: [
    { symbol: "EURA", vToken: "0x795DE779Be00Ea46eA97a28BDD38d9ED570BCF0F", supplyCapGap: true, borrowCapGap: true },
    { symbol: "lisUSD", vToken: "0xCa2D81AA7C09A1a025De797600A7081146dceEd9", supplyCapGap: true, borrowCapGap: true },
    { symbol: "USDD", vToken: "0xc3a45ad8812189cAb659aD99E64B1376f6aCD035", supplyCapGap: true, borrowCapGap: true },
    { symbol: "USDT", vToken: "0x5e3072305F9caE1c7A82F6Fe9E38811c74922c3B", supplyCapGap: true, borrowCapGap: true },
  ],
};

export const BNB_TRON: PoolDef = {
  label: "BNB Tron pool",
  comptroller: "0x23b4404E4E5eC5FF5a6FFb70B7d14E3FabF237B0",
  irmKey: "bscIsolated",
  markets: [
    { symbol: "BTT", vToken: "0x49c26e12959345472E2Fd95E5f79F8381058d3Ee", supplyCapGap: true, borrowCapGap: true },
    { symbol: "TRX", vToken: "0x836beb2cB723C498136e1119248436A645845F4E", supplyCapGap: true, borrowCapGap: true },
    { symbol: "USDD", vToken: "0xf1da185CCe5BeD1BeBbb3007Ef738Ea4224025F7", supplyCapGap: true, borrowCapGap: true },
    { symbol: "USDT", vToken: "0x281E5378f99A4bc55b295ABc0A3E7eD32Deba059", supplyCapGap: true, borrowCapGap: true },
    { symbol: "WIN", vToken: "0xb114cfA615c828D88021a41bFc524B800E64a9D5", supplyCapGap: true, borrowCapGap: true },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// BNB Core (legacy Unitroller — underscore-prefixed setters)
// ─────────────────────────────────────────────────────────────────────────────

export const BNB_CORE: PoolDef = {
  label: "BNB Core pool",
  comptroller: "0xfD36E2c2a6789Db23113685031d7F16329158384",
  irmKey: "bscCore",
  legacy: true,
  markets: [
    { symbol: "DOT", vToken: "0x1610bc33319e9398de5f57B33a5b184c806aD217", supplyCapGap: true, borrowCapGap: true },
    { symbol: "FIL", vToken: "0xf91d58b5aE142DAcC749f58A49FCBac340Cb0343" },
    { symbol: "TUSDOLD", vToken: "0x08CEB3F4a7ed3500cA0982bcd0FC7816688084c3", rfAlready100: true },
    { symbol: "THE", vToken: "0x86e06EAfa6A1eA631Eab51DE500E3D474933739f" },
    { symbol: "TUSD", vToken: "0xBf762cd5991cA1DCdDaC9ae5C638F5B5Dc3Bee6E" },
    { symbol: "BETH", vToken: "0x972207A639CC1B374B893cc33Fa251b55CEB7c07", rfAlready100: true, borrowCapGap: true },
    { symbol: "MATIC", vToken: "0x5c9476FcD6a4F9a3654139721c949c2233bBbBc8" },
    { symbol: "TRXOLD", vToken: "0x61eDcFe8Dd6bA3c891CB9bEc2dc7657B3B422E93", rfAlready100: true },
    { symbol: "BUSD", vToken: "0x95c78222B3D6e262426483D42CfA53685A67Ab9D", rfAlready100: true },
    { symbol: "SXP", vToken: "0x2fF3d0F6990a40261c66E1ff2017aCBc282EB6d0", rfAlready100: true },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// Remote chains (routed via LayerZero / dstChainId)
// ─────────────────────────────────────────────────────────────────────────────

export const OPBNB: PoolDef = {
  label: "opBNB Core pool",
  comptroller: "0xD6e3E2A1d8d95caE355D15b3b9f8E5c2511874dd",
  irmKey: "opbnb",
  dstChainId: LzChainId.opbnbmainnet,
  markets: [
    { symbol: "BTCB", vToken: "0xED827b80Bd838192EA95002C01B5c6dA8354219a" },
    { symbol: "ETH", vToken: "0x509e81eF638D489936FA85BC58F52Df01190d26C" },
    { symbol: "FDUSD", vToken: "0x13B492B8A03d072Bab5C54AC91Dba5b830a50917" },
    { symbol: "USDT", vToken: "0xb7a01Ba126830692238521a1aA7E7A7509410b8e" },
    { symbol: "WBNB", vToken: "0x53d11cB8A0e5320Cd7229C3acc80d1A0707F2672" },
  ],
};

export const OPTIMISM: PoolDef = {
  label: "Optimism Core pool",
  comptroller: "0x5593FF68bE84C966821eEf5F0a988C285D5B7CeC",
  irmKey: "optimism",
  dstChainId: LzChainId.opmainnet,
  markets: [
    { symbol: "OP", vToken: "0x6b846E3418455804C1920fA4CC7a31A51C659A2D" },
    { symbol: "USDC", vToken: "0x1C9406ee95B7af55F005996947b19F91B6D55b15" },
    { symbol: "USDT", vToken: "0x37ac9731B0B02df54975cd0c7240e0977a051721" },
    { symbol: "WBTC", vToken: "0x9EfdCfC2373f81D3DF24647B1c46e15268884c46" },
    { symbol: "WETH", vToken: "0x66d5AE25731Ce99D46770745385e662C8e0B4025" },
  ],
};

export const UNICHAIN: PoolDef = {
  label: "Unichain Core pool",
  comptroller: "0xe22af1e6b78318e1Fe1053Edbd7209b8Fc62c4Fe",
  irmKey: "unichain",
  dstChainId: LzChainId.unichainmainnet,
  markets: [
    { symbol: "UNI", vToken: "0x67716D6Bf76170Af816F5735e14c4d44D0B05eD2" },
    { symbol: "USDC", vToken: "0xB953f92B9f759d97d2F2Dec10A8A3cf75fcE3A95" },
    { symbol: "USD₮0", vToken: "0xDa7Ce7Ba016d266645712e2e4Ebc6cC75eA8E4CD" },
    { symbol: "WBTC", vToken: "0x68e2A6F7257FAc2F5a557b9E83E1fE6D5B408CE5" },
    { symbol: "weETH", vToken: "0x0170398083eb0D0387709523baFCA6426146C218" },
    { symbol: "WETH", vToken: "0xc219BC179C7cDb37eACB03f993f9fDc2495e3374" },
    { symbol: "wstETH", vToken: "0xbEC19Bef402C697a7be315d3e59E5F65b89Fa1BB" },
  ],
};

// Ethereum is split across the two VIPs to keep each LayerZero message < 10 KB:
//   - ETH_CORE  → VIP-664
//   - ETH_CURVE + ETH_LIQUID_STAKED_ETH → VIP-665
export const ETH_CORE: PoolDef = {
  label: "Ethereum Core pool",
  comptroller: "0x687a01ecF6d3907658f7A7c714749fAC32336D1B",
  irmKey: "ethereum",
  dstChainId: LzChainId.ethereum,
  markets: [
    { symbol: "TUSD", vToken: "0x13eB80FDBe5C5f4a7039728E258A6f05fb3B912b" },
    { symbol: "FRAX", vToken: "0x4fAfbDc4F2a9876Bd1764827b26fb8dc4FD1dB95", supplyCapGap: true, borrowCapGap: true },
    { symbol: "sFRAX", vToken: "0x17142a05fe678e9584FA1d88EfAC1bF181bF7ABe" },
    { symbol: "EIGEN", vToken: "0x256AdDBe0a387c98f487e44b85c29eb983413c5e" },
    { symbol: "BAL", vToken: "0x0Ec5488e4F8f319213a14cab188E01fB8517Faa8" },
    { symbol: "yvUSDC-1", vToken: "0xf87c0a64dc3a8622D6c63265FA29137788163879" },
    { symbol: "yvUSDT-1", vToken: "0x475d0C68a8CD275c15D1F01F4f291804E445F677" },
    { symbol: "yvUSDS-1", vToken: "0x520d67226Bc904aC122dcE66ed2f8f61AA1ED764" },
    { symbol: "yvWETH-1", vToken: "0xba3916302cBA4aBcB51a01e706fC6051AaF272A0" },
  ],
};

export const ETH_CURVE: PoolDef = {
  label: "Ethereum Curve pool",
  comptroller: "0x67aA3eCc5831a65A5Ba7be76BED3B5dc7DB60796",
  irmKey: "ethereum",
  dstChainId: LzChainId.ethereum,
  markets: [
    { symbol: "CRV", vToken: "0x30aD10Bd5Be62CAb37863C2BfcC6E8fb4fD85BDa", supplyCapGap: true, borrowCapGap: true },
    { symbol: "crvUSD", vToken: "0x2d499800239C4CD3012473Cb1EAE33562F0A6933", supplyCapGap: true, borrowCapGap: true },
  ],
};

export const ETH_LIQUID_STAKED_ETH: PoolDef = {
  label: "Ethereum Liquid Staked ETH pool",
  comptroller: "0xF522cd0360EF8c2FF48B648d53EA1717Ec0F3Ac3",
  irmKey: "ethereum",
  dstChainId: LzChainId.ethereum,
  markets: [
    { symbol: "ezETH", vToken: "0xA854D35664c658280fFf27B6eDC6C4195c3229B3" },
    { symbol: "pufETH", vToken: "0xE0ee5dDeBFe0abe0a4Af50299D68b74Cec31668e" },
    { symbol: "sfrxETH", vToken: "0xF9E9Fe17C00a8B96a8ac20c4E344C8688D7b947E" },
    { symbol: "weETH", vToken: "0xb4933AF59868986316Ed37fa865C829Eba2df0C7" },
    { symbol: "weETHs", vToken: "0xEF26C64bC06A8dE4CA5D31f119835f9A1d9433b9" },
    { symbol: "WETH", vToken: "0xc82780Db1257C788F262FBbDA960B3706Dfdcaf2" },
    { symbol: "wstETH", vToken: "0x4a240F0ee138697726C8a3E43eFE6Ac3593432CB" },
  ],
};

export const ARBITRUM_LIQUID_STAKED_ETH: PoolDef = {
  label: "Arbitrum Liquid Staked ETH pool",
  comptroller: "0x52bAB1aF7Ff770551BD05b9FC2329a0Bf5E23F16",
  irmKey: "arbitrum",
  dstChainId: LzChainId.arbitrumone,
  markets: [
    { symbol: "weETH", vToken: "0x246a35E79a3a0618535A469aDaF5091cAA9f7E88" },
    { symbol: "WETH", vToken: "0x39D6d13Ea59548637104E40e729E4aABE27FE106" },
    { symbol: "wstETH", vToken: "0x9df6B5132135f14719696bBAe3C54BAb272fDb16" },
  ],
};

export const BASE_CORE: PoolDef = {
  label: "Base Core pool",
  comptroller: "0x0C7973F9598AA62f9e03B94E92C967fD5437426C",
  irmKey: "base",
  dstChainId: LzChainId.basemainnet,
  markets: [{ symbol: "wsuperOETHb", vToken: "0x75201D81B3B0b9D17b179118837Be37f64fc4930" }],
};

export const ZKSYNC_CORE: PoolDef = {
  label: "zkSync Era Core pool",
  comptroller: "0xddE4D098D9995B659724ae6d5E3FB9681Ac941B1",
  irmKey: "zksync",
  dstChainId: LzChainId.zksyncmainnet,
  markets: [
    { symbol: "ZK", vToken: "0x697a70779C1A03Ba2BD28b7627a902BFf831b616" },
    { symbol: "wUSDM", vToken: "0x183dE3C349fCf546aAe925E1c7F364EA6FB4033c", rfAlready100: true },
    { symbol: "wstETH", vToken: "0x03CAd66259f7F34EE075f8B62D133563D249eDa4" },
    { symbol: "zkETH", vToken: "0xCEb7Da150d16aCE58F090754feF2775C23C8b631" },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// Command generator
// ─────────────────────────────────────────────────────────────────────────────

const sig = (pool: PoolDef) => ({
  reserveFactor: pool.legacy ? "_setReserveFactor(uint256)" : "setReserveFactor(uint256)",
  interestRateModel: pool.legacy ? "_setInterestRateModel(address)" : "setInterestRateModel(address)",
  supplyCaps: pool.legacy ? "_setMarketSupplyCaps(address[],uint256[])" : "setMarketSupplyCaps(address[],uint256[])",
  borrowCaps: pool.legacy ? "_setMarketBorrowCaps(address[],uint256[])" : "setMarketBorrowCaps(address[],uint256[])",
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const generatePoolCommands = (pool: PoolDef): any[] => {
  const { comptroller, irmKey, markets, dstChainId } = pool;
  const chain = dstChainId !== undefined ? { dstChainId } : {};
  const s = sig(pool);
  const irm = PUSHOUT_IRM[irmKey];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const commands: any[] = [];

  // RF → 100% on the vToken (skip markets already at 100%).
  for (const m of markets.filter(m => !m.rfAlready100)) {
    commands.push({ target: m.vToken, signature: s.reserveFactor, params: [RF_FULL], ...chain });
  }

  // Repoint the IRM on the vToken (skip PLANET / stkBNB).
  for (const m of markets.filter(m => !m.skipIrm)) {
    commands.push({ target: m.vToken, signature: s.interestRateModel, params: [irm], ...chain });
  }

  // Close supply-cap gaps → 0, batched per pool.
  const supplyGap = markets.filter(m => m.supplyCapGap);
  if (supplyGap.length > 0) {
    commands.push({
      target: comptroller,
      signature: s.supplyCaps,
      params: [supplyGap.map(m => m.vToken), supplyGap.map(() => 0)],
      ...chain,
    });
  }

  // Close borrow-cap gaps → 0, batched per pool.
  const borrowGap = markets.filter(m => m.borrowCapGap);
  if (borrowGap.length > 0) {
    commands.push({
      target: comptroller,
      signature: s.borrowCaps,
      params: [borrowGap.map(m => m.vToken), borrowGap.map(() => 0)],
      ...chain,
    });
  }

  // Close CF gaps → 0 (preserving the liquidation threshold). Isolated pools only.
  for (const m of markets.filter(m => m.cfGapLiqThreshold !== undefined)) {
    commands.push({
      target: comptroller,
      signature: "setCollateralFactor(address,uint256,uint256)",
      params: [m.vToken, 0, m.cfGapLiqThreshold],
      ...chain,
    });
  }

  return commands;
};
