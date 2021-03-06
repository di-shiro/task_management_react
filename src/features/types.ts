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

/* taskSlice.ts */

// GETでTaskにアクセスした時
export interface READ_TASK {
  id: number;
  task: string;
  description: string;
  criteria: string;
  status: string;
  status_name: string;
  category: number;
  category_item: string;
  estimate: number;
  responsible: number;
  responsible_username: string;
  owner: number;
  owner_username: string;
  created_at: string;
  updated_at: string;
}

// PostでTaskにアクセスした時
export interface POST_TASK {
  id: number;
  task: string;
  description: string;
  criteria: string;
  status: string;
  category: number;
  estimate: number;
  responsible: number;
}

// GETのレスポンスと同じデータ型を定義しておく（Django側のCategorySerializerに指定した）
export interface CATEGORY {
  id: number;
  item: string;
}

// taskStateのReduxの中で使うで使うデータ型
export interface TASK_STATE {
  tasks: READ_TASK[];
  editedTask: POST_TASK; // 編集中のTaskのState
  selectedTask: READ_TASK; // 選択されたTaskの情報を表示するためのState
  users: USER[]; // Usersのエンドポイントにアクセスした時のレスポンスを格納
  category: CATEGORY[]; // 全TaskのCategoryを格納
}

/* TaskList.tsx
    Task一覧表示画面でのTaskのソートに使う
*/
export interface SORT_STATE {
  rows: READ_TASK[] /*      サーバ側からGETで取得した全Taskを配列で保持 */;
  order: "desc" | "asc" /*  降順、昇順 */;
  activeKey: string /*      並べ替えるColumnの表題を保持 */;
}
