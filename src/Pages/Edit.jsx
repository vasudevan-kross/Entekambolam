import React, { useState } from "react";
import { Editor } from "react-draft-wysiwyg";
import {
  ContentState,
  EditorState,
  convertFromHTML,
  convertToRaw,
} from "draft-js";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import {
  Box,
  Divider,
  Typography,
  Button,
  Snackbar,
  Alert,
  CircularProgress,
  Stack,
  Skeleton,
} from "@mui/material";
import draftToHtml from "draftjs-to-html";
import { useEffect } from "react";
import api from "../Data/api";
import { GET } from "../Functions/apiFunction";
import { ADD } from "../Functions/apiFunction";
import LoadingSkeleton from "../Components/LoadingSkeleton";

function Edit(props) {
  const admin = JSON.parse(sessionStorage.getItem("admin"));
  const token = `Bearer ${admin.token}`;
  const [content, setcontent] = useState();
  const [snakbarOpen, setsnakbarOpen] = useState(false);
  const [fetch, setfetch] = useState(true);
  const [alertType, setalertType] = useState("error");
  const [alertMsg, setalertMsg] = useState("");
  const [isLoading, setisLoading] = useState(false);
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const page = props.page;

  useEffect(() => {
    const getData = async () => {
      const url = `${api}/get_web_page/page/${page}`;
      const pge = await GET(token, url);

      // Get body and last updated date from the response
      let body = pge.data.body;
      const lastUpdatedRaw = pge.data.updated_at;

      // Format the date to "MM/DD/YYYY" format
      const lastUpdatedDate = new Date(lastUpdatedRaw);
      const formattedDate =
        `${("0" + lastUpdatedDate.getDate()).slice(-2)}/` +
        `${("0" + (lastUpdatedDate.getMonth() + 1)).slice(-2)}/` +
        `${lastUpdatedDate.getFullYear()}`;

      // Parse HTML content using DOMParser
      const parser = new DOMParser();
      const doc = parser.parseFromString(body, "text/html");

      // Find if "Last Updated" already exists in the first <p> tag, then replace it
      const firstParagraph = doc.querySelector("p");
      const updatedText = firstParagraph.innerHTML.replace(
        /Last Updated: \d{2}\/\d{2}\/\d{4}/,
        `Last Updated: ${formattedDate}`
      );
      firstParagraph.innerHTML = updatedText;

      // Serialize the modified HTML back to string
      const updatedBody = doc.body.innerHTML;

      // Now set the updated body to state
      setEditorState(
        EditorState.createWithContent(
          ContentState.createFromBlockArray(convertFromHTML(updatedBody))
        )
      );
      setcontent(updatedBody);
    };
    getData();
  }, [page, token, fetch]);

  const handleSnakBarOpen = () => setsnakbarOpen(true);
  const handleSnakBarClose = () => setsnakbarOpen(false);

  const onEditorStateChange = (editorState) => {
    setEditorState(editorState);
    console.log(draftToHtml(convertToRaw(editorState.getCurrentContent())));
  };

  const submit = async () => {
    const url = `${api}/update_web_page`;
    const data = {
      page_id: page,
      body: draftToHtml(convertToRaw(editorState.getCurrentContent())),
    };
    setisLoading(true);
    const sbmt = await ADD(token, url, data);
    setisLoading(false);
    console.log(sbmt);
    if (sbmt.response === 200) {
      setfetch(!fetch);
      handleSnakBarOpen();
      setalertType("success");
      setalertMsg("Success");
    } else {
      handleSnakBarOpen();
      setalertType("error");
      setalertMsg("Something Went Wrong");
    }
  };
  return (
    <Box sx={{ height: 600, width: "100%" }}>
      <Snackbar
        open={snakbarOpen}
        autoHideDuration={3000}
        onClose={handleSnakBarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnakBarClose}
          severity={alertType}
          sx={{ width: "100%" }}
        >
          {alertMsg}
        </Alert>
      </Snackbar>
      <div style={{}}>
        {" "}
        <Typography variant="h1" component={"h3"} sx={{ textAlign: "center" }}>
          Edit{" "}
          {props.page === 1
            ? "About"
            : props.page === 2
            ? "Privacy"
            : props.page === 3
            ? "Terms"
            : ""}{" "}
          Page
        </Typography>
        <Divider sx={{ mt: "5px" }} />
      </div>{" "}
      <br />
      <br />
      {content ? (
        <Editor
          editorState={editorState}
          wrapperClassName="demo-wrapper"
          editorClassName="demo-editor"
          onEditorStateChange={onEditorStateChange}
          toolbar={{
            options: [
              "inline",
              "blockType",
              "fontSize",
              "fontFamily",
              "list",
              "textAlign",
              "colorPicker",
              "link",
              "embedded",
              "emoji",

              "remove",
              "history",
            ],
            inline: {
              inDropdown: false,
              className: undefined,
              component: undefined,
              dropdownClassName: undefined,
              options: [
                "bold",
                "italic",
                "underline",
                "strikethrough",
                "monospace",
                "superscript",
                "subscript",
              ],
            },
            blockType: {
              inDropdown: true,
              options: [
                "Normal",
                "H1",
                "H2",
                "H3",
                "H4",
                "H5",
                "H6",
                "Blockquote",
                "Code",
              ],
              className: undefined,
              component: undefined,
              dropdownClassName: undefined,
            },
            fontSize: {
              options: [
                8, 9, 10, 11, 12, 14, 16, 18, 24, 30, 36, 48, 60, 72, 96,
              ],
              className: undefined,
              component: undefined,
              dropdownClassName: undefined,
            },
            fontFamily: {
              options: [
                "Arial",
                "Georgia",
                "Impact",
                "Tahoma",
                "Times New Roman",
                "Verdana",
              ],
              className: undefined,
              component: undefined,
              dropdownClassName: undefined,
            },
            list: {
              inDropdown: false,
              className: undefined,
              component: undefined,
              dropdownClassName: undefined,
              options: ["unordered", "ordered", "indent", "outdent"],
            },
            textAlign: {
              inDropdown: false,
              className: undefined,
              component: undefined,
              dropdownClassName: undefined,
              options: ["left", "center", "right", "justify"],
            },
            colorPicker: {
              className: undefined,
              component: undefined,
              popupClassName: undefined,
              colors: [
                "rgb(97,189,109)",
                "rgb(26,188,156)",
                "rgb(84,172,210)",
                "rgb(44,130,201)",
                "rgb(147,101,184)",
                "rgb(71,85,119)",
                "rgb(204,204,204)",
                "rgb(65,168,95)",
                "rgb(0,168,133)",
                "rgb(61,142,185)",
                "rgb(41,105,176)",
                "rgb(85,57,130)",
                "rgb(40,50,78)",
                "rgb(0,0,0)",
                "rgb(247,218,100)",
                "rgb(251,160,38)",
                "rgb(235,107,86)",
                "rgb(226,80,65)",
                "rgb(163,143,132)",
                "rgb(239,239,239)",
                "rgb(255,255,255)",
                "rgb(250,197,28)",
                "rgb(243,121,52)",
                "rgb(209,72,65)",
                "rgb(184,49,47)",
                "rgb(124,112,107)",
                "rgb(209,213,216)",
              ],
            },
            link: {
              inDropdown: false,
              className: undefined,
              component: undefined,
              popupClassName: undefined,
              dropdownClassName: undefined,
              showOpenOptionOnHover: true,
              defaultTargetOption: "_self",
              options: ["link", "unlink"],
              linkCallback: undefined,
            },
            emoji: {
              className: undefined,
              component: undefined,
              popupClassName: undefined,
              emojis: [
                "😀",
                "😁",
                "😂",
                "😃",
                "😉",
                "😋",
                "😎",
                "😍",
                "😗",
                "🤗",
                "🤔",
                "😣",
                "😫",
                "😴",
                "😌",
                "🤓",
                "😛",
                "😜",
                "😠",
                "😇",
                "😷",
                "😈",
                "👻",
                "😺",
                "😸",
                "😹",
                "😻",
                "😼",
                "😽",
                "🙀",
                "🙈",
                "🙉",
                "🙊",
                "👼",
                "👮",
                "🕵",
                "💂",
                "👳",
                "🎅",
                "👸",
                "👰",
                "👲",
                "🙍",
                "🙇",
                "🚶",
                "🏃",
                "💃",
                "⛷",
                "🏂",
                "🏌",
                "🏄",
                "🚣",
                "🏊",
                "⛹",
                "🏋",
                "🚴",
                "👫",
                "💪",
                "👈",
                "👉",
                "👉",
                "👆",
                "🖕",
                "👇",
                "🖖",
                "🤘",
                "🖐",
                "👌",
                "👍",
                "👎",
                "✊",
                "👊",
                "👏",
                "🙌",
                "🙏",
                "🐵",
                "🐶",
                "🐇",
                "🐥",
                "🐸",
                "🐌",
                "🐛",
                "🐜",
                "🐝",
                "🍉",
                "🍄",
                "🍔",
                "🍤",
                "🍨",
                "🍪",
                "🎂",
                "🍰",
                "🍾",
                "🍷",
                "🍸",
                "🍺",
                "🌍",
                "🚑",
                "⏰",
                "🌙",
                "🌝",
                "🌞",
                "⭐",
                "🌟",
                "🌠",
                "🌨",
                "🌩",
                "⛄",
                "🔥",
                "🎄",
                "🎈",
                "🎉",
                "🎊",
                "🎁",
                "🎗",
                "🏀",
                "🏈",
                "🎲",
                "🔇",
                "🔈",
                "📣",
                "🔔",
                "🎵",
                "🎷",
                "💰",
                "🖊",
                "📅",
                "✅",
                "❎",
                "💯",
              ],
            },
            embedded: {
              className: undefined,
              component: undefined,
              popupClassName: undefined,
              embedCallback: undefined,
              defaultSize: {
                height: "auto",
                width: "auto",
              },
            },

            remove: {
              className: undefined,
              component: undefined,
            },
            history: {
              inDropdown: false,
              className: undefined,
              component: undefined,
              dropdownClassName: undefined,
              options: ["undo", "redo"],
            },
          }}
        />
      ) : (
        <LoadingSkeleton rows={6} height={30} />
      )}
      <Button
        sx={{ mt: 3, mb: 2, fontWeight: "700", color: "#fff", width: "43%" }}
        color="secondary"
        variant="contained"
        onClick={submit}
      >
        {isLoading ? <CircularProgress /> : "Submit"}
      </Button>
    </Box>
  );
}

export default Edit;
