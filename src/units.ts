import BigNumber from "bignumber.js";

export function formatUnits(
  amount: number,
  decimals: number
): number {
  if (amount === 0) return 0;
  return Number(BigNumber(amount).div(BigNumber(10).pow(decimals)).toString());
}

export const parseUnits = ( 
  amount: string | number,
  decimals: number
) => {
  return Number(BigNumber(amount).multipliedBy(BigNumber(10).pow(decimals)).toString());
};

