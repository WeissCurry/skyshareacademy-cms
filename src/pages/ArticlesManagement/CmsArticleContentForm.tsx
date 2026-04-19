import React from "react";
import { Editor } from "primereact/editor";

const CmsArticleContenForm = () => {
  return (
    <>
      <div className="card">
        <Editor
          value={editorValue}
          name="contain"
          onTextChange={handleEditorChange}
          style={{ height: "320px" }}
        />
      </div>
    </>
  );
};

export default CmsArticleContenForm;
