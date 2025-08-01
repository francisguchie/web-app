/** Angular Imports */
import { Component, OnInit, Input, OnChanges } from '@angular/core';
// import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
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

/** Dialog Components */
import { DeleteDialogComponent } from 'app/shared/delete-dialog/delete-dialog.component';
import { FormDialogComponent } from 'app/shared/form-dialog/form-dialog.component';
// import { LoansAccountAddCollateralDialogComponent } from 'app/loans/custom-dialog/loans-account-add-collateral-dialog/loans-account-add-collateral-dialog.component';

/** Custom Services */
import { DatepickerBase } from 'app/shared/form-dialog/formfield/model/datepicker-base';
import { FormfieldBase } from 'app/shared/form-dialog/formfield/model/formfield-base';
import { InputBase } from 'app/shared/form-dialog/formfield/model/input-base';
import { SettingsService } from 'app/settings/settings.service';
import { Dates } from 'app/core/utils/dates';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButton, MatIconButton } from '@angular/material/button';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { MatDivider } from '@angular/material/divider';
import { MatStepperPrevious, MatStepperNext } from '@angular/material/stepper';
import { DateFormatPipe } from '../../../pipes/date-format.pipe';
import { FormatNumberPipe } from '../../../pipes/format-number.pipe';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Recurring Deposit Account Charges Step
 */
@Component({
  selector: 'mifosx-loans-account-charges-step',
  templateUrl: './loans-account-charges-step.component.html',
  styleUrls: ['./loans-account-charges-step.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    FaIconComponent,
    MatTable,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatCellDef,
    MatCell,
    MatIconButton,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    MatDivider,
    MatStepperPrevious,
    MatStepperNext,
    DateFormatPipe,
    FormatNumberPipe
  ]
})
export class LoansAccountChargesStepComponent implements OnInit, OnChanges {
  // @Input loansAccountProductTemplate: LoansAccountProductTemplate
  @Input() loansAccountProductTemplate: any;
  // @Imput loansAccountTemplate: LoansAccountTemplate
  @Input() loansAccountTemplate: any;
  // @Input() loansAccountFormValid: LoansAccountFormValid
  @Input() loansAccountFormValid: boolean;
  /** active Client Members in case of GSIM Account */
  @Input() activeClientMembers?: any;
  // returns the chosen savings account linked to the loan account
  @Input() loansSavingsAccountLinked: any;

  /** Charges Data */
  chargeData: any;
  /** Charges Data Source */
  chargesDataSource: {}[] = [];
  /** Overdue Charges Data Source */
  overDueChargesDataSource: {}[] = [];
  /** Collateral Data Source */
  collateralDataSource: {}[] = [];
  /** Charges table columns */
  chargesDisplayedColumns: string[] = [
    'name',
    'chargeCalculationType',
    'amount',
    'chargeTimeType',
    'date',
    'action'
  ];
  /** Columns to be displayed in overdue charges table. */
  overdueChargesDisplayedColumns: string[] = [
    'name',
    'type',
    'amount',
    'collectedon'
  ];
  /** Table Data Source */
  dataSource: any;
  /** Check for select all the Clients List */
  selectAllItems = false;
  /** Loan Purpose Options */
  loanPurposeOptions: string[] = [];
  /** Table Displayed Columns */
  displayedColumn: string[] = [
    'check',
    'id',
    'name',
    'purpose',
    'amount'
  ];
  /** Component is pristine if there has been no changes by user interaction */
  pristine = true;
  /** Check if value of collateral added  is more than principal amount */
  isCollateralSufficient = false;
  /** Total value of all collateral added to a loan */
  totalCollateralValue: any = 0;
  loanId: any = null;

  /**
   * Loans Account Charges Form Step
   * @param {dialog} MatDialog Mat Dialog
   * @param {Dates} dateUtils Date Utils
   * @param {SettingsService} settingsService Settings Service
   */
  constructor(
    public dialog: MatDialog,
    private dateUtils: Dates,
    private route: ActivatedRoute,
    private settingsService: SettingsService
  ) {
    this.loanId = this.route.snapshot.params['loanId'];
  }

  ngOnInit() {
    if (this.loansAccountTemplate && this.loansAccountTemplate.charges) {
      this.chargesDataSource =
        this.loansAccountTemplate.charges.map((charge: any) => ({ ...charge, id: charge.chargeId })) || [];
    }
    this.dataSource = new MatTableDataSource<any>(this.activeClientMembers);
  }

  /**
   * Executes on change of input values
   */
  ngOnChanges() {
    if (this.loansAccountProductTemplate) {
      this.loanPurposeOptions = this.loansAccountProductTemplate.loanPurposeOptions;
      this.chargeData = this.loansAccountProductTemplate.chargeOptions;
      // filter chargeData to have charges that have chargePaymentMode not 'Account Transfer' if loansSavingsAccountLinked is false
      if (!this.loansSavingsAccountLinked) {
        this.chargeData = this.chargeData.filter(
          (charge: any) => charge.chargePaymentMode?.value != 'Account transfer'
        );
      }
      if (this.loansAccountProductTemplate.overdueCharges) {
        this.overDueChargesDataSource = this.loansAccountProductTemplate.overdueCharges;
      }
      if (
        this.loansAccountProductTemplate.charges &&
        this.loansAccountProductTemplate.charges.length > 0 &&
        this.chargesDataSource.length === 0
      ) {
        this.chargesDataSource =
          this.loansAccountProductTemplate.charges.map((charge: any) => ({ ...charge, id: charge.chargeId })) || [];
      }
    }
  }

