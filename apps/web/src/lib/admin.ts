const adminEmails = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export function isAdmin(email: string): boolean {
  return adminEmails.includes(email.toLowerCase());
}
