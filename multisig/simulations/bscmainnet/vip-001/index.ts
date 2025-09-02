import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { forking, pretendExecutingVip } from "src/vip-framework/index";
import RESILIENT_ORACLE_ABI from "./abi/resilientOracle.json";
import CHAINLINK_ORACLE_ABI from "./abi/chainlinkOracle.json";
import vip001, { BTCB, REDSTONE_ORACLE, CHAINLINK_ORACLE } from "../../../proposals/bscmainnet/vip-001";

const RESILIENT_ORACLE = "0x6592b5DE802159F3E74B2486b091D11a8256ab8A"
forking(59782673, async () => {
    const provider = ethers.provider;
    let oracle: Contract;
    let chainlinkOracle: Contract;

  describe("Pre-VIP behavior", async () => {
    before(async () => {
        oracle = new ethers.Contract(RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, provider);
        chainlinkOracle = new ethers.Contract(CHAINLINK_ORACLE, CHAINLINK_ORACLE_ABI, provider);
    });
  });

  describe("Post-VIP behavior", async () => {
    before(async () => {
      await pretendExecutingVip(await vip001());
    });

    // TODO: Add VIP-001 checks here also

    it("has the correct BTCB price", async () => {
        const price = await oracle.getPrice(BTCB);
        expect(price).to.be.not.eq("10000000000000000000000000000");
    });
  });
});
