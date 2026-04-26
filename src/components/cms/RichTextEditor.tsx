import { Editor } from "@tinymce/tinymce-react";
import skyshareApi from "@utilities/skyshareApi";

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
}

interface BlobInfo {
  id: () => string;
  name: () => string;
  filename: () => string;
  blob: () => Blob;
  base64: () => string;
  blobUri: () => string;
  uri: () => string | undefined;
}

const RichTextEditor = ({ value, onChange }: RichTextEditorProps) => {
  return (
    <Editor
      value={value}
      onEditorChange={onChange}
      apiKey="6tl5tifchc48dqu40vcan97ogm0iavsuezuoygext3jeifqu"
      init={{
        menubar: false,
        resize: false,
        height: 400,
        plugins:
          "anchor autolink charmap emoticons image link lists media searchreplace table visualblocks wordcount code",
        toolbar:
          "undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table | align lineheight | checklist numlist bullist indent outdent | emoticons charmap | removeformat | code",
        extended_valid_elements: 'script[src|async|defer|type|charset]',
        paste_data_images: true,
        images_upload_handler: (blobInfo: BlobInfo) =>
          new Promise((resolve, reject) => {
            const formData = new FormData();
            formData.append(
              "file",
              blobInfo.blob(),
              blobInfo.filename()
            );

            skyshareApi
              .post("/media/tinymce", formData, {
                headers: {
                  "Content-Type": "multipart/form-data",
                },
              })
              .then((res) => {
                resolve(res.data.location);
              })
              .catch((err: unknown) => {
                const error = err as Error;
                reject("HTTP Error: " + error.message);
              });
          }),
        content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
      }}
    />
  );
};

export default RichTextEditor;
