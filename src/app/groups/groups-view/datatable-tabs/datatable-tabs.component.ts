/** Angular Imports */
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EntityDatatableTabComponent } from '../../../shared/tabs/entity-datatable-tab/entity-datatable-tab.component';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Groups Datatable Tabs Component
 */
@Component({
  selector: 'mifosx-datatable-tabs',
  templateUrl: './datatable-tabs.component.html',
  styleUrls: ['./datatable-tabs.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    EntityDatatableTabComponent
  ]
})
export class DatatableTabsComponent {
  entityId: string;
  /** Group Datatable */
  entityDatatable: any;
  /** Multi Row Datatable Flag */
  multiRowDatatableFlag: boolean;

  /**
   * Fetches data table data from `resolve`
   * @param {ActivatedRoute} route Activated Route.
   */
  constructor(private route: ActivatedRoute) {
    this.entityId = this.route.parent.parent.snapshot.paramMap.get('groupId');

    this.route.data.subscribe((data: { groupDatatable: any }) => {
      this.entityDatatable = data.groupDatatable;
      this.multiRowDatatableFlag = this.entityDatatable.columnHeaders[0].columnName === 'id' ? true : false;
    });
  }
}
