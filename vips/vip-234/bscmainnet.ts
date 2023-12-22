import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

// IL
const NEW_IMPL_IL_VTOKEN = "";
const VTOKEN_BEACON = "0x2b8A1C539ABaC89CbF7E2Bc6987A0A38A5e660D4";
// Core
const NEW_VBEP20_DELEGATE_IMPL = "";

interface AssetConfig {
  name: string;
  address: string;
  holder: string; // Used by the simulation
}

export const CORE_MARKETS: AssetConfig[] = [
  {
    name: "vAAVE",
    address: "0x26DA28954763B92139ED49283625ceCAf52C6f94",
    holder: "0x5a52E96BAcdaBb82fd05763E25335261B270Efcb",
  },
  {
    name: "vADA",
    address: "0x9A0AF7FDb2065Ce470D72664DE73cAE409dA28Ec",
    holder: "0xF977814e90dA44bFA03b6295A0616a897441aceC",
  },
  {
    name: "vBCH",
    address: "0x5F0388EBc2B94FA8E123F404b79cCF5f40b29176",
    holder: "0xF977814e90dA44bFA03b6295A0616a897441aceC",
  },
  {
    name: "vBETH",
    address: "0x972207A639CC1B374B893cc33Fa251b55CEB7c07",
    holder: "0xF68a4b64162906efF0fF6aE34E2bB1Cd42FEf62d",
  },
  {
    name: "vBTC",
    address: "0x882C173bC7Ff3b7786CA16dfeD3DFFfb9Ee7847B",
    holder: "0xF977814e90dA44bFA03b6295A0616a897441aceC",
  },
  {
    name: "vCAKE",
    address: "0x86aC3974e2BD0d60825230fa6F355fF11409df5c",
    holder: "0x000000000000000000000000000000000000dEaD",
  },
  {
    name: "vDAI",
    address: "0x334b3eCB4DCa3593BCCC3c7EBD1A1C1d1780FBF1",
    holder: "0xF977814e90dA44bFA03b6295A0616a897441aceC",
  },
  {
    name: "vDOGE",
    address: "0xec3422Ef92B2fb59e84c8B02Ba73F1fE84Ed8D71",
    holder: "0x0000000000000000000000000000000000001004",
  },
  {
    name: "vDOT",
    address: "0x1610bc33319e9398de5f57B33a5b184c806aD217",
    holder: "0xF977814e90dA44bFA03b6295A0616a897441aceC",
  },
  {
    name: "vETH",
    address: "0xf508fCD89b8bd15579dc79A6827cB4686A3592c8",
    holder: "0xF977814e90dA44bFA03b6295A0616a897441aceC",
  },
  {
    name: "vFIL",
    address: "0xf91d58b5aE142DAcC749f58A49FCBac340Cb0343",
    holder: "0xF977814e90dA44bFA03b6295A0616a897441aceC",
  },
  {
    name: "vLINK",
    address: "0x650b940a1033B8A1b1873f78730FcFC73ec11f1f",
    holder: "0xF977814e90dA44bFA03b6295A0616a897441aceC",
  },
  {
    name: "vLTC",
    address: "0x57A5297F2cB2c0AaC9D554660acd6D385Ab50c6B",
    holder: "0xF977814e90dA44bFA03b6295A0616a897441aceC",
  },
  {
    name: "vMATIC",
    address: "0x5c9476FcD6a4F9a3654139721c949c2233bBbBc8",
    holder: "0xF977814e90dA44bFA03b6295A0616a897441aceC",
  },
  {
    name: "vSXP",
    address: "0x2fF3d0F6990a40261c66E1ff2017aCBc282EB6d0",
    holder: "0xF977814e90dA44bFA03b6295A0616a897441aceC",
  },
  {
    name: "vTRX",
    address: "0xC5D3466aA484B040eE977073fcF337f2c00071c1",
    holder: "0xF977814e90dA44bFA03b6295A0616a897441aceC",
  },
  {
    name: "vTUSD",
    address: "0xBf762cd5991cA1DCdDaC9ae5C638F5B5Dc3Bee6E",
    holder: "0xF977814e90dA44bFA03b6295A0616a897441aceC",
  },
  {
    name: "vUSDC",
    address: "0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8",
    holder: "0xF977814e90dA44bFA03b6295A0616a897441aceC",
  },
  {
    name: "vUSDT",
    address: "0xfD5840Cd36d94D7229439859C0112a4185BC0255",
    holder: "0xF977814e90dA44bFA03b6295A0616a897441aceC",
  },
  {
    name: "vWBETH",
    address: "0x6CFdEc747f37DAf3b87a35a1D9c8AD3063A1A8A0",
    holder: "0xF977814e90dA44bFA03b6295A0616a897441aceC",
  },
  {
    name: "vXRP",
    address: "0xB248a295732e0225acd3337607cc01068e3b9c10",
    holder: "0xF977814e90dA44bFA03b6295A0616a897441aceC",
  },
  {
    name: "vXVS",
    address: "0x151B1e2635A717bcDc836ECd6FbB62B674FE3E1D",
    holder: "0xF977814e90dA44bFA03b6295A0616a897441aceC",
  },
  {
    name: "vBUSD",
    address: "0x95c78222B3D6e262426483D42CfA53685A67Ab9D",
    holder: "0xF977814e90dA44bFA03b6295A0616a897441aceC",
  },
  {
    name: "vTRXOLD",
    address: "0x61eDcFe8Dd6bA3c891CB9bEc2dc7657B3B422E93",
    holder: "0xe2fc31F816A9b94326492132018C3aEcC4a93aE1",
  },
  {
    name: "vTUSDOLD",
    address: "0x08CEB3F4a7ed3500cA0982bcd0FC7816688084c3",
    holder: "0x8894E0a0c962CB723c1976a4421c95949bE2D4E3",
  },
  {
    name: "vUNI",
    address: "0x27FF564707786720C71A2e5c1490A63266683612",
    holder: "0x8894E0a0c962CB723c1976a4421c95949bE2D4E3",
  },
  {
    name: "vFDUSD",
    address: "0xC4eF4229FEc74Ccfe17B2bdeF7715fAC740BA0ba",
    holder: "0x8894E0a0c962CB723c1976a4421c95949bE2D4E3",
  },
];

