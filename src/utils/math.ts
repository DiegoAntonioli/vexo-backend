export const simulation = ({
  value,
  installments,
}: {
  value: number;
  installments: number;
}) => {
  // PMT=((((1+i)^n)*i)/(((1+i)^n)-1))*M
  const installmentValue =
    (value * Math.pow(1.045, installments) * 0.045) /
    (Math.pow(1.045, installments) - 1);

  return {
    totalValue: value,
    installmentValue,
    installments,
  };
};
