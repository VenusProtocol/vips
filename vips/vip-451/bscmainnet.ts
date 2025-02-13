import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const TRANSFERS = [
  {
    name: "yvUSDC-1",
    token: "0xBe53A109B494E5c9f97b9Cd39Fe969BE68BF6204",
    amount: parseUnits("9533.021607", 6),
  },
  {
    name: "yvUSDT-1",
    token: "0x310B7Ea7475A0B449Cfd73bE81522F1B88eFAFaa",
    amount: parseUnits("8321.541317", 6),
  },
  {
    name: "yvUSDS-1",
    token: "0x182863131F9a4630fF9E27830d945B1413e347E8",
    amount: parseUnits("9723.178564012393153016", 18),
  },
  {
    name: "yvWETH-1",
    token: "0xc56413869c6CDf96496f2b1eF801fEDBdFA7dDB0",
    amount: parseUnits("3.920893913355987542", 18),
  },
];

export const RECIPIENT = "0x16388463d60FFE0661Cf7F1f31a7D658aC790ff7";

export const vip451 = () => {
  const meta = {
    version: "v2",
    title: "VIP-451 [Ethereum] Return surplus bootstrap liquidity of Yearn.fi markets",
    description: `If passed, this VIP will transfer the following funds from the [Venus Treasury on Ethereum](https://etherscan.io/address/0xFD9B071168bC27DBE16406eC3Aba050Ce8Eb22FA) to the [Yearn.fi team](https://etherscan.io/address/0x16388463d60FFE0661Cf7F1f31a7D658aC790ff7):

- 9,533.021607 [yvUSDC-1](https://etherscan.io/address/0xBe53A109B494E5c9f97b9Cd39Fe969BE68BF6204)
- 8,321.541317 [yvUSDT-1](https://etherscan.io/address/0x310B7Ea7475A0B449Cfd73bE81522F1B88eFAFaa)
- 9,723.178564012393153016 [yvUSDS-1](https://etherscan.io/address/0x182863131F9a4630fF9E27830d945B1413e347E8)
- 3.920893913355987542 [yvWETH-1](https://etherscan.io/address/0xc56413869c6CDf96496f2b1eF801fEDBdFA7dDB0)

The bootstrap liquidity for the Yearn.fi markets (see [VIP-445](https://app.venus.io/#/governance/proposal/445?chainId=56) and [VIP-447](https://app.venus.io/#/governance/proposal/447?chainId=56)) has been sent twice, to the [Venus Treasury](https://etherscan.io/address/0xFD9B071168bC27DBE16406eC3Aba050Ce8Eb22FA) and the [Normal Timelock](https://etherscan.io/address/0xd969E79406c35E80750aAae061D402Aab9325714) on Ethereum. The bootstrap liquidity sent to the Normal Timelock will be used, and the tokens sent to the Venus Treasury won’t, so this VIP will return them to the provider (the [Yearn.fi team](https://etherscan.io/address/0x16388463d60FFE0661Cf7F1f31a7D658aC790ff7)).

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/495)
- [VIP-445 [Ethereum] New Yearn markets in the Core pool (yvUSDC-1, yvUSDT-1, yvUSDS-1)](https://app.venus.io/#/governance/proposal/445?chainId=56)
- [VIP-447 [Ethereum] New yvWETH-1 market in the Core pool](https://app.venus.io/#/governance/proposal/447?chainId=56)
- [Transaction where the funds were sent to the Venus Treasury](https://etherscan.io/tx/0x2c4c26eb45bf3d5ac9dc2d62fbcabacf275e40d2b09240e63511f3f36819d224)
- [Transaction where the funds were sent to the Normal Timelock](https://etherscan.io/tx/0x970d3297638de30d39644e3fd3d329d8f021d5472e5ed562d7dee4d8b2e51078)`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      ...TRANSFERS.map(transfer => ({
        target: NETWORK_ADDRESSES["ethereum"].VTREASURY,
        signature: "withdrawTreasuryToken(address,uint256,address)",
        params: [transfer.token, transfer.amount, RECIPIENT],
        dstChainId: LzChainId.ethereum,
      })),
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip451;
