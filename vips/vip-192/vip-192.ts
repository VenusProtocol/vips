import { ethers } from "hardhat";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const NEW_VBEP20_DELEGATE_IMPL = "0xc3279442a5aCaCF0A2EcB015d1cDDBb3E0f3F775";
const ACCESS_CONTROL_MANAGER = "0x4788629ABc6cFCA10F9f969efdEAa1cF70c23555";
const FAST_TRACK_TIMELOCK = "0x555ba73dB1b006F3f2C7dB7126d6e4343aDBce02";
const CRITICAL_TIMELOCK = "0x213c446ec11e45b15a6E29C1C1b402B8897f606d";
const PROTOCOL_SHARE_RESERVE = "0xCa01D5A9A248a830E9D93231e791B1afFed7c446";
const COMPTROLLER = "0xfd36e2c2a6789db23113685031d7f16329158384";
const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";

interface AssetConfig {
  name: string;
  address: string;
  reduceReservesBlockDelta: number;
  holder: string; // Used by the simulation
}

export const CORE_MARKETS: AssetConfig[] = [
  {
    name: "vTRXOLD",
    address: "0x61eDcFe8Dd6bA3c891CB9bEc2dc7657B3B422E93",
    reduceReservesBlockDelta: 28800,
    holder: "0xe2fc31F816A9b94326492132018C3aEcC4a93aE1",
  },
  {
    name: "vTUSDOLD",
    address: "0x08CEB3F4a7ed3500cA0982bcd0FC7816688084c3",
    reduceReservesBlockDelta: 28800,
    holder: "0x8894E0a0c962CB723c1976a4421c95949bE2D4E3",
  },
];

