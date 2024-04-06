import { phone as phoneParser } from "phone";

export const parseAndValidateCPF = ({
  cpf,
}: {
  cpf: string;
}): string | null => {
  if (!cpf) return null;
  const numberPattern = /\d+/g;
  const cpfMatchNumberPattern = cpf.match(numberPattern);
  if (!cpfMatchNumberPattern) return null;
  const cpfStr = cpfMatchNumberPattern.join("");
  const cpfArray = cpfStr.split("");
  if (
    cpfArray.length < 11 ||
    cpfStr === "00000000000" ||
    cpfStr === "11111111111" ||
    cpfStr === "22222222222" ||
    cpfStr === "33333333333" ||
    cpfStr === "44444444444" ||
    cpfStr === "55555555555" ||
    cpfStr === "66666666666" ||
    cpfStr === "77777777777" ||
    cpfStr === "88888888888" ||
    cpfStr === "99999999999"
  ) {
    return null;
  }
  const firstDigitAux =
    (parseInt(cpfArray[0]) * 10 +
      parseInt(cpfArray[1]) * 9 +
      parseInt(cpfArray[2]) * 8 +
      parseInt(cpfArray[3]) * 7 +
      parseInt(cpfArray[4]) * 6 +
      parseInt(cpfArray[5]) * 5 +
      parseInt(cpfArray[6]) * 4 +
      parseInt(cpfArray[7]) * 3 +
      parseInt(cpfArray[8]) * 2) %
    11;
  let firstDigit;
  if (firstDigitAux === 0 || firstDigitAux === 1) {
    firstDigit = 0;
  } else {
    firstDigit = 11 - firstDigitAux;
  }
  if (firstDigit !== parseInt(cpfArray[9])) {
    return null;
  }
  const secondDigitAux =
    (parseInt(cpfArray[0]) * 11 +
      parseInt(cpfArray[1]) * 10 +
      parseInt(cpfArray[2]) * 9 +
      parseInt(cpfArray[3]) * 8 +
      parseInt(cpfArray[4]) * 7 +
      parseInt(cpfArray[5]) * 6 +
      parseInt(cpfArray[6]) * 5 +
      parseInt(cpfArray[7]) * 4 +
      parseInt(cpfArray[8]) * 3 +
      parseInt(cpfArray[9]) * 2) %
    11;
  let secondDigit;
  if (secondDigitAux === 0 || secondDigitAux === 1) {
    secondDigit = 0;
  } else {
    secondDigit = 11 - secondDigitAux;
  }
  if (secondDigit !== parseInt(cpfArray[10])) {
    return null;
  }
  return cpfStr;
};

export const parseAndValidatePhone = ({
  phone,
}: {
  phone: string;
}): string | null => {
  if (!phone) return null;
  const numberPattern = /\d+/g;
  const phoneMatchNumberPattern = phone.match(numberPattern);
  if (!phoneMatchNumberPattern) return null;
  const phoneStr = phoneMatchNumberPattern.join("");
  const validationData = phoneParser("+" + phoneStr);
  if (validationData.isValid) return validationData.phoneNumber;
  return null;
};

export const parseAndValidateDate = ({
  date,
}: {
  date: string;
}): Date | null => {
  if (!date) return null;
  const numberPattern = /\d+/g;
  console.log({ date });
  const dateMatchNumberPattern = date.match(numberPattern);
  console.log({ dateMatchNumberPattern });
  if (!dateMatchNumberPattern) return null;
  if (dateMatchNumberPattern.length === 1) {
    const dateNumericStr = dateMatchNumberPattern.join("");
    if (dateNumericStr.length === 8) {
      const day = parseInt(dateNumericStr.slice(0, 2));
      const month = parseInt(dateNumericStr.slice(2, 4)) - 1;
      const year = parseInt(dateNumericStr.slice(4));
      console.log({ day, month, year });
      return new Date(year, month, day);
    }
  }
  if (dateMatchNumberPattern.length === 3) {
    const day = parseInt(dateMatchNumberPattern[0]);
    const month = parseInt(dateMatchNumberPattern[1]) - 1;
    const year = parseInt(dateMatchNumberPattern[2]);
    console.log({ dateMatchNumberPattern, day, month, year });
    return new Date(year, month, day);
  }
  return null;
};