export const vip219 = () => {
  const meta = {
    version: "v2",
    title: `VIP-219 VToken Upgrade`,
    description: `If passed, this VIP will upgrade the implementation of every market in the Core pool - except vBNB (non upgradable), vLUNA and vUST (deprecated) and the markets in Isolated Pools allowing for reserves to reduced with either cash on hand or accrued revenues whichever is less.

    #### Description

    A situation can arise where the accrued revenues to reduce from the reserves are less than cash on hand. This can cause problems because interest accrual will throw an error that not enough cash is available and break features such as calculated fresh account balances.


    **Audit reports**

    **Deployed contracts**

    - Mainnet: ****[new VToken implementations](https://bscscan.com/address/<>)
    - Testnet: ****[new VToken implementations](https://testnet.bscscan.com/address/<>)

    **References**

    - [Pull request with the new Core Pool VToken contracts](https://github.com/VenusProtocol/venus-protocol/pull/414)
    - [Pull request with the new Isolated Pools VToken contracts](https://github.com/VenusProtocol/isolated-pools/pull/337)
    - [Simulation post upgrade](https://github.com/VenusProtocol/vips/pull/<>)
    - [Mainnet deployment Core VToken](https://testnet.bscscan.com/tx/<>)
    - [Mainnet deployment IL VToken](https://testnet.bscscan.com/tx/<>)
    - [Documentation](https://docs-v4.venus.io/technical-reference/reference-technical-articles/automatic-income-allocation)`,
    forDescription:
      "I agree that Venus Protocol should proceed with VToken Upgrade allowing for income to be reduced based on cash on hand",
    againstDescription:
      "I do not think that Venus Protocol should proceed with VToken Upgrade allowing for income to be reduced based on cash on hand",
    abstainDescription:
      "I am indifferent to whether Venus Protocol proceeds with VToken Upgrade allowing for income to be reduced based on cash on hand",
  };

  return makeProposal(
    [
      ...CORE_MARKETS.map(asset => {
        return {
          target: asset.address,
          signature: "_setImplementation(address,bool,bytes)",
          params: [NEW_VBEP20_DELEGATE_IMPL, false, "0x"],
        };
      }),
      {
        target: VTOKEN_BEACON,
        signature: "upgradeTo(address)",
        params: [NEW_IMPL_IL_VTOKEN],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
