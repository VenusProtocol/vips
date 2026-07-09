import { ethers } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { bsctestnet } = NETWORK_ADDRESSES;

export const VCEBTC = "0x3C5Fc884BF6d1Ec8957A75EF6436b3B5750A57da";
export const FIXED_RATE_VAULT_CONTROLLER = "0xf77dED2A00F94e33C392126238360D4642c16Ba2";
export const BTCB = "0xA808e341e8e723DC6BA0Bb5204Bafc2330d7B8e4";
export const CHAINLINK_ORACLE = bsctestnet.CHAINLINK_ORACLE;

// Fixed direct price for vceBTC set on the Chainlink sub-oracle (18-decimal scale).
export const VCEBTC_DIRECT_PRICE = "2100000000000000000000000";

// Loan market supply asset — testnet USDT (6 decimals)
export const SUPPLY_ASSET = "0xA11c8D9DC9b66E209Ef60F0C8D969D3CD988782c";

// Test institution operator
export const INSTITUTION_OPERATOR = "0x4cD6300F5cb8D6BbA5E646131c3522664C10dF11";

// Initial vceBTC collateral supply
export const VCEBTC_INITIAL_SUPPLY = parseUnits("21.92", 18);

// VaultConfig: [supplyAsset, fixedAPY(bps), reserveFactor(1e18), minBorrowCap,
//   maxBorrowCap, minSupplierDeposit, openDuration, lockDuration, settlementWindow]
// Caps / minSupplierDeposit are in the supply asset (USDT, 6 decimals).
export const vaultConfig = [
  SUPPLY_ASSET,
  600, // fixedAPY = 6%
  parseUnits("0.3", 18), // reserveFactor = 30%
  parseUnits("10", 6), // minBorrowCap = 10 USDT (must be > 0; createVault reverts if 0)
  parseUnits("1000000", 6), // maxBorrowCap = 1M USDT
  0, // minSupplierDeposit
  7 * 24 * 60 * 60, // openDuration = 7 days
  30 * 24 * 60 * 60, // lockDuration = 1 month
  3 * 24 * 60 * 60, // settlementWindow = 3 days
];

// InstitutionalConfig: [collateralAsset, idealCollateralAmount, marginRate(1e18),
//                       institutionOperator, positionTokenId]
export const instConfig = [
  VCEBTC, // collateral = vceBTC (18 decimals)
  parseUnits("21.92", 18), // idealCollateralAmount = 21.92 BTCB
  parseUnits("0.005", 18), // marginRate = 0.5% (must be > 0; createVault reverts InvalidConfig if 0)
  INSTITUTION_OPERATOR,
  0, // positionTokenId assigned by the controller
];

// RiskConfig: [liquidationThreshold(1e18), liquidationIncentive(1e18), latePenaltyRate(1e18)]
export const riskConfig = [parseUnits("0.9", 18), parseUnits("1.1", 18), parseUnits("1.1", 18)];

export const VAULT_SHARE_NAME = "FRV Solv BTCB 24JUL2026 30";
export const VAULT_SHARE_SYMBOL = "FRV-sv-24JUL2026-30";
export const INSTITUTION_NAME = "Ceffu";

export const vip999 = () => {
  const meta = {
    version: "v2",
    title: "VIP-999 [BNB Chain Testnet] Create Ceffu Custody BTC Fixed Rate Vault (DRAFT)",
    description: `#### Summary

This proposal onboards a new custody-mirror collateral token, **vceBTC ("Ceffu Custody BTC for Venus")**, and creates a new Venus **Fixed Rate Vault** (Institutional Loan Vault) that uses vceBTC as collateral. vceBTC is an accounting mirror for BTC held in custody by Ceffu; its supply is controlled by Venus governance and priced identically to BTCB.

#### Actions

1. **Oracle** — price vceBTC identically to BTCB by mirroring BTCB's oracle setup: set a fixed direct price on the Chainlink main sub-oracle (equal to BTCB's price) and point the ResilientOracle token config at that sub-oracle (main only; pivot / fallback disabled, no bound validation — matching BTCB on testnet).
2. **Ownership** — accept ownership of vceBTC (already transferred to the Normal Timelock by the deployer).
3. **Access control** — grant \`mint(address,uint256)\` and \`burn(address,uint256)\` on vceBTC to the Normal Timelock and the Guardian. (The \`createVault(...)\` permission on the InstitutionalVaultController is granted by the separate controller/vault-upgrade VIP.)
4. **Initial supply** — mint the initial vceBTC collateral to the Guardian.
5. **Vault creation** — create the Fixed Rate Vault with vceBTC as collateral.`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      // ──────────────────────────────────────────────────────────────────────
      // 1. Oracle configuration — fixed direct price on the Chainlink sub-oracle
      // ──────────────────────────────────────────────────────────────────────
      {
        target: CHAINLINK_ORACLE,
        signature: "setDirectPrice(address,uint256)",
        params: [VCEBTC, VCEBTC_DIRECT_PRICE],
      },
      {
        target: bsctestnet.RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3],bool))",
        params: [
          [
            VCEBTC,
            [CHAINLINK_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero],
            [true, false, false],
            false,
          ],
        ],
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
        params: [bsctestnet.GUARDIAN, VCEBTC_INITIAL_SUPPLY],
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
