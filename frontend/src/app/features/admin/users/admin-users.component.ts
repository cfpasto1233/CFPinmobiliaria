import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { UsersActions } from '../../../store/Users/users.actions';
import {
  selectUsersError,
  selectUsersList,
  selectUsersLoading,
} from '../../../store/Users/users.selectors';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin-users.html',
  styleUrl: './admin-users.scss',
})
export class AdminUsersComponent implements OnInit {
  private readonly store = inject(Store);

  protected readonly users = this.store.selectSignal(selectUsersList);
  protected readonly loading = this.store.selectSignal(selectUsersLoading);
  protected readonly error = this.store.selectSignal(selectUsersError);

  ngOnInit(): void {
    this.store.dispatch(UsersActions.load());
  }
}
