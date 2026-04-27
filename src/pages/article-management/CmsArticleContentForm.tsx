import { useState } from "react";

const CmsArticleContenForm = () => {
  const [editorValue, setEditorValue] = useState("");

  const handleEditorChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditorValue(e.target.value);
  };

  return (
    <>
      <div className="card">
        <textarea
          value={editorValue}
          name="contain"
          onChange={handleEditorChange}
          style={{ height: "320px", width: "100%" }}
          className="border-2 border-gray-300 rounded-lg p-4 outline-none"
          placeholder="Tulis konten artikel di sini..."
        />
      </div>
    </>
  );
};

export default CmsArticleContenForm;