  /**
   * Add a charge
   */
  addCharge(charge: any) {
    this.chargesDataSource = this.chargesDataSource.concat([charge.value]);
    charge.value = '';
    this.pristine = false;
  }

  /**
   * Edits the Charge Amount
   * @param {any} charge Charge
   */
  editChargeAmount(charge: any) {
    const formfields: FormfieldBase[] = [
      new InputBase({
        controlName: 'amount',
        label: 'Amount',
        value: charge.amount,
        type: 'number',
        required: false
      })

    ];
    const data = {
      title: 'Edit Charge Amount',
      layout: { addButtonText: 'Confirm' },
      formfields: formfields
    };
    const editNoteDialogRef = this.dialog.open(FormDialogComponent, { data });
    editNoteDialogRef.afterClosed().subscribe((response: any) => {
      if (response.data) {
        const newCharge = { ...charge, amount: response.data.value.amount };
        this.chargesDataSource.splice(this.chargesDataSource.indexOf(charge), 1, newCharge);
        this.chargesDataSource = this.chargesDataSource.concat([]);
      }
    });
    this.pristine = false;
  }

  /**
   * Edits the Charge Date
   * @param {any} charge Charge
   */
  editChargeDate(charge: any) {
    const formfields: FormfieldBase[] = [
      new DatepickerBase({
        controlName: 'date',
        label: 'Date',
        value: charge.dueDate || charge.feeOnMonthDay || '',
        type: 'datetime-local',
        required: false
      })

    ];
    const data = {
      title: 'Edit Charge Date',
      layout: { addButtonText: 'Confirm' },
      formfields: formfields
    };
    const editNoteDialogRef = this.dialog.open(FormDialogComponent, { data });
    editNoteDialogRef.afterClosed().subscribe((response: any) => {
      if (response.data) {
        let newCharge: any;
        const dateFormat = this.settingsService.dateFormat;
        const date = this.dateUtils.formatDate(response.data.value.date, dateFormat);
        switch (charge.chargeTimeType.value) {
          case 'Specified due date':
          case 'Weekly Fee':
            newCharge = { ...charge, dueDate: date };
            break;
          case 'Annual Fee':
            newCharge = { ...charge, feeOnMonthDay: date };
            break;
        }
        this.chargesDataSource.splice(this.chargesDataSource.indexOf(charge), 1, newCharge);
        this.chargesDataSource = this.chargesDataSource.concat([]);
      }
    });
    this.pristine = false;
  }

  /**
   * Edits the Charge Fee Interval
   * @param {any} charge Charge
   */
  editChargeFeeInterval(charge: any) {
    const formfields: FormfieldBase[] = [
      new InputBase({
        controlName: 'feeInterval',
        label: 'Fee Interval',
        value: charge.feeInterval,
        type: 'text',
        required: false
      })

    ];
    const data = {
      title: 'Edit Charge Fee Interval',
      layout: { addButtonText: 'Confirm' },
      formfields: formfields
    };
    const editNoteDialogRef = this.dialog.open(FormDialogComponent, { data });
    editNoteDialogRef.afterClosed().subscribe((response: any) => {
      if (response.data) {
        const newCharge = { ...charge, feeInterval: response.data.value.feeInterval };
        this.chargesDataSource.splice(this.chargesDataSource.indexOf(charge), 1, newCharge);
        this.chargesDataSource = this.chargesDataSource.concat([]);
      }
    });
    this.pristine = false;
  }

  /**
   * Delete a particular charge
   * @param charge Charge
   */
  deleteCharge(charge: any) {
    const deleteChargeDialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { deleteContext: `charge ${charge.name}` }
    });
    deleteChargeDialogRef.afterClosed().subscribe((response: any) => {
      if (response.delete) {
        this.chargesDataSource.splice(this.chargesDataSource.indexOf(charge), 1);
        this.chargesDataSource = this.chargesDataSource.concat([]);
        this.pristine = false;
      }
    });
  }

  get isValid() {
    return true;
    // !this.activeClientMembers ||
    // this.selectedClientMembers?.selectedMembers?.reduce((acc: any, cur: any) => acc + (cur.principal ?? 0), 0) > 0
  }

  /**
   * Returns Loans Account Charges and Collateral Form
   */
  get loansAccountCharges() {
    return {
      charges: this.chargesDataSource
    };
  }

  get selectedClientMembers() {
    return { selectedMembers: this.activeClientMembers.filter((item: any) => item.selected) };
  }

  /** Toggle all checks */
  toggleSelects() {
    for (const member of this.activeClientMembers) {
      member.selected = this.selectAllItems;
    }
  }

  /** Check if all the checks are selected */
  toggleSelect() {
    const len = this.activeClientMembers.length;
    this.selectAllItems =
      len === 0 ? false : this.activeClientMembers.filter((item: any) => item.selected).length === len;
  }
}
