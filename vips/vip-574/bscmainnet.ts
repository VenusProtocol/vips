import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalMeta, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const vUSDT = "0xfD5840Cd36d94D7229439859C0112a4185BC0255";
export const vUSDC = "0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8";
export const IRM = "0x1AAADE04A970043756D90e11af57e03A3A10E2c4";

export const XVS = "0xcF6BB5389c92Bdda8a3747Ddb454cB7a64626C63";
export const HEARTBEAT_25_HOURS = 25 * 60 * 60;
export const BOUND_VALIDATOR = "0x6E332fF0bB52475304494E4AE5063c1051c7d735";

export const PRICE_LOWER_BOUND = parseUnits("0.95", 18);
export const PRICE_UPPER_BOUND = parseUnits("1.05", 18);
const { bscmainnet } = NETWORK_ADDRESSES;

export const vip574 = async () => {
  const meta: ProposalMeta = {
    version: "v2",
    title: "VIP-574 Venus VIP update week 49",
    description: `[2025/12/01 - 2025/12/07]

## **Summary:**

If  pass, the following will be performed:

### **1. [BNB Chain] Risk Parameters Adjustments (USDT, USDC)**

**Description :**

Recommended by Chaos Labs in the Venus community forum publication [**Chaos Labs - USDT/USDC Interest Rate Model Update**](https://community.venus.io/t/chaos-labs-usdt-usdc-interest-rate-model-update/5553):

**Action :**

- [USDT (Core pool)](https://app.venus.io/#/pool/0xfD36E2c2a6789Db23113685031d7F16329158384/market/0xfD5840Cd36d94D7229439859C0112a4185BC0255?chainId=56&tab=supply):
    - set Kink 1 at 84% (previously 80%)
    - set Kink 2 at 92% (previously 90%)
    - decrease the borrow rate (APR) at Kink 1 from 7% to 5.5%
    - decrease the borrow rate (APR) at Kink 2 from 9% to 7.5%
    - a maximum borrow rate of 40% at full utilization.
- [USDC (Core pool)](https://app.venus.io/#/pool/0xfD36E2c2a6789Db23113685031d7F16329158384/market/0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8?chainId=56&tab=supply):
    - set Kink 1 at 84% (previously 80%)
    - set Kink 2 at 92% (previously 90%)
    - decrease the borrow rate (APR) at Kink 1 from 6.5% to 5.5%
    - decrease the borrow rate (APR) at Kink 2 from 8.5% to 7.5%
    - a maximum borrow rate of 40% at full utilization.

Complete analysis and details of these recommendations are available in the above publication.

### **2. Reintroduce Binance Oracle for XVS Pool with Updated Price Expiry**

**Description :**

On Nov 30, 2025, users reported that some Venus markets were unavailable due to oracle pricing errors. Investigation revealed an issue with the Binance Oracle heartbeat for $XVS. The Venus team quickly hotfixed this by reverting the $XVS oracle setup to use Chainlink exclusively.

**Action :**

Add Binance oracle back to the XVS Pool Token, with adjusted price expiration time from 20 minutes to 24hours.`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: bscmainnet.BINANCE_ORACLE,
        signature: "setMaxStalePeriod(string,uint256)",
        params: ["XVS", HEARTBEAT_25_HOURS],
      },
      {
        target: bscmainnet.RESILIENT_ORACLE,
        signature: "setTokenConfigs((address,address[3],bool[3],bool)[])",
        params: [
          [
            [
              XVS,
              [bscmainnet.CHAINLINK_ORACLE, bscmainnet.BINANCE_ORACLE, ethers.constants.AddressZero],
              [true, true, false],
              false,
            ],
          ],
        ],
      },
      {
        target: BOUND_VALIDATOR,
        signature: "setValidateConfigs((address,uint256,uint256)[])",
        params: [[[XVS, PRICE_UPPER_BOUND, PRICE_LOWER_BOUND]]],
      },
      {
        target: vUSDT,
        signature: "_setInterestRateModel(address)",
        params: [IRM],
      },
      {
        target: vUSDC,
        signature: "_setInterestRateModel(address)",
        params: [IRM],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip574;
