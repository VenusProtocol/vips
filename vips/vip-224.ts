import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../src/types";
import { makeProposal } from "../src/utils";

const MOVE_DEBT_DELEGATE = "0x89621C48EeC04A85AfadFD37d32077e65aFe2226";
const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
const PROTOCOL_SHARE_RESERVE = "0xCa01D5A9A248a830E9D93231e791B1afFed7c446";
const TREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";
const CHAINLINK_ORACLE = "0x1B2103441A0A108daD8848D8F5d790e4D402921F";

const VUSDC = "0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8";
const VUSDT = "0xfD5840Cd36d94D7229439859C0112a4185BC0255";
const VBUSD = "0x95c78222B3D6e262426483D42CfA53685A67Ab9D";
const BUSD = "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56";

const RESERVES_TO_WITHDRAW = parseUnits("2373087.553409498607767042", 18);
const VTOKEN_AMOUNT = parseUnits("6944693.44741659", 8);
const REDEEMER_CONTRACT = "0x29171F17BF7F3691908eD55bAC2014A632B87dD3";
const BNB_CHAIN_RECEIVER = "0x6657911F7411765979Da0794840D671Be55bA273";

export const vip224 = () => {
  const meta = {
    version: "v2",
    title: "VIP-224",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with this proposal",
  };

  return makeProposal(
    [
      {
        target: MOVE_DEBT_DELEGATE,
        signature: "setBorrowAllowed(address,bool)",
        params: [VUSDC, false],
      },
      {
        target: MOVE_DEBT_DELEGATE,
        signature: "setBorrowAllowed(address,bool)",
        params: [VUSDT, false],
      },
      {
        target: VBUSD,
        signature: "setProtocolShareReserve(address)",
        params: [NORMAL_TIMELOCK],
      },
      {
        target: VBUSD,
        signature: "_reduceReserves(uint256)",
        params: [RESERVES_TO_WITHDRAW],
      },
      {
        target: VBUSD,
        signature: "setProtocolShareReserve(address)",
        params: [PROTOCOL_SHARE_RESERVE],
      },
      {
        target: BUSD,
        signature: "transfer(address,uint256)",
        params: [BNB_CHAIN_RECEIVER, RESERVES_TO_WITHDRAW],
      },
      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [VBUSD, VTOKEN_AMOUNT, REDEEMER_CONTRACT],
      },
      {
        target: REDEEMER_CONTRACT,
        signature: "redeemAndTransfer(address,address)",
        params: [VBUSD, BNB_CHAIN_RECEIVER],
      },
      {
        target: CHAINLINK_ORACLE,
        signature: "setDirectPrice(address,uint256)",
        params: [BUSD, parseUnits("1", 18)],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
