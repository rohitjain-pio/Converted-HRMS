// material-ui

// project import
// import Notification from './Notification';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';
import Profile from '@/layout/Dashboard/Header/HeaderContent/Profile';
import Search from '@/layout/Dashboard/Header/HeaderContent/Search';
import { FEATURE_FLAGS, permissionValue } from '@/utils/constants';
import Box from '@mui/material/Box';
import SubmitFeedBackPage from '@/layout/Dashboard/Header/HeaderContent/SubmitSupportPage';
import { hasPermission } from '@/utils/hasPermission';

// ==============================|| HEADER - CONTENT ||============================== //

export default function HeaderContent() {
    const { enableChatbot } = FEATURE_FLAGS;
    const {SUPPORT}=permissionValue

    const isChatbotEnabled = useFeatureFlag(enableChatbot);


  return (
    <>
  
      <Search />
       {/* <Notification />  */}
       {hasPermission(SUPPORT.READ)&&(
      <SubmitFeedBackPage/>)}
      <Profile />
      {isChatbotEnabled ? <Box sx={{ pl: 1, mr: { xs: "-12px", sm: "-20px" } }}>
         <web-chatlauncher></web-chatlauncher>
      </Box> : null}
    
    </>
  );
}
