import { ProposalType } from "../../../src/types";
import { makeProposal } from "../../../src/utils";
import { ADDRESSES, ZERO_ADDRESS } from "../../helpers/config";

const { sepoliaContracts } = ADDRESSES;
const WBTC_CHAINLINK_FEED = "0x1b44F3514812d835EB1BDB0acB33d3fA3351Ee43";
const WETH_CHAINLINK_FEED = "0x694AA1769357215DE4FAC081bf1f309aDC325306";
const USDC_CHAINLINK_FEED = "0xA2F78ab2355fe2f984D808B5CeE7FD0A93D5270E";

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
        target: sepoliaContracts.CHAINLINK_ORACLE,
        signature: "setTokenConfig((address,address,uint256))",
        params: [[sepoliaContracts.MOCK_WBTC, WBTC_CHAINLINK_FEED, 86400]],
      },
      {
        target: sepoliaContracts.RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [
            sepoliaContracts.MOCK_WBTC,
            [sepoliaContracts.CHAINLINK_ORACLE, ZERO_ADDRESS, ZERO_ADDRESS],
            [true, false, false],
          ],
        ],
      },
      {
        target: sepoliaContracts.CHAINLINK_ORACLE,
        signature: "setTokenConfig((address,address,uint256))",
        params: [[sepoliaContracts.MOCK_WETH, WETH_CHAINLINK_FEED, 86400]],
      },
      {
        target: sepoliaContracts.RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [
            sepoliaContracts.MOCK_WETH,
            [sepoliaContracts.CHAINLINK_ORACLE, ZERO_ADDRESS, ZERO_ADDRESS],
            [true, false, false],
          ],
        ],
      },
      {
        target: sepoliaContracts.CHAINLINK_ORACLE,
        signature: "setTokenConfig((address,address,uint256))",
        params: [[sepoliaContracts.MOCK_USDC, USDC_CHAINLINK_FEED, 86400]],
      },
      {
        target: sepoliaContracts.RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [
            sepoliaContracts.MOCK_USDC,
            [sepoliaContracts.CHAINLINK_ORACLE, ZERO_ADDRESS, ZERO_ADDRESS],
            [true, false, false],
          ],
        ],
      },
      {
        target: sepoliaContracts.CHAINLINK_ORACLE,
        signature: "setDirectPrice(address,uint256)",
        params: [sepoliaContracts.MOCK_USDT, "1000000000000000000"],
      },
      {
        target: sepoliaContracts.RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [
            sepoliaContracts.MOCK_USDT,
            [sepoliaContracts.CHAINLINK_ORACLE, ZERO_ADDRESS, ZERO_ADDRESS],
            [true, false, false],
          ],
        ],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
