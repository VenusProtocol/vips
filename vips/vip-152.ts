import { ProposalType } from "../src/types";
import { makeProposal } from "../src/utils";

const COMPTROLLER_ADDRESS = "0xfD36E2c2a6789Db23113685031d7F16329158384";
const vBNB_ADDRESS = "0xA07c5b74C9B40447a954e1466938b865b6BBea36";
const WBNB_ADDRESS = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";
const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
const VTOKEN_TREASURY_ADDRESS = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";
const ACM = "0x4788629ABc6cFCA10F9f969efdEAa1cF70c23555";
const VBNBAdmin_IMPLEMENTATION = "0xAD50B75ae062c9853725ed88eF1E220C0bC44753";
const VBNBAdmin_ADDRESS = "0x027a815a6825eE98F3dFe57e10B7f354038DEa67"

export const vip152 = () => {
  const meta = {
    version: "v2",
    title: "Change vBNB admin to vBNBAdmin",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with setting the vBNB admin",
    againstDescription: "I do not think that Venus Protocol should proceed with setting the vBNB admin",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with setting the vBNB admin",
  };

  return makeProposal(
    [
      {
        target: VBNBAdmin_ADDRESS,
        signature: "acceptOwnership()",
        params: [],
      },
      {
        target: vBNB_ADDRESS,
        signature: "_setPendingAdmin(address)",
        params: [VBNBAdmin_ADDRESS],
      },
      {
        target: VBNBAdmin_ADDRESS,
        signature: "_acceptAdmin()",
        params: [],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
