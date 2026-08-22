export const ADMIN_EMAILS = [
  'cyber924@naver.com',
  'cyber924@gmail.com', // 현재 로그인 테스트 계정 포함하여 편리하게 즉시 테스트 가능
];

export function isUserAdmin(email?: string | null): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return ADMIN_EMAILS.some((adminEmail) => adminEmail.toLowerCase() === normalized);
}
