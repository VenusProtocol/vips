import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const ACM = "0x4788629ABc6cFCA10F9f969efdEAa1cF70c23555";

const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
const FAST_TRACK_TIMELOCK = "0x555ba73dB1b006F3f2C7dB7126d6e4343aDBce02";
const CRITICAL_TIMELOCK = "0x213c446ec11e45b15a6E29C1C1b402B8897f606d";
const PAUSE_GUARDIAN = "0x1C2CAc6ec528c20800B2fe734820D87b581eAA6B";
const MANAGER = "0x7B1AE5Ea599bC56734624b95589e7E8E64C351c9";

const SHORTFALL = "0xf37530A8a810Fcb501AA0Ecd0B0699388F0F2209";
const RISK_FUND = "0xdF31a28D68A2AB381D42b380649Ead7ae2A76E42";
const PROTOCOL_SHARE_RESERVE = "0xfB5bE09a1FA6CFDA075aB1E69FE83ce8324682e4";

const vTokens = {
  vHAY_Stablecoins: "0xCa2D81AA7C09A1a025De797600A7081146dceEd9",
  vUSDT_Stablecoins: "0x5e3072305F9caE1c7A82F6Fe9E38811c74922c3B",
  vUSDD_Stablecoins: "0xc3a45ad8812189cAb659aD99E64B1376f6aCD035",

  vALPACA_DeFi: "0x02c5Fb0F26761093D297165e902e96D08576D344",
  vANKR_DeFi: "0x19CE11C8817a1828D1d357DFBF62dCf5b0B2A362",
  vUSDT_DeFi: "0x1D8bBDE12B6b34140604E18e9f9c6e14deC16854",
  vBSW_DeFi: "0x8f657dFD3a1354DEB4545765fE6840cc54AFd379",
  vUSDD_DeFi: "0xA615467caE6B9E0bb98BC04B4411d9296fd1dFa0",
  vankrBNB_DeFi: "0x53728FD51060a85ac41974C6C3Eb1DaE42776723",
  vTWT_DeFi: "0x736bf1D21A28b5DC19A1aC8cA71Fc2856C23c03F",

  vFLOKI_GameFi: "0xc353B7a1E13dDba393B5E120D4169Da7185aA2cb",
  vRACA_GameFi: "0xE5FE5527A5b76C75eedE77FdFA6B80D52444A465",
  vUSDD_GameFi: "0x9f2FD23bd0A5E08C5f2b9DD6CF9C96Bfb5fA515C",
  vUSDT_GameFi: "0x4978591f17670A846137d9d613e333C38dc68A37",

  vBNBx_LiquidStakedBNB: "0x5E21bF67a6af41c74C1773E4b473ca5ce8fd3791",
  vWBNB_LiquidStakedBNB: "0xe10E80B7FD3a29fE46E16C30CC8F4dd938B742e2",
  vankrBNB_LiquidStakedBNB: "0xBfe25459BA784e70E2D7a718Be99a1f3521cA17f",
  vstkBNB_LiquidStakedBNB: "0xcc5D9e502574cda17215E70bC0B4546663785227",

  vBTT_Tron: "0x49c26e12959345472E2Fd95E5f79F8381058d3Ee",
  vTRX_Tron: "0x836beb2cB723C498136e1119248436A645845F4E",
  vUSDD_Tron: "0xf1da185CCe5BeD1BeBbb3007Ef738Ea4224025F7",
  vUSDT_Tron: "0x281E5378f99A4bc55b295ABc0A3E7eD32Deba059",
  vWIN_Tron: "0xb114cfA615c828D88021a41bFc524B800E64a9D5",
};

const grant = (target: string, signature: string, caller: string) => ({
  target: ACM,
  signature: "giveCallPermission(address,string,address)",
  params: [target, signature, caller],
});

const acceptOwnership = () => {
  return [SHORTFALL, RISK_FUND, PROTOCOL_SHARE_RESERVE].map(target => ({
    target: target,
    signature: "acceptOwnership()",
    params: [],
  }));
};

