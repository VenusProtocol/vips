import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { bscmainnet } = NETWORK_ADDRESSES;

// Core Pool vToken addresses for migrated assets (from vip-587 part 1)
export const vLINK = "0x650b940a1033B8A1b1873f78730FcFC73ec11f1f";
export const vUNI = "0x27FF564707786720C71A2e5c1490A63266683612";
export const vAAVE = "0x26DA28954763B92139ED49283625ceCAf52C6f94";
export const vDOGE = "0xec3422Ef92B2fb59e84c8B02Ba73F1fE84Ed8D71";
export const vBCH = "0x5F0388EBc2B94FA8E123F404b79cCF5f40b29176";
export const vTWT = "0x4d41a36D04D97785bcEA57b057C412b278e6Edcc";
export const vADA = "0x9A0AF7FDb2065Ce470D72664DE73cAE409dA28Ec";

// Core Pool vToken addresses for migrated assets (from vip-588 part 2)
export const vLTC = "0x57A5297F2cB2c0AaC9D554660acd6D385Ab50c6B";
export const vFIL = "0xf91d58b5aE142DAcC749f58A49FCBac340Cb0343";
export const vTRX = "0xC5D3466aA484B040eE977073fcF337f2c00071c1";
export const vDOT = "0x1610bc33319e9398de5f57B33a5b184c806aD217";
export const vTHE = "0x86e06EAfa6A1eA631Eab51DE500E3D474933739f";

// TUSD — pausing in Core Pool (no e-mode migration)
export const vTUSD = "0xBf762cd5991cA1DCdDaC9ae5C638F5B5Dc3Bee6E";

// Migrated assets — CF and borrow disabled in Core Pool (still active in E-Mode pools)
export const MARKETS_TO_DISABLE = [
  { symbol: "LINK", vToken: vLINK, liquidationThreshold: parseUnits("0.63", 18) },
  { symbol: "UNI", vToken: vUNI, liquidationThreshold: parseUnits("0.55", 18) },
  { symbol: "AAVE", vToken: vAAVE, liquidationThreshold: parseUnits("0.55", 18) },
  { symbol: "DOGE", vToken: vDOGE, liquidationThreshold: parseUnits("0.43", 18) },
  { symbol: "BCH", vToken: vBCH, liquidationThreshold: parseUnits("0.6", 18) },
  { symbol: "TWT", vToken: vTWT, liquidationThreshold: parseUnits("0.5", 18) },
  { symbol: "ADA", vToken: vADA, liquidationThreshold: parseUnits("0.63", 18) },
  { symbol: "LTC", vToken: vLTC, liquidationThreshold: parseUnits("0.63", 18) },
  { symbol: "FIL", vToken: vFIL, liquidationThreshold: parseUnits("0.63", 18) },
  { symbol: "TRX", vToken: vTRX, liquidationThreshold: parseUnits("0.525", 18) },
  { symbol: "DOT", vToken: vDOT, liquidationThreshold: parseUnits("0.65", 18) },
  { symbol: "THE", vToken: vTHE, liquidationThreshold: parseUnits("0.53", 18) },
];

// TUSD — fully paused in Core Pool (no e-mode migration, safe to pause actions)
export const TUSD_MARKET = { symbol: "TUSD", vToken: vTUSD, liquidationThreshold: parseUnits("0.75", 18) };

export const Actions = {
  MINT: 0,
};

// All markets whose CF and borrow will be disabled
export const ALL_MARKETS = [...MARKETS_TO_DISABLE, TUSD_MARKET];

export const CORE_POOL_ID = 0;

export const vip599 = () => {
  const meta = {
    version: "v2",
    title: "VIP-599 [BNB Chain] Phase 2 Asset Migration to Isolation Mode Pools + Pause TUSD",
    description: `This proposal implements **Phase 2** of the asset migration discussed in the [Venus community forum](https://community.venus.io/t/asset-migration-from-core-pool-to-isolated-e-mode/5648), moving selected assets from the **Core Pool** to **Isolated E-Mode pools (Isolation Mode)**, and pausing **TUSD** in the Core Pool.

Phase 2 continues the migration process by moving a group of lower-utilisation or higher-volatility assets out of the Core Pool and into an **Isolation Mode group**. This approach allows the protocol to retain support for these assets while reducing systemic risk to the Core Pool.

After the migration, the **Isolation group** will consist of the migrated assets together with **USDT and USDC**, allowing users to continue interacting with these markets while leveraging stablecoin liquidity from the Core Pool.

In addition, **TUSD** will be **paused in the Core Pool** due to its **very low supply and borrow levels**.

#### Changes

#### 1. Asset Migration to Isolation Mode

The following assets will be migrated from the **Core Pool** to the **Isolation Mode group**:

- **LINK**
- **UNI**
- **AAVE**
- **DOGE**
- **BCH**
- **TWT**
- **ADA**
- **LTC**
- **FIL**
- **MATIC**
- **TRX**
- **DOT**
- **THE**

For all migrated assets, the following adjustments will be applied in the **Core Pool**:

- **Loan-to-Value (LTV)** will be set to **0**
- **Borrowable status** will be set to **false**

The corresponding markets in **Isolation Mode** will retain the same parameters previously used in the Core Pool:

- **Loan-to-Value (LTV)** in the corresponding Isolation Mode
- **Liquidation Threshold (LT)**
- **Supply Cap**
- **Borrow Cap**
- **Collateral Cap**
- **Borrowable status** in the corresponding Isolation Mode
- **Collateral status**
- **Interest Rate Model (IRM)**

#### 2. Pause TUSD in the Core Pool

**TUSD** will be **paused in the Core Pool** and will **not be migrated** to an Isolation Mode group.

Given the **very low utilisation and limited activity**, pausing the market helps streamline the Core Pool while reducing maintenance overhead for underutilised assets.

#### Summary

If approved, this VIP will:

- Migrate **13 assets** from the **Core Pool** to **Isolation Mode pools** and maintain existing parameters for all migrated markets
- **Pause the TUSD market** in the Core Pool due to low utilisation
- Improve **risk segmentation** while preserving user access to migrated assets via isolated markets

#### References

- [VIP-587: Phase 1](https://github.com/VenusProtocol/vips/pull/661)
- [Community post](https://community.venus.io/t/asset-migration-from-core-pool-to-isolated-e-mode/5648)`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      // Set Collateral Factor to 0 for all markets (keep LT unchanged)
      ...ALL_MARKETS.map(market => ({
        target: bscmainnet.UNITROLLER,
        signature: "setCollateralFactor(uint96,address,uint256,uint256)",
        params: [CORE_POOL_ID, market.vToken, 0, market.liquidationThreshold],
      })),
      // Disable borrowing in Core Pool (pool 0) for all markets
      ...ALL_MARKETS.map(market => ({
        target: bscmainnet.UNITROLLER,
        signature: "setIsBorrowAllowed(uint96,address,bool)",
        params: [CORE_POOL_ID, market.vToken, false],
      })),
      // Pause mint action for TUSD in Core Pool
      {
        target: bscmainnet.UNITROLLER,
        signature: "_setActionsPaused(address[],uint8[],bool)",
        params: [[vTUSD], [Actions.MINT], true],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip599;
