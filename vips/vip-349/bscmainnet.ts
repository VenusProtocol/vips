import { parseUnits } from "ethers/lib/utils";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const USDT = "0x55d398326f99059fF775485246999027B3197955";
export const VAI = "0x4BD17003473389A42DAF6a0a729f6Fdb328BbBd7";

export const COMMUNITY = "0xc444949e0054A23c44Fc45789738bdF64aed2391";
export const VTREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";

export const USDT_AMOUNT = parseUnits("193000", 18);
export const VAI_AMOUNT = parseUnits("200000", 18);

export const vip349 = () => {
  const meta = {
    version: "v2",
    title: "VIP-349 Venus Stars Program Renewal",
    description: `#### Summary

If passed, this VIP will transfer to the [Venus Community Wallet](https://bscscan.com/address/0xc444949e0054A23c44Fc45789738bdF64aed2391) 193,000 USDT and 200,000 VAI, from the [Venus Treasury](https://bscscan.com/address/0xf322942f644a996a617bd29c16bd7d231d9f35e9): the budget for the annual Venus Stars Program (Ambassador Program) renewal for the period of July 2024 - June 2025. All unused funds will be carried over and used in the next period as previously.

#### Description

The Venus Stars Team suggests revising and enhancing the budget for the Venus Ambassadors program. With Venus expanding to multiple new blockchains, additional resources are necessary. The proposed restructuring aims to ensure that resources are appropriately allocated to meet the program's increasing needs, enabling effective outreach and support for our global community.

#### Details

- The estimated yearly budget total is $393K. We propose using a mix of VAI tokens already accumulated in the Venus Treasury and USDT to fund the program.
- This VIP will transfer: 200,000 VAI and 193,000 USDT to the Venus Community wallet address: [0xc444949e0054A23c44Fc45789738bdF64aed2391](https://bscscan.com/address/0xc444949e0054A23c44Fc45789738bdF64aed2391)

#### References

- [Venus Stars Program Renewal Snapshot](https://snapshot.org/#/venus-xvs.eth/proposal/0xfc7200b104fc61aa283ef25136c7d48d686f1edc2bb684d3da2904508ac69aa8)
- [Proposal: Venus Stars Program Renewal 2024](https://community.venus.io/t/proposal-venus-stars-program-renewal-2024/4488)
- [VIP simulation](https://github.com/VenusProtocol/vips/pull/343)`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT, USDT_AMOUNT, COMMUNITY],
      },
      {
        target: VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [VAI, VAI_AMOUNT, COMMUNITY],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip349;
