import { ethers } from "hardhat";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const NEW_VBEP20_DELEGATE_IMPL = "0xc3279442a5aCaCF0A2EcB015d1cDDBb3E0f3F775";
const ACCESS_CONTROL_MANAGER = "0x4788629ABc6cFCA10F9f969efdEAa1cF70c23555";
const PROTOCOL_SHARE_RESERVE = "0xCa01D5A9A248a830E9D93231e791B1afFed7c446";
const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";

interface AssetConfig {
  name: string;
  address: string;
  reduceReservesBlockDelta: number;
  holder: string; // Used by the simulation
}

export const CORE_MARKETS: AssetConfig[] = [
  {
    name: "vAAVE",
    address: "0x26DA28954763B92139ED49283625ceCAf52C6f94",
    reduceReservesBlockDelta: 28800,
    holder: "0x5a52E96BAcdaBb82fd05763E25335261B270Efcb",
  },
  {
    name: "vADA",
    address: "0x9A0AF7FDb2065Ce470D72664DE73cAE409dA28Ec",
    reduceReservesBlockDelta: 28800,
    holder: "0xF977814e90dA44bFA03b6295A0616a897441aceC",
  },
  {
    name: "vBCH",
    address: "0x5F0388EBc2B94FA8E123F404b79cCF5f40b29176",
    reduceReservesBlockDelta: 28800,
    holder: "0xF977814e90dA44bFA03b6295A0616a897441aceC",
  },
  {
    name: "vBETH",
    address: "0x972207A639CC1B374B893cc33Fa251b55CEB7c07",
    reduceReservesBlockDelta: 28800,
    holder: "0xF68a4b64162906efF0fF6aE34E2bB1Cd42FEf62d",
  },
  {
    name: "vBTC",
    address: "0x882C173bC7Ff3b7786CA16dfeD3DFFfb9Ee7847B",
    reduceReservesBlockDelta: 28800,
    holder: "0xF977814e90dA44bFA03b6295A0616a897441aceC",
  },
  {
    name: "vCAKE",
    address: "0x86aC3974e2BD0d60825230fa6F355fF11409df5c",
    reduceReservesBlockDelta: 28800,
    holder: "0x000000000000000000000000000000000000dEaD",
  },
  {
    name: "vDAI",
    address: "0x334b3eCB4DCa3593BCCC3c7EBD1A1C1d1780FBF1",
    reduceReservesBlockDelta: 28800,
    holder: "0xF977814e90dA44bFA03b6295A0616a897441aceC",
  },
  {
    name: "vDOGE",
    address: "0xec3422Ef92B2fb59e84c8B02Ba73F1fE84Ed8D71",
    reduceReservesBlockDelta: 28800,
    holder: "0x0000000000000000000000000000000000001004",
  },
  {
    name: "vDOT",
    address: "0x1610bc33319e9398de5f57B33a5b184c806aD217",
    reduceReservesBlockDelta: 28800,
    holder: "0xF977814e90dA44bFA03b6295A0616a897441aceC",
  },
  {
    name: "vETH",
    address: "0xf508fCD89b8bd15579dc79A6827cB4686A3592c8",
    reduceReservesBlockDelta: 28800,
    holder: "0xF977814e90dA44bFA03b6295A0616a897441aceC",
  },
  {
    name: "vFIL",
    address: "0xf91d58b5aE142DAcC749f58A49FCBac340Cb0343",
    reduceReservesBlockDelta: 28800,
    holder: "0xF977814e90dA44bFA03b6295A0616a897441aceC",
  },
  {
    name: "vLINK",
    address: "0x650b940a1033B8A1b1873f78730FcFC73ec11f1f",
    reduceReservesBlockDelta: 28800,
    holder: "0xF977814e90dA44bFA03b6295A0616a897441aceC",
  },
  {
    name: "vLTC",
    address: "0x57A5297F2cB2c0AaC9D554660acd6D385Ab50c6B",
    reduceReservesBlockDelta: 28800,
    holder: "0xF977814e90dA44bFA03b6295A0616a897441aceC",
  },
  {
    name: "vMATIC",
    address: "0x5c9476FcD6a4F9a3654139721c949c2233bBbBc8",
    reduceReservesBlockDelta: 28800,
    holder: "0xF977814e90dA44bFA03b6295A0616a897441aceC",
  },
  {
    name: "vSXP",
    address: "0x2fF3d0F6990a40261c66E1ff2017aCBc282EB6d0",
    reduceReservesBlockDelta: 28800,
    holder: "0xF977814e90dA44bFA03b6295A0616a897441aceC",
  },
  {
    name: "vTRX",
    address: "0xC5D3466aA484B040eE977073fcF337f2c00071c1",
    reduceReservesBlockDelta: 28800,
    holder: "0xF977814e90dA44bFA03b6295A0616a897441aceC",
  },
  {
    name: "vTUSD",
    address: "0xBf762cd5991cA1DCdDaC9ae5C638F5B5Dc3Bee6E",
    reduceReservesBlockDelta: 28800,
    holder: "0xF977814e90dA44bFA03b6295A0616a897441aceC",
  },
  {
    name: "vUSDC",
    address: "0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8",
    reduceReservesBlockDelta: 28800,
    holder: "0xF977814e90dA44bFA03b6295A0616a897441aceC",
  },
  {
    name: "vUSDT",
    address: "0xfD5840Cd36d94D7229439859C0112a4185BC0255",
    reduceReservesBlockDelta: 28800,
    holder: "0xF977814e90dA44bFA03b6295A0616a897441aceC",
  },
  {
    name: "vWBETH",
    address: "0x6CFdEc747f37DAf3b87a35a1D9c8AD3063A1A8A0",
    reduceReservesBlockDelta: 28800,
    holder: "0xF977814e90dA44bFA03b6295A0616a897441aceC",
  },
  {
    name: "vXRP",
    address: "0xB248a295732e0225acd3337607cc01068e3b9c10",
    reduceReservesBlockDelta: 28800,
    holder: "0xF977814e90dA44bFA03b6295A0616a897441aceC",
  },
  {
    name: "vXVS",
    address: "0x151B1e2635A717bcDc836ECd6FbB62B674FE3E1D",
    reduceReservesBlockDelta: 28800,
    holder: "0xF977814e90dA44bFA03b6295A0616a897441aceC",
  },
  {
    name: "vBUSD",
    address: "0x95c78222B3D6e262426483D42CfA53685A67Ab9D",
    reduceReservesBlockDelta: 105120000,
    holder: "0xF977814e90dA44bFA03b6295A0616a897441aceC",
  },
];

