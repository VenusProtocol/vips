import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { NETWORK_ADDRESSES } from "../../../../src/networkAddresses";
import { forking, pretendExecutingVip } from "../../../../src/vip-framework";
import vip001, { XVS } from "../../../proposals/arbitrumsepolia/vip-001/addendum-2";
import CHAINLINK_ORACLE_ABI from "./abi/chainlinkOracle.json";
import RESILIENT_ORACLE_ABI from "./abi/resilientOracle.json";

const { arbitrumsepolia } = NETWORK_ADDRESSES;
const RESILIENT_ORACLE = arbitrumsepolia.RESILIENT_ORACLE;

forking(48763255, () => {
  const provider = ethers.provider;
  let resilientOracle: Contract;
  let redstoneOracle: Contract;

  describe("Pre-VIP behavior", () => {
    before(async () => {
      resilientOracle = new ethers.Contract(RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, provider);
      redstoneOracle = new ethers.Contract(arbitrumsepolia.REDSTONE_ORACLE, CHAINLINK_ORACLE_ABI, provider);
    });

    it("Should return chainlink oracle as main oracle", async () => {
      expect((await resilientOracle.getTokenConfig(XVS)).oracles[0]).equals(arbitrumsepolia.CHAINLINK_ORACLE);
    });
  });

  describe("Post-VIP behavior", async () => {
    before(async () => {
      await pretendExecutingVip(vip001());
    });

    it("Should return correct owner", async () => {
      expect(await redstoneOracle.owner()).equals(arbitrumsepolia.NORMAL_TIMELOCK);
    });

    it("Should return redstone oracle as main oracle", async () => {
      expect((await resilientOracle.getTokenConfig(XVS)).oracles[0]).equals(arbitrumsepolia.REDSTONE_ORACLE);
    });

    it("Should return price of XVS", async () => {
      expect(await resilientOracle.getPrice(XVS)).to.be.equal(parseUnits("10", 18));
    });
  });
});
