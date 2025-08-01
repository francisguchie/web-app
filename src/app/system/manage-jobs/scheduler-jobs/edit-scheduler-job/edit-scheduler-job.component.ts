/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UntypedFormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';

/** Custom Services */
import { SystemService } from 'app/system/system.service';
import { MatCheckbox } from '@angular/material/checkbox';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Edit scheduler job component.
 */
@Component({
  selector: 'mifosx-edit-scheduler-job',
  templateUrl: './edit-scheduler-job.component.html',
  styleUrls: ['./edit-scheduler-job.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatCheckbox
  ]
})
export class EditSchedulerJobComponent implements OnInit {
  /** Job Data. */
  jobData: any;
  /** Job Form. */
  jobForm: any;

  /**
   * Retrieves the selected job data from `resolve`.
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {SystemService} systemService System Service.
   * @param {Router} router Router for navigation.
   * @param {ActivatedRoute} route Activated Route.
   */
  constructor(
    private route: ActivatedRoute,
    private systemService: SystemService,
    private router: Router,
    private formBuilder: UntypedFormBuilder
  ) {
    this.route.data.subscribe((data: { jobSelected: any }) => {
      this.jobData = data.jobSelected;
    });
  }

  /**
   * Creates and sets job form.
   */
  ngOnInit() {
    this.createJobForm();
  }

  /**
   * Creates and sets job form.
   */
  createJobForm() {
    this.jobForm = this.formBuilder.group({
      displayName: [
        this.jobData.displayName,
        Validators.required
      ],
      cronExpression: [
        this.jobData.cronExpression,
        Validators.required
      ],
      active: [this.jobData.active]
    });
  }

  /**
   * Submits the edit job form.
   */
  submit() {
    this.systemService.updateScheduler(this.jobData.jobId, this.jobForm.value).subscribe(() => {
      this.router.navigate(['../'], { relativeTo: this.route });
    });
  }
}
