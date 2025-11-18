# HRMS Legacy Backend Configuration

## Important: Secret Files Not Included in Repository

The following files contain sensitive credentials and are **not tracked in Git**:
- `appsettings.json`
- `appsettings.Development.json`

## Setup Instructions

1. Copy `appsettings.example.json` to create your configuration files:
   ```bash
   cp appsettings.example.json appsettings.json
   cp appsettings.example.json appsettings.Development.json
   ```

2. Fill in the required secrets in both files:
   - **AzureBlobStorageConnectionString**: Your Azure Storage connection string
   - **ApiKeys.AuthorizedKey**: Your API authorization key
   - **HttpClientsUrl.DownTownApiToken**: Downtown API token
   - **HttpClientsUrl.EmailNotificationApiToken**: Email notification API token
   - **HttpClientsUrl.TimeDoctorApiToken**: TimeDoctor API token
   - **EmailSMTPSettings.Password**: SMTP email password

3. Never commit these files to version control!

## Security Note

These files are listed in `.gitignore` to prevent accidental commits. If you need to share configuration, use the example template and share secrets through secure channels.
