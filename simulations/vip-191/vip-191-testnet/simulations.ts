import { mine, setBalance } from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents, initMainnetUser } from "../../../src/utils";
import { forking, pretendExecutingVip, testVip } from "../../../src/vip-framework";
import { fetchVTokenStorageIL, performVTokenBasicActions, storageLayout } from "../../../src/vtokenUpgradesHelper";
import { IL_MARKETS, vip191Testnet } from "../../../vips/vip-191/vip-191-testnet";
import BEACON_ABI from "./abi/BEACON_ABI.json";
import COMPTROLLER_ABI from "./abi/COMPTROLLER.json";
import MOCK_TOKEN_ABI from "./abi/MOCK_TOKEN_ABI.json";
import VTOKEN_ABI from "./abi/VTOKEN_ABI.json";

const VTOKEN_BEACON = "0xBF85A90673E61956f8c79b9150BAB7893b791bDd";
const NEW_IMPL_VTOKEN = "0xcA408D716011169645Aa94ddc5665043C33df814";
const NORMAL_TIMELOCK = "0xce10739590001705F7FF231611ba4A48B2820327";
const PROTOCOL_SHARE_RESERVE = "0x25c7c7D6Bf710949fD7f03364E9BA19a1b3c10E3";

let vToken: ethers.Contract;
let underlying: ethers.Contract;
let user: SignerWithAddress;
let impersonatedTimelock: SignerWithAddress;
const postVipStorage: storageLayout[] = [];
const preVipStorage: storageLayout[] = [];
const provider = ethers.provider;
const mintAmount = parseUnits("200", 18);
const borrowAmount = parseUnits("50", 18);
const repayAmount = parseUnits("50", 18);
const redeemAmount = parseUnits("50", 18);
forking(34455768, () => {
  describe("Pre VIP simulations", async () => {
    before(async () => {
      [user] = await ethers.getSigners();
      impersonatedTimelock = await initMainnetUser(NORMAL_TIMELOCK, ethers.utils.parseEther("3"));
      await mine(IL_MARKETS.length * 2 + 4); // Number of Vip steps
    });
    for (const market of IL_MARKETS) {
      it(`Save pre VIP storage snapshot of ${market.name}`, async () => {
        await setBalance(user.address, ethers.utils.parseEther("5"));
        vToken = new ethers.Contract(market.address, VTOKEN_ABI, provider);
        const comptroller = new ethers.Contract(await vToken.comptroller(), COMPTROLLER_ABI, provider);
        underlying = new ethers.Contract(await vToken.underlying(), MOCK_TOKEN_ABI, provider);

        await comptroller.connect(impersonatedTimelock).setMarketBorrowCaps([market.address], [parseUnits("2", 38)]);
        await comptroller.connect(impersonatedTimelock).setMarketSupplyCaps([market.address], [parseUnits("2", 38)]);
        await comptroller
          .connect(impersonatedTimelock)
          .setCollateralFactor(market.address, parseUnits("0.8", 18), parseUnits("0.9", 18));

        await performVTokenBasicActions(
          market.address,
          user,
          mintAmount,
          borrowAmount,
          repayAmount,
          redeemAmount,
          vToken,
          underlying,
          true,
        );
        const state = await fetchVTokenStorageIL(vToken, user.address);

        delete state.protocolShareReserve;
        delete state.totalReserves;

        preVipStorage.push(state);
      });
    }
  });
});

forking(34455768, () => {
  testVip("VIP-170 IL VToken Upgrade of AIA", vip191Testnet(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [VTOKEN_ABI, BEACON_ABI], ["Upgraded", "NewReduceReservesBlockDelta"], [1, 22]);
    },
  });
});

forking(34455768, () => {
  describe("Post VIP simulations", async () => {
    before(async () => {
      await pretendExecutingVip(vip191Testnet());
      [user] = await ethers.getSigners();
    });

    for (const market of IL_MARKETS) {
      it(`Save post VIP storage snapshot of ${market.name}`, async () => {
        await setBalance(user.address, ethers.utils.parseEther("5"));
        vToken = new ethers.Contract(market.address, VTOKEN_ABI, provider);
        const comptroller = new ethers.Contract(await vToken.comptroller(), COMPTROLLER_ABI, provider);
        underlying = new ethers.Contract(await vToken.underlying(), MOCK_TOKEN_ABI, provider);

        await comptroller.connect(impersonatedTimelock).setMarketBorrowCaps([market.address], [parseUnits("2", 38)]);
        await comptroller.connect(impersonatedTimelock).setMarketSupplyCaps([market.address], [parseUnits("2", 38)]);
        await comptroller
          .connect(impersonatedTimelock)
          .setCollateralFactor(market.address, parseUnits("0.8", 18), parseUnits("0.9", 18));

        await performVTokenBasicActions(
          market.address,
          user,
          mintAmount,
          borrowAmount,
          repayAmount,
          redeemAmount,
          vToken,
          underlying,
          true,
        );
        const state = await fetchVTokenStorageIL(vToken, user.address);

        delete state.protocolShareReserve;
        delete state.totalReserves;

        expect(await vToken.protocolShareReserve()).equals(PROTOCOL_SHARE_RESERVE);
        postVipStorage.push(state);
      });
    }

    it("Should match pre and post storage", async () => {
      for (let i = 0; i < preVipStorage.length; i++) {
        expect(preVipStorage[i]).to.deep.equal(postVipStorage[i]);
      }
    });

    it("Should change implementation", async () => {
      const beacon = new ethers.Contract(VTOKEN_BEACON, BEACON_ABI, provider);
      expect(await beacon.implementation()).equals(NEW_IMPL_VTOKEN);
    });
  });
});
