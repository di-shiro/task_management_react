import React, { useState, useEffect } from "react";
import styles from "./TaskList.module.css";

import { makeStyles, Theme } from "@material-ui/core/styles";
import AddCircleOutlineIcon from "@material-ui/icons/AddCircleOutline";
import DeleteOutlineOutlinedIcon from "@material-ui/icons/DeleteOutlineOutlined";
import EditOutlinedIcon from "@material-ui/icons/EditOutlined";
import {
  Button,
  Avatar,
  Badge,
  Table,
  TableHead,
  TableCell,
  TableRow,
  TableBody,
  TableSortLabel,
} from "@material-ui/core";

import { useSelector, useDispatch } from "react-redux";
import {
  fetchAsyncDeleteTask,
  selectTasks,
  editTask,
  selectTask,
} from "./taskSlice";
import { selectLoginUser, selectProfiles } from "../auth/authSlice";
import { AppDispatch } from "../../app/store";
import { initialState } from "./taskSlice";
import { SORT_STATE, READ_TASK } from "../types";

const useStyles = makeStyles((theme: Theme) => ({
  table: {
    tableLayout: "fixed",
  },
  button: {
    margin: theme.spacing(3),
  },
  small: {
    margin: "auto",
    width: theme.spacing(3),
    height: theme.spacing(3),
  },
}));

