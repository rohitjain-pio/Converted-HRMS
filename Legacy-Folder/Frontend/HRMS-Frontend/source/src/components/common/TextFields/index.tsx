import { TextFieldProps } from '@mui/material';
import { StyledTextFields } from '@/components/common/TextFields/input.style';

const TextFields = (props: TextFieldProps) => {
  return <StyledTextFields {...props} />;
};

export default TextFields;
