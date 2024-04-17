import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

export const RESILIENT_ORACLE = "0x3cD69251D04A28d887Ac14cbe2E14c52F3D57823";
export const BNBxOracle = "0x24f6E7f40E3d8782E0c50d749625b6412437Af18";
export const BNBx = "0x327d6E6FAC0228070884e913263CFF9eFed4a2C8";
export const SlisBNBOracle = "0x57e9230b8e57561e0Be71075A0BAC1B6e6a3369E";
export const SlisBNB = "0xd2aF6A916Bc77764dc63742BC30f71AF4cF423F4";
export const StkBNBOracle = "0x78c1248c07c3724fe7D6FbD0e8D9859eF206B6d0";
export const StkBNB = "0x2999C176eBf66ecda3a646E70CeB5FF4d5fCFb8C";
export const WBETHOracle = "0x80f80ad1d963673819752c234339901fa19fA7cb";
export const WBETH = "0x9c37E59Ba22c4320547F00D4f1857AF1abd1Dd6f";
export const ankrBNB = "0x5269b7558D3d5E113010Ef1cFF0901c367849CC9";
export const ankrBNBOracle = "0x00ea3D7Abe2f04004Ce71f9ef5C04F5f8Dce2f55";

export const WBETH_EXCHANGE_RATE = parseUnits("1.036711601665", "18");
export const ankrBNB_EXCHANGE_RATE = parseUnits("1.080640588742602582", "18");

export const TEMP_POOL_REGISTRY_IMP = "0x0012875a7395a293Adfc9b5cDC2Cfa352C4cDcD3";
export const ORIGINAL_POOL_REGISTRY_IMP = "0xed659A02c5f63f299C28F6A246143326b922e3d9";
export const PROXY_ADMIN = "0x7877ffd62649b6a1557b55d4c20fcbab17344c91";
export const POOL_REGISTRY = "0xC85491616Fa949E048F3aAc39fbf5b0703800667";
export const OLD_ankrBNB = "0x167F1F9EF531b3576201aa3146b13c57dbEda514";
export const COMPTROLLER_ADDRESS = "0x596B11acAACF03217287939f88d63b51d3771704";
export const vankrBNB = "0x57a664Dd7f1dE19545fEE9c86C949e3BF43d6D47";
export const TEMP_VTOKEN_IMP = "0xbd3AAd064295dcA0f45fab4C6A5adFb0D23a19D2";
export const VTOKEN_BEACON = "0xBF85A90673E61956f8c79b9150BAB7893b791bDd";
export const VTOKEN_IMP = "0xa60b28FDDaAB87240C3AF319892e7A4ad6FbF41F";
export const OLD_WBETH = "0xf9F98365566F4D55234f24b99caA1AfBE6428D44";
export const vWBETH = "0x35566ED3AF9E537Be487C98b1811cDf95ad0C32b";
export const WBETH_VTOKEN_IMPL = "0xad6aa8bb4829560412a94aa930745f407bf8000b";
export const WBETH_TEMP_VTOKEN_IMPL = "0x9ac3C79de233952bEBdf88A932c52fC24dD6ebcf";

// Holders Data from: https://testnet.bscscan.com/token/0x167F1F9EF531b3576201aa3146b13c57dbEda514#balances
export const ankrBNB_TOKEN_HOLDERS = [
  {
    address: "0xcd2a514f04241b7c9A0d5d54441e92E4611929CF",
    amount: parseUnits("199999900", "18"),
  },
  {
    address: "0xA3c9ad26Fb87ec864624730C45f5d11A4F37fAcE",
    amount: parseUnits("110000", "18"),
  },
  {
    address: "0x03862dFa5D0be8F64509C001cb8C6188194469DF",
    amount: parseUnits("672.1", "18"),
  },
  {
    address: "0xDd704A44866AE9C387CfC687fa642a222b84f0D3",
    amount: parseUnits("316", "18"),
  },
  {
    address: "0x9cc6F5f16498fCEEf4D00A350Bd8F8921D304Dc9",
    amount: parseUnits("277", "18"),
  },
  {
    address: "0xe507B30C41E9e375BCe05197c1e09fc9ee40c0f6",
    amount: parseUnits("242.000000001060475973", "18"),
  },
  {
    address: "0x2Ce1d0ffD7E869D9DF33e28552b12DdDed326706",
    amount: parseUnits("179", "18"),
  },
  {
    address: "0x8b293600C50D6fbdc6Ed4251cc75ECe29880276f",
    amount: parseUnits("158", "18"),
  },
  {
    address: "0x6f057A858171e187124ddEDF034dAc63De5dE5dB",
    amount: parseUnits("101.090351001623470241", "18"),
  },
  {
    address: "0x2EF706339560Ffd848c04bcD1b611edE0a0b79b7",
    amount: parseUnits("98", "18"),
  },
  {
    address: "0x6eACe20E1F89D0B24e5B295Af1802dfBc730B37D",
    amount: parseUnits("79", "18"),
  },
  {
    address: "0x7E8c214B0862885EFf707F827d1171C6D7FbBf5F",
    amount: parseUnits("79", "18"),
  },
  {
    address: "0x57a664Dd7f1dE19545fEE9c86C949e3BF43d6D47",
    amount: parseUnits("37.686205910410599126", "18"),
  },
  {
    address: "0xbcC32d0729043259594C36Ac53c3D2f94CD61860",
    amount: parseUnits("29.576315531093403723", "18"),
  },
  {
    address: "0x7df11563c6b6b8027aE619FD9644A647dED5893B",
    amount: parseUnits("15.333333466222650063", "18"),
  },
  {
    address: "0xC8E2d418dAE56DcC9fa05A1c67AfeD876F04e553",
    amount: parseUnits("10", "18"),
  },
  {
    address: "0xD4a9F68DEbed2F8D7cE0115d415cc992AB0BFbcc",
    amount: parseUnits("1", "18"),
  },
  {
    address: "0x9CeF4778267400D921271f0BC9434C3f9a73d826",
    amount: parseUnits("1", "18"),
  },
  {
    address: "0x25c7c7D6Bf710949fD7f03364E9BA19a1b3c10E3",
    amount: parseUnits("0.313794089589400874", "18"),
  },
];

