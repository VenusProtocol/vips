import { parseUnits } from "ethers/lib/utils";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const ETHEREUM_CORE_COMPTROLLER = "0x687a01ecF6d3907658f7A7c714749fAC32336D1B";
export const GAMEFI_COMPTROLLER = "0x1b43ea8622e76627B81665B1eCeBB4867566B963";
export const BNB_CHAIN_vFLOKI = "0xc353B7a1E13dDba393B5E120D4169Da7185aA2cb";
export const ETHEREUM_vweETHs_CORE = "0xc42E4bfb996ED35235bda505430cBE404Eb49F77";
export const FLOKI_BORROW_CAP = parseUnits("16000000000", 9);
export const WEETHS_SUPPLY_CAP = parseUnits("1400", 18);

const vip453 = () => {
  const meta = {
    version: "v2",
    title: "VIP-453 [BNB Chain][Ethereum][Unichain] Risk Parameters Adjustments (FLOKI, weETHs, WETH)",
    description: `If passed, this VIP will perform the changes recommended by Chaos Labs in the Venus community forum publications [Chaos Labs - Risk Parameter Update - 2/15/25](https://community.venus.io/t/chaos-labs-risk-parameter-update-2-15-25/4903) and [Chaos Labs - Risk Parameter Updates - 02/17/25](https://community.venus.io/t/chaos-labs-risk-parameter-updates-02-17-25/4929).

- [FLOKI on BNB Chain (GameFi pool)](https://bscscan.com/address/0xc353B7a1E13dDba393B5E120D4169Da7185aA2cb): increase borrow cap from 8,000,000,000 FLOKI to 16,000,000,000 FLOKI
- [weETHs on Ethereum (Core pool)](https://etherscan.io/address/0xc42E4bfb996ED35235bda505430cBE404Eb49F77): increase supply cap from 700 weETHs to 1,400 weETHs
- [WETH on Unichain (Core pool)](https://uniscan.xyz/address/0xc219BC179C7cDb37eACB03f993f9fDc2495e3374): increase supply cap from 350 WETH to 700 WETH

Complete analysis and details of these recommendations are available in the above publications.

**References**

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/503)

**Disclaimer for Unichain VIPs**

Privilege commands on Unichain will be executed by the [](https://etherscan.io/address/0x285960C5B22fD66A736C7136967A3eB15e93CC67)[Guardian wallet](https://uniscan.xyz/address/0x1803Cf1D3495b43cC628aa1d8638A981F8CD341C), until the [Multichain Governance](https://docs-v4.venus.io/technical-reference/reference-technical-articles/multichain-governance) contracts are fully enabled. If this VIP passes, [](https://app.safe.global/transactions/tx?safe=eth:0x285960C5B22fD66A736C7136967A3eB15e93CC67&id=multisig_0x285960C5B22fD66A736C7136967A3eB15e93CC67_0x79ca5d7ef82648f5c52054aa996356da270a60e95a959c595ee3c29defc6a4ca)[this](https://app.safe.global/transactions/tx?safe=unichain:0x1803Cf1D3495b43cC628aa1d8638A981F8CD341C&id=multisig_0x1803Cf1D3495b43cC628aa1d8638A981F8CD341C_0xd57d514c076f382221125939b3c5b36eaa2cc103e5b59684ed0b31a0e3d2b9f8) multisig transaction will be executed. Otherwise, it will be rejected.`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: GAMEFI_COMPTROLLER,
        signature: "setMarketBorrowCaps(address[],uint256[])",
        params: [[BNB_CHAIN_vFLOKI], [FLOKI_BORROW_CAP]],
      },
      {
        target: ETHEREUM_CORE_COMPTROLLER,
        signature: "setMarketSupplyCaps(address[],uint256[])",
        params: [[ETHEREUM_vweETHs_CORE], [WEETHS_SUPPLY_CAP]],
        dstChainId: LzChainId.ethereum,
      },
    ],
    meta,
    ProposalType.CRITICAL,
  );
};

export default vip453;
