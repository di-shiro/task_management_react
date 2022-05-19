import React, { useState } from "react";
import { makeStyles, Theme } from "@material-ui/core/styles";
import {
  TextField,
  InputLabel,
  MenuItem,
  FormControl,
  Select,
  Button,
  Fab,
  Modal,
} from "@material-ui/core";
import SaveIcon from "@material-ui/icons/Save";
import AddIcon from "@material-ui/icons/Add";

import { useSelector, useDispatch } from "react-redux";
import {
  fetchAsyncCreateTask,
  fetchAsyncUpdateTask,
  fetchAsyncCreateCategory,
  selectUsers,
  selectEditedTask,
  selectCategory,
  editTask,
  selectTask,
} from "./taskSlice";
import { AppDispatch } from "../../app/store";
import { initialState } from "./taskSlice";
import { SettingsInputComponent } from "@material-ui/icons";

const useStyles = makeStyles((theme: Theme) => ({
  field: {
    margin: theme.spacing(2),
    minWidth: 240,
  },
  button: {
    margin: theme.spacing(3),
  },
  addIcon: {
    marginTop: theme.spacing(3),
    marginLeft: theme.spacing(2),
  },
  saveModal: {
    marginTop: theme.spacing(4),
    marginLeft: theme.spacing(2),
  },
  paper: {
    position: "absolute",
    textAlign: "center",
    width: 400,
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
}));

function getModalStyle() {
  // モーダルを画面の中央に表示させる
  const top = 50;
  const left = 50;

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  };
}

// 選択Taskの表示や、Taskの編集を行うためのForm画面
const TaskForm: React.FC = () => {
  const classes = useStyles();
  const dispatch: AppDispatch = useDispatch();

  const users = useSelector(selectUsers);
  const category = useSelector(selectCategory);
  const editedTask = useSelector(selectEditedTask);

  const [open, setOpen] = useState(false);
  const [modalStyle] = useState(getModalStyle);
  const [inputText, setInputText] = useState("");

  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };
  const isDisabled =
    editedTask.task.length === 0 ||
    editedTask.description.length === 0 ||
    editedTask.criteria.length === 0;

  const isCatDisabled = inputText.length === 0;

  const handleInputTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Columnの「estimate（作業日数）」は変数型を文字列から数値に変換しておく。
    //
    let value: string | number = e.target.value;
    const name = e.target.name;
    if (name === "estimate") {
      value = Number(value);
    }
    dispatch(editTask({ ...editedTask, [name]: value }));
  };

  // dispatch: Task-Responsible
  const handleSelectRespChange = (e: React.ChangeEvent<{ value: unknown }>) => {
    // selectorの仕様でデータを受け取るときは特定のデータ型で受け取れないので、
    // まずはunknownで受け取り、この関数内で型をつける。
    const value = e.target.value as number;
    // Responsibleの選択項目にUserIDが割り当てられており、これをdispatchでStateに設定する。
    dispatch(editTask({ ...editedTask, responsible: value }));
  };

  // dispatch: Task-Status
  const handleSelectStatusChange = (
    e: React.ChangeEvent<{ value: unknown }>
  ) => {
    const value = e.target.value as string;
    dispatch(editTask({ ...editedTask, status: value }));
  };

  // dispatch: Task-Category
  const handleSelectCatChange = (e: React.ChangeEvent<{ value: unknown }>) => {
    const value = e.target.value as number;
    dispatch(editTask({ ...editedTask, category: value }));
  };

  // Form-ListBox: Responsible:  UserNameを表示。KeyにUserIDを設定
  let userOptions = users.map((user) => (
    <MenuItem key={user.id} value={user.id}>
      {user.username}
    </MenuItem>
  ));
  // Form-ListBox: Category
  let catOptions = category.map((cat) => (
    <MenuItem key={cat.id} value={cat.id}>
      {cat.item}
    </MenuItem>
  ));

  return <div></div>;
};

export default TaskForm;
