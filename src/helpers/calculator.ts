export const f = ({
  loan,
  installmentValue,
  installments,
  interestRateMultiplier,
}) =>
  loan * Math.pow(interestRateMultiplier, installments + 1) -
  (loan + installmentValue) * Math.pow(interestRateMultiplier, installments) +
  installmentValue;

export const fPrime = ({
  loan,
  installmentValue,
  installments,
  interestRateMultiplier,
}) =>
  loan * (installments + 1) * Math.pow(interestRateMultiplier, installments) -
  (loan + installmentValue) *
    installments *
    Math.pow(interestRateMultiplier, installments - 1);

export const calculateInterestRate = ({
  loan,
  installmentValue,
  installments,
}) => {
  const guess = 0.01;
  const tol = 0.000001;

  if (!loan || !installments || !installmentValue)
    return { interestRate: null };

  let interestRateMultiplier = guess;

  for (let i = 0; i < 1000; i++) {
    if (
      Math.abs(
        f({
          loan,
          installmentValue,
          installments,
          interestRateMultiplier,
        }),
      ) <= tol
    )
      return { interestRate: interestRateMultiplier - 1 };

    interestRateMultiplier =
      interestRateMultiplier -
      f({
        loan,
        installmentValue,
        installments,
        interestRateMultiplier,
      }) /
        fPrime({
          loan,
          installmentValue,
          installments,
          interestRateMultiplier,
        });
  }

  return { interestRate: null };
};

export const newCalculateIntallmentAndTotalValues = ({
  loan,
  interestRate,
  firstPaymentDate,
  disbursementDate,
  installments,
  installmentValue,
  lastTotalInterest = 0,
  count = 0,
}) => {
  const tol = 0.000001;
  const dailyInterest = Math.pow(interestRate, 1 / 30);
  let daysPassed =
    (firstPaymentDate.valueOf() - disbursementDate.valueOf()) /
    (24 * 60 * 60 * 1000);
  let remainingValue = loan;
  let totalInterest = 0;
  const firstPaymentDay = firstPaymentDate.getDate();
  let lastPaymentDate = firstPaymentDate;
  let installmentInterestRate = Math.pow(dailyInterest, daysPassed) - 1;
  let interest = installmentInterestRate * remainingValue;
  totalInterest += interest;
  let deductable = installmentValue - interest;
  remainingValue -= deductable;
  for (let i = 1; i < installments; i++) {
    let installmentDueDate = new Date(lastPaymentDate);
    if (installmentDueDate.getDate() === 1 && firstPaymentDay !== 1) {
      installmentDueDate.setDate(firstPaymentDay);
    } else {
      installmentDueDate.setMonth(installmentDueDate.getMonth() + 1);
      if (installmentDueDate.getMonth() - installmentDueDate.getMonth() > 1) {
        installmentDueDate.setDate(1);
      }
    }

    daysPassed =
      (installmentDueDate.valueOf() - lastPaymentDate.valueOf()) /
      (1000 * 60 * 60 * 24);

    installmentInterestRate =
      // daysPassed === 30
      //   ? interestRate - 1
      //   :
      Math.pow(dailyInterest, daysPassed) - 1;

    interest = remainingValue * installmentInterestRate;
    deductable = installmentValue - interest;

    remainingValue -= deductable;
    lastPaymentDate = installmentDueDate;

    totalInterest += interest;
  }

  if (
    lastTotalInterest !== totalInterest &&
    Math.abs(remainingValue) > tol &&
    count < 1000
  ) {
    return newCalculateIntallmentAndTotalValues({
      loan,
      interestRate,
      firstPaymentDate,
      disbursementDate,
      installments,
      installmentValue: (loan + totalInterest) / installments,
      lastTotalInterest: totalInterest,
      count: count + 1,
    });
  }
  return { installmentValue: installmentValue };
};

export const newCaclIOF = ({
  loan,
  interestRate,
  firstPaymentDate,
  disbursementDate,
  installments,
  installmentValue,
}) => {
  const dailyInterest = Math.pow(interestRate, 1 / 30);
  const firstPaymentDay = firstPaymentDate.getDate();
  const firstPaymentMonth = firstPaymentDate.getMonth();
  let remainingValue = loan;

  let daysPassed =
    (firstPaymentDate.valueOf() - disbursementDate.valueOf()) /
    (1000 * 60 * 60 * 24);
  let installMentInterestRate =
    daysPassed === 30 ? interestRate : Math.pow(dailyInterest, daysPassed);
  let interest = remainingValue * (installMentInterestRate - 1);

  let deductable = installmentValue - interest;
  let aditionalIOF = deductable * 0.0038;
  let taxaIOF = daysPassed * 0.000082;
  let iof = daysPassed * deductable * 0.000082;

  let totalIOF = aditionalIOF + iof;

  console.log({
    aditionalIOF,
    iof,
    total: aditionalIOF + iof,
    taxaIOF,
    deductable,
    interest,
    installMentInterestRate,
    daysPassed,
    totalIOF,
  });

  remainingValue -= deductable;
  let lastPaymentDate = firstPaymentDate;
  let lastPaymentMonth = firstPaymentMonth;

  for (let i = 1; i < installments; i++) {
    let installmentDueDate = new Date(lastPaymentDate);
    if (installmentDueDate.getDate() === 1 && firstPaymentDay !== 1) {
      installmentDueDate.setDate(firstPaymentDay);
    } else {
      installmentDueDate.setMonth(lastPaymentMonth + 1);
      if (installmentDueDate.getMonth() - lastPaymentMonth > 1) {
        installmentDueDate.setDate(1);
      }
    }
    const installmentdaysPassed =
      (installmentDueDate.valueOf() - lastPaymentDate.valueOf()) /
      (1000 * 60 * 60 * 24);
    installMentInterestRate =
      // installmentdaysPassed === 30
      //   ? interestRate
      //   :
      Math.pow(dailyInterest, installmentdaysPassed);
    interest = remainingValue * (installMentInterestRate - 1);
    daysPassed += installmentdaysPassed;

    deductable = installmentValue - interest;
    aditionalIOF = deductable * 0.0038;
    taxaIOF = daysPassed > 366 ? 0.03 : daysPassed * 0.000082;
    iof = taxaIOF * deductable;
    totalIOF += aditionalIOF + iof;

    remainingValue -= deductable;

    lastPaymentDate = installmentDueDate;
    lastPaymentMonth = installmentDueDate.getMonth();
  }
  totalIOF -= remainingValue;
  console.log({ loan, totalIOF });
  const iofFinanciado = (totalIOF * loan) / (loan - totalIOF);
  console.log({ totalIOF, remainingValue, iofFinanciado });
  return iofFinanciado;
};
