import { parseUnits } from "ethers/lib/utils";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const TREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";
export const WBNB = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";
export const vBNB = "0xA07c5b74C9B40447a954e1466938b865b6BBea36";
export const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
export const WBNB_WITHDRAW_AMOUNT = parseUnits("2431.068422494325838291", 18);

export const vip268 = () => {
  const meta = {
    version: "v2",
    title: "VIP-268 Treasury Management (BNB)",
    description: `Following the community proposal for [Treasury Management](https://community.venus.io/t/treasury-management-proposal/4134), and the [associated snapshot](https://snapshot.org/#/venus-xvs.eth/proposal/0xb58cdfa3dba5459e9279a06065033c327f239afb834b27e06c5474954e51b30d), this VIP, if approved, will supply 2,431.06 WBNB from the [Venus Treasury](https://bscscan.com/address/0xf322942f644a996a617bd29c16bd7d231d9f35e9) to the [Venus BNB market](https://bscscan.com/address/0xA07c5b74C9B40447a954e1466938b865b6BBea36).

The minted vTokens will be held by the [Normal Timelock](https://bscscan.com/address/0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396) contract, and they will be transferred to the Venus Treasury in a different VIP (it cannot be pre-calculated how many vBNB’s will be minted).`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [WBNB, WBNB_WITHDRAW_AMOUNT, NORMAL_TIMELOCK],
      },
      {
        target: WBNB,
        signature: "withdraw(uint256)",
        params: [WBNB_WITHDRAW_AMOUNT],
      },
      {
        target: vBNB,
        signature: "mint(uint256)",
        params: [WBNB_WITHDRAW_AMOUNT],
        value: WBNB_WITHDRAW_AMOUNT.toString(),
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip268;