export const vip193 = () => {
  const meta = {
    version: "v2",
    title: "VIP-193 Automatic income allocation: deployment stage 2 - Core pool",
    description: `#### Summary

If passed, this VIP will upgrade the implementation of every market in the Core pool - except vTRXOLD and vTUSDOLD (already upgraded at [VIP-192](https://app.venus.io/#/governance/proposal/192)), vBNB (non upgradable), vLUNA and vUST (deprecated) - enabling the [Automatic Income Allocation](https://docs-v4.venus.io/technical-reference/reference-technical-articles/automatic-income-allocation) in those markets.

#### Description

This VIP is part of the proposal [Automatic Income Allocation & Token Converter](https://community.venus.io/t/automatic-income-allocation-token-converter/3702), published in the Venus community forum. It’s part of the deployment plan started with the [VIP-189](https://app.venus.io/#/governance/proposal/189) and continued with [VIP-191](https://app.venus.io/#/governance/proposal/191).

The new implementation pushes market reserves of the affected markets automatically to the [ProtocolShareReserve](https://bscscan.com/address/0xCa01D5A9A248a830E9D93231e791B1afFed7c446) contract after 28,800 blocks (24 hours on BNB chain). These reserves are distributed following the [protocol tokenomics](https://docs-v4.venus.io/governance/tokenomics):

- 40% to the RiskFund contract
- 40% to the [Venus Treasury](https://bscscan.com/address/0xf322942f644a996a617bd29c16bd7d231d9f35e9) contract
- 10% to the Venus Prime Program. This 10% will be sent temporarily to the Venus Treasury, until the Venus Prime contract is ready.
- 10% for the XVS Vault rewards. This 10% will be sent temporarily to the Venus Treasury, until the [Token Converter contracts](https://community.venus.io/t/automatic-income-allocation-token-converter/3702) are ready.

There will be one more VIP for this second stage of the Automatic Income Allocation deployment, proposed in the following days. In that VIP, the markets of the Isolated pools will be upgraded to enable the Automatic Income Allocation.

**Security and additional considerations**

We applied the following security procedures for this upgrade:

- **Markets behavior post upgrade**: in a simulation environment, validating in the upgraded contracts the main operations (supply, borrow, repay and redeem) and the storage layout after the VIP
- **Automatic reduction of the reserves**: in a simulation environment, validating the market reserves are sent as expected to the ProtocolShareReserve
- **Deployment on testnet**: the same VIP was proposed and executed on testnet, and the upgraded contracts are used in the Venus Protocol testnet deployment
- **Audit: Quantstamp, Certik, Peckshield and Fairyproof have audited the deployed code**

**Audit reports**

- [Quantstamp audit report (2023/09/13)](https://github.com/VenusProtocol/venus-protocol/blob/9ef8901dfef84a11338751881fd10a2d36c576ad/audits/058_automatic_income_allocation_quantstamp_20230913.pdf)
- [Certik audit audit report (2023/09/12)](https://github.com/VenusProtocol/venus-protocol/blob/90f913fd345c24c60efa613ab5ab7e633b7aa07a/audits/059_automatic_income_allocation_certik_20230912.pdf)
- [Peckshield audit report (2023/08/12)](https://github.com/VenusProtocol/venus-protocol/blob/90f913fd345c24c60efa613ab5ab7e633b7aa07a/audits/054_automatic_income_allocation_peckshield_20230812.pdf)
- [Fairyproof audit report (2023/08/03)](https://github.com/VenusProtocol/venus-protocol/blob/90f913fd345c24c60efa613ab5ab7e633b7aa07a/audits/050_automatic_income_allocation_fairyproof_20230803.pdf)

**Deployed contracts**

- Mainnet: ****[new VToken implementations](https://bscscan.com/address/0xc3279442a5aCaCF0A2EcB015d1cDDBb3E0f3F775)
- Testnet: ****[new VToken implementations](https://testnet.bscscan.com/address/0x8d79C8f4400fE68Fd17040539FE5e1706c1f2850)

**References**

- [Pull request with the new VToken contracts](https://github.com/VenusProtocol/venus-protocol/pull/262)
- [Simulation post upgrade](https://github.com/VenusProtocol/vips/pull/67)
- [Testnet deployment](https://testnet.bscscan.com/tx/0x01fd5a980e9b2c3d627aaba81c5f08d9c8539355201f48597cdb9cf796cef4e1)
- [Documentation](https://docs-v4.venus.io/technical-reference/reference-technical-articles/automatic-income-allocation)`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with this proposal or not",
  };

  return makeProposal(
    [
      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setReduceReservesBlockDelta(uint256)", NORMAL_TIMELOCK],
      },

      ...CORE_MARKETS.map(asset => {
        return {
          target: asset.address,
          signature: "_setImplementation(address,bool,bytes)",
          params: [NEW_VBEP20_DELEGATE_IMPL, false, "0x"],
        };
      }),

      ...CORE_MARKETS.map(asset => {
        return {
          target: asset.address,
          signature: "setAccessControlManager(address)",
          params: [ACCESS_CONTROL_MANAGER],
        };
      }),

      ...CORE_MARKETS.map(asset => {
        return {
          target: asset.address,
          signature: "setReduceReservesBlockDelta(uint256)",
          params: [asset.reduceReservesBlockDelta],
        };
      }),

      ...CORE_MARKETS.map(asset => {
        return {
          target: asset.address,
          signature: "setProtocolShareReserve(address)",
          params: [PROTOCOL_SHARE_RESERVE],
        };
      }),
    ],
    meta,
    ProposalType.REGULAR,
  );
};
