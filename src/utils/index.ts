import { Connection, PublicKey } from "@solana/web3.js";
import config from "../config";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
  getMint,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { Metaplex } from "@metaplex-foundation/js";

export const getCirculatingSupplyFromMint = async (mint: string) => {
  const url = `https://api.solana.fm/v1/tokens/${mint}/supply`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    return data.circulatingSupply;
  } catch (err) {
    console.log(err);
    return null;
  }
};

const getDEVstateFromAmount2String = (value: number) => {
  if (value === 0) return "Sell All";
  if (value < 1) return "Sell";
  else return "Buy";
};

export async function getDevState(mint: PublicKey, owner: PublicKey) {
  try {
    const ata = getAssociatedTokenAddressSync(
      mint,
      owner,
      true,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );

    const balance = await config.connection.getTokenAccountBalance(ata);
    return getDEVstateFromAmount2String(Number(balance.value.uiAmount));
    // return {
    //   amount: Number(balance.value.uiAmount),
    //   lamports: Number(balance.value.amount),
    //   decimals: balance.value.decimals,
    // };
  } catch (e) {
    // console.log("Error getting token balance:", e);
    return getDEVstateFromAmount2String(0);
  }
}

const calculateTotalPercentage = (holders: any[]) => {
  return holders.reduce((total, holder) => total + holder.percentage, 0);
};

async function getTop10Percent(mint: string): Promise<any> {
  // console.log("🚀 ~ TokenService.getTopHolderInfo ~ mint", mint)
  const tokenPublicKey = new PublicKey(mint);

  const mintInfo = await getMint(config.connection, tokenPublicKey);
  const supply = Number(mintInfo.supply);

  const allAccounts = await config.connection.getProgramAccounts(
    TOKEN_PROGRAM_ID,
    {
      filters: [
        { dataSize: 165 }, // Size of token account
        { memcmp: { offset: 0, bytes: mint } }, // Filter for token mint
      ],
    }
  );

  const holders = allAccounts
    .map((accountInfo: any) => {
      const data = accountInfo.account.data;
      const amount = Number(data.readBigUInt64LE(64));
      const percentage = (amount / supply) * 100;

      return {
        amount,
        percentage,
      };
    })
    .filter((holder: any) => holder !== null);

  holders.sort((a: any, b: any) => b.amount - a.amount);

  const top10 = holders.slice(1, 10);
  const top10HP = calculateTotalPercentage(top10);

  return top10HP;
}

const getMetadataFromMint = async (ca: string) => {
  const mintAddress = new PublicKey(ca);
  const metadata = await config.metaplex.nfts().findByMint({ mintAddress });
  return metadata;
};

export const updateDataProcess = async (data: any[]) => {
  const allPromises = data.flatMap((item) => [
    getDevState(new PublicKey(item.mint), new PublicKey(item.creator)),
    getTop10Percent(item.mint),
    getMetadataFromMint(item.mint),
  ]);

  const results = await Promise.all(allPromises);

  return data.map((item, index) => {
    const i = index * 3;
    const devState = results[i];
    const top10 = results[i + 1];
    const metadata = results[i + 2];

    const decimal = metadata?.mint.decimals;
    const supply = metadata?.mint.supply.basisPoints / 10 ** decimal;
    const price = item.usd_market_cap / supply;

    return {
      mint: item.mint,
      name: item.name,
      symbol: item.symbol,
      image_url: item.image_uri,
      twitter: item.twitter,
      telegram: item.telegram,
      creator: item.creator,
      created_timestamp: item.created_timestamp,
      total_supply: item.total_supply / 10 ** decimal,
      usd_market_cap: item.usd_market_cap,
      fdv: (price * item.total_supply) / 10 ** decimal,
      dev_state: devState,
      top10_percent: top10,
      circul_supply: supply,
      price: price,
      mint_auth: metadata?.mint.mintAuthorityAddress === null ? true : false,
      freeze_auth:
        metadata?.mint.freezeAuthorityAddress === null ? true : false,
    };
  });
};
