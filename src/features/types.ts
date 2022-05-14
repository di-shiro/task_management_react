/* authSlice.ts にて利用するデータ型 */

/* Django側に作成したAPIエンドポイント loginuser/
から返却されたログインUserの情報を受け取る際に用いる型情報 */
export interface LOGIN_USER {
  id: number;
  username: string;
}

// 画像ファイルを取り扱う際に用いる型情報
export interface FILE extends Blob {
  readonly lastModified: number; // 最後に編集された日付
  readonly name: string;
}
/* // Django側のAPIエンドポイント profile/ にGETでアクセスした際に返却されたデータを保持するための型情報
受け取るデータはDjango のSerializerにて定義したクラスの fields の所に指定されたもの。 */
export interface PROFILE {
  id: number;
  user_profile: number;
  img: string | null; // avatar画像
}
// POSTの際は user_profile は更新できないので、型情報としてもuser_profileは含めないようにする
export interface POST_PROFILE {
  id: number;
  img: File | null;
}
// ログインの際にReact側からサーバ側へ送る username と password
export interface CRED {
  username: string;
  password: string;
}

// ログイン時にサーバ側で認証後に発行される JWT Token を受け取る際に用いる型情報
export interface JWT {
  refresh: string;
  access: string;
}
export interface USER {
  id: number;
  username: string;
}
// Reduxの中で使う
export interface AUTH_STATE {
  isLoginView: boolean; // ログイン画面にて、Login と Register との切り替えを管理する。
  loginUser: LOGIN_USER; // 上にて作成した interface LOGIN_USER を使う。
  profiles: PROFILE[]; // 上にて作成した interface PROFILE の配列構造。ログイン後にサーバから取得した全UserProfileを管理。
}
