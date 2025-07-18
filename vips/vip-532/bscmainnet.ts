import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { LzChainId, ProposalMeta, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const vLBTC = "0x25C20e6e110A1cE3FEbaCC8b7E48368c7b2F0C91";
export const veBTC = "0x325cEB02fe1C2fF816A83a5770eA0E88e2faEcF2";
export const COMPTROLLER = "0x687a01ecF6d3907658f7A7c714749fAC32336D1B";
export const LBTC_ORACLE = "0x54B033D102db7DD734E0Ad649463E90fFA78D853";
export const eBTC_ORACLE = "0x04d6096A6F089047C7af6E4644D18fB766B8d4cE";

export const Actions = {
  MINT: 0,
  REDEEM: 1,
  BORROW: 2,
  REPAY: 3,
  SEIZE: 4,
  LIQUIDATE: 5,
  TRANSFER: 6,
  ENTER_MARKET: 7,
  EXIT_MARKET: 8,
};

export const DAYS_30 = 30 * 24 * 60 * 60;
export const getSnapshotGap = (
  exchangeRate: BigNumber,
  percentage: number, // BPS value (e.g., 10000 for 100%)
) => {
  // snapshot gap is percentage of the exchange rate
  const snapshotGap = exchangeRate.mul(percentage).div(10000);
  return snapshotGap.toString();
};

export const LBTC_InitialExchangeRate = parseUnits("1", 8);
export const eBTC_InitialExchangeRate = parseUnits("1", 8);
export const LBTC_GrowthRate = parseUnits("0.02", 18); // 2% growth rate
export const eBTC_GrowthRate = parseUnits("0.019", 18); // 1.9% growth rate
export const LBTC_SnapshotGap = 17; // 0.17%
export const eBTC_SnapshotGap = 16; // 0.16%

export const vip532 = async () => {
  const meta: ProposalMeta = {
    version: "v2",
    title: "VIP-532 [Ethereum] Risk Parameters Adjustments (LBTC, eBTC)",
    description: `If passed, this VIP will perform the changes recommended by Chaos Labs in the Venus community forum publication [Chaos Labs - LBTC and eBTC Oracle and Risk Parameter Update - 07/17/25](https://community.venus.io/t/chaos-labs-lbtc-and-ebtc-oracle-and-risk-parameter-update-07-17-25/5230):

- [LBTC (Core pool)](https://app.venus.io/#/pools/pool/0x687a01ecF6d3907658f7A7c714749fAC32336D1B/market/0x25C20e6e110A1cE3FEbaCC8b7E48368c7b2F0C91?chainId=1):
    - decrease borrow cap, from 45 LBTC to 0 LBTC
    - update the risk parameters of the [associated Capped Oracle](https://etherscan.io/address/0x54B033D102db7DD734E0Ad649463E90fFA78D853):
        - Annual Growth Rate: 2%
        - Snapshot Interval: 30 days
        - Snapshot Gap: 0.17%
- [eBTC (Core pool)](https://app.venus.io/#/pools/pool/0x687a01ecF6d3907658f7A7c714749fAC32336D1B/market/0x325cEB02fe1C2fF816A83a5770eA0E88e2faEcF2?chainId=1):
    - decrease borrow cap, from 12.6 eBTC to 0 eBTC
    - update the risk parameters of the [associated Capped Oracle](https://etherscan.io/address/0x04d6096A6F089047C7af6E4644D18fB766B8d4cE):
        - Annual Growth Rate: 1.9%
        - Snapshot Interval: 30 days
        - Snapshot Gap: 0.16%

Complete analysis and details of this recommendation are available in the above publication.

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/594)
- [Oracle contract for LBTC](https://etherscan.io/address/0x54B033D102db7DD734E0Ad649463E90fFA78D853)
- [Oracle contract for eBTC](https://etherscan.io/address/0x04d6096A6F089047C7af6E4644D18fB766B8d4cE)`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: COMPTROLLER,
        signature: "setMarketBorrowCaps(address[],uint256[])",
        params: [[vLBTC], [0]],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: COMPTROLLER,
        signature: "setMarketBorrowCaps(address[],uint256[])",
        params: [[veBTC], [0]],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: COMPTROLLER,
        signature: "setActionsPaused(address[],uint8[],bool)",
        params: [[vLBTC, veBTC], [Actions.BORROW], true],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: LBTC_ORACLE,
        signature: "setGrowthRate(uint256,uint256)",
        params: [LBTC_GrowthRate, DAYS_30],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: LBTC_ORACLE,
        signature: "setSnapshotGap(uint256)",
        params: [getSnapshotGap(LBTC_InitialExchangeRate, LBTC_SnapshotGap)],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: eBTC_ORACLE,
        signature: "setGrowthRate(uint256,uint256)",
        params: [eBTC_GrowthRate, DAYS_30],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: eBTC_ORACLE,
        signature: "setSnapshotGap(uint256)",
        params: [getSnapshotGap(eBTC_InitialExchangeRate, eBTC_SnapshotGap)],
        dstChainId: LzChainId.ethereum,
      },
    ],
    meta,
    ProposalType.FAST_TRACK,
  );
};

export default vip532;
