import {
  Component,
  OnInit,
  Input,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { FormGroup, FormControl, FormBuilder, NgForm } from '@angular/forms';
import { Memo } from 'src/app/entity/memo.entity';
import { Folder } from 'src/app/entity/folder.entity';
import { MemoService } from 'src/app/services/memo.service';
import { FolderService } from 'src/app/services/folder.service';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { SpinnerService } from 'src/app/services/spinner.service';
import { FolderCode } from 'src/app/constants/folder-code';
import { firestore } from 'firebase';
import { CustomValidator } from '../../validation/custom-validator';

/**
 * メモの新規作成・更新フォーム
 *
 * @export
 * @class UpsertFormComponent
 * @implements {OnInit}
 * @implements {OnChanges}
 */
@Component({
  selector: 'app-upsert-form',
  templateUrl: './upsert-form.component.html',
  styleUrls: ['./upsert-form.component.scss']
})
export class UpsertFormComponent implements OnInit, OnChanges {
  // FormGroup定義
  public createFormGroup: FormGroup;
  // Titleフォームのコントロール定義
  public titleControl: FormControl;
  // descriptionフォームのコントロール定義
  public descriptionControl: FormControl;
  public folderControl: FormControl;
  public memo: Memo;
  public folderList: Folder[];
  public folderNone: number;

  @Input() selectedMemoId: string;

  constructor(
    private fb: FormBuilder,
    private memoService: MemoService,
    private folderService: FolderService,
    private authenticationService: AuthenticationService,
    private afStore: AngularFirestore,
    private spinnerService: SpinnerService
  ) {
    this.createForm();
    this.folderControl = this.createFormGroup.get('folder') as FormControl;
    this.titleControl = this.createFormGroup.get('title') as FormControl;
    this.descriptionControl = this.createFormGroup.get(
      'description'
    ) as FormControl;
  }

  public ngOnInit() {
    this.retrieveFolder();
    this.folderNone = FolderCode.None;
  }

  public ngOnChanges(changes: SimpleChanges) {
    if (!this.selectedMemoId) {
      this.createFormGroup.reset();
    } else {
      // 画面遷移で渡したIDをキーにメモを取得
      this.memoService.retrieveMemo(this.selectedMemoId);

      this.memoService.memoCollection.valueChanges().subscribe(data => {
        this.memo = data[0];
        if (this.memo) {
          this.titleControl.setValue(this.memo.title);
          this.descriptionControl.setValue(this.memo.description);
          this.folderControl.setValue(this.memo.folderId);
        }
      });
    }
  }

  /**
   * フォーム設定の作成
   *
   */
  private createForm() {
    this.createFormGroup = this.fb.group(
      {
        title: ['', []],
        folder: ['', []],
        description: ['', []]
      },
      {
        validators: CustomValidator.titleOrDescriptionRequired
      }
    );
  }

  /**
   * メモ更新処理
   *
   * @memberof UpsertComponent
   */
  public onSubmit(form: NgForm) {
    if (this.selectedMemoId) {
      this.updateMemo();
    } else {
      this.registerMemo(form);
    }
  }

  public retrieveFolder() {
    const user = this.authenticationService.getCurrentUser();
    // 自分が作成したフォルダーを取得する
    this.folderService.folderCollection = this.afStore.collection(
      'folder',
      ref =>
        ref.orderBy('updatedDate', 'desc').where('createdUser', '==', user.uid)
    );

    this.setFolderList();
  }

  /**
   * 取得したフォルダーの一覧をセットする
   *
   * @private
   * @memberof UpsertFormComponent
   */
  private setFolderList() {
    this.folderService.folderCollection.valueChanges().subscribe(data => {
      this.spinnerService.show();
      this.folderList = data;
      this.spinnerService.hide();
    });
  }

  /**
   * メモの更新処理
   *
   * @private
   * @memberof UpsertFormComponent
   */
  private async updateMemo() {
    // スピナーを表示する
    this.spinnerService.show();

    this.memo.title = this.titleControl.value || '無題';
    this.memo.description = this.descriptionControl.value;
    this.memo.folderId = this.folderControl.value;
    this.memo.updatedDate = firestore.FieldValue.serverTimestamp();

    try {
      await this.memoService.updateMemo(this.memo);
      // 入力フォームをリセットする
      this.createFormGroup.reset();
    } catch (err) {
      console.log(err);
    } finally {
      // スピナーを非表示にする
      this.spinnerService.hide();
    }
  }

  /**
   * メモの新規作成
   *
   * @memberof CreateComponent
   */
  private async registerMemo(form: NgForm) {
    // スピナーを表示する
    this.spinnerService.show();

    // ログインしているユーザ情報の取得
    const user = this.authenticationService.getCurrentUser();

    // メモを新規作成する
    this.memo = {
      id: '',
      title: this.titleControl.value || '無題',
      description: this.descriptionControl.value,
      folderId: this.folderControl.value,
      createdUser: user.uid,
      createdDate: firestore.FieldValue.serverTimestamp(),
      updatedDate: firestore.FieldValue.serverTimestamp()
    };

    try {
      const docRef = await this.memoService.registerMemo(this.memo);

      this.memoService.memoCollection.doc(docRef.id).update({
        id: docRef.id
      });
      form.resetForm();
    } catch (err) {
      console.log(err);
    } finally {
      // スピナーを非表示にする
      this.spinnerService.hide();
    }
  }
}