export const vip192 = () => {
  const meta = {
    version: "v2",
    title: "VIP-192 Automatic income allocation: deployment stage 2 - vTRXOLD and vTUSDOLD",
    description: `#### Summary

If passed, this VIP will upgrade the implementation of the [vTRXOLD](https://bscscan.com/address/0x61eDcFe8Dd6bA3c891CB9bEc2dc7657B3B422E93) and [vTUSDOLD](https://bscscan.com/address/0x08CEB3F4a7ed3500cA0982bcd0FC7816688084c3) markets in the Core pool, enabling the [Automatic Income Allocation](https://docs-v4.venus.io/technical-reference/reference-technical-articles/automatic-income-allocation) in those markets. Moreover, it will allow Fast track and Critical VIP’s to be proposed in the future to adjust several risk parameters.

#### Description

This VIP is part of the proposal [Automatic Income Allocation & Token Converter](https://community.venus.io/t/automatic-income-allocation-token-converter/3702), published in the Venus community forum. It’s part of the deployment plan started with the [VIP-189](https://app.venus.io/#/governance/proposal/189).

- The new implementation pushes market reserves of the two affected markets automatically to the [ProtocolShareReserve](https://bscscan.com/address/0xCa01D5A9A248a830E9D93231e791B1afFed7c446) contract after 28,800 blocks (24 hours on BNB chain). These reserves are distributed following the [protocol tokenomics](https://docs-v4.venus.io/governance/tokenomics):
    - 40% to the RiskFund contract
    - 40% to the [Venus Treasury](https://bscscan.com/address/0xf322942f644a996a617bd29c16bd7d231d9f35e9) contract
    - 10% to the Venus Prime Program. This 10% will be sent temporarily to the Venus Treasury, until the Venus Prime contract is ready.
    - 10% for the XVS Vault rewards. This 10% will be sent temporarily to the Venus Treasury, until the [Token Converter contracts](https://community.venus.io/t/automatic-income-allocation-token-converter/3702) are ready.
- From now on, Fast-track and Critical VIP’s will be able to perform the following actions on the vTRXOLD and vTUSDOLD markets:
    - Update reserve factor
    - Update the interest rate model
    - Update collateral factor
    - Update borrow and supply caps
    - Pause/resume the full protocol or a specific action in one market

There will be two more VIP’s for this second stage of the Automatic Income Allocation deployment, proposed in the following days. In those VIP’s, the remaining markets of the Core pool and the markets of the Isolated pools will be upgraded to enable the Automatic Income Allocation.

**Security and additional considerations**

We applied the following security procedures for this upgrade:

- **Markets behavior post upgrade**: in a simulation environment, validating in the upgraded contracts the main operations (supply, borrow, repay and redeem) and the storage layout after the VIP
- **Automatic reduction of the reserves**: in a simulation environment, validating the TUSDOLD and TRXOLD reserves are sent as expected to the ProtocolShareReserve
- **Deployment on testnet**: the same VIP was proposed and executed on testnet, and the upgraded contracts are used in the Venus Protocol testnet deployment
- **Audit: Quantstamp, Certik, Peckshield and Fairyproof have audited the deployed code**

**Audit reports**

- [Quantstamp audit report (2023/09/13)](https://github.com/VenusProtocol/venus-protocol/blob/9ef8901dfef84a11338751881fd10a2d36c576ad/audits/058_automatic_income_allocation_quantstamp_20230913.pdf)
- [Certik audit audit report (2023/09/12)](https://github.com/VenusProtocol/venus-protocol/blob/90f913fd345c24c60efa613ab5ab7e633b7aa07a/audits/059_automatic_income_allocation_certik_20230912.pdf)
- [Peckshield audit report (2023/08/12)](https://github.com/VenusProtocol/venus-protocol/blob/90f913fd345c24c60efa613ab5ab7e633b7aa07a/audits/054_automatic_income_allocation_peckshield_20230812.pdf)
- [Fairyproof audit report (2023/08/03)](https://github.com/VenusProtocol/venus-protocol/blob/90f913fd345c24c60efa613ab5ab7e633b7aa07a/audits/050_automatic_income_allocation_fairyproof_20230803.pdf)

**Deployed contracts**

- Mainnet: ****[new vTRXOLD and vTUSDOLD implementations](https://bscscan.com/address/0xc3279442a5aCaCF0A2EcB015d1cDDBb3E0f3F775)
- Testnet: ****[new vTRXOLD and vTUSDOLD implementations](https://testnet.bscscan.com/address/0x8d79C8f4400fE68Fd17040539FE5e1706c1f2850)

**References**

- [Pull request with the new VToken contracts](https://github.com/VenusProtocol/venus-protocol/pull/262)
- [Simulation post upgrade](https://github.com/VenusProtocol/vips/pull/67)
- [Testnet deployment](https://testnet.bscscan.com/tx/0x710421181c38b08072dff6ff49806f4bd0492bf920adfb64785b83f72e86c57c)
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

      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "_setReserveFactor(uint256)", NORMAL_TIMELOCK],
      },

      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "_setInterestRateModel(address)", NORMAL_TIMELOCK],
      },

      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "_reduceReserves(uint256)", NORMAL_TIMELOCK],
      },

      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setReduceReservesBlockDelta(uint256)", FAST_TRACK_TIMELOCK],
      },

      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setReduceReservesBlockDelta(uint256)", CRITICAL_TIMELOCK],
      },

      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "_setReserveFactor(uint256)", FAST_TRACK_TIMELOCK],
      },

      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "_setReserveFactor(uint256)", CRITICAL_TIMELOCK],
      },

      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "_setInterestRateModel(address)", FAST_TRACK_TIMELOCK],
      },

      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "_setInterestRateModel(address)", CRITICAL_TIMELOCK],
      },

      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "_reduceReserves(uint256)", FAST_TRACK_TIMELOCK],
      },

      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "_reduceReserves(uint256)", CRITICAL_TIMELOCK],
      },

      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [COMPTROLLER, "_setCollateralFactor(address,uint256)", FAST_TRACK_TIMELOCK],
      },

      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [COMPTROLLER, "_setCollateralFactor(address,uint256)", CRITICAL_TIMELOCK],
      },

      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [COMPTROLLER, "_setMarketBorrowCaps(address[],uint256[])", FAST_TRACK_TIMELOCK],
      },

      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [COMPTROLLER, "_setMarketBorrowCaps(address[],uint256[])", CRITICAL_TIMELOCK],
      },

      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [COMPTROLLER, "_setMarketSupplyCaps(address[],uint256[])", FAST_TRACK_TIMELOCK],
      },

      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [COMPTROLLER, "_setMarketSupplyCaps(address[],uint256[])", CRITICAL_TIMELOCK],
      },

      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [COMPTROLLER, "_setProtocolPaused(bool)", FAST_TRACK_TIMELOCK],
      },

      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [COMPTROLLER, "_setProtocolPaused(bool)", CRITICAL_TIMELOCK],
      },

      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [COMPTROLLER, "_setActionsPaused(address[],uint8[],bool)", FAST_TRACK_TIMELOCK],
      },

      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [COMPTROLLER, "_setActionsPaused(address[],uint8[],bool)", CRITICAL_TIMELOCK],
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
