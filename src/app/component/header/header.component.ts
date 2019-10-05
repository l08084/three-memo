import { Component, OnInit, Input } from '@angular/core';
import { SpinnerService } from 'src/app/services/spinner.service';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';

/**
 * ヘッダーのコンポーネントクラス
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
    private spinnerService: SpinnerService
  ) {}

  ngOnInit() {}

  /**
   * ログアウト処理
   *
   * @memberof HeaderComponent
   */
  public signOut(): void {
    // スピナー表示
    this.spinnerService.show();
    // ログアウトAPIを呼び出す
    this.afAuth.auth
      .signOut()
      .then(() => {
        // ログアウトが成功したら、ログイン画面に遷移
        this.router.navigate(['/login']);
      })
      .catch(error => console.log(error))
      // 一連の処理が完了したらスピナーを消す
      .finally(() => this.spinnerService.hide());
  }
}
