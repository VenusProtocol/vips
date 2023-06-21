import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

// Core pool: 0x94d1820b2D1c7c7452A163983Dc888CEC546b77D
// swapRouter core pool = "0x83edf1deE1B730b7e8e13C00ba76027D63a51ac0";

// IL pool 1: 0xF320d8CB33E08805E9798Ea0d38d65B91b9d00CD
// swapRouter IL 1 = "0x7DcBd10E3479907e0B8C79d01D0572C8cc00227B";

// IL pool 2: 0x5bCe7102339B3865ba7ceA8602d5B61db9980827
// swapRouter IL 2 = "0x76B88ff4579B35D2722B7383b9B9ce831dc89B72";

// IL pool 3: 0x605AA769d14F6Af2E405295FEC2A4d8Baa623d80
// swapRouter IL 3 = "0x6cE131c2321e25d7b4C63283b75DB160Ce3Fb710";

// IL pool 4: 0xd39b346F2D8fEFfaeeBdD790Ca24Ee3a60d20519
// swapRouter IL 4 = "0x51Fd03aD1132e8cb5a5a793528c9F4ec918667d4";

// IL pool 5: 0xee25Be03d7f41f3cF497d102B8c3dF0BFEA974E3
// swapRouter IL 5 = "0xFdeBF4530F9c7d352ffFE88cd0e96C8Bb7391BD9";

// Addresses of all the swapRouters
export const swapRouters = [
  "0x83edf1deE1B730b7e8e13C00ba76027D63a51ac0",
  "0x7DcBd10E3479907e0B8C79d01D0572C8cc00227B",
  "0x76B88ff4579B35D2722B7383b9B9ce831dc89B72",
  "0x6cE131c2321e25d7b4C63283b75DB160Ce3Fb710",
  "0x51Fd03aD1132e8cb5a5a793528c9F4ec918667d4",
  "0xFdeBF4530F9c7d352ffFE88cd0e96C8Bb7391BD9",
];

export const vip130Testnet = () => {
  const meta = {
    version: "v2",
    title: "VIP-130 Accepting ownership for swap routers",
    description: `Swap routers are deployed for each pool including the core pool and the other five isolated pools,
      and the ownership of these routers is transferred to Timeclock and this VIP is to accept the ownership of all
      the swap routers.`,
    forDescription: "I agree that Venus Protocol should proceed with accepting ownership for swap routers",
    againstDescription: "I do not think that Venus Protocol should proceed with accepting ownership for swap routers",
    abstainDescription:
      "I am indifferent to whether Venus Protocol proceeds with accepting ownership for swap routers or not",
  };

  return makeProposal(
    swapRouters.map(router => ({
      target: router,
      signature: "acceptOwnership()",
      params: [],
    })),
    meta,
    ProposalType.REGULAR,
  );
};
