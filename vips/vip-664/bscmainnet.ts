import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { bscmainnet, ethereum } = NETWORK_ADDRESSES;

// ─────────────────────────────────────────────────────────────────────────────
// BNB Chain — lisUSD resumption (Core pool)
// ─────────────────────────────────────────────────────────────────────────────
export const BSC_COMPTROLLER = bscmainnet.UNITROLLER; // Core pool Comptroller (Diamond)
export const vlisUSD = "0x689E0daB47Ab16bcae87Ec18491692BF621Dc6Ab";
export const lisUSD = "0x0782b6d8c4551B9760e74c0545a9bCD90bdc41E5";
export const USDT = "0x55d398326f99059fF775485246999027B3197955";

// ListaDAO lisUSD/USDT StableSwap pool (PancakeSwap StableSwap interface) —
// coins[0]=lisUSD, coins[1]=USDT. https://lista.org/liquidity/pool/bsc/0x8df7891fb2cb3e98c7ab3cfb4d9a59fbcc63c956
export const LISTA_LISUSD_USDT_POOL = "0x8df7891fb2Cb3e98C7AB3cfB4d9A59FbCC63c956";

// Deviation Sentinel stack on BNB Chain (VIP-590 / VIP-610 / VIP-613)
export const BSC_SENTINEL_ORACLE = "0x58eae0Cf4215590E19860b66b146C5d539cb6f14";
export const BSC_EBRAKE = "0x35eBaBB99c7Fb7ba0C90bCc26e5d55Cdf89C23Ec";
export const BSC_ACM = bscmainnet.ACCESS_CONTROL_MANAGER;
export const BSC_GUARDIAN = bscmainnet.GUARDIAN;
export const BSC_GOVERNANCE_TIMELOCKS = [
  bscmainnet.NORMAL_TIMELOCK,
  bscmainnet.FAST_TRACK_TIMELOCK,
  bscmainnet.CRITICAL_TIMELOCK,
];

// New PancakeSwap StableSwap / ListaDAO oracle adapter (venus-periphery).
// PLACEHOLDER — the real mainnet address is pinned in a later deployment phase.
// The simulation deploys the adapter in-fork and passes that address to vip664(),
// so the sim never relies on this default. Do NOT propose this VIP on-chain until
// this constant is replaced with the deployed mainnet PCSStableOracle address.
export const PCS_STABLE_ORACLE = "0x0000000000000000000000000000000000000000";

// lisUSD risk parameters (restored)
export const LISUSD_COLLATERAL_FACTOR = parseUnits("0.5", 18); // 50%
export const LISUSD_LIQUIDATION_THRESHOLD = parseUnits("0.55", 18); // 55% (unchanged, matches EBrake CF snapshot)
export const LISUSD_NEW_SUPPLY_CAP = parseUnits("2100000", 18); // 2.1M lisUSD (from 5M; 2× 3-mo avg supply)

// Pool config indices for the ListaDAO lisUSD/USDT pool (verified on-chain).
export const LISUSD_COIN_INDEX = 0;
export const USDT_REF_COIN_INDEX = 1;
export const LISUSD_DECIMALS = 18;

// ─────────────────────────────────────────────────────────────────────────────
// Ethereum — eBTC delisting (Core pool, cross-chain)
// ─────────────────────────────────────────────────────────────────────────────
export const ETH_CORE_COMPTROLLER = ethereum.CORE_COMPTROLLER;
export const veBTC = "0x325cEB02fe1C2fF816A83a5770eA0E88e2faEcF2";
export const eBTC = "0x657e8C867D8B37dCC18fA4Caead9C45EB088C642";
export const ETH_EBRAKE = "0xCD09042c5DFFed762998Df9a058ec5944e39949B";
export const ETH_DEVIATION_SENTINEL = "0x7D0EFA41eBF1aF242A37174E1E047bD6ea1b1B9c";

export const SET_POOL_CONFIG_SIGNATURE = "setPoolConfig(address,address,uint8,uint8,address,uint8)";

const giveCallPermission = (contract: string, sig: string, account: string) => ({
  target: BSC_ACM,
  signature: "giveCallPermission(address,string,address)",
  params: [contract, sig, account],
});

