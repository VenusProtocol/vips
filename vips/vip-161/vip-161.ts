import { parseUnits } from "ethers/lib/utils";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
const VBUSD = "0x95c78222B3D6e262426483D42CfA53685A67Ab9D";
const VTUSDOLD = "0x08CEB3F4a7ed3500cA0982bcd0FC7816688084c3";
const DEFI_POOL = "0x3344417c9360b963ca93A4e8305361AEde340Ab9";
const VANKRBNB_DEFI = "0x53728FD51060a85ac41974C6C3Eb1DaE42776723";
const VTUSDOLD_INTEREST_RATE_MODEL = "0x574f056c1751ed5f3aa30ba04e550f4e6090c992";

export const Actions = {
  MINT: 0,
  BORROW: 2,
  ENTER_MARKETS: 7,
};

export const vip161 = () => {
  const meta = {
    version: "v2",
    title: "VIP-161 Initiate BUSD market deprecation and Risk Parameters Updates",
    description: `**Summary**

If passed this VIP will perform the following actions as per the latest Chaos Labs [recommendations](https://community.venus.io/t/chaos-labs-risk-parameter-updates-08-21-2023/3707):

* BUSD: Pause MINT, Pause BORROW, Pause ENTER_MARKET - Users that have already enabled BUSD as collateral will not be affected by this update. Set XVS rewards in the BUSD market to 0.Freeze new supply and borrow by reducing supply and borrow caps to 0 and Increase BUSD Reserve Factor to 100%
* TUSDOLD: Reduce jump multiplier from 2.5 to 0.5
* ankrBNB (Defi Pool): Increase supply cap by 2X to 10,000

**Rationale**

Given the ongoing deprecation of BUSD by Paxos leading to increasing risk due to reduced liquidity, Chaos Labs recommend gradually winding down the BUSD market on Venus. As announced by [PAXOS](https://paxos.com/2023/02/13/paxos-will-halt-minting-new-busd-tokens/), the original issuer of BUSD, they have already halted minting New BUSD Tokens. Existing Tokens Remain Fully-Backed and Redeemable Through Binance or the Paxos Trust Company Through at Least February 2024.

* Paxos Will Halt Minting New BUSD Tokens
* Paxos will continue supporting BUSD until at least February 2024
* Binance started delisting BUSD pairs
* Coinbase has already stopped BUSD trading

This proposal aims to initiate the deprecation of BUSD from the Venus market. If the community agrees to deprecate BUSD, Chaos Labs proposes a phased plan comprising the following actions:

* Limit exposure to BUSD on Venus
* Freeze new supply and borrow
* Gradually reduce Collateral Factors to allow users to repay or swap their collaterals
* Encourage repayment of BUSD loans by amending IR curves
* Encourage redemption of BUSD supply by reducing supply interest - increasing Reserve Factors

Following each update, Chaos Labs will continue to monitor the market and the impact of the parameter updates on usage. Based on the observed effects and future market conditions, they will continue to supply recommendations as necessary.
        `,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: COMPTROLLER,
        signature: "_setMarketSupplyCaps(address[],uint256[])",
        params: [[VBUSD], [0]],
      },

      {
        target: COMPTROLLER,
        signature: "_setMarketBorrowCaps(address[],uint256[])",
        params: [[VBUSD], [1]],
      },

      {
        target: VBUSD,
        signature: "_setReserveFactor(uint256)",
        params: [parseUnits("1", 18)],
      },

      {
        target: COMPTROLLER,
        signature: "_setActionsPaused(address[],uint8[],bool)",
        params: [[VBUSD], [Actions.MINT, Actions.BORROW, Actions.ENTER_MARKETS], true],
      },

      {
        target: COMPTROLLER,
        signature: "_setVenusSpeeds(address[],uint256[],uint256[])",
        params: [[VBUSD], ["0"], ["0"]],
      },

      {
        target: VTUSDOLD,
        signature: "_setInterestRateModel(address)",
        params: [VTUSDOLD_INTEREST_RATE_MODEL],
      },

      {
        target: DEFI_POOL,
        signature: "setMarketSupplyCaps(address[],uint256[])",
        params: [[VANKRBNB_DEFI], [parseUnits("10000", 18)]],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
