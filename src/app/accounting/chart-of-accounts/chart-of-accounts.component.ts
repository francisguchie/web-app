/** Angular Imports */
import { Component, OnInit, TemplateRef, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import {
  MatTableDataSource,
  MatTable,
  MatColumnDef,
  MatHeaderCellDef,
  MatHeaderCell,
  MatCellDef,
  MatCell,
  MatHeaderRowDef,
  MatHeaderRow,
  MatRowDef,
  MatRow
} from '@angular/material/table';
import {
  MatTreeNestedDataSource,
  MatTree,
  MatTreeNodeDef,
  MatTreeNode,
  MatTreeNodeToggle,
  MatNestedTreeNode,
  MatTreeNodeOutlet
} from '@angular/material/tree';
import { NestedTreeControl } from '@angular/cdk/tree';
import { UntypedFormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

/** rxjs Imports */
import { of } from 'rxjs';

/** Custom Models */
import { GLAccountNode } from './gl-account-node.model';

/** Custom Services */
import { GlAccountTreeService } from './gl-account-tree.service';
import { PopoverService } from '../../configuration-wizard/popover/popover.service';
import { ConfigurationWizardService } from '../../configuration-wizard/configuration-wizard.service';
import { TreeControlService } from 'app/shared/common-logic/tree-control.service';
import { MatButtonToggleGroup, MatButtonToggle } from '@angular/material/button-toggle';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Chart of accounts component.
 */
@Component({
  selector: 'mifosx-chart-of-accounts',
  templateUrl: './chart-of-accounts.component.html',
  styleUrls: ['./chart-of-accounts.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatButtonToggleGroup,
    MatButtonToggle,
    FaIconComponent,
    MatTable,
    MatSort,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatSortHeader,
    MatCellDef,
    MatCell,
    MatTooltip,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    MatPaginator,
    MatTree,
    MatTreeNodeDef,
    MatTreeNode,
    MatTreeNodeToggle,
    MatIconButton,
    MatNestedTreeNode,
    MatTreeNodeOutlet
  ]
})
export class ChartOfAccountsComponent implements AfterViewInit, OnInit {
  /** Button toggle group form control for type of view. (list/tree) */
  viewGroup = new UntypedFormControl('listView');
  /** GL Account data. */
  glAccountData: any;
  /** Columns to be displayed in chart of accounts table. */
  displayedColumns: string[] = [
    'name',
    'glCode',
    'glAccountType',
    'disabled',
    'manualEntriesAllowed',
    'usedAs'
  ];
  /** Data source for chart of accounts table. */
  tableDataSource: MatTableDataSource<any>;
  /** Nested tree control for chart of accounts tree. */
  nestedTreeControl: NestedTreeControl<GLAccountNode>;
  /** Nested tree data source for chart of accounts tree. */
  nestedTreeDataSource: MatTreeNestedDataSource<GLAccountNode>;
  /** Selected GL Account. */
  glAccount: GLAccountNode;
  /** Flag to check if tree is expanded or collapsed. */
  isTreeExpanded = true;

  /** Paginator for chart of accounts table. */
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  /** Sorter for chart of accounts table. */
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  /* Reference of Tree View Button */
  @ViewChild('buttonTreeView') buttonTreeView: ElementRef<any>;
  /* Template for popover on tree view button */
  @ViewChild('templateButtonTreeView') templateButtonTreeView: TemplateRef<any>;
  /* Reference of Accounts Table */
  @ViewChild('accountsTable') accountsTable: ElementRef<any>;
  /* Template for popover on accounts table */
  @ViewChild('templateAccountsTable') templateAccountsTable: TemplateRef<any>;

  /**
   * Retrieves the gl accounts data from `resolve` and initializes(generates) gl accounts tree.
   * @param {GlAccountTreeService} glAccountTreeService GL Account tree service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router.
   * @param {ConfigurationWizardService} configurationWizardService ConfigurationWizard Service.
   * @param {PopoverService} popoverService PopoverService.
   */
  constructor(
    private glAccountTreeService: GlAccountTreeService,
    private route: ActivatedRoute,
    private router: Router,
    private treeControlService: TreeControlService,
    private configurationWizardService: ConfigurationWizardService,
    private popoverService: PopoverService
  ) {
    this.route.data.subscribe((data: { chartOfAccounts: any }) => {
      this.glAccountData = data.chartOfAccounts;
      glAccountTreeService.initialize(this.glAccountData);
    });
    this.nestedTreeControl = new NestedTreeControl<GLAccountNode>(this._getChildren);
    this.nestedTreeDataSource = new MatTreeNestedDataSource<GLAccountNode>();
  }

  /**
   * Initializes the data source for chart of accounts table and tree.
   */
  ngOnInit() {
    this.tableDataSource = new MatTableDataSource(this.glAccountData);
    this.glAccountTreeService.treeDataChange.subscribe((glAccountTreeData: GLAccountNode[]) => {
      this.nestedTreeDataSource.data = glAccountTreeData;
      this.nestedTreeControl.expand(this.nestedTreeDataSource.data[0]);
      this.nestedTreeControl.dataNodes = glAccountTreeData;
    });
  }

  /**
   * Initializes the paginator and sorter for chart of accounts table.
   */
  ngAfterViewInit() {
    this.tableDataSource.paginator = this.paginator;
    this.tableDataSource.sortingDataAccessor = (glAccount: any, property: any) => {
      switch (property) {
        case 'glAccountType':
          return glAccount.type.value;
        case 'usedAs':
          return glAccount.usage.value;
        default:
          return glAccount[property];
      }
    };
    this.tableDataSource.sort = this.sort;
    if (this.configurationWizardService.showChartofAccountsPage === true) {
      setTimeout(() => {
        this.showPopover(this.templateButtonTreeView, this.buttonTreeView.nativeElement, 'bottom', true);
      });
    }

    if (this.configurationWizardService.showChartofAccountsList === true) {
      setTimeout(() => {
        this.showPopover(this.templateAccountsTable, this.accountsTable.nativeElement, 'top', true);
      });
    }
  }

  /**
   * Filters data in chart of accounts table based on passed value.
   * @param {string} filterValue Value to filter data.
   */
  applyFilter(filterValue: string) {
    this.tableDataSource.filter = filterValue.trim().toLowerCase();
  }

  /**
   * View selected gl account.
   * @param {GLAccountNode} glAccount GL Account to be viewed.
   */
  viewGLAccountNode(glAccount: GLAccountNode) {
    if (glAccount.glCode) {
      this.glAccount = glAccount;
    } else {
      delete this.glAccount;
    }
  }

  /**
   * Checks if selected node in tree has children.
   */
  hasNestedChild = (_: number, node: GLAccountNode) => node.children.length;

  /**
   * Gets the children of selected node in tree.
   */
  private _getChildren = (node: GLAccountNode) => of(node.children);

  /**
   * Popover function
   * @param template TemplateRef<any>.
   * @param target HTMLElement | ElementRef<any>.
   * @param position String.
   * @param backdrop Boolean.
   */
  showPopover(
    template: TemplateRef<any>,
    target: HTMLElement | ElementRef<any>,
    position: string,
    backdrop: boolean
  ): void {
    setTimeout(() => this.popoverService.open(template, target, position, backdrop, {}), 200);
  }

  /**
   * Next Step (Create Charts of Accounts Page) Configuration Wizard.
   */
  nextStep() {
    this.configurationWizardService.showChartofAccountsPage = false;
    this.configurationWizardService.showChartofAccountsList = false;
    this.configurationWizardService.showChartofAccountsForm = true;
    this.router.navigate(['/accounting/chart-of-accounts/gl-accounts/create']);
  }

  /**
   * Previous Step (Charts of Accounts Accounting Page) Configuration Wizard.
   */
  previousStep() {
    this.configurationWizardService.showChartofAccountsPage = false;
    this.configurationWizardService.showChartofAccountsList = false;
    this.configurationWizardService.showChartofAccounts = true;
    this.router.navigate(['/accounting']);
  }

  /**
   * Expand and Collapse the tree
   */
  toggleExpandCollapse() {
    this.isTreeExpanded = this.treeControlService.toggleExpandCollapse(this.nestedTreeControl, this.isTreeExpanded);
  }
}
