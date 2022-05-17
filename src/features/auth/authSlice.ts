import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../app/store";
import axios from "axios";
import {
  AUTH_STATE,
  CRED,
  LOGIN_USER,
  POST_PROFILE,
  PROFILE,
  JWT,
  USER,
} from "../types";

// Login
export const fetchAsyncLogin = createAsyncThunk(
  "auth/login", // Actionの名前は好きなものでよい。
  async (auth: CRED) => {
    // axiosでPOSTアクセスした結果のResponseの型を Generics で指定している。型はJWT。
    const res = await axios.post<JWT>(
      `${process.env.REACT_APP_API_URL}/authen/jwt/create`,
      auth,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return res.data;
  }
);

// Register
export const fetchAsyncRegister = createAsyncThunk(
  "auth/register",
  async (auth: CRED) => {
    const res = await axios.post<USER>(
      `${process.env.REACT_APP_API_URL}/api/create/`,
      auth,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return res.data;
  }
);

// LoginUserの情報を取得する。
export const fetchAsyncGetMyProf = createAsyncThunk(
  "auth/loginuser",
  async () => {
    const res = await axios.get<LOGIN_USER>(
      `${process.env.REACT_APP_API_URL}/api/loginuser/`,
      {
        headers: {
          Authorization: `JWT ${localStorage.localJWT}`,
        },
      }
    );
    return res.data;
  }
);

// 新規Profile作成: 新規User作成後、連鎖してその新規UserのProfileを作成する。そのためAvatar画像はnullにしている。
export const fetchAsyncCreateProf = createAsyncThunk(
  "auth/createProfile",
  async () => {
    const res = await axios.post<PROFILE>(
      `${process.env.REACT_APP_API_URL}/api/profile/`,
      // 初回、Registerで新規Userを作成した際には、同時にAvatar画像を登録しないので、{img: null } としておく。
      { img: null },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `JWT ${localStorage.localJWT}`,
        },
      }
    );
    return res.data;
  }
);

// 全UserのProfileデータを取得
export const fetchAsyncGetProfs = createAsyncThunk(
  "auth/getProfiles",
  async () => {
    const res = await axios.get<PROFILE[]>(
      `${process.env.REACT_APP_API_URL}/api/profile/`,
      {
        headers: {
          Authorization: `JWT ${localStorage.localJWT}`,
        },
      }
    );
    return res.data;
  }
);

// ログイン後にProfileを編集する際に実行される
// この関数が呼ばれた際、コンポーネント側からprofileという引数を受け取る。
export const fetchAsyncUpdateProf = createAsyncThunk(
  "auth/updateProfile",
  async (profile: POST_PROFILE) => {
    const uploadData = new FormData(); // 空のFormDataオブジェクト
    // この関数の実行に当たり、 まずは画像が選択されているかをチェックした上で、FormData型の変数にappendで追加する。
    // img属性に画像本体と画像の名前を追加する。
    profile.img && uploadData.append("img", profile.img, profile.img.name);
    const res = await axios.put<PROFILE>(
      `${process.env.REACT_APP_API_URL}/api/profile/${profile.id}/`, // Profileを編集するUserのID
      uploadData,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `JWT ${localStorage.localJWT}`,
        },
      }
    );
    return res.data;
  }
);

const initialState: AUTH_STATE = {
  isLoginView: true,
  loginUser: {
    id: 0,
    username: "",
  },
  profiles: [{ id: 0, user_profile: 0, img: null }], // とりあえず、初期値として1つだけデータを定義しておく
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    toggleMode(state) {
      state.isLoginView = !state.isLoginView;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(
      fetchAsyncLogin.fulfilled,
      // action.Payload は、fetchAsyncLogin関数の戻り値return res.data が入ってくるので、genericsでJWT型を付ける。
      (state, action: PayloadAction<JWT>) => {
        // サーバ側からのレスポンスであるTokenには2つの値、refresh と access がある。Tokenはaccessに入っている。
        localStorage.setItem("localJWT", action.payload.access);
        action.payload.access && (window.location.href = "/tasks");
      }
    );
    builder.addCase(
      fetchAsyncGetMyProf.fulfilled,
      (state, action: PayloadAction<LOGIN_USER>) => {
        return {
          ...state,
          loginUser: action.payload, // ReduxStateの loginUser の属性に代入
        };
      }
    );
    builder.addCase(
      fetchAsyncGetProfs.fulfilled,
      (state, action: PayloadAction<PROFILE[]>) => {
        return {
          ...state,
          profiles: action.payload, // 全UserのProfilesデータを ReduxStateの profile属性に代入
        };
      }
    );
    builder.addCase(
      fetchAsyncUpdateProf.fulfilled,
      // fetchAsyncUpdateProfでサーバ側のDBにてデータを変更後、その変更データがレスポンスとして帰ってくる。
      // それを受け取るため、payload のデータ型は PROFILE を指定しておく。
      (state, action: PayloadAction<PROFILE>) => {
        return {
          // profilesには全UserのProfileデータが格納されている。その中からProfileを変更したUserのみ置き換える。
          ...state,
          profiles: state.profiles.map((prof) =>
            prof.id === action.payload.id ? action.payload : prof
          ),
        };
      }
    );
  },
});

export const { toggleMode } = authSlice.actions;

export const selectIsLoginView = (state: RootState) => state.auth.isLoginView;
export const selectLoginUser = (state: RootState) => state.auth.loginUser;
export const selectProfiles = (state: RootState) => state.auth.profiles;

export default authSlice.reducer;