export const vip664 = (pcsStableOracle: string = PCS_STABLE_ORACLE) => {
  const meta = {
    version: "v2",
    title: "VIP-664 [BNB Chain & Ethereum] eBTC Delisting & lisUSD Resumption",
    description: `#### Summary

This VIP (1) resumes **lisUSD** as collateral on BNB Chain with a tightened supply cap and re-routes its Deviation Sentinel price source to the ListaDAO lisUSD/USDT pool via a new PancakeSwap StableSwap oracle adapter, and (2) delists **eBTC** on Ethereum Core by zeroing its supply cap and disabling its Deviation Sentinel monitoring.

#### BNB Chain — lisUSD (Core pool)

1. **Accept ownership of the new PCSStableOracle** — \`acceptOwnership()\`. The adapter is deployed with a two-step ownership transfer to the Normal Timelock, which this VIP accepts (same pattern as the DEX oracles in VIP-590 / VIP-616).
2. **Grant \`setPoolConfig\` permission** on PCSStableOracle to Guardian and the Normal / FastTrack / Critical timelocks (VIP-590 pattern), so the pool can be configured.
3. **Restore the collateral factor to 50%** — \`setCollateralFactor(vlisUSD, 0.5e18, 0.55e18)\`. The liquidation threshold stays 0.55 (matches the pre-incident value stored in the Emergency Brake CF snapshot).
4. **Reduce the supply cap 5,000,000 → 2,100,000 lisUSD** — \`setMarketSupplyCaps([vlisUSD], [2,100,000])\` (2× the 3-month average supply).
5. **Reset the Emergency Brake CF snapshot** for vlisUSD — \`resetCFSnapshot(vlisUSD)\`.
6. **Re-route the Deviation Sentinel** from the old lisUSD PancakeSwap V3 pool to the ListaDAO lisUSD/USDT pool: \`PCSStableOracle.setPoolConfig(lisUSD, ListaDAOPool, 0, 1, USDT, 18)\` then \`SentinelOracle.setTokenOracleConfig(lisUSD, PCSStableOracle)\`. The ListaDAO pool exposes the PancakeSwap StableSwap interface, which the existing CurveOracle (int128 indices) cannot read, hence the new adapter.

#### Ethereum — eBTC (Core pool, cross-chain)

7. **Set the eBTC supply cap to 0** — \`setMarketSupplyCaps([veBTC], [0])\` on the Ethereum Core Comptroller.
8. **Reset the Emergency Brake CF snapshot** for veBTC — \`resetCFSnapshot(veBTC)\`.
9. **Disable the Deviation Sentinel for eBTC** — \`setTokenMonitoringEnabled(eBTC, false)\`.

The Ethereum Normal Timelock already holds the \`resetCFSnapshot\` and \`setTokenMonitoringEnabled\` permissions (granted in VIP-616), so no additional ACM grants are required. The reduce-reserves and treasury-veBTC-redemption steps are handled in a follow-up deployment step (the on-chain redemption helper / receiver addresses are still to be confirmed) — accrued reserves on the eBTC market are currently 0.

#### References

- [Community Post](https://community.venus.io/) — eBTC Delisting and lisUSD Resumption
- [ListaDAO lisUSD/USDT pool](https://lista.org/liquidity/pool/bsc/0x8df7891fb2cb3e98c7ab3cfb4d9a59fbcc63c956)
- Deviation Sentinel governance pattern: VIP-590, VIP-610, VIP-613, VIP-616

#### Voting options

- **For** — Execute the proposal
- **Against** — Do not execute the proposal
- **Abstain** — Indifferent to execution`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      // ──────────────────────────────────────────────────────────────────────
      // BNB Chain — lisUSD resumption
      // ──────────────────────────────────────────────────────────────────────

      // 1. Accept ownership of the newly deployed PCSStableOracle (two-step transfer to Normal Timelock).
      {
        target: pcsStableOracle,
        signature: "acceptOwnership()",
        params: [],
      },

      // 2. Grant setPoolConfig permission on PCSStableOracle to Guardian + governance timelocks (VIP-590 pattern).
      ...[BSC_GUARDIAN, ...BSC_GOVERNANCE_TIMELOCKS].map(account =>
        giveCallPermission(pcsStableOracle, SET_POOL_CONFIG_SIGNATURE, account),
      ),

      // 3. Restore lisUSD collateral factor to 50% (liquidation threshold unchanged at 55%).
      {
        target: BSC_COMPTROLLER,
        signature: "setCollateralFactor(address,uint256,uint256)",
        params: [vlisUSD, LISUSD_COLLATERAL_FACTOR, LISUSD_LIQUIDATION_THRESHOLD],
      },

      // 4. Reduce lisUSD supply cap 5,000,000 → 2,100,000.
      {
        target: BSC_COMPTROLLER,
        signature: "setMarketSupplyCaps(address[],uint256[])",
        params: [[vlisUSD], [LISUSD_NEW_SUPPLY_CAP]],
      },

      // 5. Reset the Emergency Brake CF snapshot for vlisUSD.
      {
        target: BSC_EBRAKE,
        signature: "resetCFSnapshot(address)",
        params: [vlisUSD],
      },

      // 6. Re-route the Deviation Sentinel to the ListaDAO pool via the new PCSStableOracle.
      {
        target: pcsStableOracle,
        signature: SET_POOL_CONFIG_SIGNATURE,
        params: [lisUSD, LISTA_LISUSD_USDT_POOL, LISUSD_COIN_INDEX, USDT_REF_COIN_INDEX, USDT, LISUSD_DECIMALS],
      },
      {
        target: BSC_SENTINEL_ORACLE,
        signature: "setTokenOracleConfig(address,address)",
        params: [lisUSD, pcsStableOracle],
      },

      // ──────────────────────────────────────────────────────────────────────
      // Ethereum — eBTC delisting (cross-chain)
      // ──────────────────────────────────────────────────────────────────────

      // 7. Set the eBTC supply cap to 0.
      {
        target: ETH_CORE_COMPTROLLER,
        signature: "setMarketSupplyCaps(address[],uint256[])",
        params: [[veBTC], [0]],
        dstChainId: LzChainId.ethereum,
      },

      // 8. Reset the Emergency Brake CF snapshot for veBTC.
      {
        target: ETH_EBRAKE,
        signature: "resetCFSnapshot(address)",
        params: [veBTC],
        dstChainId: LzChainId.ethereum,
      },

      // 9. Disable the Deviation Sentinel for eBTC.
      {
        target: ETH_DEVIATION_SENTINEL,
        signature: "setTokenMonitoringEnabled(address,bool)",
        params: [eBTC, false],
        dstChainId: LzChainId.ethereum,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip664;
