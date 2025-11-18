import { useNavigate } from "react-router-dom";
import { Button, Grid, Paper, Typography } from "@mui/material";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import PageHeader from "@/components/PageHeader/PageHeader";
import { formatDate } from "@/utils/formatDate";
import { DocumentDetailsProps } from "@/pages/CompanyPolicy/types";
import { TruncatedText } from "@/components/TruncatedText/TruncatedText";
import ViewDocument from "@/pages/CompanyPolicy/components/ViewDocument";
import { hasPermission } from "@/utils/hasPermission";
import { permissionValue } from "@/utils/constants";
import BreadCrumbs from "@/components/@extended/Router";

const DocumentDetails: React.FC<DocumentDetailsProps> = ({ data }) => {
  const navigate = useNavigate();
  const { VIEW, EDIT } = permissionValue.COMPANY_POLICY;

  const details = [
    {
      label: "Document Name",
      value: data.name,
    },
    {
      label: "Description",
      value: data.description,
    },
    {
      label: "Category",
      value: data.documentCategory,
    },
    {
      label: "Created By",
      value: data.createdBy,
    },
    {
      label: "Created On",
      value: formatDate(data.createdOn),
    },
    {
      label: "Modified By",
      value: data.modifiedBy ? data.modifiedBy : "N/A",
    },
    {
      label: "Modified On",
      value: data.modifiedOn ? formatDate(data.modifiedOn) : "N/A",
    },
    {
      label: "Version",
      value: data.versionNo,
    },
    {
      label: "Attachment",
      customElement: (
        <ViewDocument
          companyPolicyId={data.id}
          fileName={data?.fileName as string}
          fileOriginalName={data.fileOriginalName as string}
          hasPermission={hasPermission(VIEW)}
        />
      ),
    },
  ];

  return (
    <>
      <BreadCrumbs />
      <Paper>
        <PageHeader
          variant="h3"
          color="primary"
          title="Document Details"
          actionButton={
            hasPermission(EDIT) && (
              <Button
                variant="contained"
                startIcon={<ModeEditIcon />}
                onClick={() => navigate(`/company-policy/edit/${data.id}`)}
              >
                Edit
              </Button>
            )
          }
          goBack={true}
        />
        <Grid container spacing={2} padding="20px">
          {details.map(({ label, value, customElement }, index) => (
            <Grid
              key={index}
              item
              xs={4}
              display="flex"
              flexDirection="row"
              gap="5px"
            >
              <Typography
                sx={{
                  fontWeight: 700,
                }}
              >{`${label}:`}</Typography>
              {customElement ? (
                customElement
              ) : (
                <TruncatedText
                  text={value}
                  tooltipTitle={value}
                  maxLength={20}
                />
              )}
            </Grid>
          ))}
        </Grid>
      </Paper>
    </>
  );
};

export default DocumentDetails;