// Taskを一覧表示するための画面
const TaskList: React.FC = () => {
  const classes = useStyles();
  const dispatch: AppDispatch = useDispatch();
  const tasks = useSelector(selectTasks);
  const loginUser = useSelector(selectLoginUser);
  const profiles = useSelector(selectProfiles);
  const columns = tasks[0] && Object.keys(tasks[0]); // 全Taskの中からどれか1つを選択して、keyをcolumnとする。

  // このTaskListコンポーネントのState
  const [state, setState] = useState<SORT_STATE>({
    rows: tasks,
    order: "desc",
    activeKey: "",
  });

  /*  バブルソートみたいな処理をする。
  sort()メソッドの返り値が
  「return -1 」ならば 、「a:小、b:大」となる。昇順ならば、a と b との入れ替えはせず「a, b」の並び順になる。
  「return  0 」ならば、a と b との大小関係を判定しない。入れ替えはせずにそのまま「a, b」の並び順となる。
  「return  1 」ならば、「a:大、b:小」となる。昇順ならば、a と b との入れ替えを行い「b, a」の並び順となる。
  */
  const handleClickSortColumn = (column: keyof READ_TASK) => {
    const isDesc = column === state.activeKey && state.order === "desc";
    const newOrder = isDesc ? "asc" : "desc";
    const sortedRows = Array.from(state.rows).sort((a, b) => {
      if (a[column] > b[column]) {
        return newOrder === "asc" ? 1 : -1;
      } else if (a[column] < b[column]) {
        return newOrder === "asc" ? -1 : 1;
      } else {
        return 0;
      }
    });
    // Global Stateをソート後の値で更新する。
    setState({
      rows: sortedRows,
      order: newOrder,
      activeKey: column,
    });
  };

  // useEffectで、Global State が変更された際に検知してTaskListの表示を更新する。
  useEffect(() => {
    setState((state) => ({
      ...state,
      rows: tasks,
    }));
  }, [tasks]);

  const renderSwitch = (statusName: string) => {
    switch (statusName) {
      case "Not started":
        return (
          <Badge variant="dot" color="error">
            {statusName}
          </Badge>
        );
      case "On going":
        return (
          <Badge variant="dot" color="primary">
            {statusName}
          </Badge>
        );
      case "Done":
        return (
          <Badge variant="dot" color="secondary">
            {statusName}
          </Badge>
        );
      default:
        return null;
    }
  };

  /* UserIDと一致するUserのProfileオブジェクト(loginProfile)を取ってくる。
  そして、そのloginProfileにAvatar画像が存在する時は、その画像を利用して、ない場合はundefinedを返す。 */
  const conditionalSrc = (userId: number) => {
    const loginProfile = profiles.filter(
      (prof) => prof.user_profile === userId
    )[0];
    return loginProfile?.img !== null ? loginProfile?.img : undefined;
  };
  return (
    <>
      <Button
        className={classes.button}
        variant="contained"
        color="primary" /*                    青色 */
        size="small"
        startIcon={
          <AddCircleOutlineIcon />
        } /* ボタンの中にアイコンを埋め込んでいる */
        onClick={() => {
          dispatch(
            editTask({
              id: 0,
              task: "",
              description: "",
              criteria: "",
              responsible: loginUser.id, // Taskの責任者はDefaultでログインUserとしている。
              status: "1",
              category: 1,
              estimate: 0,
            })
          );
          // Taskを編集完了したら、編集用Stateを初期化リセットしておく。
          dispatch(selectTask(initialState.selectedTask));
        }}
      >
        Add new
      </Button>

      {tasks[0]?.task && (
        <Table size="small" className={classes.table}>
          <TableHead>
            <TableRow>
              {
                // mapで各要素を展開する際にcolIndexに連番を割り振ってくれる。
                columns.map(
                  (column, colIndex) =>
                    // 以下に画面に一覧表示するColumnを指定している。
                    (column === "task" ||
                      column === "status" ||
                      column === "category" ||
                      column === "estimate" ||
                      column === "responsible" ||
                      column === "owner") && (
                      <TableCell align="center" key={colIndex}>
                        <TableSortLabel
                          active={
                            /* useStateで作成したこのTaskListコンポーネントのStateがactiveKeyなら
                            降順・昇順の切り替えのアイコンを表示。 */
                            state.activeKey === column
                          }
                          direction={state.order /* 降順・昇順の指定 */}
                          onClick={
                            () => handleClickSortColumn(column)
                            /* Sort関数に並べ替えるcolumnを引数で渡している。 */
                          }
                        >
                          <strong>{column}</strong>
                        </TableSortLabel>
                      </TableCell>
                    )
                )
              }
              <TableCell></TableCell>
              {/* 編集アイコンを設置するので、レイアウトを整えるために空のTableCellを置く。 */}
            </TableRow>
          </TableHead>

          <TableBody>
            {state.rows.map((row, rowIndex) => (
              <TableRow hover key={rowIndex}>
                {
                  /* rowは1つ1つのTaskのことで、リスト表示の行にあたる。 */
                  Object.keys(row).map(
                    (key, colIndex) =>
                      // 以下の4つのColumnを表示する
                      (key === "task" ||
                        key === "status_name" || // この場合、statusの状態に応じて表示が3通りある。別途下に分岐処理を記す。
                        key === "category_item" ||
                        key === "estimate") && (
                        <TableCell
                          align="center"
                          className={styles.tasklist__hover}
                          key={
                            `${rowIndex}+${colIndex}` /* Tableの縦横に配置されたCellを一意に示すkey */
                          }
                          onClick={() => {
                            // クリックしたCellの該当RowのTaskをTaskFormに表示しつつ、ReduxStateのselectTaskに選択Taskの値を設定する。
                            dispatch(selectTask(row));
                            dispatch(editTask(initialState.editedTask)); // 直前に何か編集してたかもしれないのでeditedTaskを初期化しておく
                          }}
                        >
                          {
                            // status_name の場合はアイコンを表示して、それ以外はシンプルにStateの値を表示する。
                            key === "status_name" ? (
                              // status_nameの状態に応じて3通りのアイコンを色分けして表示させるrenderSwitchを実行。
                              // 引数として渡されるのは、次の3つのいずれか。[Not started, On going, Done]
                              renderSwitch(row[key])
                            ) : (
                              <span>{row[key]}</span>
                            )
                          }
                        </TableCell>
                      )
                  )
                }
                <TableCell align="center">
                  <Avatar
                    className={classes.small}
                    alt="Responsible"
                    src={
                      conditionalSrc(
                        row["responsible"]
                      ) /* Task責任者のUserIDを渡し、責任UserのAvatar画像のURLを取得する */
                    }
                  />
                  {row["responsible_username"]}
                </TableCell>
                <TableCell align="center">
                  <Avatar
                    className={classes.small}
                    alt="Owner"
                    src={
                      conditionalSrc(
                        row["owner"]
                      ) /* Task作成者のUserIDを渡して、作成UserのAvatar画像のURLを取得する*/
                    }
                  />
                  {row["owner_username"]}
                </TableCell>

                <TableCell align="center">
                  <button
                    className={styles.tasklist__icon}
                    onClick={() => dispatch(editTask(row))}
                    disabled={row["owner"] !== loginUser.id}
                  >
                    <DeleteOutlineOutlinedIcon />
                  </button>
                  <button
                    className={styles.tasklist__icon}
                    onClick={
                      () => dispatch(editTask(row))
                      /* 編集したいTaskオブジェクトを引数rowとして渡す */
                    }
                    disabled={
                      row["owner"] !== loginUser.id
                      /* owner !== loginUser の場合に非表示にする。 */
                    }
                  >
                    <EditOutlinedIcon />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </>
  );
};

export default TaskList;
