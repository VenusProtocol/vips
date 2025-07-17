import { ethers } from "hardhat";
import { LzChainId, ProposalMeta, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const ADAPTER_PARAMS = ethers.utils.solidityPack(["uint16", "uint256"], [1, 300000]);

export const rewardDistributors = [
  {
    address: "0x7C7846A74AB38A8d554Bc5f7652eCf8Efb58c894",
    markets: [
      "0x1aF23bD57c62A99C59aD48236553D0Dd11e49D2D",
      "0x69cDA960E3b20DFD480866fFfd377Ebe40bd0A46",
      "0xAF8fD83cFCbe963211FAaf1847F0F217F80B4719",
      "0x1Fa916C27c7C2c4602124A14C77Dbb40a5FF1BE8",
      "0x697a70779C1A03Ba2BD28b7627a902BFf831b616",
    ],
    chainId: LzChainId.zksyncmainnet,
  },
  {
    address: "0x53b488baA4052094495b6De9E5505FE1Ee3EAc7a",
    markets: [
      "0xAeB0FEd69354f34831fe1D16475D9A83ddaCaDA6",
      "0x7D8609f8da70fF9027E9bc5229Af4F6727662707",
      "0xB9F9117d4200dC296F9AcD1e8bE1937df834a2fD",
      "0xaDa57840B372D4c28623E87FC175dE8490792811",
      "0x68a34332983f4Bf866768DD6D6E638b02eF5e1f0",
    ],
    chainId: LzChainId.arbitrumone,
  },
  {
    address: "0x6204Bae72dE568384Ca4dA91735dc343a0C7bD6D",
    markets: ["0x39D6d13Ea59548637104E40e729E4aABE27FE106"],
    chainId: LzChainId.arbitrumone,
  },
  {
    address: "0x134bfDEa7e68733921Bc6A87159FB0d68aBc6Cf8",
    markets: [
      "0x17C07e0c232f2f80DfDbd7a95b942D893A4C5ACb",
      "0x8C3e3821259B82fFb32B2450A95d2dcbf161C24E",
      "0x8716554364f20BCA783cb2BAA744d39361fd1D8d",
      "0x7c8ff7d2A1372433726f879BD945fFb250B94c65",
      "0x672208C10aaAA2F9A6719F449C4C8227bc0BC202",
    ],
    chainId: LzChainId.ethereum,
  },
  {
    address: "0x886767B62C7ACD601672607373048FFD96Cf27B2",
    markets: ["0x8C3e3821259B82fFb32B2450A95d2dcbf161C24E"],
    chainId: LzChainId.ethereum,
  },
  {
    address: "0x8473B767F68250F5309bae939337136a899E43F9",
    markets: ["0x30aD10Bd5Be62CAb37863C2BfcC6E8fb4fD85BDa", "0x2d499800239C4CD3012473Cb1EAE33562F0A6933"],
    chainId: LzChainId.ethereum,
  },
  {
    address: "0x7A91bEd36D96E4e644d3A181c287E0fcf9E9cc98",
    markets: ["0xc82780Db1257C788F262FBbDA960B3706Dfdcaf2", "0x4a240F0ee138697726C8a3E43eFE6Ac3593432CB"],
    chainId: LzChainId.ethereum,
  },
  {
    address: "0x1e25CF968f12850003Db17E0Dba32108509C4359",
    markets: ["0xc82780Db1257C788F262FBbDA960B3706Dfdcaf2"],
    chainId: LzChainId.ethereum,
  },
  {
    address: "0x4630B71C1BD27c99DD86aBB2A18C50c3F75C88fb",
    markets: ["0xb953f92b9f759d97d2f2dec10a8a3cf75fce3a95", "0xc219bc179c7cdb37eacb03f993f9fdc2495e3374"],
    chainId: LzChainId.unichainmainnet,
  },
];

export const vip530 = async () => {
  const meta: ProposalMeta = {
    version: "v2",
    title: "VIP-530",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      ...rewardDistributors.flatMap(rd => {
        return rd.markets.map(market => ({
          target: rd.address,
          signature: "setRewardTokenSpeeds(address[],uint256[],uint256[])",
          params: [[market], [0], [0]],
          dstChainId: rd.chainId,
        }));
      }),
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip530;
