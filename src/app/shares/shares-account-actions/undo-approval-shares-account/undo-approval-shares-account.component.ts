/** Angular Imports */
import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

/** Custom Services */
import { SharesService } from 'app/shares/shares.service';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Undo Approval Shares Account Component
 */
@Component({
  selector: 'mifosx-undo-approval-shares-account',
  templateUrl: './undo-approval-shares-account.component.html',
  styleUrls: ['./undo-approval-shares-account.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    FormsModule
  ]
})
export class UndoApprovalSharesAccountComponent {
  /** Shares Account Id */
  accountId: any;

  /**
   * @param {SharesService} sharesService Shares Service
   * @param {ActivatedRoute} route Activated Route
   * @param {Router} router Router
   */
  constructor(
    private sharesService: SharesService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.accountId = this.route.parent.snapshot.params['shareAccountId'];
  }

  /**
   * Submits the form and undo the approval of share account,
   * if successful redirects to the share account.
   */
  submit() {
    this.sharesService.executeSharesAccountCommand(this.accountId, 'undoapproval', {}).subscribe(() => {
      this.router.navigate(['../../'], { relativeTo: this.route });
    });
  }
}
