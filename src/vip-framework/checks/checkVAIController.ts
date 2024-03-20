import { impersonateAccount, mine } from "@nomicfoundation/hardhat-network-helpers";
import mainnet from "@venusprotocol/venus-protocol/deployments/bscmainnet.json";
import testnet from "@venusprotocol/venus-protocol/deployments/bsctestnet.json";
import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { FORKED_NETWORK, ethers } from "hardhat";

import { getForkedNetworkAddress, setMaxStalePeriod, setMaxStalePeriodInChainlinkOracle } from "../../utils";
import COMPTROLLER_ABI from "../abi/comptroller.json";
import ERC20_ABI from "../abi/erc20.json";
import RESILIENT_ORACLE_ABI from "../abi/resilientOracle.json";
import VTOKEN_ABI from "../abi/vToken.json";
import VAI_ABI from "../abi/vai.json";
import VAI_CONTROLLER_ABI from "../abi/vaiController.json";

const EXP_SCALE = parseUnits("1", "18");
const VAI_UNITROLLER = getForkedNetworkAddress("VAI_UNITROLLER");
const ACCOUNT = getForkedNetworkAddress("VAI_MINT_USER_ACCOUNT");
const UNITROLLER = getForkedNetworkAddress("UNITROLLER");
const VAI = getForkedNetworkAddress("VAI");
const CHAINLINK_ORACLE = getForkedNetworkAddress("CHAINLINK_ORACLE");
const RESILIENT_ORACLE = getForkedNetworkAddress("RESILIENT_ORACLE");
let NORMAL_TIMELOCK = mainnet.contracts.NormalTimelock.address;
let vBNB = mainnet.contracts.vBNB.address;
let WBNB = mainnet.contracts.WBNB.address;

if (FORKED_NETWORK === "bsctestnet") {
  NORMAL_TIMELOCK = testnet.contracts.NormalTimelock.address;
  vBNB = testnet.contracts.vBNB.address;
  WBNB = testnet.contracts.WBNB.address;
}

export const checkVAIController = () => {
  describe("generic VAI controller checks", () => {
    let vaiController: Contract;
    let comptroller: Contract;
    let resilientOracle: Contract;
    let vai: Contract;

    before(async () => {
      impersonateAccount(ACCOUNT);
      const signer = await ethers.getSigner(ACCOUNT);

      vaiController = await ethers.getContractAt(VAI_CONTROLLER_ABI, VAI_UNITROLLER, signer);
      comptroller = await ethers.getContractAt(COMPTROLLER_ABI, UNITROLLER, signer);
      vai = await ethers.getContractAt(VAI_ABI, VAI, signer);
      resilientOracle = await ethers.getContractAt(RESILIENT_ORACLE_ABI, RESILIENT_ORACLE);

      const markets = await comptroller.getAssetsIn(ACCOUNT);

      for (let i = 0; i < markets.length; i++) {
        if (markets[i] === vBNB) {
          await setMaxStalePeriodInChainlinkOracle(
            CHAINLINK_ORACLE,
            WBNB,
            ethers.constants.AddressZero,
            NORMAL_TIMELOCK,
          );
          continue;
        }

        const vToken = await ethers.getContractAt(VTOKEN_ABI, markets[i], signer);
        const underlyingToken = await ethers.getContractAt(ERC20_ABI, await vToken.underlying());
        await setMaxStalePeriod(resilientOracle, underlyingToken);
      }

      // increase max stale period of VAI
      const underlyingToken = await ethers.getContractAt(ERC20_ABI, VAI);
      await setMaxStalePeriod(resilientOracle, underlyingToken);
    });

    it("mint and repay", async () => {
      const isVAIMintingEnabled = await comptroller.vaiMintRate();
      if (isVAIMintingEnabled.eq(0)) {
        return;
      }

      const vaiToMint = parseUnits("1000", "18");

      const mintableAmount = await vaiController.getMintableVAI(ACCOUNT);
      expect(mintableAmount[1]).to.be.gt(0);

      const treasuryPercent = await vaiController.treasuryPercent();

      const balanceBefore = await vai.balanceOf(ACCOUNT);
      await expect(vaiController.mintVAI(vaiToMint)).to.not.reverted;
      const balanceAfter = await vai.balanceOf(ACCOUNT);

      expect(balanceAfter.sub(balanceBefore)).to.be.gt(0);
      expect(balanceAfter.sub(balanceBefore)).eq(vaiToMint.mul(EXP_SCALE.sub(treasuryPercent)).div(EXP_SCALE));

      const repayAmount = await vaiController.getVAIRepayAmount(ACCOUNT);
      expect(repayAmount).to.be.gt(0);

      const repayAmountWithInterestBefore = await vaiController.getVAICalculateRepayAmount(ACCOUNT, repayAmount);
      await mine(5000);

      await vaiController.accrueVAIInterest();
      const repayAmountWithInterestAfter = await vaiController.getVAICalculateRepayAmount(ACCOUNT, repayAmount);
      expect(repayAmountWithInterestAfter[1].add(repayAmountWithInterestAfter[2])).to.be.gt(
        repayAmountWithInterestBefore[1].add(repayAmountWithInterestBefore[2]),
      );

      const amountToRepay = parseUnits("500", "18");
      await vai.approve(vaiController.address, amountToRepay);

      await expect(vaiController.repayVAI(amountToRepay)).to.not.reverted;
      const balanceAfterRepay = await vai.balanceOf(ACCOUNT);

      expect(balanceAfterRepay).to.be.lt(balanceAfter);
    });
  });
};
