import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { bscmainnet } = NETWORK_ADDRESSES;

export const VCEBTC = "0xAB7D138c6e6fF1bfD3ac871d0dB08f9442Ce927F";
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
export const INSTITUTION_OPERATOR = "0x8972E6F8874406D294fc0380afBDA839B1b96262";
export const VCEBTC_INITIAL_SUPPLY = parseUnits("21.47", 18);

// Recipient of the initial vceBTC collateral mint (multisig)
export const INITIAL_SUPPLY_RECIPIENT = "0x5D1507d5Cfb3d031C3209e9FB8e2644e4094Ea01";

// VaultConfig: [supplyAsset, fixedAPY(bps), reserveFactor(1e18), minBorrowCap,
//               maxBorrowCap, minSupplierDeposit, openDuration, lockDuration, settlementWindow]
export const vaultConfig = [
  SUPPLY_ASSET,
  600, // fixedAPY = 6%
  parseUnits("0.3", 18), // reserveFactor = 30%
  parseUnits("500000", 18), // minBorrowCap = 500k USDT (must be > 0; createVault reverts if 0)
  parseUnits("1000000", 18), // maxBorrowCap = 1M
  0, // minSupplierDeposit
  7 * 24 * 60 * 60, // openDuration = 7 days
  30 * 24 * 60 * 60, // lockDuration = 30 days
  3 * 24 * 60 * 60, // settlementWindow = 3 days
];

// InstitutionalConfig: [collateralAsset, idealCollateralAmount, marginRate(1e18),
//                       institutionOperator, positionTokenId]
export const instConfig = [
  VCEBTC,
  parseUnits("21.47", 18), // idealCollateralAmount = 21.47 BTCB
  parseUnits("0.005", 18), // marginRate = 0.5% (must be > 0; createVault reverts InvalidConfig if 0)
  INSTITUTION_OPERATOR,
  0, // positionTokenId assigned by the controller
];

// RiskConfig: [liquidationThreshold(1e18), liquidationIncentive(1e18), latePenaltyRate(1e18)]
export const riskConfig = [parseUnits("0.9", 18), parseUnits("1.1", 18), parseUnits("1.1", 18)];

export const VAULT_SHARE_NAME = "FRV Solv BTCB 17AUG2026 30";
export const VAULT_SHARE_SYMBOL = "FRV-sv-17AUG2026-30";
export const INSTITUTION_NAME = "Solv(Ceffu custody)";

export const MINT_BURN_AUTHORIZED = [bscmainnet.NORMAL_TIMELOCK, bscmainnet.CRITICAL_GUARDIAN];

export const PAUSE_UNPAUSE_AUTHORIZED = [bscmainnet.NORMAL_TIMELOCK, bscmainnet.CRITICAL_GUARDIAN];

