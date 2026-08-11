import { constants } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { bscmainnet } = NETWORK_ADDRESSES;

// Newly deployed APRO oracle (a ChainlinkOracle instance).
export const APRO_ORACLE = "0x04480f1Ba2252CDF89deB022B58d0a03d1B4cF91";

export const BOUND_VALIDATOR = "0x6E332fF0bB52475304494E4AE5063c1051c7d735";
export const ATLAS_ORACLE = "0x9E6928Ec418948ceb9f1cd9872fD312b13D841D0";
export const MAX_STALE_PERIOD = 3800;

// ±2% anchor band
export const UPPER_BOUND = parseUnits("1.02", 18);
export const LOWER_BOUND = parseUnits("0.98", 18);

export interface AproAsset {
  symbol: string;
  asset: string;
  feed: string;
  // The feed's own AccessControlledOffchainAggregator access controller
  accessController: string;
}

export const APRO_ASSETS: AproAsset[] = [
  {
    symbol: "SKHYB",
    asset: "0xCA750eF65f295BBECd685Abf54e82CAf297BDB61",
    feed: "0x2446DCeDd294EDB5d90Ee16Fa32Da56Bc2973ACd",
    accessController: "0x0Ae22Ed18D388BCC5247ED46bDB03010A2A9cb7E",
  },
  {
    symbol: "NVDAB",
    asset: "0x02Fca66C1D1aFB4E2A7884261eB00F63598a7436",
    feed: "0x310EFC9Fefe89B8085F89E91Ac782Bef6416499E",
    accessController: "0x8120CeCd66A758F547675897139a124D00b1cb70",
  },
  {
    symbol: "SPCXB",
    asset: "0xbe9D156892E55e7154BcD3cB0FEA677F9D3103E1",
    feed: "0x44c4173459121690613Bc22C110c4f0624254f3E",
    accessController: "0x7b03c0cf65Fb840cB55131EdDCF43b2a1BB83D5A",
  },
  {
    symbol: "TSLAB",
    asset: "0x5b1910eAaD6450E50f816082Aa078C41F10C292f",
    feed: "0xe1bc21701Bc8FFa39DaecDb8f58263C1d5e1c0bc",
    accessController: "0x5E714018c12304e2c02D028F6DCdfF395221c89D",
  },
];

export const vip999 = () => {
  const meta = {
    version: "v2",
    title: "VIP-999 [BNB Chain] Add APRO oracle as PIVOT for BStocks markets (SKHYB, NVDAB, SPCXB, TSLAB)",
    description: `#### Summary

The four tokenized-stock (BStocks) assets — SK Hynix (SKHYB), NVIDIA (NVDAB), SpaceX (SPCXB) and
Tesla (TSLAB) — currently price from a single source: the Atlas Oracle configured as MAIN with no PIVOT
and no FALLBACK. This VIP adds a second, independent price source — the newly deployed APRO oracle — as
the PIVOT for each of these markets, and configures the BoundValidator anchor band so the MAIN price is
sanity-checked against the PIVOT.

The APRO oracle is a ChainlinkOracle instance reading the APRO price feeds for each asset. Atlas remains
the MAIN source; APRO becomes the loose sanity checker (PIVOT). With a PIVOT enabled and no FALLBACK, the
ResilientOracle requires the MAIN price to fall within the BoundValidator band around the PIVOT price,
otherwise pricing reverts — strengthening the oracle setup for these markets.

#### Details — BNB Chain

1. **Accept ownership of the APRO oracle.** The oracle was deployed with the Normal Timelock as
   pendingOwner; this call completes the two-step transfer so governance owns it.
2. **Grant permissions on the APRO oracle** via the Access Control Manager (per-contract permissions
   for the newly deployed oracle): the Normal Timelock gets \`setTokenConfig(TokenConfig)\` and
   \`setDirectPrice(address,uint256)\`; the Guardian additionally gets \`setDirectPrice(address,uint256)\`
   so it can also manually pin an emergency price without waiting on a timelock delay.
3. **Configure the APRO feeds** on the APRO oracle for the four assets (feed address + a 3800s max stale
   period, matching the Atlas feeds).
4. **Insert APRO as PIVOT** in the ResilientOracle for the four assets: oracles become
   [Atlas (MAIN), APRO (PIVOT), 0 (no FALLBACK)] with enable flags [true, true, false]. Atlas is
   unchanged as MAIN.
5. **Set the BoundValidator anchor band** for the four assets to ±2% (upper 1.02, lower 0.98) so the
   MAIN (Atlas) price is validated against the PIVOT (APRO) price. The band has to absorb the gap
   between two independent feeds — each feed's own deviation threshold plus the skew between their
   ~1h heartbeats — rather than a single feed's threshold. Over a 14-day sample of both feeds the
   observed Atlas-vs-APRO spread peaks near 1.6%, so ±2% keeps normal operation inside the band
   while still rejecting a genuine divergence.

#### Voting options

- **For** — Execute this proposal
- **Against** — Do not execute this proposal
- **Abstain** — Indifferent to execution`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      // ────────────────────────────────────────────────────────────────
      // 1. Ownership + ACM permission for the newly deployed APRO oracle
      // ────────────────────────────────────────────────────────────────
      { target: APRO_ORACLE, signature: "acceptOwnership()", params: [] },
      {
        target: bscmainnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [APRO_ORACLE, "setTokenConfig(TokenConfig)", bscmainnet.NORMAL_TIMELOCK],
      },
      {
        target: bscmainnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [APRO_ORACLE, "setDirectPrice(address,uint256)", bscmainnet.NORMAL_TIMELOCK],
      },
      {
        target: bscmainnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [APRO_ORACLE, "setDirectPrice(address,uint256)", bscmainnet.GUARDIAN],
      },

      // ────────────────────────────────────────────────────────────────
      // 2. Configure APRO feeds on the APRO oracle
      // ────────────────────────────────────────────────────────────────
      {
        target: APRO_ORACLE,
        signature: "setTokenConfigs((address,address,uint256)[])",
        params: [APRO_ASSETS.map(({ asset, feed }) => [asset, feed, MAX_STALE_PERIOD])],
      },

      // ────────────────────────────────────────────────────────────────
      // 3. Insert APRO as PIVOT in the ResilientOracle (Atlas stays MAIN)
      // ────────────────────────────────────────────────────────────────
      {
        target: bscmainnet.RESILIENT_ORACLE,
        signature: "setTokenConfigs((address,address[3],bool[3],bool)[])",
        params: [
          APRO_ASSETS.map(({ asset }) => [
            asset,
            [ATLAS_ORACLE, APRO_ORACLE, constants.AddressZero],
            [true, true, false],
            false,
          ]),
        ],
      },

      // ────────────────────────────────────────────────────────────────
      // 4. Set the BoundValidator anchor band for MAIN-vs-PIVOT validation
      // ────────────────────────────────────────────────────────────────
      {
        target: BOUND_VALIDATOR,
        signature: "setValidateConfigs((address,uint256,uint256)[])",
        params: [APRO_ASSETS.map(({ asset }) => [asset, UPPER_BOUND, LOWER_BOUND])],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip999;
