import { impersonateAccount } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { forking, pretendExecutingVip } from "../../../../src/vip-framework";
import { vip009 } from "../../../proposals/vip-009/vip-009-sepolia";
import COMPTROLLER_FACET_ABI from "./abis/comptroller.json";
import UPGRADABLE_BEACON_ABI from "./abis/upgradableBeacon.json";

forking(5152462, () => {
  describe("Pre-VIP behavior", () => {
    before(async () => {
    });
  });

  describe("Post-VIP behavior", async () => {
    before(async () => {
      await pretendExecutingVip(vip009());
    });

    it("should have the correct implementation", async () => {
    });
  });
});
