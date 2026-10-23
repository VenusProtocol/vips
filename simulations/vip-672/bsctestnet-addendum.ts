import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES, ORACLE_BNB } from "src/networkAddresses";
import { expectEvents, setMaxStalePeriodForAllAssets } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip712Addendum, {
  NEW_COMPTROLLER_LENS,
  OLD_COMPTROLLER_LENS,
  UNITROLLER,
} from "../../vips/vip-672/bsctestnet-addendum";
import COMPTROLLER_ABI from "./abi/Comptroller.json";
import ERC20_ABI from "./abi/ERC20.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";

const { bsctestnet } = NETWORK_ADDRESSES;

const USDT = "0xA11c8D9DC9b66E209Ef60F0C8D969D3CD988782c";
const VUSDT = "0xb7526572FFE56AB9D7489838Bf2E18e3323b441A";
const VBNB = "0x2E7222e51c0f6e98610A1543Aa3836E092CDe62c";
const REPAY_AMOUNT = ethers.utils.parseUnits("1000", 18);

forking(138244700, async () => {
  const provider = ethers.provider;
  let unitroller: Contract;
  let seizeTokensBefore: BigNumber;

  before(async () => {
    unitroller = new ethers.Contract(UNITROLLER, COMPTROLLER_ABI, provider);

    // Governance time travel leaves every feed stale, so widen the stale period for the two
    // markets the seize check prices.
    const resilientOracle = new ethers.Contract(bsctestnet.RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, provider);
    await setMaxStalePeriodForAllAssets(resilientOracle, [
      new ethers.Contract(USDT, ERC20_ABI, provider),
      new ethers.Contract(ORACLE_BNB, ERC20_ABI, provider),
    ]);

    [, seizeTokensBefore] = await unitroller["liquidateCalculateSeizeTokens(address,address,uint256)"](
      VUSDT,
      VBNB,
      REPAY_AMOUNT,
    );
  });

  describe("Pre-VIP behavior", async () => {
    it("Comptroller uses the old lens", async () => {
      expect(await unitroller.comptrollerLens()).to.equal(OLD_COMPTROLLER_LENS);
      expect(seizeTokensBefore).to.be.gt(0);
    });
  });

  testVip("vip-712 addendum testnet", await vip712Addendum(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(txResponse, [COMPTROLLER_ABI], ["NewComptrollerLens"], [1]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("Comptroller uses the new lens and seize amounts for 18-decimal markets are unchanged", async () => {
      expect(await unitroller.comptrollerLens()).to.equal(NEW_COMPTROLLER_LENS);
      const [err, seizeTokensAfter] = await unitroller["liquidateCalculateSeizeTokens(address,address,uint256)"](
        VUSDT,
        VBNB,
        REPAY_AMOUNT,
      );
      expect(err).to.equal(0);
      // The old lens truncates the ratio before multiplying by the repay amount, so the two
      // results differ only by that rounding: well under one part per million.
      expect(seizeTokensAfter).to.be.closeTo(seizeTokensBefore, seizeTokensBefore.div(1_000_000));
    });
  });
});
