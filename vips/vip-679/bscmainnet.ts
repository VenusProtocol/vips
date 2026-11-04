import { BigNumber, constants } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const NORMAL_TIMELOCK = NETWORK_ADDRESSES.bscmainnet.NORMAL_TIMELOCK;
export const PRIME = "0x059EabA8676b03e4e8f009eFb7F587C28450F50f";
export const PLP = "0x23c4F844ffDdC6161174eB32c770D4D8C07833F2";
export const USDT = "0x55d398326f99059fF775485246999027B3197955";
export const U = "0xcE24439F2D9C6a2289F741120FE202248B666666";
export const VHUSDT = "0x18AfDACF30F8671021dec4b78297E39d2FE87226";
export const VHU = "0x0e5AA174d4F31b757a237eb1999DE151596788B0";
export const VVHUSDT = "0xc0768948e668B7BacFf8b4BD1BaBe0eD2b512d3c";
export const VVHU = "0x80a5694441810d2b871BEeD644b6d16D113ce06E";
export const DEV_RECIPIENT = "0x080f8A0fB70F8F0F1b83C6178225a96CbE2BE0DE";
export const U_TO_SWAP = parseUnits("22000", 18);
export const FLOKI = "0xfb5B838b6cfEEdC2873aB27866079AC55363D37E";
// CoinGecko FLOKI/USD, 2026-11-04 05:19:49 UTC. Recheck before execution.
// setDirectPrice takes 18-decimal USD, not the 27-decimal normalized FLOKI price.
export const FLOKI_PRICE = parseUnits("0.00002228", 18);

// Seed both Hub reward legs atomically. The extra 500 underlying tokens per leg
// cover share-price drift and conversion costs; they do not increase reward speeds.
export const USDT_TO_DEPOSIT = parseUnits("22500", 18);
export const U_TO_DEPOSIT = parseUnits("11500", 18);
export const SUPPLY_MULTIPLIER = parseUnits("2", 18);
export const BLOCKS_PER_MONTH = 192000 * 30;
// Match the 1-token/block cap used by 18-decimal USDT/U, scaled to Hub share decimals.
export const HUB_MAX_DISTRIBUTION_SPEED = parseUnits("1", 24);

// Hub.previewDeposit(44,000 USDT / 11,000 U), BSC block 131549804 (2026-11-04).
// Both share tokens have 24 decimals. These FIXED share speeds approximate the
// underlying budgets at that snapshot; they do not track USD or the live Hub PPS.
export const MONTHLY_VHUSDT = BigNumber.from("43693500110621916102848004828");
export const MONTHLY_VHU = BigNumber.from("10949457384727242068042507424");
export const VHUSDT_SPEED = MONTHLY_VHUSDT.div(BLOCKS_PER_MONTH);
export const VHU_SPEED = MONTHLY_VHU.div(BLOCKS_PER_MONTH);

