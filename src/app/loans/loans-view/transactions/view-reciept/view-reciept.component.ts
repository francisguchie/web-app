/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * View Transaction Reciept Component
 */
@Component({
  selector: 'mifosx-view-reciept',
  templateUrl: './view-reciept.component.html',
  styleUrls: ['./view-reciept.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    FaIconComponent
  ]
})
export class ViewRecieptComponent implements OnInit {
  /** trusted resource url for pentaho output */
  pentahoUrl: any;
  /** Transaction Reciept Data */
  transactionRecieptData: any;

  /**
   * Fetches transaction reciept `resolve`
   * @param {DomSanitizer} sanitizer DOM Sanitizer
   * @param {ActivatedRoute} route Activated Route
   */
  constructor(
    private sanitizer: DomSanitizer,
    private route: ActivatedRoute
  ) {
    this.route.data.subscribe((data: { loansTransactionReciept: any }) => {
      this.transactionRecieptData = data.loansTransactionReciept;
    });
  }

  ngOnInit() {
    const contentType = this.transactionRecieptData.headers.get('Content-Type');
    const file = new Blob([this.transactionRecieptData.body], { type: contentType });
    const filecontent = URL.createObjectURL(file);
    this.pentahoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(filecontent);
  }
}