let MINT_TOTAL = parseUnits("0", "18");
ankrBNB_TOKEN_HOLDERS.forEach(holder => {
  MINT_TOTAL = MINT_TOTAL.add(holder.amount);
});

const TRANSFER_COMMANDS = ankrBNB_TOKEN_HOLDERS.map(holder => {
  return {
    target: ankrBNB,
    signature: "transfer(address,uint256)",
    params: [holder.address, holder.amount],
  };
});

const vip289 = () => {
  const meta = {
    version: "v2",
    title: "VIP-289 Set custom oracles for markets with LST tokens (ankrBNB, BNBx, stkBNB, and slisBNB)",
    description: ``,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [
            BNBx,
            [BNBxOracle, "0x0000000000000000000000000000000000000000", "0x0000000000000000000000000000000000000000"],
            [true, false, false],
          ],
        ],
      },
      {
        target: RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [
            SlisBNB,
            [SlisBNBOracle, "0x0000000000000000000000000000000000000000", "0x0000000000000000000000000000000000000000"],
            [true, false, false],
          ],
        ],
      },
      {
        target: RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [
            StkBNB,
            [StkBNBOracle, "0x0000000000000000000000000000000000000000", "0x0000000000000000000000000000000000000000"],
            [true, false, false],
          ],
        ],
      },
      {
        target: WBETH,
        signature: "setExchangeRate(uint256)",
        params: [WBETH_EXCHANGE_RATE],
      },
      {
        target: ankrBNB,
        signature: "setSharesToBonds(uint256)",
        params: [ankrBNB_EXCHANGE_RATE],
      },
      {
        target: RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [
            ankrBNB,
            [ankrBNBOracle, "0x0000000000000000000000000000000000000000", "0x0000000000000000000000000000000000000000"],
            [true, false, false],
          ],
        ],
      },
      {
        target: PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [POOL_REGISTRY, TEMP_POOL_REGISTRY_IMP],
      },
      {
        target: POOL_REGISTRY,
        signature: "updateUnderlying(address,address,address,address)",
        params: [OLD_ankrBNB, ankrBNB, COMPTROLLER_ADDRESS, vankrBNB],
      },
      {
        target: PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [POOL_REGISTRY, ORIGINAL_POOL_REGISTRY_IMP],
      },
      {
        target: vWBETH,
        signature: "_setImplementation(address,bool,bytes)",
        params: [WBETH_TEMP_VTOKEN_IMPL, false, "0x"],
      },
      {
        target: vWBETH,
        signature: "updateUnderlying(address)",
        params: [WBETH],
      },
      {
        target: vWBETH,
        signature: "_setImplementation(address,bool,bytes)",
        params: [WBETH_VTOKEN_IMPL, false, "0x"],
      },
      {
        target: VTOKEN_BEACON,
        signature: "upgradeTo(address)",
        params: [TEMP_VTOKEN_IMP],
      },
      {
        target: vankrBNB,
        signature: "updateUnderlying(address)",
        params: [ankrBNB],
      },
      {
        target: VTOKEN_BEACON,
        signature: "upgradeTo(address)",
        params: [VTOKEN_IMP],
      },
      {
        target: ankrBNB,
        signature: "faucet(uint256)",
        params: [MINT_TOTAL],
      },
      ...TRANSFER_COMMANDS,
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip289;
