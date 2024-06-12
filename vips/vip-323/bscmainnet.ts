import { NETWORK_ADDRESSES } from "../../src/networkAddresses";
import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const { bscmainnet } = NETWORK_ADDRESSES;
export const PROTOCOL_SHARE_RESERVE_PROXY = "0xCa01D5A9A248a830E9D93231e791B1afFed7c446";

export const USDT_PRIME_CONVERTER = "0xD9f101AA67F3D72662609a2703387242452078C3";
export const USDC_PRIME_CONVERTER = "0xa758c9C215B6c4198F0a0e3FA46395Fa15Db691b";
export const BTCB_PRIME_CONVERTER = "0xE8CeAa79f082768f99266dFd208d665d2Dd18f53";
export const XVS_VAULT_CONVERTER = "0xd5b9AE835F4C59272032B3B954417179573331E0";
export const VTREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";
const RISK_FUND_CONVERTER = "0xA5622D276CcbB8d9BBE3D1ffd1BB11a0032E53F0";
const ETH_PRIME_CONVERTER = "0xca430B8A97Ea918fF634162acb0b731445B8195E";

export const XVS_VAULT_REWARDS_SPEED = "7291666666666666";

export const vip323 = () => {
  const meta = {
    version: "v2",
    title: "VIP-323 Update Distribution rules on PSR",
    description: ``,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: PROTOCOL_SHARE_RESERVE_PROXY,
        signature: "addOrUpdateDistributionConfigs((uint8,uint16,address)[])",
        params: [
          [
            [0, 6000, VTREASURY],
            [0, 2000, XVS_VAULT_CONVERTER],
            [0, 0, RISK_FUND_CONVERTER],
            [0, 800, USDC_PRIME_CONVERTER],
            [0, 800, USDT_PRIME_CONVERTER],
            [0, 100, BTCB_PRIME_CONVERTER],
            [0, 300, ETH_PRIME_CONVERTER],
            [1, 0, RISK_FUND_CONVERTER],
            [1, 8000, VTREASURY],
            [1, 2000, XVS_VAULT_CONVERTER],
          ],
        ],
      },
      {
        target: PROTOCOL_SHARE_RESERVE_PROXY,
        signature: "removeDistributionConfig(uint8,address)",
        params: [0, RISK_FUND_CONVERTER],
      },
      {
        target: PROTOCOL_SHARE_RESERVE_PROXY,
        signature: "removeDistributionConfig(uint8,address)",
        params: [1, RISK_FUND_CONVERTER],
      },
      {
        target: bscmainnet.XVS_VAULT_PROXY,
        signature: "setRewardAmountPerBlockOrSecond(address,uint256)",
        params: [bscmainnet.XVS, XVS_VAULT_REWARDS_SPEED],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip323;
