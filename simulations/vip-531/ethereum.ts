import { impersonateAccount, setBalance } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, setMaxStalePeriod, setRedstonePrice } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip531, { Actions, COMPTROLLER, vLBTC, veBTC } from "../../vips/vip-531/bscmainnet";
import COMPTROLLER_ABI from "./abi/Comptroller.json";
import ERC20_ABI from "./abi/ERC20.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";
import VTOKEN_ABI from "./abi/VToken.json";

const { ethereum } = NETWORK_ADDRESSES;

const prices = [
  {
    symbol: "vWBTC",
    address: "0x8716554364f20BCA783cb2BAA744d39361fd1D8d",
    expectedPrice: parseUnits("120533.660943", 28),
    postVIP: async function (resilientOracle: any, address: string) {
      const vtoken = new ethers.Contract(address, VTOKEN_ABI, ethers.provider);
      const underlying = await vtoken.underlying();
      const token = new ethers.Contract(underlying, ERC20_ABI, ethers.provider);
      await setMaxStalePeriod(resilientOracle, token);
    },
  },
  {
    symbol: "vLBTC",
    address: "0x25C20e6e110A1cE3FEbaCC8b7E48368c7b2F0C91",
    expectedPrice: parseUnits("120533.660943", 28),
    preVIP: async function () {
      await setRedstonePrice(
        ethereum.REDSTONE_ORACLE,
        "0x8236a87084f8B84306f72007F36F2618A5634494",
        "0xb415eAA355D8440ac7eCB602D3fb67ccC1f0bc81",
        ethereum.NORMAL_TIMELOCK,
        31536000,
        { tokenDecimals: 8 },
      );
    },
  },
  {
    symbol: "veBTC",
    address: "0x325cEB02fe1C2fF816A83a5770eA0E88e2faEcF2",
    expectedPrice: parseUnits("120533.660943", 28),
  },
];

forking(22944397, async () => {
  const provider = ethers.provider;

  await impersonateAccount(ethereum.NORMAL_TIMELOCK);
  await setBalance(ethereum.NORMAL_TIMELOCK, ethers.utils.parseEther("1000000"));
  const resilientOracle = new ethers.Contract(ethereum.RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, provider);
  const comptroller = new ethers.Contract(COMPTROLLER, COMPTROLLER_ABI, provider);

  describe("Pre-VIP behaviour", async () => {
    for (const price of prices) {
      it(`check ${price.symbol} price`, async () => {
        if (price.preVIP) {
          await price.preVIP();
        }
        expect(await resilientOracle.getUnderlyingPrice(price.address)).to.equal(price.expectedPrice);
      });
    }

    it("check borrowcaps", async () => {
      let borrowCap = await comptroller.borrowCaps(veBTC);
      expect(borrowCap).to.be.not.equal(0);

      borrowCap = await comptroller.borrowCaps(vLBTC);
      expect(borrowCap).to.be.not.equal(0);
    });

    it("Check market actions are paused", async () => {
      let isPaused = await comptroller.actionPaused(veBTC, Actions.BORROW);
      expect(isPaused).to.be.false;

      isPaused = await comptroller.actionPaused(vLBTC, Actions.BORROW);
      expect(isPaused).to.be.false;
    });
  });

  testForkedNetworkVipCommands("vip506", await vip531(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [COMPTROLLER_ABI], ["NewBorrowCap", "ActionPausedMarket"], [2, 2]);
    },
  });

  describe("Post-VIP behaviour", async () => {
    for (const price of prices) {
      it(`check ${price.symbol} price`, async () => {
        if (price.postVIP) {
          await price.postVIP(resilientOracle, price.address);
        }
        expect(await resilientOracle.getUnderlyingPrice(price.address)).to.equal(price.expectedPrice);
      });
    }

    it("check borrowcaps", async () => {
      let borrowCap = await comptroller.borrowCaps(veBTC);
      expect(borrowCap).to.be.equal(0);

      borrowCap = await comptroller.borrowCaps(vLBTC);
      expect(borrowCap).to.be.equal(0);
    });

    it("Check market actions are paused", async () => {
      let isPaused = await comptroller.actionPaused(veBTC, Actions.BORROW);
      expect(isPaused).to.be.true;

      isPaused = await comptroller.actionPaused(vLBTC, Actions.BORROW);
      expect(isPaused).to.be.true;
    });
  });
});