const configureAccessControls = () => [
  grant(RISK_FUND, "setMinAmountToConvert(uint256)", NORMAL_TIMELOCK),
  grant(RISK_FUND, "setMinAmountToConvert(uint256)", FAST_TRACK_TIMELOCK),
  grant(RISK_FUND, "setMinAmountToConvert(uint256)", CRITICAL_TIMELOCK),
  grant(RISK_FUND, "swapPoolsAssets(address[],uint256[],address[][],uint256)", MANAGER),

  grant(SHORTFALL, "updateNextBidderBlockLimit(uint256)", NORMAL_TIMELOCK),
  grant(SHORTFALL, "updateNextBidderBlockLimit(uint256)", FAST_TRACK_TIMELOCK),
  grant(SHORTFALL, "updateNextBidderBlockLimit(uint256)", CRITICAL_TIMELOCK),

  grant(SHORTFALL, "updateIncentiveBps(uint256)", NORMAL_TIMELOCK),
  grant(SHORTFALL, "updateIncentiveBps(uint256)", FAST_TRACK_TIMELOCK),
  grant(SHORTFALL, "updateIncentiveBps(uint256)", CRITICAL_TIMELOCK),

  grant(SHORTFALL, "updateMinimumPoolBadDebt(uint256)", NORMAL_TIMELOCK),
  grant(SHORTFALL, "updateMinimumPoolBadDebt(uint256)", FAST_TRACK_TIMELOCK),
  grant(SHORTFALL, "updateMinimumPoolBadDebt(uint256)", CRITICAL_TIMELOCK),

  grant(SHORTFALL, "updateWaitForFirstBidder(uint256)", NORMAL_TIMELOCK),
  grant(SHORTFALL, "updateWaitForFirstBidder(uint256)", FAST_TRACK_TIMELOCK),
  grant(SHORTFALL, "updateWaitForFirstBidder(uint256)", CRITICAL_TIMELOCK),

  grant(SHORTFALL, "pauseAuctions()", NORMAL_TIMELOCK),
  grant(SHORTFALL, "pauseAuctions()", FAST_TRACK_TIMELOCK),
  grant(SHORTFALL, "pauseAuctions()", CRITICAL_TIMELOCK),
  grant(SHORTFALL, "pauseAuctions()", PAUSE_GUARDIAN),

  grant(SHORTFALL, "resumeAuctions()", NORMAL_TIMELOCK),
  grant(SHORTFALL, "resumeAuctions()", FAST_TRACK_TIMELOCK),
  grant(SHORTFALL, "resumeAuctions()", CRITICAL_TIMELOCK),
  grant(SHORTFALL, "resumeAuctions()", PAUSE_GUARDIAN),
];

