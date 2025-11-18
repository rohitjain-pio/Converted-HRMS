import "@/pages/Dashboard/components/CompanyPolicyDocument.css";
import defaultIcon from "@/assets/images/icons/document.svg";
import { CompanyPolicyDocumentProps } from "@/services/Dashboard";
import { Box, CircularProgress, Tooltip, styled, Typography } from "@mui/material";
import { hasPermission } from "@/utils/hasPermission";
import { permissionValue } from "@/utils/constants";
import ActionIconButton from "@/components/ActionIconButton/ActionIconButton";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { Link } from "react-router-dom";
import moment from "moment-timezone";
import { No_Permission_To_View_Details, View_Details } from "@/utils/messages";

const StyledDataBox = styled(Box)(() => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "3px",
  border: "1px solid #e3e7eb",
  borderRadius: "10px",
  margin: "5px 0",
  backgroundColor: "rgba(255,255,255,0.5019607843137255)",
  minHeight: "64px",
  ".policy-info": {
    minWidth: 0,
  },
  ".policy-name": {
      fontSize: "16px",
      color: "#273A50",
      fontWeight: 400,
      fontFamily: "Roboto",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis"
  },
  ".policy-date":{
      fontSize: "12px",
      color: "#6d6d6d",
      fontWeight: 400,
      fontFamily: "Roboto"
  },
  ".policy-pic": {
      width: "50px",
      height: "50px",
      borderRadius: "20%",
      margin: "0px 10px",
  },
  ".view-icon":{
      marginRight: "10px"
  },
  "&:hover": {
        background: "#F6F9FC"
    }
}));

const CompanyPolicyDocument: React.FC<CompanyPolicyDocumentProps> = ({
  isLoading,
  companyPolicyDocuments,
}) => {
  const { VIEW } = permissionValue.COMPANY_POLICY;
  
  const localTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return (
    <div>
      {isLoading ? (
        <div className="loading-spinner">
          <CircularProgress />
        </div>
      ) : (
        companyPolicyDocuments?.map((policyDoc) => (
          <StyledDataBox key={policyDoc.id}>
            <img
              src={defaultIcon}
              title={policyDoc.name}
              alt={policyDoc.name}
              className="policy-pic"
              style={{
                filter: 'invert(0.6)',
                width: '36px',
                height: '36px'
              }}
            />
            <div className="policy-info">
              <Tooltip title={policyDoc.name} followCursor>
                <Typography className="policy-name">{policyDoc.name}</Typography>
              </Tooltip>
              <Typography className="policy-date">
                Updated On:{" "}
                {moment.utc(policyDoc.updatedOn).tz(localTimeZone).format("MMM Do, YYYY, hh:mm A")}
              </Typography>
            </div>
            {
              <Tooltip
                title={
                  hasPermission(VIEW) ? View_Details : No_Permission_To_View_Details
                }
                arrow
              >
                <span>
                  <Box>
                    <ActionIconButton
                      label=""
                      colorType="primary"
                      disableRipple
                      as={Link}
                      icon={hasPermission(VIEW) ? <Visibility className="view-icon" sx={{ color: "#27A8E0", fontSize: '24px'}} /> : <VisibilityOff className="view-icon" sx={{ color: "#27A8E0", fontSize: '24px'}} />}
                      to={`/company-policy/view/${policyDoc.id}`}
                      onClick={(e) => {
                        if (!hasPermission(VIEW)) {
                          e.preventDefault();
                        }
                      }}
                      disabled={!hasPermission(VIEW)}
                    />
                  </Box>
                </span>
              </Tooltip>
            }
          </StyledDataBox>
        ))
      )}
    </div>
  );
};

export default CompanyPolicyDocument;
