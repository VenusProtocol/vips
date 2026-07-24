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
// Per review: grant setPoolConfig only to the Guardian + Normal Timelock. FastTrack and Critical
// timelocks are intentionally omitted (added back only if a future VIP specifically needs them).
export const BSC_GOVERNANCE_TIMELOCKS = [bscmainnet.NORMAL_TIMELOCK];

// New PancakeSwap StableSwap / ListaDAO oracle adapter (venus-periphery), deployed on BNB Chain.
// Its ownership is transferred to the Normal Timelock (two-step) as part of the deployment step
// preceding execution; this VIP accepts that ownership in command 1.
export const PCS_STABLE_ORACLE = "0x8440889CaEC04FeFEB52c3c5cd729548864E7886";

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
// Venus Treasury (VTreasuryV8) on Ethereum — holds the eBTC seed-liquidity position (~0.1447 veBTC).
export const ETH_VTREASURY = ethereum.VTREASURY;
// Ethereum Normal Timelock — executes the destination-chain commands, so it is the account that
// temporarily holds and redeems the treasury's veBTC in the direct redemption flow (see command 10).
export const ETH_NORMAL_TIMELOCK = ethereum.NORMAL_TIMELOCK;

// Treasury's full veBTC balance and the eBTC it redeems into. veBTC and eBTC are both 8-decimal
// tokens and the market has 0 borrows, so its exchange rate is fixed at 1e18 (no interest accrues):
// redeeming the whole veBTC balance yields exactly the same amount of eBTC, leaving no dust. Verified
// on-chain: treasury veBTC balance = 0.14471345, exchangeRateStored = 1e18, totalBorrows = 0.
export const TREASURY_VEBTC_AMOUNT = parseUnits("0.14471345", 8);
export const EXPECTED_EBTC_UNDERLYING = parseUnits("0.14471345", 8);

// Held in a named constant because it is referenced twice (the ACM grant in command 2 and the
// setPoolConfig call in command 6) and both must use the byte-identical string, or the grant would
// not authorize the call. Expanded, the call is:
//   setPoolConfig(asset, pool, coinIndex, refCoinIndex, referenceToken, assetDecimals)
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
2. **Grant \`setPoolConfig\` permission** on PCSStableOracle to the Guardian and the Normal Timelock, so the pool can be configured.
3. **Restore the collateral factor to 50%** — \`setCollateralFactor(vlisUSD, 0.5e18, 0.55e18)\`. The liquidation threshold stays 0.55 (matches the pre-incident value stored in the Emergency Brake CF snapshot).
4. **Reduce the supply cap 5,000,000 → 2,100,000 lisUSD** — \`setMarketSupplyCaps([vlisUSD], [2,100,000])\` (2× the 3-month average supply).
5. **Reset the Emergency Brake CF snapshot** for vlisUSD — \`resetCFSnapshot(vlisUSD)\`.
6. **Re-route the Deviation Sentinel** from the old lisUSD PancakeSwap V3 pool to the ListaDAO lisUSD/USDT pool: \`PCSStableOracle.setPoolConfig(lisUSD, ListaDAOPool, 0, 1, USDT, 18)\` then \`SentinelOracle.setTokenOracleConfig(lisUSD, PCSStableOracle)\`. The ListaDAO pool exposes the PancakeSwap StableSwap interface, which the existing CurveOracle (int128 indices) cannot read, hence the new adapter.

#### Ethereum — eBTC (Core pool, cross-chain)

7. **Set the eBTC supply cap to 0** — \`setMarketSupplyCaps([veBTC], [0])\` on the Ethereum Core Comptroller.
8. **Reset the Emergency Brake CF snapshot** for veBTC — \`resetCFSnapshot(veBTC)\`.
9. **Disable the Deviation Sentinel for eBTC** — \`setTokenMonitoringEnabled(eBTC, false)\`.
10. **Redeem the treasury-held veBTC back to eBTC** (direct redemption through the Normal Timelock, same flow as VIP-526): \`VTreasuryV8.withdrawTreasuryToken(veBTC, 0.14471345, NormalTimelock)\` moves the Treasury's full veBTC balance to the Ethereum Normal Timelock, \`veBTC.redeem(0.14471345)\` redeems it to eBTC held by the Timelock, and \`eBTC.transfer(VTreasuryV8, 0.14471345)\` returns the redeemed eBTC to the Treasury. The eBTC market has 0 borrows and full cash with a fixed 1e18 exchange rate, so the position redeems 1:1 with no dust left in the Timelock.

The Ethereum Normal Timelock already holds the \`resetCFSnapshot\` and \`setTokenMonitoringEnabled\` permissions (granted in VIP-616), so no additional ACM grants are required. Accrued reserves on the eBTC market are currently 0, so no \`reduceReserves\` step is needed. This redemption path does not rely on the Token Redeemer (which is not deployed on Ethereum); the standard redemption flow works because the market has no borrows and therefore no accruing interest.

#### References

- [Community Post](https://community.venus.io/) — eBTC Delisting and lisUSD Resumption
- [ListaDAO lisUSD/USDT pool](https://lista.org/liquidity/pool/bsc/0x8df7891fb2cb3e98c7ab3cfb4d9a59fbcc63c956)
- Deviation Sentinel governance pattern: VIP-590, VIP-610, VIP-613, VIP-616
- Treasury redemption pattern (withdraw → redeem → transfer back): VIP-526

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
        // setPoolConfig(address,address,uint8,uint8,address,uint8) — same signature granted in command 2.
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

      // 10. Redeem the treasury-held veBTC back to eBTC directly through the Normal Timelock (VIP-526 flow):
      //   a) move the treasury's full veBTC balance to the Ethereum Normal Timelock (the executor of
      //      these cross-chain commands, so it becomes the holder that can redeem).
      {
        target: ETH_VTREASURY,
        signature: "withdrawTreasuryToken(address,uint256,address)",
        params: [veBTC, TREASURY_VEBTC_AMOUNT, ETH_NORMAL_TIMELOCK],
        dstChainId: LzChainId.ethereum,
      },
      //   b) the Timelock redeems the veBTC, receiving the underlying eBTC (0 borrows → 1e18 exchange
      //      rate → redeems 1:1, no dust).
      {
        target: veBTC,
        signature: "redeem(uint256)",
        params: [TREASURY_VEBTC_AMOUNT],
        dstChainId: LzChainId.ethereum,
      },
      //   c) transfer the redeemed eBTC from the Timelock back to the Treasury.
      {
        target: eBTC,
        signature: "transfer(address,uint256)",
        params: [ETH_VTREASURY, EXPECTED_EBTC_UNDERLYING],
        dstChainId: LzChainId.ethereum,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip664;
