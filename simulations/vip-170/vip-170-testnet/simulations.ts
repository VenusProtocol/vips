import { mine, setBalance } from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents, initMainnetUser } from "../../../src/utils";
import { forking, pretendExecutingVip, testVip } from "../../../src/vip-framework";
import { fetchStorage, performVTokenBasicActions, storageLayout } from "../../../src/vtokenUpgradesHelper";
import { IL_MARKETS, vip170Testnet } from "../../../vips/vip-170/vip-170-testnet";
import BEACON_ABI from "./abi/BEACON_ABI.json";
import COMPTROLLER_ABI from "./abi/COMPTROLLER.json";
import MOCK_TOKEN_ABI from "./abi/MOCK_TOKEN_ABI.json";
import VTOKEN_ABI from "./abi/VTOKEN_ABI.json";

const VTOKEN_BEACON = "0xBF85A90673E61956f8c79b9150BAB7893b791bDd";
const NEW_IMPL_VTOKEN = "0x37130dd8181477Be3dDe8b22A32FE302ca602BA7";
const NORMAL_TIMELOCK = "0xce10739590001705F7FF231611ba4A48B2820327";
const TREASURY = "0x8b293600C50D6fbdc6Ed4251cc75ECe29880276f";

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
forking(33043237, () => {
  describe("Pre VIP simulations", async () => {
    before(async () => {
      [user] = await ethers.getSigners();
      impersonatedTimelock = await initMainnetUser(NORMAL_TIMELOCK, ethers.utils.parseEther("3"));
      await mine(IL_MARKETS.length * 2 + 2); // Number of Vip steps
    });
    for (const market of IL_MARKETS) {
      it(`Save pre VIP storage snapshot of ${market.name}`, async () => {
        await setBalance(user.address, ethers.utils.parseEther("5"));
        vToken = new ethers.Contract(market.address, VTOKEN_ABI, provider);
        const comptroller = new ethers.Contract(await vToken.comptroller(), COMPTROLLER_ABI, provider);
        underlying = new ethers.Contract(await vToken.underlying(), MOCK_TOKEN_ABI, provider);

        await performVTokenBasicActions(
          market.address,
          user,
          impersonatedTimelock,
          mintAmount,
          borrowAmount,
          repayAmount,
          redeemAmount,
          vToken,
          underlying,
          comptroller,
        );
        const state = await fetchStorage(vToken, user.address);
        delete state.protocolShareReserve;
        preVipStorage.push(state);
      });
    }
  });
});

forking(33043237, () => {
  testVip("VIP-170 VToken Upgrade of AIA", vip170Testnet(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [VTOKEN_ABI, BEACON_ABI], ["Upgraded", "NewReduceReservesBlockDelta"], [1, 22]);
    },
  });
});

forking(33043237, () => {
  describe("Post VIP simulations", async () => {
    before(async () => {
      await pretendExecutingVip(vip170Testnet());
      [user] = await ethers.getSigners();
    });

    for (const market of IL_MARKETS) {
      it(`Save post VIP storage snapshot of ${market.name}`, async () => {
        await setBalance(user.address, ethers.utils.parseEther("5"));
        vToken = new ethers.Contract(market.address, VTOKEN_ABI, provider);
        const comptroller = new ethers.Contract(await vToken.comptroller(), COMPTROLLER_ABI, provider);
        underlying = new ethers.Contract(await vToken.underlying(), MOCK_TOKEN_ABI, provider);

        await performVTokenBasicActions(
          market.address,
          user,
          impersonatedTimelock,
          mintAmount,
          borrowAmount,
          repayAmount,
          redeemAmount,
          vToken,
          underlying,
          comptroller,
        );
        const state = await fetchStorage(vToken, user.address);
        delete state.protocolShareReserve;
        expect(await vToken.protocolShareReserve()).equals(TREASURY);
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
