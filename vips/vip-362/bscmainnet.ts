import { parseUnits } from "ethers/lib/utils";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const vUNI = "0x27FF564707786720C71A2e5c1490A63266683612";
export const vDOGE = "0xec3422Ef92B2fb59e84c8B02Ba73F1fE84Ed8D71";
export const vFLOKI = "0xc353B7a1E13dDba393B5E120D4169Da7185aA2cb";
export const UNITROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
export const GAMEFI_COMPTROLLER = "0x1b43ea8622e76627B81665B1eCeBB4867566B963";
export const vUNI_SUPPLY_CAP = parseUnits("900000", 18);
export const vDOGE_SUPPLY_CAP = parseUnits("120000000", 8);
export const vFLOKI_BORROW_CAP = parseUnits("4000000000", 9);

const vip362 = () => {
  const meta = {
    version: "v2",
    title: "VIP-362 Risk Parameters Adjustments (PT-weETH-DEC24, UNI, DOGE and FLOKI)",
    description: `If passed, this VIP will perform the changes recommended by Chaos Labs in these Venus community forum publications:

- [Chaos Labs - Risk Parameter Update - 08/29/24](https://community.venus.io/t/chaos-labs-risk-parameter-update-08-29-24/4543)
- [Chaos Labs - Risk Parameter Updates - 09/03/24](https://community.venus.io/t/chaos-labs-risk-parameter-updates-09-03-24/4547)

Changes:
- BNB chain
  - [UNI (Core pool)](https://bscscan.com/address/0x27FF564707786720C71A2e5c1490A63266683612): increase supply cap from 600,000 to 900,000
  - [DOGE (Core pool)](https://bscscan.com/address/0xec3422Ef92B2fb59e84c8B02Ba73F1fE84Ed8D71): increase supply cap from 80,000,000 to 120,000,000
  - [FLOKI (GameFi pool)](https://bscscan.com/address/0xc353B7a1E13dDba393B5E120D4169Da7185aA2cb): increase borrow cap from 2,000,000,000 to 4,000,000,000
- Ethereum
  - [PT-wETH-26DEC2024 (Liquid Staked ETH)](https://etherscan.io/address/0x76697f8eaeA4bE01C678376aAb97498Ee8f80D5C): increase supply cap from 2,400 to 5,000

Complete analysis and details of these recommendations are available in the above publications.

VIP simulation: [https://github.com/VenusProtocol/vips/pull/375](https://github.com/VenusProtocol/vips/pull/375)

#### Disclaimer for Ethereum commands

Privilege commands on Ethereum will be executed by the [Guardian wallet](https://etherscan.io/address/0x285960C5B22fD66A736C7136967A3eB15e93CC67), until the [Multichain Governance](https://docs-v4.venus.io/technical-reference/reference-technical-articles/multichain-governance) contracts are fully enabled. If this VIP passes, [this](https://app.safe.global/transactions/tx?safe=eth:0x285960C5B22fD66A736C7136967A3eB15e93CC67&id=multisig_0x285960C5B22fD66A736C7136967A3eB15e93CC67_0x6382bf2136d0d5bb521a1cd3b79ab9ae411468a78b545e4c7b2ff73e7f7ea773) multisig transaction will be executed. Otherwise, it will be rejected.`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: UNITROLLER,
        signature: "_setMarketSupplyCaps(address[],uint256[])",
        params: [
          [vUNI, vDOGE],
          [vUNI_SUPPLY_CAP, vDOGE_SUPPLY_CAP],
        ],
      },
      {
        target: GAMEFI_COMPTROLLER,
        signature: "setMarketBorrowCaps(address[],uint256[])",
        params: [[vFLOKI], [vFLOKI_BORROW_CAP]],
      },
    ],
    meta,
    ProposalType.FAST_TRACK,
  );
};

export default vip362;
