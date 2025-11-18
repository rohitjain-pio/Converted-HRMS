import { useEffect, useRef, useState } from "react";
import "@/components/RichTextEditor/RichTextEditor.css";
import "ckeditor5/ckeditor5.css";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import { ClassicEditor, EditorConfig } from "ckeditor5";
import Box from "@mui/material/Box";

type TextEditorProps = {
  value: string;
  onChange: (data: string) => void;
  readOnly?: boolean;
  editorConfig: EditorConfig;
};

const RichTextEditor = (props: TextEditorProps) => {
  const { value, onChange, readOnly, editorConfig } = props;
  const editorContainerRef = useRef(null);
  const editorRef = useRef(null);
  const [isLayoutReady, setIsLayoutReady] = useState(false);

  useEffect(() => {
    setIsLayoutReady(true);

    return () => setIsLayoutReady(false);
  }, []);

  return (
    <Box className="main-container">
      <Box ref={editorContainerRef}>
        <Box>
          <Box ref={editorRef}>
            {isLayoutReady && (
              <CKEditor
                editor={ClassicEditor}
                data={value}
                onChange={(_event, editor) => {
                  const data = editor.getData();
                  onChange(data);
                }}
                onReady={(editor) => {
                  readOnly
                    ? editor.enableReadOnlyMode("read-only")
                    : editor.disableReadOnlyMode("read-only");
                }}
                config={editorConfig}
              />
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default RichTextEditor;
