import React, { useState, useEffect } from "react";
import styles from "./TaskList.module.css";

import { makeStyles, Theme } from "@material-ui/core/styles";
import AddCircleOutlineIcon from "@material-ui/icons/AddCircleOutline";
import DeleteOutlineOutlinedIcon from "@material-ui/icons/DeleteOutlineOutlined";
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
  const columns = tasks[0] && Object.keys(tasks[0]);

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
  return <div></div>;
};

export default TaskList;