export const vip656 = () => {
  const meta = {
    version: "v2",
    title: "VIP-656 [BNB Chain] Ceffu Custody BTC Fixed Rate Vault",
    description: `#### Summary

This proposal onboards **vceBTC** ("Ceffu Custody BTC for Venus"), a governance-controlled token representing BTC held in Ceffu custody and priced identically to BTCB, and creates an Institutional Fixed Rate Vault that uses it as collateral for a 1,000,000 USDT, 30-day loan supplied at a fixed 4.2%. Refer to the community post for the full background and rationale.

#### Actions

This VIP performs the following 16 actions on BNB Chain:

1. **Chainlink feed for vceBTC** — Calls setTokenConfig((address,address,uint256)) on ChainlinkOracle (0x1B2103441A0A108daD8848D8F5d790e4D402921F), registering vceBTC (0xAB7D138c6e6fF1bfD3ac871d0dB08f9442Ce927F) against BTCB's Chainlink feed (0x8ECF7dE377F788A813F5215668E282556b35f300) with a 100-second maximum stale period.
2. **RedStone feed for vceBTC** — Calls setTokenConfig((address,address,uint256)) on RedStoneOracle (0x8455EFA4D7Ff63b8BFD96AdD889483Ea7d39B70a), registering vceBTC against BTCB's RedStone feed (0xa51738d1937FFc553d5070f43300B385AA2D9F55) with a 100-second maximum stale period.
3. **Atlas feed for vceBTC** — Calls setTokenConfig((address,address,uint256)) on AtlasOracle (0x9E6928Ec418948ceb9f1cd9872fD312b13D841D0), registering vceBTC against BTCB's Atlas feed (0x4f6c53fb9CdD46269d24bCa4E68bB680879132fc) with a 120-second maximum stale period.
4. **Price bounds** — Calls setValidateConfig((address,uint256,uint256)) on BoundValidator (0x6E332fF0bB52475304494E4AE5063c1051c7d735), applying to vceBTC the same 1.01 upper and 0.99 lower bound ratios currently applied to BTCB.
5. **ResilientOracle configuration** — Calls setTokenConfig((address,address[3],bool[3],bool)) on ResilientOracle (0x6592b5DE802159F3E74B2486b091D11a8256ab8A), enabling the three sub-oracles above as the main, pivot and fallback oracles for vceBTC. From this point vceBTC returns the same price as BTCB.
6. **Ownership** — Calls acceptOwnership() on vceBTC (0xAB7D138c6e6fF1bfD3ac871d0dB08f9442Ce927F), completing the transfer of ownership to the Normal Timelock (0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396), which the deployer has already offered.
7. **Mint permission — Normal Timelock** — Calls giveCallPermission(address,string,address) on AccessControlManager (0x4788629ABc6cFCA10F9f969efdEAa1cF70c23555), granting mint(address,uint256) on vceBTC to the Normal Timelock.
8. **Burn permission — Normal Timelock** — Calls giveCallPermission(address,string,address) on AccessControlManager, granting burn(address,uint256) on vceBTC to the Normal Timelock.
9. **Mint permission — Critical Guardian** — Calls giveCallPermission(address,string,address) on AccessControlManager, granting mint(address,uint256) on vceBTC to the Critical Guardian (0x7B1AE5Ea599bC56734624b95589e7E8E64C351c9).
10. **Burn permission — Critical Guardian** — Calls giveCallPermission(address,string,address) on AccessControlManager, granting burn(address,uint256) on vceBTC to the Critical Guardian.
11. **Pause permission — Normal Timelock** — Calls giveCallPermission(address,string,address) on AccessControlManager, granting pause() on vceBTC to the Normal Timelock.
12. **Unpause permission — Normal Timelock** — Calls giveCallPermission(address,string,address) on AccessControlManager, granting unpause() on vceBTC to the Normal Timelock.
13. **Pause permission — Critical Guardian** — Calls giveCallPermission(address,string,address) on AccessControlManager, granting pause() on vceBTC to the Critical Guardian.
14. **Unpause permission — Critical Guardian** — Calls giveCallPermission(address,string,address) on AccessControlManager, granting unpause() on vceBTC to the Critical Guardian.
15. **Initial collateral mint** — Calls mint(address,uint256) on vceBTC, minting 21.47 vceBTC to the custody multisig (0x5D1507d5Cfb3d031C3209e9FB8e2644e4094Ea01), matching the BTC held under custody. This is the entire supply of vceBTC.
16. **Vault creation** — Calls createVault(...) on InstitutionalVaultController (0x6D9e91cB766259af42619c14c994E694E57e6E85), creating the vault FRV Solv BTCB 17AUG2026 30 (FRV-sv-17AUG2026-30) for the institution Solv(Ceffu custody), with the configuration below.

#### Vault configuration

- **Supply asset** — USDT (0x55d398326f99059fF775485246999027B3197955)
- **Fixed APY** — 6%
- **Reserve factor** — 30% (4.2% fixed supply rate)
- **Borrow cap** — 500,000 – 1,000,000 USDT
- **Minimum supplier deposit** — 0
- **Open / lock / settlement** — 7 days / 30 days / 3 days
- **Collateral asset** — vceBTC (0xAB7D138c6e6fF1bfD3ac871d0dB08f9442Ce927F)
- **Ideal collateral amount** — 21.47 vceBTC
- **Margin rate** — 0.5%
- **Institution operator** — 0x8972E6F8874406D294fc0380afBDA839B1b96262
- **Liquidation threshold** — 90%
- **Liquidation incentive** — 10%
- **Late penalty rate** — 10%

This proposal depends on the Institutional Fixed Rate Vault upgrade VIP, which must be executed first: it grants the createVault permission used in action 16.`,
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
      // 3. Access control — vceBTC mint/burn + pause/unpause
      // ──────────────────────────────────────────────────────────────────────
      ...MINT_BURN_AUTHORIZED.flatMap(account => [
        {
          target: bscmainnet.ACCESS_CONTROL_MANAGER,
          signature: "giveCallPermission(address,string,address)",
          params: [VCEBTC, "mint(address,uint256)", account],
        },
        {
          target: bscmainnet.ACCESS_CONTROL_MANAGER,
          signature: "giveCallPermission(address,string,address)",
          params: [VCEBTC, "burn(address,uint256)", account],
        },
      ]),
      ...PAUSE_UNPAUSE_AUTHORIZED.flatMap(account => [
        {
          target: bscmainnet.ACCESS_CONTROL_MANAGER,
          signature: "giveCallPermission(address,string,address)",
          params: [VCEBTC, "pause()", account],
        },
        {
          target: bscmainnet.ACCESS_CONTROL_MANAGER,
          signature: "giveCallPermission(address,string,address)",
          params: [VCEBTC, "unpause()", account],
        },
      ]),

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

export default vip656;
