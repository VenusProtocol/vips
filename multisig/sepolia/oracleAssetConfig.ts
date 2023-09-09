import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

export const oracleAssetConfig = () => {
  const meta = {
    version: "v2",
    title: "Sepolia Oracle Configuration",
    description: `
      This Multisig TX configures the oracle deployed on sepolia:
	    - configures the initial price feeds that will be used
      `,
    forDescription: "I agree that Venus Protocol should proceed with the Risk Parameters Update's",
    againstDescription: "I do not think that Venus Protocol should proceed with the Risk Parameters Update's",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with the Risk Parameters Update's or not",
  };

  return makeProposal(
    [
      {
        target: "0x0a16c96EB3E767147DB477196aA8E9774945CDf7",
        signature: "setTokenConfig((address,address,uint256))",
        params: [["0xbA9c9b6c72ACd08050BBF6e03AeAD1BBbaF21ef7", "0x1b44F3514812d835EB1BDB0acB33d3fA3351Ee43", 86400]],
      },
      {
        target: "0x9005091f2E0b20bEf6AaF2bD7F21dfd45DA8Af07",
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [
            "0xbA9c9b6c72ACd08050BBF6e03AeAD1BBbaF21ef7",
            [
              "0x0a16c96EB3E767147DB477196aA8E9774945CDf7",
              "0x0000000000000000000000000000000000000000",
              "0x0000000000000000000000000000000000000000",
            ],
            [true, false, false],
          ],
        ],
      },
      {
        target: "0x0a16c96EB3E767147DB477196aA8E9774945CDf7",
        signature: "setTokenConfig((address,address,uint256))",
        params: [["0x58ef310046b1b9CFFE304D89104EA5DF2bABee28", "0x694AA1769357215DE4FAC081bf1f309aDC325306", 86400]],
      },
      {
        target: "0x9005091f2E0b20bEf6AaF2bD7F21dfd45DA8Af07",
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [
            "0x58ef310046b1b9CFFE304D89104EA5DF2bABee28",
            [
              "0x0a16c96EB3E767147DB477196aA8E9774945CDf7",
              "0x0000000000000000000000000000000000000000",
              "0x0000000000000000000000000000000000000000",
            ],
            [true, false, false],
          ],
        ],
      },
      {
        target: "0x0a16c96EB3E767147DB477196aA8E9774945CDf7",
        signature: "setTokenConfig((address,address,uint256))",
        params: [["0xA8c06B029d70142F7E7b389a7C4bdFe371d9eDf5", "0xA2F78ab2355fe2f984D808B5CeE7FD0A93D5270E", 86400]],
      },
      {
        target: "0x9005091f2E0b20bEf6AaF2bD7F21dfd45DA8Af07",
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [
            "0xA8c06B029d70142F7E7b389a7C4bdFe371d9eDf5",
            [
              "0x0a16c96EB3E767147DB477196aA8E9774945CDf7",
              "0x0000000000000000000000000000000000000000",
              "0x0000000000000000000000000000000000000000",
            ],
            [true, false, false],
          ],
        ],
      },
      {
        target: "0x0a16c96EB3E767147DB477196aA8E9774945CDf7",
        signature: "setDirectPrice(address,uint256)",
        params: ["0xbEe8E181599bBC04ACaaa24c741a27A32883e872", "1000000000000000000"],
      },
      {
        target: "0x9005091f2E0b20bEf6AaF2bD7F21dfd45DA8Af07",
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [
            "0xbEe8E181599bBC04ACaaa24c741a27A32883e872",
            [
              "0x0a16c96EB3E767147DB477196aA8E9774945CDf7",
              "0x0000000000000000000000000000000000000000",
              "0x0000000000000000000000000000000000000000",
            ],
            [true, false, false],
          ],
        ],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
