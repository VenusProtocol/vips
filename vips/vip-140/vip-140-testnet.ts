import { parseUnits } from "ethers/lib/utils";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const DEPLOYER = "0x2Ce1d0ffD7E869D9DF33e28552b12DdDed326706";

const commands = [
  {
    target: "0xe73774DfCD551BF75650772dC2cC56a2B6323453",
    signature: "transferFrom(address,address,uint256)",
    params: [DEPLOYER, "0xb0269d68CfdCc30Cb7Cd2E0b52b08Fa7Ffd3079b", parseUnits("3000", 18)],
  },
  {
    target: "0xE98344A7c691B200EF47c9b8829110087D832C64",
    signature: "transferFrom(address,address,uint256)",
    params: [DEPLOYER, "0x095902273F06eEAC825c3F52dEF44f67a86B31cD", parseUnits("34506556246", 18)],
  },
  {
    target: "0x2E6Af3f3F059F43D764060968658c9F3c8f9479D",
    signature: "transferFrom(address,address,uint256)",
    params: [DEPLOYER, "0x9A73Ba89f6a95611B46b68241aBEcAF2cD0bd78A", parseUnits("42863267", 18)],
  },
  {
    target: "0x7D21841DC10BA1C5797951EFc62fADBBDD06704B",
    signature: "transferFrom(address,address,uint256)",
    params: [DEPLOYER, "0x507401883C2a874D919e78a73dD0cB56f2e7eaD7", parseUnits("78557", 6)],
  },
  {
    target: "0x2E2466e22FcbE0732Be385ee2FBb9C59a1098382",
    signature: "transferFrom(address,address,uint256)",
    params: [DEPLOYER, "0x1c50672f4752cc0Ae532D9b93b936C21121Ff08b", parseUnits("25000", 18)],
  },
  {
    target: "0xD60cC803d888A3e743F21D0bdE4bF2cAfdEA1F26",
    signature: "transferFrom(address,address,uint256)",
    params: [DEPLOYER, "0x66E213a4b8ba1c8D62cAa4649C7177E29321E262", parseUnits("10500000", 18)],
  },
  {
    target: "0xb22cF15FBc089d470f8e532aeAd2baB76bE87c88",
    signature: "transferFrom(address,address,uint256)",
    params: [DEPLOYER, "0x5651866bcC4650d6fe5178E5ED7a8Be2cf3F70D0", parseUnits("397968025.47", 18)],
  },
  {
    target: "0x167F1F9EF531b3576201aa3146b13c57dbEda514",
    signature: "transferFrom(address,address,uint256)",
    params: [DEPLOYER, "0x7df11563c6b6b8027aE619FD9644A647dED5893B", parseUnits("46", 18)],
  },
  {
    target: "0x7FCC76fc1F573d8Eb445c236Cc282246bC562bCE",
    signature: "transferFrom(address,address,uint256)",
    params: [DEPLOYER, "0x2b67Cfaf28a1aBbBf71fb814Ad384d0C5a98e0F9", parseUnits("48250", 18)],
  },
  {
    target: "0x2999C176eBf66ecda3a646E70CeB5FF4d5fCFb8C",
    signature: "transferFrom(address,address,uint256)",
    params: [DEPLOYER, "0x72c770A1E73Ad9ccD5249fC5536346f95345Fe2c", parseUnits("5.3", 18)],
  },
  {
    target: "0xac7D6B77EBD1DB8C5a9f0896e5eB5d485CB677b3",
    signature: "transferFrom(address,address,uint256)",
    params: [DEPLOYER, "0x8Ad2Ad29e4e2C0606644Be51c853A7A4a3078F85", parseUnits("6400", 18)],
  },
  {
    target: "0xb0269d68CfdCc30Cb7Cd2E0b52b08Fa7Ffd3079b",
    signature: "setRewardTokenSpeeds(address[],uint256[],uint256[])",
    params: [["0x170d3b2da05cc2124334240fB34ad1359e34C562"], ["1860119047619047"], ["1860119047619047"]],
    value: "0",
  },
  {
    target: "0x2b67Cfaf28a1aBbBf71fb814Ad384d0C5a98e0F9",
    signature: "acceptOwnership()",
    params: [],
    value: "0",
  },
  {
    target: "0x23a73971A6B9f6580c048B9CB188869B2A2aA2aD",
    signature: "addRewardsDistributor(address)",
    params: ["0x2b67Cfaf28a1aBbBf71fb814Ad384d0C5a98e0F9"],
    value: "0",
  },
  {
    target: "0x2b67Cfaf28a1aBbBf71fb814Ad384d0C5a98e0F9",
    signature: "setRewardTokenSpeeds(address[],uint256[],uint256[])",
    params: [["0x5e68913fbbfb91af30366ab1B21324410b49a308"], ["16753472222222222"], ["16753472222222222"]],
    value: "0",
  },
  {
    target: "0x5651866bcC4650d6fe5178E5ED7a8Be2cf3F70D0",
    signature: "acceptOwnership()",
    params: [],
    value: "0",
  },
  {
    target: "0x1F4f0989C51f12DAcacD4025018176711f3Bf289",
    signature: "addRewardsDistributor(address)",
    params: ["0x5651866bcC4650d6fe5178E5ED7a8Be2cf3F70D0"],
    value: "0",
  },
  {
    target: "0x5651866bcC4650d6fe5178E5ED7a8Be2cf3F70D0",
    signature: "setRewardTokenSpeeds(address[],uint256[],uint256[])",
    params: [["0xef470AbC365F88e4582D8027172a392C473A5B53"], ["230305570295138888888"], ["230305570295138888888"]],
    value: "0",
  },
  {
    target: "0x66E213a4b8ba1c8D62cAa4649C7177E29321E262",
    signature: "acceptOwnership()",
    params: [],
    value: "0",
  },
  {
    target: "0x1F4f0989C51f12DAcacD4025018176711f3Bf289",
    signature: "addRewardsDistributor(address)",
    params: ["0x66E213a4b8ba1c8D62cAa4649C7177E29321E262"],
    value: "0",
  },
  {
    target: "0x66E213a4b8ba1c8D62cAa4649C7177E29321E262",
    signature: "setRewardTokenSpeeds(address[],uint256[],uint256[])",
    params: [["0x1958035231E125830bA5d17D168cEa07Bb42184a"], ["6076388888888888888"], ["6076388888888888888"]],
    value: "0",
  },
  {
    target: "0x7df11563c6b6b8027aE619FD9644A647dED5893B",
    signature: "acceptOwnership()",
    params: [],
    value: "0",
  },
  {
    target: "0x596B11acAACF03217287939f88d63b51d3771704",
    signature: "addRewardsDistributor(address)",
    params: ["0x7df11563c6b6b8027aE619FD9644A647dED5893B"],
    value: "0",
  },
  {
    target: "0x7df11563c6b6b8027aE619FD9644A647dED5893B",
    signature: "setRewardTokenSpeeds(address[],uint256[],uint256[])",
    params: [["0x57a664Dd7f1dE19545fEE9c86C949e3BF43d6D47"], ["26620370370370"], ["26620370370370"]],
    value: "0",
  },
  {
    target: "0x72c770A1E73Ad9ccD5249fC5536346f95345Fe2c",
    signature: "acceptOwnership()",
    params: [],
    value: "0",
  },
  {
    target: "0x596B11acAACF03217287939f88d63b51d3771704",
    signature: "addRewardsDistributor(address)",
    params: ["0x72c770A1E73Ad9ccD5249fC5536346f95345Fe2c"],
    value: "0",
  },
  {
    target: "0x72c770A1E73Ad9ccD5249fC5536346f95345Fe2c",
    signature: "setRewardTokenSpeeds(address[],uint256[],uint256[])",
    params: [["0x75aa42c832a8911B77219DbeBABBB40040d16987"], ["4629629629629"], ["1504629629629"]],
    value: "0",
  },
  {
    target: "0x095902273F06eEAC825c3F52dEF44f67a86B31cD",
    signature: "acceptOwnership()",
    params: [],
    value: "0",
  },
  {
    target: "0x11537D023f489E4EF0C7157cc729C7B69CbE0c97",
    signature: "addRewardsDistributor(address)",
    params: ["0x095902273F06eEAC825c3F52dEF44f67a86B31cD"],
    value: "0",
  },
  {
    target: "0x095902273F06eEAC825c3F52dEF44f67a86B31cD",
    signature: "setRewardTokenSpeeds(address[],uint256[],uint256[])",
    params: [["0x47793540757c6E6D84155B33cd8D9535CFdb9334"], ["19969071901620370370370"], ["19969071901620370370370"]],
    value: "0",
  },
  {
    target: "0x9A73Ba89f6a95611B46b68241aBEcAF2cD0bd78A",
    signature: "acceptOwnership()",
    params: [],
    value: "0",
  },
  {
    target: "0x11537D023f489E4EF0C7157cc729C7B69CbE0c97",
    signature: "addRewardsDistributor(address)",
    params: ["0x9A73Ba89f6a95611B46b68241aBEcAF2cD0bd78A"],
    value: "0",
  },
  {
    target: "0x9A73Ba89f6a95611B46b68241aBEcAF2cD0bd78A",
    signature: "setRewardTokenSpeeds(address[],uint256[],uint256[])",
    params: [["0xEe543D5de2Dbb5b07675Fc72831A2f1812428393"], ["24805131365740740740"], ["24805131365740740740"]],
    value: "0",
  },
  {
    target: "0x507401883C2a874D919e78a73dD0cB56f2e7eaD7",
    signature: "acceptOwnership()",
    params: [],
    value: "0",
  },
  {
    target: "0x11537D023f489E4EF0C7157cc729C7B69CbE0c97",
    signature: "addRewardsDistributor(address)",
    params: ["0x507401883C2a874D919e78a73dD0cB56f2e7eaD7"],
    value: "0",
  },
  {
    target: "0x507401883C2a874D919e78a73dD0cB56f2e7eaD7",
    signature: "setRewardTokenSpeeds(address[],uint256[],uint256[])",
    params: [["0x410286c43a525E1DCC7468a9B091C111C8324cd1"], ["45461"], ["45461"]],
    value: "0",
  },
  {
    target: "0x1c50672f4752cc0Ae532D9b93b936C21121Ff08b",
    signature: "acceptOwnership()",
    params: [],
    value: "0",
  },
  {
    target: "0x11537D023f489E4EF0C7157cc729C7B69CbE0c97",
    signature: "addRewardsDistributor(address)",
    params: ["0x1c50672f4752cc0Ae532D9b93b936C21121Ff08b"],
    value: "0",
  },
  {
    target: "0x1c50672f4752cc0Ae532D9b93b936C21121Ff08b",
    signature: "setRewardTokenSpeeds(address[],uint256[],uint256[])",
    params: [["0xD804F74fe21290d213c46610ab171f7c2EeEBDE7"], ["14467592592592592"], ["14467592592592592"]],
    value: "0",
  },
  {
    target: "0x8Ad2Ad29e4e2C0606644Be51c853A7A4a3078F85",
    signature: "acceptOwnership()",
    params: [],
    value: "0",
  },
  {
    target: "0x596B11acAACF03217287939f88d63b51d3771704",
    signature: "addRewardsDistributor(address)",
    params: ["0x8Ad2Ad29e4e2C0606644Be51c853A7A4a3078F85"],
    value: "0",
  },
  {
    target: "0x8Ad2Ad29e4e2C0606644Be51c853A7A4a3078F85",
    signature: "setRewardTokenSpeeds(address[],uint256[],uint256[])",
    params: [["0x644A149853E5507AdF3e682218b8AC86cdD62951"], ["3703703703703703"], ["3703703703703703"]],
    value: "0",
  },
];

export const vip140Testnet = () => {
  const meta = {
    version: "v2",
    title: "IL Rewards",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with IL Rewards",
    againstDescription: "I do not think that Venus Protocol should proceed with IL Rewards",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with IL Rewards",
  };

  return makeProposal(commands, meta, ProposalType.REGULAR);
};
