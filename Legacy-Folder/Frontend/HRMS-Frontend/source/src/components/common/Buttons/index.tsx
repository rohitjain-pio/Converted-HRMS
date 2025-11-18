import { ButtonProps } from '@mui/material';
import { StyledButtons } from '@/components/common/Buttons/Buttons.style';

const Buttons = (props: ButtonProps) => {
  return <StyledButtons {...props}>{props.name}</StyledButtons>;
};

export default Buttons;
