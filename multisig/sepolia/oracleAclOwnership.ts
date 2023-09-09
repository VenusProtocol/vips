import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

export const oracleAclOwnership = () => {
  const meta = {
    version: "v2",
    title: "Sepolia Oracle Configuration",
    description: `
      This Multisig TX configures the oracle deployed on sepolia:
	   - sets the required access controls
	   - accepts ownership from deployer to multisig
      `,
    forDescription: "I agree that Venus Protocol should proceed with the Risk Parameters Update's",
    againstDescription: "I do not think that Venus Protocol should proceed with the Risk Parameters Update's",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with the Risk Parameters Update's or not",
  };

  return makeProposal(
    [
      {
        target: "0xbf705C00578d43B6147ab4eaE04DBBEd1ccCdc96",
        signature: "giveCallPermission(address,string,address)",
        params: ["0x0000000000000000000000000000000000000000", "pause()", "0x94fa6078b6b8a26f0b6edffbe6501b22a10470fb"],
      },
      {
        target: "0xbf705C00578d43B6147ab4eaE04DBBEd1ccCdc96",
        signature: "giveCallPermission(address,string,address)",
        params: [
          "0x0000000000000000000000000000000000000000",
          "unpause()",
          "0x94fa6078b6b8a26f0b6edffbe6501b22a10470fb",
        ],
      },
      {
        target: "0xbf705C00578d43B6147ab4eaE04DBBEd1ccCdc96",
        signature: "giveCallPermission(address,string,address)",
        params: [
          "0x0000000000000000000000000000000000000000",
          "setOracle(address,address,uint8)",
          "0x94fa6078b6b8a26f0b6edffbe6501b22a10470fb",
        ],
      },
      {
        target: "0xbf705C00578d43B6147ab4eaE04DBBEd1ccCdc96",
        signature: "giveCallPermission(address,string,address)",
        params: [
          "0x0000000000000000000000000000000000000000",
          "enableOracle(address,uint8,bool)",
          "0x94fa6078b6b8a26f0b6edffbe6501b22a10470fb",
        ],
      },
      {
        target: "0xbf705C00578d43B6147ab4eaE04DBBEd1ccCdc96",
        signature: "giveCallPermission(address,string,address)",
        params: [
          "0x0000000000000000000000000000000000000000",
          "setTokenConfig(TokenConfig)",
          "0x94fa6078b6b8a26f0b6edffbe6501b22a10470fb",
        ],
      },
      {
        target: "0xbf705C00578d43B6147ab4eaE04DBBEd1ccCdc96",
        signature: "giveCallPermission(address,string,address)",
        params: [
          "0x0000000000000000000000000000000000000000",
          "setDirectPrice(address,uint256)",
          "0x94fa6078b6b8a26f0b6edffbe6501b22a10470fb",
        ],
      },
      {
        target: "0xbf705C00578d43B6147ab4eaE04DBBEd1ccCdc96",
        signature: "giveCallPermission(address,string,address)",
        params: [
          "0x0000000000000000000000000000000000000000",
          "setValidateConfig(ValidateConfig)",
          "0x94fa6078b6b8a26f0b6edffbe6501b22a10470fb",
        ],
      },
      {
        target: "0xbf705C00578d43B6147ab4eaE04DBBEd1ccCdc96",
        signature: "giveCallPermission(address,string,address)",
        params: [
          "0x0000000000000000000000000000000000000000",
          "setMaxStalePeriod(string,uint256)",
          "0x94fa6078b6b8a26f0b6edffbe6501b22a10470fb",
        ],
      },
      {
        target: "0xbf705C00578d43B6147ab4eaE04DBBEd1ccCdc96",
        signature: "giveCallPermission(address,string,address)",
        params: [
          "0x0000000000000000000000000000000000000000",
          "setSymbolOverride(string,string)",
          "0x94fa6078b6b8a26f0b6edffbe6501b22a10470fb",
        ],
      },
      {
        target: "0xbf705C00578d43B6147ab4eaE04DBBEd1ccCdc96",
        signature: "giveCallPermission(address,string,address)",
        params: [
          "0x0000000000000000000000000000000000000000",
          "setUnderlyingPythOracle(address)",
          "0x94fa6078b6b8a26f0b6edffbe6501b22a10470fb",
        ],
      },
      { target: "0x9005091f2E0b20bEf6AaF2bD7F21dfd45DA8Af07", signature: "acceptOwnership()", params: [] },
      { target: "0x0a16c96EB3E767147DB477196aA8E9774945CDf7", signature: "acceptOwnership()", params: [] },
      { target: "0x8305fF2eEAE00bc0C19746851c1c8643Ebd68193", signature: "acceptOwnership()", params: [] },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
