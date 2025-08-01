/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UntypedFormControl, ReactiveFormsModule } from '@angular/forms';

/** Custom Services */
import { GroupsService } from 'app/groups/groups.service';
import { SettingsService } from 'app/settings/settings.service';

/** Custom Dialogs */
import { FormDialogComponent } from 'app/shared/form-dialog/form-dialog.component';

/** Custom Models */
import { FormfieldBase } from 'app/shared/form-dialog/formfield/model/formfield-base';
import { SelectBase } from 'app/shared/form-dialog/formfield/model/select-base';
import { Dates } from 'app/core/utils/dates';
import { MatFormField, MatLabel, MatHint } from '@angular/material/form-field';
import { NgFor, NgSwitch, NgSwitchCase } from '@angular/common';
import {
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
import { MatIconButton, MatButton } from '@angular/material/button';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { FindPipe } from '../../../../pipes/find.pipe';
import { DateFormatPipe } from '../../../../pipes/date-format.pipe';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Group Attendance component.
 */
@Component({
  selector: 'mifosx-group-attendance',
  templateUrl: './group-attendance.component.html',
  styleUrls: ['./group-attendance.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatHint,
    MatTable,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatCellDef,
    MatCell,
    NgSwitch,
    NgSwitchCase,
    MatIconButton,
    FaIconComponent,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    FindPipe,
    DateFormatPipe
  ]
})
export class GroupAttendanceComponent implements OnInit {
  /** Members data. */
  membersData: any;
  /** Group Data */
  groupData: any;
  /** Attendance Type Options */
  attendanceTypeOptions: any;
  /** Columns to be displayed in member's attendance table. */
  displayedColumns: string[] = [
    'name',
    'attendance'
  ];
  /** Start Date Form Control */
  meetingDate = new UntypedFormControl();
  /** Meeting Dates Data */
  meetingDates: any[];
  /** Data source for client members table. */
  dataSource: {}[];

  /**
   * Retrieves the group members data from `resolve`.
   * @param {ActivatedRoute} route Route
   * @param {Dates} dateUtils Date Utils
   * @param {Router} router Router
   * @param {GroupsService} groupsService Groups Service
   * @param {MatDialog} dialog Mat Dialog
   * @param {SettingsService} settingsService SettingsService
   */
  constructor(
    private route: ActivatedRoute,
    private dateUtils: Dates,
    private router: Router,
    private groupsService: GroupsService,
    public dialog: MatDialog,
    private settingsService: SettingsService
  ) {
    this.route.data.subscribe((data: { groupActionData: any }) => {
      this.groupData = data.groupActionData;
      this.membersData = data.groupActionData.clientMembers;
    });
  }

  /**
   * Sets the members table.
   */
  ngOnInit() {
    this.dataSource = this.membersData.map((member: any) => ({ clientId: member.id, attendanceType: 1 }));
    this.meetingDates = this.groupData.collectionMeetingCalendar.recurringDates.filter(
      (date: any) => new Date(date).getTime() < new Date().getTime()
    );
    this.getAttendanceOptions();
  }

  /**
   * Gets attendance type options based on calendar id.
   */
  getAttendanceOptions() {
    this.groupsService
      .getMeetingsTemplate(this.groupData.id, this.groupData.collectionMeetingCalendar.id)
      .subscribe((response: any) => {
        this.attendanceTypeOptions = response.attendanceTypeOptions;
      });
  }

  /**
   * Edits a member's attendance
   * @param {any} member Client Member
   */
  editAttendance(member: any) {
    const formfields: FormfieldBase[] = [
      new SelectBase({
        controlName: 'attendanceType',
        label: 'Attendance',
        value: member.attendanceType,
        options: { label: 'value', value: 'id', data: this.attendanceTypeOptions },
        required: false
      })

    ];
    const data = {
      title: 'Assign Member Attendance',
      layout: { addButtonText: 'Confirm' },
      formfields: formfields
    };
    const memberAttendanceDialogRef = this.dialog.open(FormDialogComponent, { data });
    memberAttendanceDialogRef.afterClosed().subscribe((response: any) => {
      if (response.data) {
        const updatedMemeber = { ...member, ...response.data.value };
        this.dataSource.splice(this.dataSource.indexOf(member), 1, updatedMemeber);
        this.dataSource = this.dataSource.concat([]);
      }
    });
  }

  /**
   * Assigns Client Members Attendance
   */
  submit() {
    // TODO: Update once language and date settings are setup
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const prevMeetingDate: Date = new Date(this.meetingDate.value);
    const data = {
      meetingDate: this.dateUtils.formatDate(prevMeetingDate, dateFormat),
      calendarId: this.groupData.collectionMeetingCalendar.id,
      clientsAttendance: this.dataSource,
      dateFormat,
      locale
    };
    this.groupsService
      .assignGroupAttendance(this.groupData.id, this.groupData.collectionMeetingCalendar.id, data)
      .subscribe(() => {
        this.router.navigate(['../../'], { relativeTo: this.route });
      });
  }
}
