import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const TREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";

const commands = [
  {
    target: TREASURY,
    signature: "withdrawTreasuryBEP20(address,uint256,address)",
    params: [
      "0x352Cb5E19b12FC216548a2677bD0fce83BaE434B",
      parseUnits("34506556246", 18),
      "0x804F3893d3c1C3EFFDf778eDDa7C199129235882",
    ],
    value: "0",
  },
  {
    target: TREASURY,
    signature: "withdrawTreasuryBEP20(address,uint256,address)",
    params: [
      "0xaeF0d72a118ce24feE3cD1d43d383897D05B4e99",
      parseUnits("42863267", 18),
      "0x6536123503DF76BDfF8207e4Fb0C594Bc5eFD00A",
    ],
    value: "0",
  },
  {
    target: TREASURY,
    signature: "withdrawTreasuryBEP20(address,uint256,address)",
    params: [
      "0xCE7de646e7208a4Ef112cb6ed5038FA6cC6b12e3",
      parseUnits("78557", 6),
      "0x22af8a65639a351a9D5d77d5a25ea5e1Cf5e9E6b",
    ],
    value: "0",
  },
  {
    target: TREASURY,
    signature: "withdrawTreasuryBEP20(address,uint256,address)",
    params: [
      "0xd17479997F34dd9156Deef8F95A52D81D265be9c",
      parseUnits("25000", 18),
      "0x08e4AFd80A5849FDBa4bBeea86ed470D697e4C54",
    ],
    value: "0",
  },
  {
    target: TREASURY,
    signature: "withdrawTreasuryBEP20(address,uint256,address)",
    params: [
      "0x12BB890508c125661E03b09EC06E404bc9289040",
      parseUnits("10500000", 18),
      "0x2517A3bEe42EA8f628926849B04870260164b555",
    ],
    value: "0",
  },
  {
    target: TREASURY,
    signature: "withdrawTreasuryBEP20(address,uint256,address)",
    params: [
      "0xfb5B838b6cfEEdC2873aB27866079AC55363D37E",
      parseUnits("397968025.47", 9),
      "0x501a91b995Bd41177503A1A4144F3D25BFF869e1",
    ],
    value: "0",
  },
  {
    target: TREASURY,
    signature: "withdrawTreasuryBEP20(address,uint256,address)",
    params: [
      "0x52F24a5e03aee338Da5fd9Df68D2b6FAe1178827",
      parseUnits("46", 18),
      "0x63aFCe42086c8302659CA0E21F4Eade27Ad85ded",
    ],
    value: "0",
  },
  {
    target: TREASURY,
    signature: "withdrawTreasuryBEP20(address,uint256,address)",
    params: [
      "0x965f527d9159dce6288a2219db51fc6eef120dd1",
      parseUnits("48250", 18),
      "0x7524116CEC937ef17B5998436F16d1306c4F7EF8",
    ],
    value: "0",
  },
  {
    target: TREASURY,
    signature: "withdrawTreasuryBEP20(address,uint256,address)",
    params: [
      "0x0782b6d8c4551B9760e74c0545a9bCD90bdc41E5",
      parseUnits("3000", 18),
      "0xBA711976CdF8CF3288bF721f758fB764503Eb1f6",
    ],
    value: "0",
  },
  {
    target: TREASURY,
    signature: "withdrawTreasuryBEP20(address,uint256,address)",
    params: [
      "0xc2E9d07F66A89c44062459A47a0D2Dc038E4fb16",
      parseUnits("5.3", 18),
      "0x79397BAc982718347406Ebb7A6a8845896fdD8dE",
    ],
    value: "0",
  },
  {
    target: TREASURY,
    signature: "withdrawTreasuryBEP20(address,uint256,address)",
    params: [
      "0x3BC5AC0dFdC871B365d159f728dd1B9A0B5481E8",
      parseUnits("6400", 18),
      "0x6a7b50EccC721f0Fa9FD7879A7dF082cdA60Db78",
    ],
    value: "0",
  },
  {
    target: "0xBA711976CdF8CF3288bF721f758fB764503Eb1f6",
    signature: "acceptOwnership()",
    params: [],
    value: "0",
  },
  {
    target: "0x94c1495cD4c557f1560Cbd68EAB0d197e6291571",
    signature: "addRewardsDistributor(address)",
    params: ["0xBA711976CdF8CF3288bF721f758fB764503Eb1f6"],
    value: "0",
  },
  {
    target: "0xBA711976CdF8CF3288bF721f758fB764503Eb1f6",
    signature: "setRewardTokenSpeeds(address[],uint256[],uint256[])",
    params: [["0xCa2D81AA7C09A1a025De797600A7081146dceEd9"], ["1860119047619047"], ["1860119047619047"]],
    value: "0",
  },
  {
    target: "0x7524116CEC937ef17B5998436F16d1306c4F7EF8",
    signature: "acceptOwnership()",
    params: [],
    value: "0",
  },
  {
    target: "0x3344417c9360b963ca93A4e8305361AEde340Ab9",
    signature: "addRewardsDistributor(address)",
    params: ["0x7524116CEC937ef17B5998436F16d1306c4F7EF8"],
    value: "0",
  },
  {
    target: "0x7524116CEC937ef17B5998436F16d1306c4F7EF8",
    signature: "setRewardTokenSpeeds(address[],uint256[],uint256[])",
    params: [["0x8f657dFD3a1354DEB4545765fE6840cc54AFd379"], ["16753472222222222"], ["16753472222222222"]],
    value: "0",
  },
  {
    target: "0x501a91b995Bd41177503A1A4144F3D25BFF869e1",
    signature: "acceptOwnership()",
    params: [],
    value: "0",
  },
  {
    target: "0x1b43ea8622e76627B81665B1eCeBB4867566B963",
    signature: "addRewardsDistributor(address)",
    params: ["0x501a91b995Bd41177503A1A4144F3D25BFF869e1"],
    value: "0",
  },
  {
    target: "0x501a91b995Bd41177503A1A4144F3D25BFF869e1",
    signature: "setRewardTokenSpeeds(address[],uint256[],uint256[])",
    params: [["0xc353B7a1E13dDba393B5E120D4169Da7185aA2cb"], ["230305570295"], ["230305570295"]],
    value: "0",
  },
  {
    target: "0x2517A3bEe42EA8f628926849B04870260164b555",
    signature: "acceptOwnership()",
    params: [],
    value: "0",
  },
  {
    target: "0x1b43ea8622e76627B81665B1eCeBB4867566B963",
    signature: "addRewardsDistributor(address)",
    params: ["0x2517A3bEe42EA8f628926849B04870260164b555"],
    value: "0",
  },
  {
    target: "0x2517A3bEe42EA8f628926849B04870260164b555",
    signature: "setRewardTokenSpeeds(address[],uint256[],uint256[])",
    params: [["0xE5FE5527A5b76C75eedE77FdFA6B80D52444A465"], ["6076388888888888888"], ["6076388888888888888"]],
    value: "0",
  },
  {
    target: "0x63aFCe42086c8302659CA0E21F4Eade27Ad85ded",
    signature: "acceptOwnership()",
    params: [],
    value: "0",
  },
  {
    target: "0xd933909A4a2b7A4638903028f44D1d38ce27c352",
    signature: "addRewardsDistributor(address)",
    params: ["0x63aFCe42086c8302659CA0E21F4Eade27Ad85ded"],
    value: "0",
  },
  {
    target: "0x63aFCe42086c8302659CA0E21F4Eade27Ad85ded",
    signature: "setRewardTokenSpeeds(address[],uint256[],uint256[])",
    params: [["0xBfe25459BA784e70E2D7a718Be99a1f3521cA17f"], ["26620370370370"], ["26620370370370"]],
    value: "0",
  },
  {
    target: "0x79397BAc982718347406Ebb7A6a8845896fdD8dE",
    signature: "acceptOwnership()",
    params: [],
    value: "0",
  },
  {
    target: "0xd933909A4a2b7A4638903028f44D1d38ce27c352",
    signature: "addRewardsDistributor(address)",
    params: ["0x79397BAc982718347406Ebb7A6a8845896fdD8dE"],
    value: "0",
  },
  {
    target: "0x79397BAc982718347406Ebb7A6a8845896fdD8dE",
    signature: "setRewardTokenSpeeds(address[],uint256[],uint256[])",
    params: [["0xcc5D9e502574cda17215E70bC0B4546663785227"], ["4629629629629"], ["1504629629629"]],
    value: "0",
  },
  {
    target: "0x804F3893d3c1C3EFFDf778eDDa7C199129235882",
    signature: "acceptOwnership()",
    params: [],
    value: "0",
  },
  {
    target: "0x23b4404E4E5eC5FF5a6FFb70B7d14E3FabF237B0",
    signature: "addRewardsDistributor(address)",
    params: ["0x804F3893d3c1C3EFFDf778eDDa7C199129235882"],
    value: "0",
  },
  {
    target: "0x804F3893d3c1C3EFFDf778eDDa7C199129235882",
    signature: "setRewardTokenSpeeds(address[],uint256[],uint256[])",
    params: [["0x49c26e12959345472E2Fd95E5f79F8381058d3Ee"], ["19969071901620370370370"], ["19969071901620370370370"]],
    value: "0",
  },
  {
    target: "0x6536123503DF76BDfF8207e4Fb0C594Bc5eFD00A",
    signature: "acceptOwnership()",
    params: [],
    value: "0",
  },
  {
    target: "0x23b4404E4E5eC5FF5a6FFb70B7d14E3FabF237B0",
    signature: "addRewardsDistributor(address)",
    params: ["0x6536123503DF76BDfF8207e4Fb0C594Bc5eFD00A"],
    value: "0",
  },
  {
    target: "0x6536123503DF76BDfF8207e4Fb0C594Bc5eFD00A",
    signature: "setRewardTokenSpeeds(address[],uint256[],uint256[])",
    params: [["0xb114cfA615c828D88021a41bFc524B800E64a9D5"], ["24805131365740740740"], ["24805131365740740740"]],
    value: "0",
  },
  {
    target: "0x22af8a65639a351a9D5d77d5a25ea5e1Cf5e9E6b",
    signature: "acceptOwnership()",
    params: [],
    value: "0",
  },
  {
    target: "0x23b4404E4E5eC5FF5a6FFb70B7d14E3FabF237B0",
    signature: "addRewardsDistributor(address)",
    params: ["0x22af8a65639a351a9D5d77d5a25ea5e1Cf5e9E6b"],
    value: "0",
  },
  {
    target: "0x22af8a65639a351a9D5d77d5a25ea5e1Cf5e9E6b",
    signature: "setRewardTokenSpeeds(address[],uint256[],uint256[])",
    params: [["0x836beb2cB723C498136e1119248436A645845F4E"], ["45461"], ["45461"]],
    value: "0",
  },
  {
    target: "0x08e4AFd80A5849FDBa4bBeea86ed470D697e4C54",
    signature: "acceptOwnership()",
    params: [],
    value: "0",
  },
  {
    target: "0x23b4404E4E5eC5FF5a6FFb70B7d14E3FabF237B0",
    signature: "addRewardsDistributor(address)",
    params: ["0x08e4AFd80A5849FDBa4bBeea86ed470D697e4C54"],
    value: "0",
  },
  {
    target: "0x08e4AFd80A5849FDBa4bBeea86ed470D697e4C54",
    signature: "setRewardTokenSpeeds(address[],uint256[],uint256[])",
    params: [["0xf1da185CCe5BeD1BeBbb3007Ef738Ea4224025F7"], ["14467592592592592"], ["14467592592592592"]],
    value: "0",
  },
  {
    target: "0x6a7b50EccC721f0Fa9FD7879A7dF082cdA60Db78",
    signature: "acceptOwnership()",
    params: [],
    value: "0",
  },
  {
    target: "0xd933909A4a2b7A4638903028f44D1d38ce27c352",
    signature: "addRewardsDistributor(address)",
    params: ["0x6a7b50EccC721f0Fa9FD7879A7dF082cdA60Db78"],
    value: "0",
  },
  {
    target: "0x6a7b50EccC721f0Fa9FD7879A7dF082cdA60Db78",
    signature: "setRewardTokenSpeeds(address[],uint256[],uint256[])",
    params: [["0x5E21bF67a6af41c74C1773E4b473ca5ce8fd3791"], ["3703703703703703"], ["3703703703703703"]],
    value: "0",
  },
];

export const vip140 = () => {
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
