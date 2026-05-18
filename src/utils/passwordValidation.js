export const LOGIN_PASSWORD_MIN_LENGTH = 8;
export const REGISTER_PASSWORD_MIN_LENGTH = 8;

export function validateLoginPassword(password) {
  if (!password.trim()) {
    return "Password is required.";
  }

  if (password.length < LOGIN_PASSWORD_MIN_LENGTH) {
    return `Password must be at least ${LOGIN_PASSWORD_MIN_LENGTH} characters.`;
  }

  return "";
}

export function getRegisterPasswordChecks(password) {
  return [
    {
      label: `At least ${REGISTER_PASSWORD_MIN_LENGTH} characters`,
      passed: password.length >= REGISTER_PASSWORD_MIN_LENGTH,
    },
    {
      label: "One uppercase letter",
      passed: /[A-Z]/.test(password),
    },
    {
      label: "At least one lowercase letter",
      passed: /[a-z]/.test(password),
    },
    {
      label: "One number",
      passed: /\d/.test(password),
    },
    {
      label: "One special character",
      passed: /[^A-Za-z0-9]/.test(password),
    },
  ];
}

export function validateRegisterPassword(password) {
  if (!password.trim()) {
    return "Password is required.";
  }

  const failedCheck = getRegisterPasswordChecks(password).find(
    (check) => !check.passed
  );

  return failedCheck ? `Password must include ${failedCheck.label.toLowerCase()}.` : "";
}
