import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalMeta, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const vUSDT = "0xfD5840Cd36d94D7229439859C0112a4185BC0255";
export const vUSDC = "0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8";
export const IRM = "0x1AAADE04A970043756D90e11af57e03A3A10E2c4";

export const XVS = "0xcF6BB5389c92Bdda8a3747Ddb454cB7a64626C63";
export const HEARTBEAT_25_HOURS = 25 * 60 * 60;
export const BOUND_VALIDATOR = "0x6E332fF0bB52475304494E4AE5063c1051c7d735";

export const PRICE_LOWER_BOUND = parseUnits("0.95", 18);
export const PRICE_UPPER_BOUND = parseUnits("1.05", 18);
const { bscmainnet } = NETWORK_ADDRESSES;

export const vip574 = async () => {
  const meta: ProposalMeta = {
    version: "v2",
    title: "VIP-574",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: bscmainnet.BINANCE_ORACLE,
        signature: "setMaxStalePeriod(string,uint256)",
        params: ["XVS", HEARTBEAT_25_HOURS],
      },
      {
        target: bscmainnet.RESILIENT_ORACLE,
        signature: "setTokenConfigs((address,address[3],bool[3],bool)[])",
        params: [
          [
            [
              XVS,
              [bscmainnet.CHAINLINK_ORACLE, bscmainnet.BINANCE_ORACLE, ethers.constants.AddressZero],
              [true, true, false],
              false,
            ],
          ],
        ],
      },
      {
        target: BOUND_VALIDATOR,
        signature: "setValidateConfigs((address,uint256,uint256)[])",
        params: [[[XVS, PRICE_UPPER_BOUND, PRICE_LOWER_BOUND]]],
      },
      {
        target: vUSDT,
        signature: "_setInterestRateModel(address)",
        params: [IRM],
      },
      {
        target: vUSDC,
        signature: "_setInterestRateModel(address)",
        params: [IRM],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip574;