export const vip679 = () =>
  makeProposal(
    [
      // Crystallize all old reward liabilities before moving only free inventory.
      {
        target: PLP,
        signature: "setTokensDistributionSpeed(address[],uint256[])",
        params: [
          [USDT, U],
          [0, 0],
        ],
      },
      { target: PLP, signature: "initializeTokens(address[])", params: [[VHUSDT, VHU]] },
      // Scale the existing 1-token/block convention to 24-decimal Hub shares.
      {
        target: PLP,
        signature: "setMaxTokensDistributionSpeed(address[],uint256[])",
        params: [
          [VHUSDT, VHU],
          [HUB_MAX_DISTRIBUTION_SPEED, HUB_MAX_DISTRIBUTION_SPEED],
        ],
      },
      {
        target: PLP,
        signature: "sweepToken(address,address,uint256)",
        params: [USDT, NORMAL_TIMELOCK, USDT_TO_DEPOSIT],
      },
      { target: PLP, signature: "sweepToken(address,address,uint256)", params: [U, NORMAL_TIMELOCK, U_TO_DEPOSIT] },
      { target: USDT, signature: "approve(address,uint256)", params: [VHUSDT, USDT_TO_DEPOSIT] },
      { target: VHUSDT, signature: "deposit(uint256,address)", params: [USDT_TO_DEPOSIT, PLP] },
      { target: U, signature: "approve(address,uint256)", params: [VHU, U_TO_DEPOSIT] },
      { target: VHU, signature: "deposit(uint256,address)", params: [U_TO_DEPOSIT, PLP] },
      // Same conversion recipient as VIP-652/660/665. Follow-up deposits the USDT
      // proceeds into the USDT Hub with receiver=PLP; returning plain USDT is insufficient.
      { target: PLP, signature: "sweepToken(address,address,uint256)", params: [U, DEV_RECIPIENT, U_TO_SWAP] },
      { target: PRIME, signature: "addMarket(address,uint256,uint256)", params: [VVHUSDT, SUPPLY_MULTIPLIER, 0] },
      { target: PRIME, signature: "addMarket(address,uint256,uint256)", params: [VVHU, SUPPLY_MULTIPLIER, 0] },
      {
        target: PLP,
        signature: "setTokensDistributionSpeed(address[],uint256[])",
        params: [
          [VHUSDT, VHU],
          [VHUSDT_SPEED, VHU_SPEED],
        ],
      },
      {
        target: NETWORK_ADDRESSES.bscmainnet.CHAINLINK_ORACLE,
        signature: "setDirectPrice(address,uint256)",
        params: [FLOKI, FLOKI_PRICE],
      },
      {
        target: NETWORK_ADDRESSES.bscmainnet.RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3],bool))",
        params: [
          [
            FLOKI,
            [NETWORK_ADDRESSES.bscmainnet.CHAINLINK_ORACLE, constants.AddressZero, constants.AddressZero],
            [true, false, false],
            false,
          ],
        ],
      },
    ],
    {
      version: "v2",
      title: "VIP-679 [BNB Chain] November Prime Rewards and FLOKI Exit Price",
      description: `#### Summary

This proposal allocates approximately $55,000 of Prime rewards for November 2026: $44,000 to vhUSDT suppliers and $11,000 to vhU suppliers in Venus Core. It implements the [November community proposal](https://community.venus.io/t/bnb-chain-prime-rewards-allocation-november-2026/6013), moving rewards from the vUSDT supply and vU borrow markets to the vvhUSDT and vvhU supply markets. Rewards are paid in the corresponding Hub shares, vhUSDT and vhU. Existing USDT and U rewards remain claimable.

It also restores a readable FLOKI price for the deprecated GameFi market, allowing affected debt-free suppliers to redeem. This is a separate oracle maintenance action, not part of the November Prime reward allocation.

#### Actions

1. Stop new USDT and U rewards on the PrimeLiquidityProvider (PLP), accruing the old speeds through execution. Keep the existing Prime markets and their historical rewards.
2. Initialise vhUSDT and vhU on the PLP and set each maximum distribution speed to 1e24 raw units per block (1 Hub share per block). This matches the 1-token-per-block cap of the existing 18-decimal USDT/U rewards, adjusted for the Hub shares' 24 decimals. These caps are independent of the monthly distribution speeds below.
3. Move 22,500 USDT and 11,500 U from the PLP to the Normal Timelock, approve only those amounts to the corresponding Hubs, and deposit them with the PLP as the share receiver. These operations execute atomically; the received shares remain in the PLP for distribution. The extra 500 underlying tokens per leg provide inventory buffers without increasing the reward allocation.
4. Transfer 22,000 U from the PLP to the [same conversion recipient used in VIP-665](https://bscscan.com/address/${DEV_RECIPIENT}). After conversion into USDT, the recipient must deposit the proceeds into the USDT Hub (${VHUSDT}) with receiver set to the PLP (${PLP}). Returning plain USDT does not fund vhUSDT rewards. This conversion and return are separate operations after VIP execution.
5. Add vvhUSDT (${VVHUSDT}) and vvhU (${VVHU}) to PrimeV2, both with supply multiplier 2e18 and borrow multiplier 0, matching the former USDT supply multiplier.
6. Set the new share distribution speeds:

- **vhUSDT**: ${VHUSDT_SPEED.toString()} raw units per block (24 decimals), approximately 43,693.500111 vhUSDT over 5,760,000 blocks, worth 44,000 USDT at the snapshot
- **vhU**: ${VHU_SPEED.toString()} raw units per block (24 decimals), approximately 10,949.457385 vhU over 5,760,000 blocks, worth 11,000 U at the snapshot

These speeds use each Hub's previewDeposit at block 131,549,804, on November 4, 2026. One vhUSDT share represented approximately 1.007014771 USDT and one vhU share approximately 1.004615993 U. Speeds are fixed in shares and use 192,000 blocks/day for 30 days; their underlying value varies with Hub share prices. WBNB rewards remain at zero.

#### Funding and execution

At block 131,549,804, the PLP held 28,793.39 USDT and 38,785.19 U free after deducting both stored and pending reward accrual. With no further inflows, four days of the old speeds leave approximately 23,460.06 USDT and 37,451.85 U at a November 8 execution. The deposits and 22,000 U conversion sweep leave approximately 960.06 USDT and 3,951.85 U free in the PLP, in addition to all rewards owed to existing claimants. At approximately 1:1 conversion, the Hubs receive 44,500 USDT and 11,500 U in total, including the inventory buffers. Recheck free balances, Hub capacity and conversion proceeds before execution; later execution and conversion costs reduce the buffers.

The vhU leg is funded at execution; the initial vhUSDT deposit funds roughly half its 30-day allocation. Complete the 22,000 U conversion and Hub deposit promptly. Reward accrual is capped by available inventory and does not backfill an exhausted period. The VIP does not itself perform or guarantee the off-chain conversion.

The 24-decimal Prime implementation upgrade from VIP-672 is already live. Adding both markets queues a score-update round for all current Prime holders. After execution, complete permissionless updateScores calls in batches of at most 20 and verify pendingScoreUpdates is zero. Until a holder's update, their new-market score is not yet included; claimPrime, issue and burn remain blocked while the round is pending. The existing markets remain listed so users can claim old USDT/U rewards. Hub share rewards received in a wallet must be supplied to Core to count toward future Prime scores.

The Normal Timelock owns the PLP and already holds the required PrimeV2 and PLP ACM permissions. No grants, upgrades, Treasury funding, interest-rate changes, collateral-factor changes or market supply/borrow cap changes are included.

#### FLOKI exit price

Set FLOKI (${FLOKI}) to a fixed USD price of $0.00002228 on ChainlinkOracle and switch its ResilientOracle main source from the expired Binance Oracle to ChainlinkOracle. The value is the [CoinGecko FLOKI/USD quote](https://www.coingecko.com/en/coins/floki) updated on November 4, 2026 at 05:19:49 UTC. The two calls execute atomically; pivot and fallback remain unset, and caching remains disabled. FLOKI has 9 decimals; setDirectPrice receives 22,280,000,000,000 (18-decimal USD), yielding a normalized oracle price of 22,280,000,000,000,000,000,000.

GameFi collateral factors and liquidation thresholds remain zero, and minting and borrowing remain paused. Suppliers with outstanding debt must repay it in full before redeeming; restoring the price also restores liquidation eligibility for indebted accounts whose other required prices are valid. Repay before VIP execution to avoid this exposure. Accounts also affected by other expired feeds may remain blocked. This action does not repay users, transfer their collateral, or resolve existing market bad debt.

The fixed price applies to every consumer of this shared ResilientOracle, including configured FLOKI token-converter pairs. It does not expire or track the market. Recheck the price and converter exposure before execution and before resuming paused converters; a later governance update is required to change or remove the override. This is an exit price for a deprecated market, not a live feed or an authorization to reopen borrowing.

#### References

- [November community proposal](https://community.venus.io/t/bnb-chain-prime-rewards-allocation-november-2026/6013)
- [VIP-665: October allocation and conversion route](https://app.venus.io/#/governance/proposal/665?chainId=56)
- [VIP-672: Prime 24-decimal support](https://app.venus.io/#/governance/proposal/672?chainId=56)

#### Voting options

- **For** — Execute the proposal
- **Against** — Do not execute the proposal
- **Abstain** — Abstain from voting`,
      forDescription: "I agree that Venus Protocol should proceed with this proposal",
      againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
      abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
    },
    ProposalType.REGULAR,
  );

export default vip679;
