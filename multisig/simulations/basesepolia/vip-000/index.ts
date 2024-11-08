import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, pretendExecutingVip } from "src/vip-framework/index";

import vip000, { BOUND_VALIDATOR, TREASURY } from "../../../proposals/basesepolia/vip-000";
import BOUND_VALIDATOR_ABI from "./abi/boundValidator.json";
import CHAINLINK_ORACLE_ABI from "./abi/chainlinkOracle.json";
import RESILIENT_ORACLE_ABI from "./abi/resilientOracle.json";
import TREASURY_ABI from "./abi/treasury.json";

forking(17650710, async () => {
  let treasury: Contract;
  let resilientOracle: Contract;
  let chainlinkOracle: Contract;
  let boundValidator: Contract;

  before(async () => {
    treasury = await ethers.getContractAt(TREASURY_ABI, TREASURY);
    resilientOracle = await ethers.getContractAt(RESILIENT_ORACLE_ABI, NETWORK_ADDRESSES.basesepolia.RESILIENT_ORACLE);
    chainlinkOracle = await ethers.getContractAt(CHAINLINK_ORACLE_ABI, NETWORK_ADDRESSES.basesepolia.CHAINLINK_ORACLE);
    boundValidator = await ethers.getContractAt(BOUND_VALIDATOR_ABI, BOUND_VALIDATOR);

    await pretendExecutingVip(await vip000());
  });

  describe("Post tx checks", () => {
    it("Should set owner to multisig", async () => {
      let owner = await treasury.owner();
      expect(owner).equals(NETWORK_ADDRESSES.basesepolia.GUARDIAN);

      owner = await resilientOracle.owner();
      expect(owner).equals(NETWORK_ADDRESSES.basesepolia.GUARDIAN);

      owner = await chainlinkOracle.owner();
      expect(owner).equals(NETWORK_ADDRESSES.basesepolia.GUARDIAN);

      owner = await boundValidator.owner();
      expect(owner).equals(NETWORK_ADDRESSES.basesepolia.GUARDIAN);
    });
  });
});
