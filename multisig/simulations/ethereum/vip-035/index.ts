import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { initMainnetUser } from "../../../../src/utils";
import { forking, pretendExecutingVip } from "../../../../src/vip-framework";
import vip035, {
} from "../../../proposals/ethereum/vip-035";
import XVS_ABI from "./abi/xvs.json";
import XVS_BRIDGE_ABI from "./abi/xvsProxyOFTDest.json";

const XVS = "0xd3CC9d8f3689B83c91b7B59cAB4946B063EB894A";
const XVS_BRIDGE = "0x888E317606b4c590BBAD88653863e8B345702633";
const XVS_HOLDER = "0xA0882C2D5DF29233A092d2887A258C2b90e9b994";

forking(20025819, () => {
  before(async () => {
  });

  describe("Post-Execution state", () => {
    before(async () => {
      await pretendExecutingVip(vip035());
    });
  });
});
