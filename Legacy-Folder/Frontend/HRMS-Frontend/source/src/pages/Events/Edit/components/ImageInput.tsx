import { Add } from "@mui/icons-material";
import { Box, FormHelperText, styled, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { useFieldError } from "@/hooks/useFieldError";

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

function getBase64(img: File, callback: (url: string) => void) {
  const reader = new FileReader();
  reader.onload = () => callback(reader.result as string);
  reader.readAsDataURL(img);
}

function matchIsFile(value: unknown): value is File {
  return typeof window !== "undefined" && value instanceof File;
}

type ImageInputProps = {
  name?: string;
  imagePath?: string;
  disabled?: boolean;
};

const ImageInput = (props: ImageInputProps) => {
  const { name = "bannerFileContent", imagePath, disabled } = props;
  const inputRef = useRef<HTMLInputElement>(null);
  const { control, watch } = useFormContext();
  const error = useFieldError(name);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const selectedFile = watch(name);

  const handleFileClick = () => {
    if (!disabled) {
      inputRef.current?.click();
    }
  };

  const handleFileChange =
    (onChange: (file: File | null) => void) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      const file = files?.[0] || null;
      onChange(file);
    };

  const hasFile = matchIsFile(selectedFile);

  useEffect(() => {
    if (selectedFile instanceof File) {
      getBase64(selectedFile as File, (url) => {
        setImageUrl(url);
      });
    } else {
      setImageUrl(null);
    }
  }, [selectedFile]);

  useEffect(() => {
    const inputElement = inputRef.current;
    if (inputElement && !hasFile) {
      inputElement.value = "";
    }
  }, [hasFile]);

  return (
    <>
      <Controller
        name={name}
        control={control}
        render={({ field: { onChange } }) => (
          <>
            <Box
              sx={{
                bgcolor: "rgba(0, 0, 0, 0.02)",
                border: "1px dashed #d9d9d9",
                borderRadius: "0.5rem",
                cursor: "pointer",
                height: "102px",
                width: "100%",
                "&:hover": {
                  border: "1px dashed #69b1ff",
                },
              }}
              onClick={handleFileClick}
            >
              <VisuallyHiddenInput
                ref={inputRef}
                type="file"
                accept=".png, .jpg, .jpeg"
                onChange={handleFileChange(onChange)}
              />
              {
                <Box
                  component="span"
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100%",
                  }}
                >
                  {imageUrl || imagePath ? (
                    <Box
                      component="img"
                      src={imageUrl || imagePath}
                      sx={{ height: "100%", objectFit: "contain" }}
                    />
                  ) : (
                    <Box display="flex" alignItems="center" gap={1}>
                      <Add sx={{ fontSize: "1.2em" }} />
                      <Typography variant="body1">Add Banner</Typography>
                    </Box>
                  )}
                </Box>
              }
            </Box>
            {error.isError && (
              <FormHelperText error sx={{ marginLeft: 0 }}>
                {error.message}
              </FormHelperText>
            )}
          </>
        )}
      />
    </>
  );
};

export default ImageInput;
