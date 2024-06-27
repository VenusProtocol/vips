import { parseUnits } from "ethers/lib/utils";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const GAME_FI_COMPTROLLER = "0x1b43ea8622e76627B81665B1eCeBB4867566B963";
export const GAME_FI_VUSDT = "0x4978591f17670A846137d9d613e333C38dc68A37";
export const CORE_COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
export const CORE_VXVS = "0x151B1e2635A717bcDc836ECd6FbB62B674FE3E1D";
export const CORE_VFDUSD = "0xC4eF4229FEc74Ccfe17B2bdeF7715fAC740BA0ba";

export const GAME_FI_VUSDT_SUPPLY_CAP = parseUnits("3000000", 18);
export const GAME_FI_VUSDT_BORROW_CAP = parseUnits("2800000", 18);
export const CORE_VXVS_SUPPLY_CAP = parseUnits("1850000", 18);
export const CORE_VFDUSD_SUPPLY_CAP = parseUnits("45000000", 18);
export const CORE_VFDUSD_BORROW_CAP = parseUnits("40000000", 18);

const vip303 = () => {
  const meta = {
    version: "v2",
    title: "VIP-303 Risk Parameters Adjustments (USDT, weETH, XVS, FDUSD)",
    description: `This VIP will perform the following Risk Parameter actions as per Chaos Labs’ latest recommendations in this Venus community forum publication: [Chaos Labs - Risk Parameter Updates - 05/07/24](https://community.venus.io/t/chaos-labs-risk-parameter-updates-05-07-24/4311).

**BNB Chain**

- [XVS (Core pool)](https://bscscan.com/address/0x151B1e2635A717bcDc836ECd6FbB62B674FE3E1D)
    - Increase supply cap, from 1.75M to 1.85M XVS
- [FDUSD (Core pool)](https://bscscan.com/address/0xC4eF4229FEc74Ccfe17B2bdeF7715fAC740BA0ba)
    - Increase supply cap, from 40M to 45M FDUSD
    - Increase borrow cap, from 34M to 40M FDUSD
- [USDT (GameFi)](https://bscscan.com/address/0x4978591f17670A846137d9d613e333C38dc68A37)
    - Increase supply cap, from 2M to 3M USDT
    - Increase borrow cap, from 1.9M to 2.8M USDT

**Ethereum**

- [weETH (Liquid Staked ETH pool)](https://etherscan.io/address/0xb4933AF59868986316Ed37fa865C829Eba2df0C7)
    - Increase borrow cap, from 750 to 1.5K weETH

Complete analysis and details of these recommendations are available in the above publication.

VIP simulation: [https://github.com/VenusProtocol/vips/pull/278](https://github.com/VenusProtocol/vips/pull/278)

#### Disclaimer for Ethereum VIPs

Privilege commands on Ethereum will be executed by the [Guardian wallet](https://etherscan.io/address/0x285960C5B22fD66A736C7136967A3eB15e93CC67), until the [Multichain Governance](https://docs-v4.venus.io/technical-reference/reference-technical-articles/multichain-governance) contracts are deployed. If this VIP passes, [this](https://app.safe.global/transactions/tx?safe=eth:0x285960C5B22fD66A736C7136967A3eB15e93CC67&id=multisig_0x285960C5B22fD66A736C7136967A3eB15e93CC67_0x79ca5d7ef82648f5c52054aa996356da270a60e95a959c595ee3c29defc6a4ca) multisig transaction will be executed. Otherwise, it will be rejected.`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with this proposal",
  };

  return makeProposal(
    [
      {
        target: GAME_FI_COMPTROLLER,
        signature: "setMarketSupplyCaps(address[],uint256[])",
        params: [[GAME_FI_VUSDT], [GAME_FI_VUSDT_SUPPLY_CAP]],
      },
      {
        target: GAME_FI_COMPTROLLER,
        signature: "setMarketBorrowCaps(address[],uint256[])",
        params: [[GAME_FI_VUSDT], [GAME_FI_VUSDT_BORROW_CAP]],
      },
      {
        target: CORE_COMPTROLLER,
        signature: "_setMarketSupplyCaps(address[],uint256[])",
        params: [
          [CORE_VXVS, CORE_VFDUSD],
          [CORE_VXVS_SUPPLY_CAP, CORE_VFDUSD_SUPPLY_CAP],
        ],
      },
      {
        target: CORE_COMPTROLLER,
        signature: "_setMarketBorrowCaps(address[],uint256[])",
        params: [[CORE_VFDUSD], [CORE_VFDUSD_BORROW_CAP]],
      },
    ],
    meta,
    ProposalType.FAST_TRACK,
  );
};

export default vip303;
