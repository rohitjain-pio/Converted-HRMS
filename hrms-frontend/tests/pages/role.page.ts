import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object for Role List Page
 */
export class RoleListPage {
  readonly page: Page;
  readonly pageTitle: Locator;
  readonly searchInput: Locator;
  readonly addRoleButton: Locator;
  readonly dataTable: Locator;
  readonly paginationSelect: Locator;
  readonly paginationButtons: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.locator('h2:has-text("Roles")');
    this.searchInput = page.locator('input[placeholder*="Search roles"]');
    this.addRoleButton = page.locator('button:has-text("Add Role")');
    this.dataTable = page.locator('.v-data-table, table').first();
    this.paginationSelect = page.locator('.v-select input').first();
    this.paginationButtons = page.locator('.v-pagination');
  }

  async goto() {
    await this.page.goto('/roles');
    await this.page.waitForLoadState('networkidle');
  }

  async isVisible() {
    return await this.pageTitle.isVisible();
  }

  async searchRole(roleName: string) {
    await this.searchInput.fill(roleName);
    await this.page.waitForTimeout(600); // Wait for debounce
    await this.page.waitForLoadState('networkidle');
  }

  async clearSearch() {
    await this.searchInput.clear();
    await this.page.waitForTimeout(600);
    await this.page.waitForLoadState('networkidle');
  }

  async clickAddRole() {
    await this.addRoleButton.click();
    await this.page.waitForURL('**/roles/add');
  }

  async getTableRowCount(): Promise<number> {
    await this.page.waitForTimeout(1000);
    return await this.page.locator('tbody tr').count();
  }

  async getRoleNameInRow(rowIndex: number): Promise<string> {
    const row = this.page.locator('tbody tr').nth(rowIndex);
    const roleCell = row.locator('td').nth(1); // Assuming role name is 2nd column
    return await roleCell.textContent() || '';
  }

  async getUserCountInRow(rowIndex: number): Promise<string> {
    const row = this.page.locator('tbody tr').nth(rowIndex);
    const userCountButton = row.locator('button').first();
    return await userCountButton.textContent() || '0';
  }

  async clickEditRole(rowIndex: number) {
    const row = this.page.locator('tbody tr').nth(rowIndex);
    const editButton = row.locator('button[type="button"]').last();
    await editButton.click();
    await this.page.waitForURL('**/roles/edit/**');
  }

  async clickUserCount(rowIndex: number) {
    const row = this.page.locator('tbody tr').nth(rowIndex);
    const userCountButton = row.locator('button').first();
    await userCountButton.click();
  }

  async changePageSize(size: number) {
    // Click pagination select and choose size
    await this.paginationSelect.click();
    await this.page.locator(`.v-list-item:has-text("${size}")`).click();
    await this.page.waitForLoadState('networkidle');
  }

  async isAddButtonVisible(): Promise<boolean> {
    return await this.addRoleButton.isVisible();
  }

  async isEditButtonVisible(rowIndex: number): Promise<boolean> {
    const row = this.page.locator('tbody tr').nth(rowIndex);
    const editButton = row.locator('button[type="button"]').last();
    return await editButton.isVisible();
  }
}

/**
 * Page Object for Role Form Page (Add/Edit)
 */
