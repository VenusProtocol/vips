import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalMeta, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { bsctestnet, sepolia } = NETWORK_ADDRESSES;

export const ADAPTER_PARAMS = ethers.utils.solidityPack(["uint16", "uint256"], [1, 300000]);

export const BRIDGE_FEES_ETH = parseUnits("0.001", 18);
export const XVS_BRIDGE_ETH = "0xc340b7d3406502F43dC11a988E4EC5bbE536E642";
export const REWARD_DISTRIBUTORS_ETH = [
  {
    address: "0xB60666395bEFeE02a28938b75ea620c7191cA77a",
    excess: parseUnits("100", 18),
  },
];
export const EXCESS_XVS_ETH = REWARD_DISTRIBUTORS_ETH.reduce(
  (acc, distributor) => acc.add(distributor.excess),
  ethers.BigNumber.from(0),
);

export const vip539 = async () => {
  const meta: ProposalMeta = {
    version: "v2",
    title: "VIP-539 Recover Excess XVS from Rewards Distributors",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      // Send XVS from ETH to BSC Treasury
      ...REWARD_DISTRIBUTORS_ETH.map(distributor => ({
        target: distributor.address,
        signature: "grantRewardToken(address,uint256)",
        params: [sepolia.NORMAL_TIMELOCK, distributor.excess],
        dstChainId: LzChainId.sepolia,
      })),
      {
        target: sepolia.XVS,
        signature: "approve(address,uint256)",
        params: [XVS_BRIDGE_ETH, EXCESS_XVS_ETH],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: XVS_BRIDGE_ETH,
        signature: "sendFrom(address,uint16,bytes32,uint256,(address,address,bytes))",
        params: [
          sepolia.NORMAL_TIMELOCK,
          LzChainId.bsctestnet,
          ethers.utils.defaultAbiCoder.encode(["address"], [bsctestnet.VTREASURY]),
          EXCESS_XVS_ETH,
          [sepolia.NORMAL_TIMELOCK, ethers.constants.AddressZero, ADAPTER_PARAMS],
        ],
        value: BRIDGE_FEES_ETH.toString(),
        dstChainId: LzChainId.sepolia,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip539;
