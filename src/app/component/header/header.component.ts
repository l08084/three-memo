import { Component, OnInit } from '@angular/core';
import { SpinnerService } from 'src/app/services/spinner.service';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';
import { ToastService } from '../../services/toast.service';
import { AuthenticationService } from 'src/app/services/authentication.service';

/**
 * 画面ヘッダーのコンポーネントクラス
 *
 * @export
 * @class HeaderComponent
 * @implements {OnInit}
 */
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  constructor(
    public afAuth: AngularFireAuth,
    private router: Router,
    private _toastService: ToastService,
    private authenticationService: AuthenticationService,
    private spinnerService: SpinnerService
  ) {}

  ngOnInit() {}

  /**
   * ログアウト処理
   *
   * @memberof HeaderComponent
   */
  public async signOut() {
    // スピナー表示
    this.spinnerService.show();
    // ログアウトAPIを呼び出す
    try {
      await this.authenticationService.signOut();
      // ログアウトが成功したら、ログイン画面に遷移
      this.router.navigate(['/login']);
      this._toastService.open('ログアウトしました。');
    } catch (error) {
      this._toastService.open('ログアウトに失敗しました。');
      console.log(error);
    } finally {
      this.spinnerService.hide();
    }
  }
}
