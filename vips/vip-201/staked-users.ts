const PRIME = "0xBbCD063efE506c3D42a0Fa2dB5C08430288C71FC";

const users = {
  "0x2e7a15e186cc81f7efc4bf7df12dbd5e3db4fefb": 1651635300,
};

const addresses: any = [];
const stakedAt: any = [];

const buildList = () => {
  for (const address in users) {
    addresses.push(address);
    stakedAt.push(users[address as keyof typeof users]);
  }
};

buildList();

export default {
  target: PRIME,
  signature: "setStakedAt(address[],uint256[])",
  params: [addresses, stakedAt],
};
