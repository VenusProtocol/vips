import { impersonateAccount, setBalance } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip529, {
  DISTRIBUTION_SPEED_ETH,
  RELEASE_AMOUNT_ETH,
  XVS_STORE_ETH,
  XVS_TOTAL_AMOUNT_ETH,
} from "../../vips/vip-529/bscmainnet";
import XVS_ABI from "./abi/XVS.json";
import XVS_VAULT_ABI from "./abi/XVSVault.json";

const { ethereum } = NETWORK_ADDRESSES;
const BRIDGE = "0x888E317606b4c590BBAD88653863e8B345702633";

forking(22837909, async () => {
  const xvs = new ethers.Contract(ethereum.XVS, XVS_ABI, ethers.provider);
  let previousBalanceXVSStore: BigNumber;
  let previousBalanceTreasury: BigNumber;

  before(async () => {
    previousBalanceTreasury = await xvs.balanceOf(ethereum.VTREASURY);
    await impersonateAccount(BRIDGE);
    await setBalance(BRIDGE, parseUnits("10", 18));
    await xvs.connect(await ethers.getSigner(BRIDGE)).mint(ethereum.VTREASURY, XVS_TOTAL_AMOUNT_ETH);

    previousBalanceXVSStore = await xvs.balanceOf(XVS_STORE_ETH);
  });

  testForkedNetworkVipCommands("VIP 529", await vip529(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [XVS_VAULT_ABI], ["RewardAmountUpdated"], [1]);
    },
  });

  describe("Post-VIP behaviour", async () => {
    it("check xvs vault speed", async () => {
      const xvsVault = new ethers.Contract(ethereum.XVS_VAULT_PROXY, XVS_VAULT_ABI, ethers.provider);
      expect(await xvsVault.rewardTokenAmountsPerBlockOrSecond(ethereum.XVS)).to.equals(DISTRIBUTION_SPEED_ETH);
    });

    it("check xvs balance", async () => {
      const currentBalance = await xvs.balanceOf(XVS_STORE_ETH);
      expect(currentBalance).to.equals(previousBalanceXVSStore.add(XVS_TOTAL_AMOUNT_ETH).add(RELEASE_AMOUNT_ETH));
    });

    it("check treasury balance", async () => {
      const currentBalance = await xvs.balanceOf(ethereum.VTREASURY);
      expect(currentBalance).to.equals(previousBalanceTreasury);
    });
  });
});
