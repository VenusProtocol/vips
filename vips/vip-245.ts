import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../src/types";
import { makeProposal } from "../src/utils";

export const blocksPerYear = 10512000;
export const blocksPerDay = parseInt((blocksPerYear / 365).toString());

export const UNITROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";

// we are adding one to make it 62.50 per day in the UI as there is precision loss during division
export const VAI_VAULT_RATE = parseUnits("62.50", 18).div(blocksPerDay).add(1);

export interface XVSSpeed {
  name: string;
  vToken: string;
  supplySpeed: string;
  borrowSpeed: string;
  oldSupplySpeed: string;
  oldBorrowSpeed: string;
}

const emissionPerBlock = (emissionPerDay: string): BigNumber => {
  return BigNumber.from(parseUnits(emissionPerDay, 18)).div(blocksPerDay);
};

export const Speeds: XVSSpeed[] = [
  {
    name: "vBTC",
    vToken: "0x882C173bC7Ff3b7786CA16dfeD3DFFfb9Ee7847B",
    supplySpeed: emissionPerBlock("46.87").div(2).toString(),
    borrowSpeed: emissionPerBlock("46.87").div(2).toString(),
    oldSupplySpeed: emissionPerBlock("93.74").div(2).toString(),
    oldBorrowSpeed: emissionPerBlock("93.74").div(2).toString(),
  },
  {
    name: "vBNB",
    vToken: "0xA07c5b74C9B40447a954e1466938b865b6BBea36",
    supplySpeed: emissionPerBlock("46.87").div(2).toString(),
    borrowSpeed: emissionPerBlock("46.87").div(2).toString(),
    oldSupplySpeed: emissionPerBlock("93.74").div(2).toString(),
    oldBorrowSpeed: emissionPerBlock("93.74").div(2).toString(),
  },
  {
    name: "vUSDT",
    vToken: "0xfD5840Cd36d94D7229439859C0112a4185BC0255",
    supplySpeed: emissionPerBlock("9.77").div(2).toString(),
    borrowSpeed: emissionPerBlock("9.77").div(2).toString(),
    oldSupplySpeed: emissionPerBlock("39.06").div(2).toString(),
    oldBorrowSpeed: emissionPerBlock("39.06").div(2).toString(),
  },
  {
    name: "vETH",
    vToken: "0xf508fCD89b8bd15579dc79A6827cB4686A3592c8",
    supplySpeed: emissionPerBlock("23.44").div(2).toString(),
    borrowSpeed: emissionPerBlock("23.44").div(2).toString(),
    oldSupplySpeed: emissionPerBlock("46.87").div(2).toString(),
    oldBorrowSpeed: emissionPerBlock("46.87").div(2).toString(),
  },
  {
    name: "vUSDC",
    vToken: "0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8",
    supplySpeed: emissionPerBlock("9.77").div(2).toString(),
    borrowSpeed: emissionPerBlock("9.77").div(2).toString(),
    oldSupplySpeed: emissionPerBlock("39.06").div(2).toString(),
    oldBorrowSpeed: emissionPerBlock("39.06").div(2).toString(),
  },
  {
    name: "vCAKE",
    vToken: "0x86aC3974e2BD0d60825230fa6F355fF11409df5c",
    supplySpeed: emissionPerBlock("1.25").div(2).toString(),
    borrowSpeed: emissionPerBlock("1.25").div(2).toString(),
    oldSupplySpeed: emissionPerBlock("3.12").div(2).toString(),
    oldBorrowSpeed: emissionPerBlock("3.12").div(2).toString(),
  },
  {
    name: "vWBETH",
    vToken: "0x6CFdEc747f37DAf3b87a35a1D9c8AD3063A1A8A0",
    supplySpeed: emissionPerBlock("4.29").div(2).toString(),
    borrowSpeed: emissionPerBlock("4.29").div(2).toString(),
    oldSupplySpeed: emissionPerBlock("8.58").div(2).toString(),
    oldBorrowSpeed: emissionPerBlock("8.58").div(2).toString(),
  },
  {
    name: "vADA",
    vToken: "0x9A0AF7FDb2065Ce470D72664DE73cAE409dA28Ec",
    supplySpeed: "0",
    borrowSpeed: "0",
    oldSupplySpeed: emissionPerBlock("4.68").div(2).toString(),
    oldBorrowSpeed: emissionPerBlock("4.68").div(2).toString(),
  },
  {
    name: "vXRP",
    vToken: "0xB248a295732e0225acd3337607cc01068e3b9c10",
    supplySpeed: "0",
    borrowSpeed: "0",
    oldSupplySpeed: emissionPerBlock("2.86").div(2).toString(),
    oldBorrowSpeed: emissionPerBlock("2.86").div(2).toString(),
  },
  {
    name: "vLINK",
    vToken: "0x650b940a1033B8A1b1873f78730FcFC73ec11f1f",
    supplySpeed: "0",
    borrowSpeed: "0",
    oldSupplySpeed: emissionPerBlock("2.86").div(2).toString(),
    oldBorrowSpeed: emissionPerBlock("2.86").div(2).toString(),
  },
  {
    name: "vDOT",
    vToken: "0x1610bc33319e9398de5f57B33a5b184c806aD217",
    supplySpeed: "0",
    borrowSpeed: "0",
    oldSupplySpeed: emissionPerBlock("4.58").div(2).toString(),
    oldBorrowSpeed: emissionPerBlock("4.58").div(2).toString(),
  },
  {
    name: "vMATIC",
    vToken: "0x5c9476FcD6a4F9a3654139721c949c2233bBbBc8",
    supplySpeed: "0",
    borrowSpeed: "0",
    oldSupplySpeed: emissionPerBlock("3.12").div(2).toString(),
    oldBorrowSpeed: emissionPerBlock("3.12").div(2).toString(),
  },
  {
    name: "vLTC",
    vToken: "0x57A5297F2cB2c0AaC9D554660acd6D385Ab50c6B",
    supplySpeed: "0",
    borrowSpeed: "0",
    oldSupplySpeed: emissionPerBlock("2.86").div(2).toString(),
    oldBorrowSpeed: emissionPerBlock("2.86").div(2).toString(),
  },
  {
    name: "vFIL",
    vToken: "0xf91d58b5aE142DAcC749f58A49FCBac340Cb0343",
    supplySpeed: "0",
    borrowSpeed: "0",
    oldSupplySpeed: emissionPerBlock("1.56").div(2).toString(),
    oldBorrowSpeed: emissionPerBlock("1.56").div(2).toString(),
  },
  {
    name: "vDAI",
    vToken: "0x334b3eCB4DCa3593BCCC3c7EBD1A1C1d1780FBF1",
    supplySpeed: "0",
    borrowSpeed: "0",
    oldSupplySpeed: emissionPerBlock("4.86").div(2).toString(),
    oldBorrowSpeed: emissionPerBlock("4.86").div(2).toString(),
  },
  {
    name: "vDOGE",
    vToken: "0xec3422Ef92B2fb59e84c8B02Ba73F1fE84Ed8D71",
    supplySpeed: "0",
    borrowSpeed: "0",
    oldSupplySpeed: emissionPerBlock("1.56").div(2).toString(),
    oldBorrowSpeed: emissionPerBlock("1.56").div(2).toString(),
  },
  {
    name: "vBCH",
    vToken: "0x5F0388EBc2B94FA8E123F404b79cCF5f40b29176",
    supplySpeed: "0",
    borrowSpeed: "0",
    oldSupplySpeed: emissionPerBlock("1.56").div(2).toString(),
    oldBorrowSpeed: emissionPerBlock("1.56").div(2).toString(),
  },
  {
    name: "vAAVE",
    vToken: "0x26DA28954763B92139ED49283625ceCAf52C6f94",
    supplySpeed: "0",
    borrowSpeed: "0",
    oldSupplySpeed: emissionPerBlock("1.56").div(2).toString(),
    oldBorrowSpeed: emissionPerBlock("1.56").div(2).toString(),
  },
  {
    name: "vFDUSD",
    vToken: "0xC4eF4229FEc74Ccfe17B2bdeF7715fAC740BA0ba",
    supplySpeed: "0",
    borrowSpeed: "0",
    oldSupplySpeed: emissionPerBlock("9.99").div(2).toString(),
    oldBorrowSpeed: emissionPerBlock("9.99").div(2).toString(),
  },
  {
    name: "vTRX",
    vToken: "0xC5D3466aA484B040eE977073fcF337f2c00071c1",
    supplySpeed: "0",
    borrowSpeed: "0",
    oldSupplySpeed: emissionPerBlock("3.12").div(2).toString(),
    oldBorrowSpeed: emissionPerBlock("3.12").div(2).toString(),
  },
  {
    name: "vUNI",
    vToken: "0x27FF564707786720C71A2e5c1490A63266683612",
    supplySpeed: "0",
    borrowSpeed: "0",
    oldSupplySpeed: emissionPerBlock("4.68").div(2).toString(),
    oldBorrowSpeed: emissionPerBlock("4.68").div(2).toString(),
  },
];

