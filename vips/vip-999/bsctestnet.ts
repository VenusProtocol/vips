import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { bsctestnet } = NETWORK_ADDRESSES;

// Deployed vceBTC (testnet)
export const VCEBTC = "0x3C5Fc884BF6d1Ec8957A75EF6436b3B5750A57da";

export const FIXED_RATE_VAULT_CONTROLLER = "0x36bA78812Ffff64B9ec060a1F07FcFa2012f6F89";
export const BTCB = "0xA808e341e8e723DC6BA0Bb5204Bafc2330d7B8e4";

// BTCB's oracle config on testnet is Chainlink main only
export const CHAINLINK_ORACLE = bsctestnet.CHAINLINK_ORACLE;
export const ADDRESS_ZERO = "0x0000000000000000000000000000000000000000";
export const BTCB_FEED_MAIN = "0x5741306c21795FdCBb9b265Ea0255F499DFe515C";
export const BTCB_STALE_MAIN = 86400;

// Supply asset for the loan market — testnet USDT (6 decimals)
export const SUPPLY_ASSET = "0xA11c8D9DC9b66E209Ef60F0C8D969D3CD988782c";

// Test institution operator (placeholder EOA on testnet)
export const INSTITUTION_OPERATOR = "0x1111111111111111111111111111111111111111";

// Initial vceBTC collateral supply
export const VCEBTC_INITIAL_SUPPLY = parseUnits("2000", 18);

// Fixed Rate Vault configuration.
// VaultConfig: [supplyAsset, fixedAPY(bps), reserveFactor(1e18), minBorrowCap,
//               maxBorrowCap, minSupplierDeposit, openDuration, lockDuration, settlementWindow]
// NB: borrow caps / minSupplierDeposit are denominated in the supply asset (USDT, 6 decimals).
export const vaultConfig = [
  SUPPLY_ASSET,
  800, // fixedAPY = 8%
  parseUnits("0.1", 18), // reserveFactor = 10%
  parseUnits("1000000", 6), // minBorrowCap = 1M USDT
  parseUnits("50000000", 6), // maxBorrowCap = 50M USDT loan market size
  0, // minSupplierDeposit
  7 * 24 * 60 * 60, // openDuration = 7 days
  30 * 24 * 60 * 60, // lockDuration = 30 days
  30 * 24 * 60 * 60, // settlementWindow = 30 days
];

// InstitutionalConfig: [collateralAsset, idealCollateralAmount, marginRate(1e18),
//                       institutionOperator, positionTokenId]
export const instConfig = [
  VCEBTC, // collateral = vceBTC (18 decimals)
  parseUnits("2000", 18), // idealCollateralAmount
  parseUnits("0.1", 18), // marginRate = 10%
  INSTITUTION_OPERATOR,
  0, // positionTokenId assigned by the controller
];

// RiskConfig: [liquidationThreshold(1e18), liquidationIncentive(1e18), latePenaltyRate(1e18)]
export const riskConfig = [parseUnits("0.85", 18), parseUnits("1.1", 18), parseUnits("1.1", 18)];

export const VAULT_SHARE_NAME = "Venus Ceffu Fixed Rate Vault";
export const VAULT_SHARE_SYMBOL = "vceFRV";
export const INSTITUTION_NAME = "Ceffu";

export const vip999 = () => {
  const meta = {
    version: "v2",
    title: "VIP-999 [BNB Chain Testnet] Create Ceffu Custody BTC Fixed Rate Vault (DRAFT)",
    description: `#### Summary

This proposal onboards a new custody-mirror collateral token, **vceBTC ("Ceffu Custody BTC for Venus")**, and creates a new Venus **Fixed Rate Vault** (Institutional Loan Vault) that uses vceBTC as collateral. vceBTC is an accounting mirror for BTC held in custody by Ceffu; its supply is controlled by Venus governance and priced identically to BTCB.

#### Actions

1. **Oracle** — price vceBTC identically to BTCB by cloning BTCB's oracle configuration: the Chainlink main sub-oracle feed and the ResilientOracle token config (pivot / fallback disabled, no bound validation — matching BTCB on testnet).
2. **Ownership** — accept ownership of vceBTC (already transferred to the Normal Timelock by the deployer).
3. **Access control** — grant \`mint(address,uint256)\` and \`burn(address,uint256)\` on vceBTC to the Normal Timelock and the Guardian. (The \`createVault(...)\` permission on the InstitutionalVaultController is granted by the separate controller/vault-upgrade VIP.)
4. **Initial supply** — mint the initial vceBTC collateral to the Venus Treasury.
5. **Vault creation** — create the Fixed Rate Vault with vceBTC as collateral.`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      // ──────────────────────────────────────────────────────────────────────
      // 1. Oracle configuration identically to BTCB (Chainlink main only)
      // ──────────────────────────────────────────────────────────────────────
      {
        target: CHAINLINK_ORACLE,
        signature: "setTokenConfig((address,address,uint256))",
        params: [[VCEBTC, BTCB_FEED_MAIN, BTCB_STALE_MAIN]],
      },
      {
        target: bsctestnet.RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3],bool))",
        params: [[VCEBTC, [CHAINLINK_ORACLE, ADDRESS_ZERO, ADDRESS_ZERO], [true, false, false], false]],
      },

      // ──────────────────────────────────────────────────────────────────────
      // 2. Accept ownership of vceBTC
      // ──────────────────────────────────────────────────────────────────────
      {
        target: VCEBTC,
        signature: "acceptOwnership()",
        params: [],
      },

      // ──────────────────────────────────────────────────────────────────────
      // 3. Access control — vceBTC mint/burn
      // ──────────────────────────────────────────────────────────────────────
      {
        target: bsctestnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [VCEBTC, "mint(address,uint256)", bsctestnet.NORMAL_TIMELOCK],
      },
      {
        target: bsctestnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [VCEBTC, "mint(address,uint256)", bsctestnet.GUARDIAN],
      },
      {
        target: bsctestnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [VCEBTC, "burn(address,uint256)", bsctestnet.NORMAL_TIMELOCK],
      },
      {
        target: bsctestnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [VCEBTC, "burn(address,uint256)", bsctestnet.GUARDIAN],
      },

      // ──────────────────────────────────────────────────────────────────────
      // 4. Mint initial vceBTC collateral
      // ──────────────────────────────────────────────────────────────────────
      {
        target: VCEBTC,
        signature: "mint(address,uint256)",
        params: [bsctestnet.VTREASURY, VCEBTC_INITIAL_SUPPLY],
      },

      // ──────────────────────────────────────────────────────────────────────
      // 5. Create the Fixed Rate Vault (vceBTC as collateral)
      // ──────────────────────────────────────────────────────────────────────
      {
        target: FIXED_RATE_VAULT_CONTROLLER,
        signature:
          "createVault((address,uint256,uint256,uint256,uint256,uint256,uint40,uint40,uint40),(address,uint256,uint256,address,uint256),(uint256,uint256,uint256),string,string,string)",
        params: [vaultConfig, instConfig, riskConfig, VAULT_SHARE_NAME, VAULT_SHARE_SYMBOL, INSTITUTION_NAME],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip999;
