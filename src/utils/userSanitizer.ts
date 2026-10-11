/**
 * Utility to sanitize user names.
 * Ensures no user is mistakenly assigned the legacy placeholder name "Lucky",
 * resolving cleanly to the user's customized nickname, "Owner" for the owner account,
 * or "User_XXXX" (last 4 digits of phone number).
 */
export function sanitizeUserName(name?: string | null, phone?: string | null): string {
  const cleanPhone = (phone || '').replace(/[^0-9]/g, '');
  if (!name || typeof name !== 'string') {
    return cleanPhone === '9510006797' ? 'Owner' : (cleanPhone ? `User_${cleanPhone.slice(-4)}` : 'User');
  }
  const trimmed = name.trim();
  if (!trimmed || trimmed.toLowerCase() === 'lucky') {
    return cleanPhone === '9510006797' ? 'Owner' : (cleanPhone ? `User_${cleanPhone.slice(-4)}` : 'User');
  }
  return trimmed;
}