export class RoleFormPage {
  readonly page: Page;
  readonly pageTitle: Locator;
  readonly backButton: Locator;
  readonly roleNameInput: Locator;
  readonly cancelButton: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.locator('h2');
    this.backButton = page.locator('button[aria-label*="arrow"], button:has(i.mdi-arrow-left)').first();
    this.roleNameInput = page.locator('input[type="text"]').first();
    this.cancelButton = page.locator('button:has-text("Cancel")');
    this.submitButton = page.locator('button[type="submit"]');
  }

  async gotoAdd() {
    await this.page.goto('/roles/add');
    await this.page.waitForLoadState('networkidle');
  }

  async gotoEdit(roleId: number) {
    await this.page.goto(`/roles/edit/${roleId}`);
    await this.page.waitForLoadState('networkidle');
  }

  async isCreateMode(): Promise<boolean> {
    const title = await this.pageTitle.textContent();
    return title?.includes('Create') || false;
  }

  async isEditMode(): Promise<boolean> {
    const title = await this.pageTitle.textContent();
    return title?.includes('Edit') || false;
  }

  async fillRoleName(name: string) {
    await this.roleNameInput.clear();
    await this.roleNameInput.fill(name);
  }

  async getRoleName(): Promise<string> {
    return await this.roleNameInput.inputValue();
  }

  async getModuleCount(): Promise<number> {
    return await this.page.locator('.permission-module').count();
  }

  async getModuleName(moduleIndex: number): Promise<string> {
    const module = this.page.locator('.permission-module').nth(moduleIndex);
    const moduleName = module.locator('.module-title').first();
    return await moduleName.textContent() || '';
  }

  async isModuleSelectAllChecked(moduleIndex: number): Promise<boolean> {
    const module = this.page.locator('.permission-module').nth(moduleIndex);
    const selectAllCheckbox = module.locator('.module-header input[type="checkbox"]').first();
    return await selectAllCheckbox.isChecked();
  }

  async clickModuleSelectAll(moduleIndex: number) {
    const module = this.page.locator('.permission-module').nth(moduleIndex);
    const selectAllCheckbox = module.locator('.module-header input[type="checkbox"]').first();
    await selectAllCheckbox.click();
    await this.page.waitForTimeout(300);
  }

  async getPermissionCount(moduleIndex: number): Promise<number> {
    const module = this.page.locator('.permission-module').nth(moduleIndex);
    return await module.locator('.permissions-grid input[type="checkbox"]').count();
  }

  async isPermissionChecked(moduleIndex: number, permissionIndex: number): Promise<boolean> {
    const module = this.page.locator('.permission-module').nth(moduleIndex);
    const permission = module.locator('.permissions-grid input[type="checkbox"]').nth(permissionIndex);
    return await permission.isChecked();
  }

  async clickPermission(moduleIndex: number, permissionIndex: number) {
    const module = this.page.locator('.permission-module').nth(moduleIndex);
    const permission = module.locator('.permissions-grid input[type="checkbox"]').nth(permissionIndex);
    await permission.click();
    await this.page.waitForTimeout(200);
  }

  async getCheckedPermissionCount(moduleIndex: number): Promise<number> {
    const module = this.page.locator('.permission-module').nth(moduleIndex);
    const checkboxes = module.locator('.permissions-grid input[type="checkbox"]');
    const count = await checkboxes.count();
    let checkedCount = 0;

    for (let i = 0; i < count; i++) {
      if (await checkboxes.nth(i).isChecked()) {
        checkedCount++;
      }
    }

    return checkedCount;
  }

  async getTotalCheckedPermissions(): Promise<number> {
    const moduleCount = await this.getModuleCount();
    let total = 0;

    for (let i = 0; i < moduleCount; i++) {
      total += await this.getCheckedPermissionCount(i);
    }

    return total;
  }

  async clickCancel() {
    await this.cancelButton.click();
    await this.page.waitForURL('**/roles');
  }

  async clickSubmit() {
    await this.submitButton.click();
    await this.page.waitForTimeout(1000);
  }

  async isSubmitButtonLoading(): Promise<boolean> {
    const loadingIcon = this.submitButton.locator('.v-progress-circular');
    return await loadingIcon.isVisible();
  }

  async getValidationError(): Promise<string | null> {
    const errorMessage = this.page.locator('.v-messages__message, .error--text').first();
    if (await errorMessage.isVisible()) {
      return await errorMessage.textContent();
    }
    return null;
  }

  async hasNoChangesWarning(): Promise<boolean> {
    // Check if there's a snackbar or alert about no changes
    const noChangeMessage = this.page.locator('text=/No modifications detected/i');
    return await noChangeMessage.isVisible({ timeout: 2000 }).catch(() => false);
  }
}
