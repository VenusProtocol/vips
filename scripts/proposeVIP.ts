import { proposeVIP } from "src/transactions";

const proposeVip = async (vipPath: string) => {
  const tx = await proposeVIP(vipPath);
  console.log(tx);
};

export default proposeVip;
