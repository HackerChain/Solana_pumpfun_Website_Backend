import { PublicKey } from "@solana/web3.js";
import config from "../config";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
  getMint,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import logger from "../logs/logger";
import XScore from "../models/XScore";
import { HEADER } from "../config/config";

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
  try {
    const mintAddress = new PublicKey(ca);
    const metadata = await config.metaplex.nfts().findByMint({ mintAddress });
    return metadata;
  } catch (error: any) {
    logger.error("Error fetching metadata: " + error);
  }
};

const extractTwitterUsername = (twitterUrl: string): string => {
  const urlParts = twitterUrl.split("/");
  return urlParts[3] || "";
};

export const getXScore = async (acc: any) => {
  try {
    // If no twitter handle, return 0
    if (!acc.twitter) {
      return 0;
    }

    // Check if score exists in DB
    const existingScore = await XScore.findOne({ mint: acc.mint });

    // Check if we need to fetch new score (if doesn't exist or older than 30 days)
    const shouldFetchNew =
      !existingScore ||
      Date.now() - existingScore.timestamp.getTime() >
        config.xScore_Update_cycle;

    if (!shouldFetchNew) {
      return existingScore.xScore;
    }
    
    const userName = extractTwitterUsername(acc.twitter);
    const response = await fetch(
      `https://api.tweetscout.io/v2/score/${userName}`,HEADER
    );

    const data = await response.json();
    const score = data.score || 0;

    // Save or update score in DB
    await XScore.findOneAndUpdate(
      { mint: acc.mint },
      {
        mint: acc.mint,
        xScore: score,
        timestamp: new Date(),
      },
      { upsert: true, new: true }
    );
    return score;
  } catch (error) {
    logger.error(`Error in getXScore for mint ${acc.mint}: ${error}`);
    return 0;
  }
};

export const updateDataProcess = async (data: any[]) => {
  const allPromises = data.flatMap((item) => [
    getDevState(new PublicKey(item.mint), new PublicKey(item.creator)),
    getTop10Percent(item.mint),
    getMetadataFromMint(item.mint),
    getXScore(item),
  ]);
  // console.log("🚀 ~ updateDataProcess ~ allPromises");
  const results = await Promise.all(allPromises);
  // console.log("🚀 ~ result");

  return data.map((item, index) => {
    const i = index * 4;
    const devState = results[i];
    const top10 = results[i + 1];
    const metadata = results[i + 2];
    const xscore = results[i + 3];
    const decimal = metadata?.mint.decimals;
    const supply = metadata?.mint.supply.basisPoints / 10 ** (decimal || 9);
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
      x_score: xscore,
    };
  });
};

export const formatTimestamp = (timestamp: number) => {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds());

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};
