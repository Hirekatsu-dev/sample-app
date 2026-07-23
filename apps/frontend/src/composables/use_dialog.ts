import { readonly, ref } from 'vue';

/** ダイアログのボタン定義 */
export interface DialogButton {
  /** ボタンのラベル */
  label: string;
  /** ボタンのアクション識別子（返り値となる） */
  action: string;
  /** ボタンのバリアント */
  variant?:
    | 'primary'
    | 'secondary'
    | 'outline'
    | 'ghost'
    | 'success'
    | 'warning'
    | 'error';
}

/** ダイアログのオプション */
export interface DialogOptions {
  /** ダイアログのタイトル */
  title: string;
  /** ダイアログのメッセージ */
  message: string;
  /** ダイアログのボタン */
  buttons: DialogButton[];
  /** オーバーレイクリックで閉じるか */
  closeOnOverlayClick?: boolean;
  /** 閉じたときのアクション（オーバーレイクリックやESCキーで閉じた場合） */
  closeAction?: string;
}

/** 内部で管理するダイアログ情報 */
export interface DialogInstance {
  /** ダイアログのID */
  id: number;
  /** ダイアログのオプション */
  options: DialogOptions;
  /** アクション時のコールバック */
  resolve: (action: string) => void;
}

// グローバルなダイアログスタック
const dialogs = ref<DialogInstance[]>([]);
let dialogIdCounter = 0;

/**
 * ダイアログを表示するためのcomposable
 */
export const useDialog = () => {
  /**
   * ダイアログを表示し、ユーザーのアクションを待つ
   * @param options ダイアログのオプション
   * @returns ユーザーが選択したアクション
   */
  const showDialog = (options: DialogOptions): Promise<string> => {
    return new Promise((resolve) => {
      const id = ++dialogIdCounter;
      const instance: DialogInstance = {
        id,
        options: {
          closeOnOverlayClick: false,
          closeAction: 'close',
          ...options,
        },
        resolve: (action: string) => {
          // ダイアログをスタックから削除
          dialogs.value = dialogs.value.filter((d) => d.id !== id);
          resolve(action);
        },
      };
      dialogs.value.push(instance);
    });
  };

  /**
   * 確認ダイアログを表示（confirm互換）
   * @param message 確認メッセージ
   * @param title タイトル（省略可）
   * @returns 確認した場合true、キャンセルした場合false
   */
  const confirm = async (message: string, title = '確認'): Promise<boolean> => {
    const action = await showDialog({
      title,
      message,
      buttons: [
        { label: 'キャンセル', action: 'cancel', variant: 'outline' },
        { label: 'OK', action: 'ok', variant: 'primary' },
      ],
      closeOnOverlayClick: true,
      closeAction: 'cancel',
    });
    return action === 'ok';
  };

  /**
   * アラートダイアログを表示
   * @param message メッセージ
   * @param title タイトル（省略可）
   */
  const alert = async (message: string, title = 'お知らせ'): Promise<void> => {
    await showDialog({
      title,
      message,
      buttons: [{ label: 'OK', action: 'ok', variant: 'primary' }],
      closeOnOverlayClick: true,
      closeAction: 'ok',
    });
  };

  /**
   * 削除確認ダイアログを表示
   * @param itemName 削除対象の名前
   * @returns 削除を確認した場合true
   */
  const confirmDelete = async (itemName: string): Promise<boolean> => {
    const action = await showDialog({
      title: '削除の確認',
      message: `「${itemName}」を削除しますか？この操作は取り消せません。`,
      buttons: [
        { label: 'キャンセル', action: 'cancel', variant: 'outline' },
        { label: '削除', action: 'delete', variant: 'error' },
      ],
      closeOnOverlayClick: true,
      closeAction: 'cancel',
    });
    return action === 'delete';
  };

  return {
    /** 現在表示中のダイアログ一覧（読み取り専用） */
    dialogs: readonly(dialogs),
    /** カスタムダイアログを表示 */
    showDialog,
    /** 確認ダイアログを表示 */
    confirm,
    /** アラートダイアログを表示 */
    alert,
    /** 削除確認ダイアログを表示 */
    confirmDelete,
  };
};