export const vTokens = Speeds.map(speed => speed.vToken);
export const supplySpeeds = Speeds.map(speed => speed.supplySpeed);
export const borrowSpeeds = Speeds.map(speed => speed.borrowSpeed);

export const vip245 = () => {
  const meta = {
    version: "v2",
    title: "VIP-247: XVS Emission Reduction",
    description: `#### Summary

After the successful passing of the [snapshot vote](https://snapshot.org/#/venus-xvs.eth/proposal/0xd11a145f3b8b721f11b0f9e97306822d65db81858080836ff13244617414ade7) to reduce XVS emissions, if passed, this VIP will reduce the amount of daily XVS emission on the Venus Core pool markets.

The current emission on the core pool markets is 501.96 XVS/day, and after the change the daily emission of XVS in the markets will be 204.74 XVS/day.

#### Details

Specifically, the changes in the daily XVS emissions are:

- BTCB. From 93.74 XVS/day to 46.87 XVS/day
- BNB. From 93.74 XVS/day to 46.87 XVS/day
- USDT. From 39.06 XVS/day to 9.77 XVS/day
- ETH. From 46.87 XVS/day to 23.44 XVS/day
- USDC. From 39.06 XVS/day to 9.77 XVS/day
- CAKE. From 3.12 XVS/day to 1.25 XVS/day
- WBETH. From 8.58 XVS/day to 4.29 XVS/day
- ADA. From 4.68 XVS/day to 0 XVS/day
- XRP. From 2.86 XVS/day to 0 XVS/day
- LINK. From 2.86 XVS/day to 0 XVS/day
- DOT. From 4.58 XVS/day to 0 XVS/day
- MATIC. From 3.12 XVS/day to 0 XVS/day
- LTC. From 2.86 XVS/day to 0 XVS/day
- FIL. From 1.56 XVS/day to 0 XVS/day
- DAI. From 4.68 XVS/day to 0 XVS/day
- DOGE. From 1.56 XVS/day to 0 XVS/day
- BCH. From 1.56 XVS/day to 0 XVS/day
- AAVE. From 1.56 XVS/day to 0 XVS/day
- FDUSD. From 9.99 XVS/day to 0 XVS/day
- TRX. From 3.12 XVS/day to 0 XVS/day
- UNI. From 4.68 XVS/day to 0 XVS/day

#### References

- [Snapshot](https://snapshot.org/#/venus-xvs.eth/proposal/0xd11a145f3b8b721f11b0f9e97306822d65db81858080836ff13244617414ade7)
- [Community post proposing the XVS emission reduction](https://community.venus.io/t/xvs-emission-cut-proposal-v4/4070)
- Previous XVS emission reductions:
    - [VIP-171](https://app.venus.io/#/governance/proposal/171)
    - [VIP-88](https://app.venus.io/#/governance/proposal/88)
    - [VIP-78](https://app.venus.io/#/governance/proposal/78)
- [VIP simulation](https://github.com/VenusProtocol/vips/pull/187)`,
    forDescription: "I agree that Venus Protocol should proceed with this VIP",
    againstDescription: "I do not think that Venus Protocol should proceed with this VIP",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with this VIP",
  };

  return makeProposal(
    [
      {
        target: UNITROLLER,
        signature: "_setVenusVAIVaultRate(uint256)",
        params: [VAI_VAULT_RATE],
      },
      {
        target: UNITROLLER,
        signature: "_setVenusSpeeds(address[],uint256[],uint256[])",
        params: [vTokens, supplySpeeds, borrowSpeeds],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
