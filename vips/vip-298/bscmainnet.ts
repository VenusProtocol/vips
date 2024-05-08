import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

export const GAMEFI_COMPTROLLER = "0x1b43ea8622e76627B81665B1eCeBB4867566B963";
export const COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
export const vUSDT_GAMEFI = "0x4978591f17670A846137d9d613e333C38dc68A37";
export const vUNI = "0x27FF564707786720C71A2e5c1490A63266683612";
export const vCAKE = "0x86aC3974e2BD0d60825230fa6F355fF11409df5c";
export const SUPPLY_CAP_USDT_GAMEFI = parseUnits("2000000", 18);
export const SUPPLY_CAP_UNI = parseUnits("500000", 18);
export const SUPPLY_CAP_CAKE = parseUnits("24000000", 18);
export const BORROW_CAP_USDT_GAMEFI = parseUnits("1900000", 18);

export const vip298 = () => {
  const meta = {
    version: "v2",
    title: "VIP-298 Risk Parameters Adjustments (USDT, crvUSD, UNI, CAKE)",
    description: `This VIP will perform the following Risk Parameter actions as per Chaos Labs’ latest recommendations in this Venus community forum publication: [Chaos Labs - Risk Parameter Updates - 04/23/24](https://community.venus.io/t/chaos-labs-risk-parameter-updates-04-23-24/4299).

**BNB Chain**

- [UNI (Core pool)](https://bscscan.com/address/0x27FF564707786720C71A2e5c1490A63266683612)
    - Increase supply cap, from 400K to 500K UNI
- [CAKE (Core pool)](https://bscscan.com/address/0x86aC3974e2BD0d60825230fa6F355fF11409df5c)
    - Increase supply cap, from 21M to 24M CAKE
- [USDT (GameFi)](https://bscscan.com/address/0x4978591f17670A846137d9d613e333C38dc68A37)
    - Increase supply cap, from 1.2M to 2M USDT
    - Increase borrow cap, from 1.1M to 1.9M USDT

**Ethereum**

- [crvUSD (Curve pool)](https://etherscan.io/address/0x2d499800239C4CD3012473Cb1EAE33562F0A6933)
    - Increase supply cap, from 2.5M to 2M crvUSD
    - Increase borrow cap, from 2M to 4M crvUSD

Complete analysis and details of these recommendations are available in the above publication.

VIP simulation: [https://github.com/VenusProtocol/vips/pull/272](https://github.com/VenusProtocol/vips/pull/272)

#### Disclaimer for Ethereum VIPs

Privilege commands on Ethereum will be executed by the [Guardian wallet](https://etherscan.io/address/0x285960C5B22fD66A736C7136967A3eB15e93CC67), until the [Multichain Governance](https://docs-v4.venus.io/technical-reference/reference-technical-articles/multichain-governance) contracts are deployed. If this VIP passes, [this](https://app.safe.global/transactions/tx?safe=eth:0x285960C5B22fD66A736C7136967A3eB15e93CC67&id=multisig_0x285960C5B22fD66A736C7136967A3eB15e93CC67_0xfc328abef2fa8924e12776c130feafd52fdb8c54ed4b087d895f6674a70e1e15) multisig transaction will be executed. Otherwise, it will be rejected.`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: COMPTROLLER,
        signature: "_setMarketSupplyCaps(address[],uint256[])",
        params: [
          [vUNI, vCAKE],
          [SUPPLY_CAP_UNI, SUPPLY_CAP_CAKE],
        ],
      },
      {
        target: GAMEFI_COMPTROLLER,
        signature: "setMarketSupplyCaps(address[],uint256[])",
        params: [[vUSDT_GAMEFI], [SUPPLY_CAP_USDT_GAMEFI]],
      },
      {
        target: GAMEFI_COMPTROLLER,
        signature: "setMarketBorrowCaps(address[],uint256[])",
        params: [[vUSDT_GAMEFI], [BORROW_CAP_USDT_GAMEFI]],
      },
    ],
    meta,
    ProposalType.FAST_TRACK,
  );
};

export default vip298;
