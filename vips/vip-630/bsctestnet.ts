import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { bsctestnet } = NETWORK_ADDRESSES;

// Core Pool vToken addresses for migrated assets (testnet)
export const vUNI = "0x171B468b52d7027F12cEF90cd065d6776a25E24e";
export const vAAVE = "0x714db6c38A17883964B68a07d56cE331501d9eb6";
export const vDOGE = "0xF912d3001CAf6DC4ADD366A62Cc9115B4303c9A9";
export const vTWT = "0x95DaED37fdD3F557b3A5cCEb7D50Be65b36721DF";
export const vADA = "0x37C28DE42bA3d22217995D146FC684B2326Ede64";
export const vLTC = "0xAfc13BC065ABeE838540823431055D2ea52eBA52";
export const vTRX = "0x6AF3Fdb3282c5bb6926269Db10837fa8Aec67C04";
export const vTHE = "0x39A239F5117BFaC7a1b0b3A517c454113323451d";

// Markets to disable in Core Pool with their current Liquidation Thresholds (keep LT unchanged)
export const MARKETS_TO_DISABLE = [
  { symbol: "UNI", vToken: vUNI, liquidationThreshold: parseUnits("0.55", 18) },
  { symbol: "AAVE", vToken: vAAVE, liquidationThreshold: parseUnits("0.55", 18) },
  { symbol: "DOGE", vToken: vDOGE, liquidationThreshold: parseUnits("0.8", 18) },
  { symbol: "TWT", vToken: vTWT, liquidationThreshold: parseUnits("0.5", 18) },
  { symbol: "ADA", vToken: vADA, liquidationThreshold: parseUnits("0.6", 18) },
  { symbol: "LTC", vToken: vLTC, liquidationThreshold: parseUnits("0.65", 18) },
  { symbol: "TRX", vToken: vTRX, liquidationThreshold: parseUnits("0.6", 18) },
  { symbol: "THE", vToken: vTHE, liquidationThreshold: parseUnits("0.53", 18) },
];

export const CORE_POOL_ID = 0;

export const vip630 = () => {
  const meta = {
    version: "v2",
    title: "VIP-630 [BNB Chain] Asset Migration from Core Pool to Isolated E-Mode — Phase 2 (Final Switch)",
    description: "VIP-630 [BNB Chain] Asset Migration from Core Pool to Isolated E-Mode — Phase 2 (Final Switch)",
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      // Set Collateral Factor to 0 for all migrated assets in Core Pool (keep LT unchanged)
      ...MARKETS_TO_DISABLE.map(market => ({
        target: bsctestnet.UNITROLLER,
        signature: "setCollateralFactor(uint96,address,uint256,uint256)",
        params: [CORE_POOL_ID, market.vToken, 0, market.liquidationThreshold],
      })),
      // Disable borrowing in Core Pool (pool 0) for all migrated assets
      ...MARKETS_TO_DISABLE.map(market => ({
        target: bsctestnet.UNITROLLER,
        signature: "setIsBorrowAllowed(uint96,address,bool)",
        params: [CORE_POOL_ID, market.vToken, false],
      })),
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip630;
