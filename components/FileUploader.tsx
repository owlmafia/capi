import { useCallback, useEffect, useState } from "react"
import { useDropzone } from "react-dropzone"
import { InfoView } from "./labeled_inputs"

export const FileUploader = ({
  setBytes,
}: {
  setBytes: (bytes: ArrayBuffer) => void
}) => {
  const [filename, setFilename] = useState("")
  const [fileReader, setFileReader] = useState(null)

  useEffect(() => {
    setFileReader(new FileReader())
  }, [])

  const onDrop = useDrop((file: File) => {
    if (fileReader) {
      setFilename(file.name)
      setBytesFromFile(fileReader, file, setBytes)
    }
  })

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

  const handleSubmit = (e: any) => {
    e.preventDefault()
  }

  return (
    <form
      className={`upload-form-image_full_width ${
        isDragActive ? "highlighted" : ""
      }`}
      onSubmit={handleSubmit}
    >
      <div
        {...getRootProps({
          className:
            "bg-dashed_border bg-no-repeat bg-contain aspect-banner flex flex-col items-center justify-center gap-4",
        })}
      >
        <div className="flex gap-2">
          <div className="text-te">{"Upload your business prospectus"}</div>
          <InfoView
            text={
              "Your business prospectus, if you have one already. If you don't, you can upload it later."
            }
          />
        </div>
        {filename && <div>{filename}</div>}
        <div className="upload-custom h-">
          <button className="h-12 w-36 bg-te text-bg transition hover:bg-pr">
            {"Upload"}
          </button>
          <input
            {...getInputProps()}
            className="upload-input"
            type="file"
            accept="image/*"
          />
        </div>
        <div className="grey-190">{"or Drag and drop here"}</div>
      </div>
    </form>
  )
}

const setBytesFromFile = (
  fileReader: FileReader,
  file: File,
  setBytes: (bytes: ArrayBuffer) => void
) => {
  fileReader.onload = () => {
    const result = fileReader.result
    if (result instanceof ArrayBuffer) {
      console.log(result)
      setBytes(result)
    } else {
      console.error(
        "Unexpected: file reader didn't return an array buffer: %o",
        fileReader.result
      )
    }
  }
  fileReader.readAsArrayBuffer(file)
}

// shared callback to be used for regular file and image upload
export const useDrop = (onFile: (file: File) => void) => {
  return useCallback(
    (acceptedFiles: File[]) => {
      console.log("drop: accepted files: %o", acceptedFiles)
      if (acceptedFiles && acceptedFiles.length === 1) {
        let file = acceptedFiles[0]
        console.log(file)
        //   console.log("will set file: " + file.name);
        onFile(file)
      } else {
        console.error("Unexpected: acceptedFiles: %o", acceptedFiles)
      }
    },
    [onFile]
  )
}
