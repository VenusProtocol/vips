import fs from "fs/promises";

import { AccountSnapshotUsd, Market } from "./types";
import { BigNumber } from "ethers";

type BigNumberToString<T> =
    T extends BigNumber
    ? string
    : { [P in keyof T]: T[P] extends BigNumber ? string : T[P] }

type Stored<ValueType> = BigNumberToString<ValueType>;

export class Cache<ValueType> {
    protected constructor(
        public readonly fileName: string,
        private _kv: Record<string, Stored<ValueType>>,
        private _encodeValue: (decoded: ValueType) => Stored<ValueType>,
        private _decodeValue: (encoded: Stored<ValueType>) => ValueType,
    ) {}

    protected static async createFromFile<ValueType>(
        fileName: string,
        encodeValueFn: (decoded: ValueType) => Stored<ValueType>,
        decodeValueFn: (encoded: Stored<ValueType>) => ValueType,
    ) {
        try {
          const file = await fs.readFile(fileName, { encoding: "utf-8" });
          return new Cache<ValueType>(fileName, JSON.parse(file), encodeValueFn, decodeValueFn);
        } catch {}
        return new Cache<ValueType>(fileName, {}, encodeValueFn, decodeValueFn);
    }

    has(key: string) {
        return this._kv[key] !== undefined;
    }

    readAll() {
        return this.decodeChunk(Object.entries(this._kv));
    }

    readKeys(keys: ReadonlyArray<string>) {
        return this.decodeChunk(
            keys.flatMap((key) => this._kv[key] !== undefined ? [[key, this._kv[key]]] : [])
        );
    }

    async append(chunk: ReadonlyArray<[string, ValueType]>) {
        const encoded = this.encodeChunk(chunk);
        this._kv = { ...this._kv, ...Object.fromEntries(encoded) };
        await fs.writeFile(this.fileName, JSON.stringify(this._kv, null, 2), { encoding: "utf-8" });
    }

    encodeChunk(chunk: ReadonlyArray<[string, ValueType]>): [string, Stored<ValueType>][] {
        return chunk.map(([account, value]) => [account, this._encodeValue(value)]);
    }

    decodeChunk(chunk: ReadonlyArray<[string, Stored<ValueType>]>): [string, ValueType][] {
        return chunk.map(([key, storedValue]) => [key, this._decodeValue(storedValue)]);
    }
}

export class AccountSnapshotsCache extends Cache<AccountSnapshotUsd> {
    static ACCOUNT_SNAPSHOTS_FILE = "./snapshots.json";

    constructor(kv: Record<string, Stored<AccountSnapshotUsd>>) {
        super(
            AccountSnapshotsCache.ACCOUNT_SNAPSHOTS_FILE,
            kv,
            AccountSnapshotsCache.encodeAccountSnapshot,
            AccountSnapshotsCache.decodeAccountSnapshot
        );
    }

    static async create() {
        return super.createFromFile(
            AccountSnapshotsCache.ACCOUNT_SNAPSHOTS_FILE,
            AccountSnapshotsCache.encodeAccountSnapshot,
            AccountSnapshotsCache.decodeAccountSnapshot
        );
    }

    static encodeAccountSnapshot(snapshot: AccountSnapshotUsd) {
        return {
            supplyUsd: snapshot.supplyUsd.toString(),
            borrowsUsd: snapshot.borrowsUsd.toString(),
            liquidity: snapshot.liquidity.toString(),
            shortfall: snapshot.shortfall.toString(),
        };
    }

    static decodeAccountSnapshot(stored: Stored<AccountSnapshotUsd>) {
        return {
            supplyUsd: BigNumber.from(stored.supplyUsd),
            borrowsUsd: BigNumber.from(stored.borrowsUsd),
            liquidity: BigNumber.from(stored.liquidity),
            shortfall: BigNumber.from(stored.shortfall),
        };
    }
}

export class BorrowBalancesCache extends Cache<BigNumber> {
    constructor(fileName: string, kv: Record<string, string>) {
        super(
            fileName,
            kv,
            BorrowBalancesCache.encodeBigNumber,
            BorrowBalancesCache.decodeBigNumber
        );
    }

    static async create(market: Market) {
        return super.createFromFile(
            `${market.symbol}-debts.json`,
            BorrowBalancesCache.encodeBigNumber,
            BorrowBalancesCache.decodeBigNumber
        );
    }

    static encodeBigNumber(value: BigNumber) {
        return value.toString();
    }

    static decodeBigNumber(stored: string) {
        return BigNumber.from(stored);
    }
}
