import { describe, it, expect } from 'vitest';
import { normalizeRole, isOrganizationAdminRole } from './roleUtils';

describe('roleUtils', () => {
  it('does not treat officer as organization_admin', () => {
    expect(normalizeRole('officer')).toBe('unknown');
    expect(isOrganizationAdminRole('officer')).toBe(false);
  });

  it('treats organization alias as organization_admin', () => {
    expect(normalizeRole('organization')).toBe('organization_admin');
    expect(isOrganizationAdminRole('organization')).toBe(true);
  });
});
