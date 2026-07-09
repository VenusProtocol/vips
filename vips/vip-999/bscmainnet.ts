import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { bscmainnet } = NETWORK_ADDRESSES;

// TODO before proposing:
// 1. Execute the controller/vault upgrade VIP (vip-640) first, then remove the
//    pretendExecutingVip(vip640) prerequisite from the simulation.
// 2. Set the real Ceffu institution operator address (INSTITUTION_OPERATOR below).
// 3. Redeploy vceBTC from fixed-rate-vaults CustodyReceiptToken (current deployment is the older
//    VenusERC20 bytecode without pause/unpause), transfer ownership to the Normal Timelock,
//    update VCEBTC, add pause()/unpause() ACM grants, and update the simulations.

// Deployed vceBTC
export const VCEBTC = "0xba63642A893b0F15aDE730943972824c9e2147a7";

export const FIXED_RATE_VAULT_CONTROLLER = "0x6D9e91cB766259af42619c14c994E694E57e6E85";
export const BTCB = "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c";

export const CHAINLINK_ORACLE = bscmainnet.CHAINLINK_ORACLE;
export const REDSTONE_ORACLE = bscmainnet.REDSTONE_ORACLE;
export const ATLAS_ORACLE = bscmainnet.ATLAS_ORACLE;

// BTCB's oracle config per sub-oracle — the VIP clones these for vceBTC: (oracle, feed, max stale period)
export const BTCB_ORACLE_CONFIGS = [
  {
    name: "Chainlink",
    address: CHAINLINK_ORACLE,
    feed: "0x8ECF7dE377F788A813F5215668E282556b35f300",
    maxStalePeriod: 100,
  },
  {
    name: "RedStone",
    address: REDSTONE_ORACLE,
    feed: "0xa51738d1937FFc553d5070f43300B385AA2D9F55",
    maxStalePeriod: 100,
  },
  {
    name: "Atlas",
    address: ATLAS_ORACLE,
    feed: "0x4f6c53fb9CdD46269d24bCa4E68bB680879132fc",
    maxStalePeriod: 120,
  },
];

export const BOUND_VALIDATOR = "0x6E332fF0bB52475304494E4AE5063c1051c7d735";
export const BTCB_UPPER_BOUND = parseUnits("1.01", 18);
export const BTCB_LOWER_BOUND = parseUnits("0.99", 18);

// USDT
export const SUPPLY_ASSET = "0x55d398326f99059fF775485246999027B3197955";

// TODO(2): placeholder — replace with the real Ceffu operator address
export const INSTITUTION_OPERATOR = "0x1111111111111111111111111111111111111111";

// Initial vceBTC collateral supply
export const VCEBTC_INITIAL_SUPPLY = parseUnits("21.92", 18);

// Recipient of the initial vceBTC collateral mint (multisig)
export const INITIAL_SUPPLY_RECIPIENT = "0x5D1507d5Cfb3d031C3209e9FB8e2644e4094Ea01";

// Fixed Rate Vault configuration.
// VaultConfig: [supplyAsset, fixedAPY(bps), reserveFactor(1e18), minBorrowCap,
//               maxBorrowCap, minSupplierDeposit, openDuration, lockDuration, settlementWindow]
export const vaultConfig = [
  SUPPLY_ASSET,
  600, // fixedAPY = 6%
  parseUnits("0.3", 18), // reserveFactor = 30%
  parseUnits("10", 18), // minBorrowCap = 10 USDT (must be > 0; createVault reverts if 0)
  parseUnits("1000000", 18), // maxBorrowCap = 1M
  0, // minSupplierDeposit
  7 * 24 * 60 * 60, // openDuration = 7 days
  30 * 24 * 60 * 60, // lockDuration = 1 month
  3 * 24 * 60 * 60, // settlementWindow = 3 days
];

// InstitutionalConfig: [collateralAsset, idealCollateralAmount, marginRate(1e18),
//                       institutionOperator, positionTokenId]
export const instConfig = [
  VCEBTC, // collateral = vceBTC
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
    title: "VIP-999 [BNB Chain] Create Ceffu Custody BTC Fixed Rate Vault (DRAFT)",
    description: `#### Summary

This proposal onboards a new custody-mirror collateral token, **vceBTC ("Ceffu Custody BTC for Venus")**, and creates a new Venus **Fixed Rate Vault** (Institutional Loan Vault) that uses vceBTC as collateral. vceBTC is an accounting mirror for BTC held in custody by Ceffu; its supply is controlled by Venus governance and priced identically to BTCB.

#### Actions

1. **Oracle** — price vceBTC identically to BTCB by cloning BTCB's full oracle configuration: the Chainlink / RedStone / Atlas sub-oracle feeds and stale periods, the BoundValidator bounds, and the ResilientOracle token config.
2. **Ownership** — accept ownership of vceBTC (already transferred to the Normal Timelock by the deployer).
3. **Access control** — grant \`mint(address,uint256)\` and \`burn(address,uint256)\` on vceBTC to the Normal Timelock and the Guardian. (The \`createVault(...)\` permission on the InstitutionalVaultController is granted by the separate controller/vault-upgrade VIP.)
4. **Initial supply** — mint the initial vceBTC collateral to the Ceffu multisig.
5. **Vault creation** — create the Fixed Rate Vault with vceBTC as collateral.`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      // ──────────────────────────────────────────────────────────────────────
      // 1. Oracle configuration identically to BTCB
      // ──────────────────────────────────────────────────────────────────────
      ...BTCB_ORACLE_CONFIGS.map(({ address, feed, maxStalePeriod }) => ({
        target: address,
        signature: "setTokenConfig((address,address,uint256))",
        params: [[VCEBTC, feed, maxStalePeriod]],
      })),
      {
        target: BOUND_VALIDATOR,
        signature: "setValidateConfig((address,uint256,uint256))",
        params: [[VCEBTC, BTCB_UPPER_BOUND, BTCB_LOWER_BOUND]],
      },
      {
        target: bscmainnet.RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3],bool))",
        params: [[VCEBTC, [CHAINLINK_ORACLE, REDSTONE_ORACLE, ATLAS_ORACLE], [true, true, true], false]],
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
        target: bscmainnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [VCEBTC, "mint(address,uint256)", bscmainnet.NORMAL_TIMELOCK],
      },
      {
        target: bscmainnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [VCEBTC, "mint(address,uint256)", bscmainnet.CRITICAL_GUARDIAN],
      },
      {
        target: bscmainnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [VCEBTC, "burn(address,uint256)", bscmainnet.NORMAL_TIMELOCK],
      },
      {
        target: bscmainnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [VCEBTC, "burn(address,uint256)", bscmainnet.CRITICAL_GUARDIAN],
      },

      // ──────────────────────────────────────────────────────────────────────
      // 4. Mint initial vceBTC collateral
      // ──────────────────────────────────────────────────────────────────────
      {
        target: VCEBTC,
        signature: "mint(address,uint256)",
        params: [INITIAL_SUPPLY_RECIPIENT, VCEBTC_INITIAL_SUPPLY],
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
