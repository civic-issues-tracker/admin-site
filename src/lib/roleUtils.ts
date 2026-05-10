export type CanonicalRole = 'resident' | 'system_admin' | 'organization_admin' | 'unknown';

// Aliases that should map to the organization admin experience.
const ORGANIZATION_ADMIN_ALIASES = new Set(['organization', 'organization_admin']);

export const normalizeRole = (roleName?: string | null): CanonicalRole => {
  if (!roleName) return 'unknown';
  if (roleName === 'system_admin') return 'system_admin';
  if (roleName === 'resident') return 'resident';
  if (ORGANIZATION_ADMIN_ALIASES.has(roleName)) return 'organization_admin';
  return 'unknown';
};

export const isOrganizationAdminRole = (roleName?: string | null): boolean => normalizeRole(roleName) === 'organization_admin';

export const hasAllowedRole = (roleName: string | null | undefined, allowedRoles?: string[]): boolean => {
  if (!allowedRoles || allowedRoles.length === 0) return true;
  const current = normalizeRole(roleName);
  const normalizedAllowed = allowedRoles.map((role) => normalizeRole(role));
  return normalizedAllowed.includes(current);
};