export const vip170 = () => {
  const meta = {
    version: "v2",
    title: "VIP-170 Risk fund foundation",
    description: `#### Summary

If passed, this VIP will set the ProtocolShareReserve and Shortfall contracts to be used on each market of the Isolated Pools. It also configures the RiskFund contract, that will provide to the Shortfall contract the funds to be auctioned, to cover any future bad debt (in case any are generated) in the markets of the Isolated Pools.

This VIP enables the Stage 1 described in the following [community post](https://community.venus.io/t/risk-fund-and-shortfall-handling-module-deployment/3748).

#### Description

This VIP sets the **ProtocolShareReserve** and **Shortfall** contracts in every current market in Isolated Pools. The ProtocolShareReserve contract is the contract where the reserves are sent from a market when they are withdrawn. Until now, the configured target of the reserves of Isolated Pools was the [Venus Treasury](https://bscscan.com/address/0xf322942f644a996a617bd29c16bd7d231d9f35e9).

The new ProtocolShareReserve contract will distribute the received reserves following the [Venus Tokenomics](https://docs-v4.venus.io/governance/tokenomics); 50% of the reserves withdrawn from the markets in the Isolated Pools will be sent to the **RiskFund** contract. Remaining funds will be sent to the Venus Treasury.

If the conditions to perform an auction of the bad debt in any of the Isolated Pools are satisfied, the funds held by the RiskFund contract will be used by the Shortfall contract to auction them, getting tokens to reduce the associated bad debt. These auctions can be initiated and participated in a permissionless fashion.

Main parameters in the Shortfall contract and the values initially set:

* Minimum USD bad debt in the pool to allow the initiation of an auction. Initial value: 1,000 USD
* Blocks to wait for the first bidder. Initial value: 100 blocks
* Time to wait for the next bidder. Initial value: 100 blocks
* Incentive to auction participants. Initial value: 1000 bps (or 10%)

Expected operational tasks:

* Funds will be sent from the markets to the ProtocolShareReserve contract, invoking the _reduceReserves_ function on each market. Anyone can do this, at any moment.
* Funds will be distributed from the ProtocolShareReserve, sending part of it to the RiskFund contract, invoking the _releaseFunds_ function on the ProtocolShareReserve contract. Anyone can do this, at any moment.
* The manager address will swap the tokens received in the RiskFund contract for USDT

There will be more VIPs in the future to enable the rest of the stages described in this [community post](https://community.venus.io/t/risk-fund-and-shortfall-handling-module-deployment/3748). The allocation of the income generated in the Core pool is more complex. As soon as the “Automatic income allocation” release is ready, a VIP will be proposed to upgrade the ProtocolShareReserve contract and link the markets from the Core pool, so the risk fund will automatically be fed with the right amount of funds from all the Venus markets (Isolated Pools and Core pool).

Finally, this VIP will authorize Normal, Fast-track and Critical timelocks to configure the risk parameters of the Shortfall and RiskFund contracts. The guardian address is also authorized to pause and resume auctions in the Shortfall contract. The manager address is authorized to swap the tokens received in the RiskFund for USDT, using PancakeSwap V2 for it.

#### Security and additional considerations

We applied the following security procedures for this upgrade:

* **Configuration post upgrade**: in a simulation environment, validating every contract is properly set after the VIP
* **Fork tests**: in a simulation environment, validating the RiskFund, ProtocolShareReserve and Shortfall contracts work as expected
* **Deployment on testnet**: the same configuration has been [deployed to testnet](https://testnet.bscscan.com/tx/0x5b4f35529ccabfedeac5db1eea9385ab63a804c14f68c5e99a47ba96b6281f76), and used in the Venus Protocol testnet deployment
* **Audit:** the deployed and configured contracts were in the scope of the audits done before the launch of Isolated Pools in the [VIP-134](https://app.venus.io/#/governance/proposal/134). Apart from those audits, the following specific audits have been done
    * [Certik audit report (2023/August/24)](https://github.com/VenusProtocol/isolated-pools/blob/1116c02c253e82cb0483afc47fb1fa104152601e/audits/061_riskFundShortfall_certik_20230824.pdf)
    * [Peckshield audit report (2023/August/25)](https://github.com/VenusProtocol/isolated-pools/blob/1116c02c253e82cb0483afc47fb1fa104152601e/audits/062_riskFundShortfall_peckshield_20230825.pdf)

#### Deployed contracts to mainnet

* [ProtocolShareReserve](https://bscscan.com/address/0xfB5bE09a1FA6CFDA075aB1E69FE83ce8324682e4)
* [Shortfall](https://bscscan.com/address/0xf37530A8a810Fcb501AA0Ecd0B0699388F0F2209)
* [RiskFund](https://bscscan.com/address/0xdF31a28D68A2AB381D42b380649Ead7ae2A76E42)

#### Deployed contracts to testnet

* [ProtocolShareReserve](https://testnet.bscscan.com/address/0xc987a03ab6C2A5891Fc0919f021cc693B5E55278)
* [Shortfall](https://testnet.bscscan.com/address/0x503574a82fE2A9f968d355C8AAc1Ba0481859369)
* [RiskFund](https://testnet.bscscan.com/address/0x487CeF72dacABD7E12e633bb3B63815a386f7012)

#### References

* [Repository](https://github.com/VenusProtocol/isolated-pools)
* [Simulation post upgrade](https://github.com/VenusProtocol/vips/pull/59)
* [Documentation](https://docs-v4.venus.io/risk/risk-fund-and-shortfall-handling)
* Fork tests: [Shortfall](https://github.com/VenusProtocol/isolated-pools/tree/develop/tests/hardhat/Fork/Shortfall.ts), [RiskFund](https://github.com/VenusProtocol/isolated-pools/tree/develop/tests/hardhat/Fork/RiskFund.ts), [RiskFund swaps](https://github.com/VenusProtocol/isolated-pools/tree/develop/tests/hardhat/Fork/RiskFundSwap.ts), [reduce reserves](https://github.com/VenusProtocol/isolated-pools/tree/develop/tests/hardhat/Fork/reduceReservesTest.ts)
* Community post: [Risk Fund and Shortfall Handling Module Deployment](https://community.venus.io/t/risk-fund-and-shortfall-handling-module-deployment/3748)
`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      ...acceptOwnership(),
      ...configureAccessControls(),
      ...Object.values(vTokens).flatMap(vToken => [
        {
          target: vToken,
          signature: "setShortfallContract(address)",
          params: [SHORTFALL],
        },
        {
          target: vToken,
          signature: "setProtocolShareReserve(address)",
          params: [PROTOCOL_SHARE_RESERVE],
        },
      ]),
    ],
    meta,
    ProposalType.REGULAR,
  );
};
