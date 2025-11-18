import { useEffect, useRef, useState } from "react";
import "@/pages/Events/components/FormTextEditor/TextEditor.css";
import "ckeditor5/ckeditor5.css";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import { ClassicEditor } from "ckeditor5";
import { editorConfig } from "@/pages/Events/components/FormTextEditor/editorConfig";
import { Box } from "@mui/material";

type TextEditorProps = {
  value: string;
  onChange: (data: string) => void;
  isReadOnly?: boolean;
};

const TextEditor = (props: TextEditorProps) => {
  const { value, onChange, isReadOnly } = props;
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
                  isReadOnly
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

export default TextEditor;
