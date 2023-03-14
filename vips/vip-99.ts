import { ProposalType } from "../src/types";
import { makeProposal } from "../src/utils";

const COMPTROLLER = "0xfd36e2c2a6789db23113685031d7f16329158384";
const VBUSD = "0x95c78222B3D6e262426483D42CfA53685A67Ab9D";
const VUSDC = "0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8";
const VUSDT = "0xfD5840Cd36d94D7229439859C0112a4185BC0255";
const VETH = "0xf508fCD89b8bd15579dc79A6827cB4686A3592c8";
const VBTC = "0x882C173bC7Ff3b7786CA16dfeD3DFFfb9Ee7847B";
const CONFIGURE_ATTACKER_COMPTROLLER_IMPL = "0xAE37464537fDa217258Bb2Cd70e4f8ffC7E95790";
const NEW_COMPTROLLER_IMPL = "0x909dd16b24CEf96c7be13065a9a0EAF8A126FFa5";
const NEW_VTOKEN_IMPL = "0x10FB44C481F87cb4F3ce8DE11fFd16e00EC5B670";
const SWAP_DEBT_DELEGATE = "0x2B16DB59c6f20672C0DB46b80361E9Ca1CD8a43a";

export const vip99 = () => {
  const meta = {
    version: "v2",
    title: "VIP-99 Delegate borrowing",
    description: `
    `,
    forDescription: "I agree that Venus Protocol should proceed with ",
    againstDescription: "I do not think that Venus Protocol should proceed with ",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with ",
  };

  return makeProposal(
    [
      {
        target: COMPTROLLER,
        signature: "_setPendingImplementation(address)",
        params: [CONFIGURE_ATTACKER_COMPTROLLER_IMPL],
      },
      {
        target: CONFIGURE_ATTACKER_COMPTROLLER_IMPL,
        signature: "_become(address)",
        params: [COMPTROLLER],
      },
      {
        target: COMPTROLLER,
        signature: "setDelegateForBNBHacker(address)",
        params: [SWAP_DEBT_DELEGATE],
      },
      {
        target: COMPTROLLER,
        signature: "_setPendingImplementation(address)",
        params: [NEW_COMPTROLLER_IMPL],
      },
      {
        target: NEW_COMPTROLLER_IMPL,
        signature: "_become(address)",
        params: [COMPTROLLER],
      },
      ...[VBUSD, VUSDC, VUSDT, VBTC, VETH].map((vToken: string) => {
        return {
          target: vToken,
          signature: "_setImplementation(address,bool,bytes)",
          params: [NEW_VTOKEN_IMPL, false, "0x"],
        };
      }),
    ],
    meta,
    ProposalType.REGULAR,
  );
};
