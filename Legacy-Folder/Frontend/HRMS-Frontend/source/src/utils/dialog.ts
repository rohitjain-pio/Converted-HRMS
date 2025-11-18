export const onCloseHandler = (
  reason: "backdropClick" | "escapeKeyDown",
  onClose: () => void
) => {
  if (reason && reason === "backdropClick") {
    return;
  }
  onClose();
};
