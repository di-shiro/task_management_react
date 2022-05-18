import React, { useEffect } from "react";
import styles from "./App.module.css";
import { Grid, Avatar } from "@material-ui/core";
import {
  makeStyles,
  createTheme,
  MuiThemeProvider,
  Theme,
} from "@material-ui/core/styles";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import PolymerIcon from "@material-ui/icons/Polymer";

import { useSelector, useDispatch } from "react-redux";
import {
  selectLoginUser,
  selectProfiles,
  fetchAsyncGetMyProf,
  fetchAsyncGetProfs,
  fetchAsyncUpdateProf,
} from "./features/auth/authSlice";
import {
  fetchAsyncGetTasks,
  fetchAsyncGetUsers,
  fetchAsyncGetCategory,
  selectEditedTask,
  selectTasks,
} from "./features/task/taskSlice";

import TaskList from "./features/task/TaskList";
import TaskForm from "./features/task/TaskForm";
import TaskDisplay from "./features/task/TaskDisplay";

import { AppDispatch } from "./app/store";

// TaskListの画面上に、Taskのstatus「Done」の表示を緑色にカスタマイズする。
const theme = createTheme({
  palette: {
    secondary: {
      main: "#3cb371",
    },
  },
});
const useStyles = makeStyles((theme: Theme) => ({
  icon: {
    marginTop: theme.spacing(3),
    cursor: "none",
  },
  avatar: {
    marginLeft: theme.spacing(1),
  },
}));

// justifyContent="center"
const App: React.FC = () => {
  const classes = useStyles();
  const dispatch: AppDispatch = useDispatch();
  const editedTask = useSelector(selectEditedTask);
  const tasks = useSelector(selectTasks);
  const loginUser = useSelector(selectLoginUser);
  const profiles = useSelector(selectProfiles);

  /* 全UserのProfileからLoginUserのProfileのみを絞り込む。
  filterの返り値はクエリーセットになっているので、オブジェクトとして格納したい場合は配列０番目の要素を指定する。?
  なんのこと？
   */
  const loginProfile = profiles.filter(
    (prof) => prof.user_profile === loginUser.id
  )[0];

  const Logout = () => {
    localStorage.removeItem("localJWT");
    window.location.href = "/";
  };

  const handlerEditPicture = () => {
    const fileInput = document.getElementById("imageInput");
    fileInput?.click();
  };

  // このAppコンポーネントがマウントされた時に、このアプリで必要なデータをサーバ側から読み込んでおく。
  useEffect(() => {
    const fetchBootLoader = async () => {
      await dispatch(fetchAsyncGetTasks());
      await dispatch(fetchAsyncGetMyProf());
      await dispatch(fetchAsyncGetUsers());
      await dispatch(fetchAsyncGetCategory());
      await dispatch(fetchAsyncGetProfs());
    };
    fetchBootLoader();
  }, [dispatch]);

  return (
    <MuiThemeProvider theme={theme}>
      <div className={styles.app__root}>
        <Grid container>
          <Grid item xs={4}>
            <PolymerIcon className={classes.icon} />
          </Grid>
          <Grid item xs={4}>
            <h1>Scrum Task Board</h1>
          </Grid>
          <Grid item xs={4}>
            <div className={styles.app__logout}>
              <button className={styles.app__iconLogout} onClick={Logout}>
                <ExitToAppIcon fontSize="large" />
              </button>

              <input
                type="file"
                id="imageInput"
                hidden={true}
                onChange={(e) => {
                  // onChangeは、表示されたFileDialogでOKボタンを押した時に実行される。
                  dispatch(
                    fetchAsyncUpdateProf({
                      id: loginProfile.id,
                      img: e.target.files !== null ? e.target.files[0] : null,
                    })
                  );
                }}
              />

              <button className={styles.app__btn} onClick={handlerEditPicture}>
                <Avatar
                  className={classes.avatar}
                  alt="avatar"
                  src={
                    loginProfile?.img !== null ? loginProfile?.img : undefined
                    /* TypeScriptでは、srcの値として string または undefined のどちらか
      しか受け付けない仕様になっているため、nullの場合はundefinedに変換している。 */
                  }
                />
              </button>
            </div>
          </Grid>
          <Grid item xs={6}>
            {
              tasks[0]?.task && <TaskList /> // Taskデータが存在する場合のみリストに表示する
            }
          </Grid>
          <Grid item xs={6}>
            <Grid
              container
              direction="column" // 画面を縦方向に分割する指定
              alignItems="center"
              justify="center"
              style={{ minHeight: "80vh" }}
            >
              <Grid item>
                {
                  /* Task編集の状態を管理するState「editedTask」のstatusにTaskの進行状況のStateが入る。
                statusは次の３つの状態を取る。NotStarted, OnGoing, Done
                statusの値がこれら３つのうちいずれかならば、Trueとなる。
                初期値は空白なので、Falseとなる。
                */
                  editedTask.status ? <TaskForm /> : <TaskDisplay />
                }
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </div>
    </MuiThemeProvider>
  );
};

export default App;
