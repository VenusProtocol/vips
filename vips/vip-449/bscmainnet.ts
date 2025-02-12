import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const TRANSFERS = [
  {
    name: "yvUSDC-1",
    token: "0xBe53A109B494E5c9f97b9Cd39Fe969BE68BF6204",
    amount: parseUnits("9533.021607", 6),
  },
  {
    name: "yvUSDT-1",
    token: "0x310B7Ea7475A0B449Cfd73bE81522F1B88eFAFaa",
    amount: parseUnits("8321.541317", 6),
  },
  {
    name: "yvUSDS-1",
    token: "0x182863131F9a4630fF9E27830d945B1413e347E8",
    amount: parseUnits("9723.178564012393153016", 18),
  },
  {
    name: "yvWETH-1",
    token: "0xc56413869c6CDf96496f2b1eF801fEDBdFA7dDB0",
    amount: parseUnits("3.920893913355987542", 18),
  },
];

export const RECIPIENT = "0x16388463d60FFE0661Cf7F1f31a7D658aC790ff7";

export const vip449 = () => {
  const meta = {
    version: "v2",
    title: "VIP-449",
    description: ``,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      ...TRANSFERS.map(transfer => ({
        target: NETWORK_ADDRESSES["ethereum"].VTREASURY,
        signature: "withdrawTreasuryToken(address,uint256,address)",
        params: [transfer.token, transfer.amount, RECIPIENT],
        dstChainId: LzChainId.ethereum,
      })),
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip449;
