-- GET_EMPLOYEE_LIST 'E','first_name','DESC',0,20

CREATE OR ALTER     PROCEDURE [dbo].[GetCompanyPolicyDocuments]
@StatusId AS bigint,
@PolicyName AS VARCHAR(100)='',
@CategoryId AS bigint,
@SortColumnName AS VARCHAR(50)='',
@SortColumnDirection AS VARCHAR(50)='',
@PageNumber AS INT=1,
@PageSize AS INT=10
AS
BEGIN
	DECLARE @Query AS VARCHAR(MAX)='',@OrderQuery AS VARCHAR(MAX)='',@Conditions AS VARCHAR(MAX)='',
	@Pagination AS VARCHAR(MAX)='', @StartIndex AS INT

	SELECT @StartIndex = (@PageNumber-1)*@PageSize  
	
	SET @Query='SELECT cp.Id,
				Name,EffectiveDate,
				cp.DocumentCategoryId,
				cdc.CategoryName as DocumentCategory ,
				VersionNo,cp.ModifiedOn,
				cp.ModifiedBy,
				cp.CreatedOn,
				cp.CreatedBy,
				cp.StatusId,
				CASE WHEN cp.StatusId = 1 THEN ''Draft''
					WHEN cp.StatusId = 2 THEN ''Active'' 
					WHEN cp.StatusId = 3 THEN ''Inactive'' END Status
				FROM CompanyPolicy cp
				Join dbo.CompanyPolicyDocCategory cdc on cdc.Id = cp.DocumentCategoryId 
				WHERE ISNull(cp.IsDeleted,0) = 0'
	
	-- SEARCH OPERATION
	BEGIN
	SET @Conditions=''
	END
	IF(ISNULL(@PolicyName,'')<>'')
	BEGIN
		SET @Conditions +=' and cp.Name LIKE ''%'+@PolicyName+'%'''
	END
	IF(@StatusId <> 0)
	BEGIN
		SET @Conditions +=' and cp.StatusId='+ CONVERT(VARCHAR(12), @StatusId)
	END
	IF(@CategoryId <> 0)
	BEGIN
		SET @Conditions +=' and cp.DocumentCategoryId='+ CONVERT(VARCHAR(12), @CategoryId)
	END	
	-- SORT OPERATION
		IF(ISNULL(@SortColumnName,'')<>'' AND ISNULL(@SortColumnDirection,'')<>'')
		BEGIN
			SET @OrderQuery=' ORDER BY '+@SortColumnName+' '+@SortColumnDirection
		END
		ELSE 
		BEGIN
			SET @OrderQuery=' ORDER BY cp.CreatedOn DESC'
		END
	-- PAGINATION OPERATION
	IF(@PageSize>0)
	BEGIN
		SET @Pagination=' OFFSET '+(CAST(@StartIndex AS varchar(10)))+' ROWS
		FETCH NEXT '+(CAST(@PageSize AS varchar(10)))+' ROWS ONLY'
	END
	IF(@Conditions<>'') SET @Query+= @Conditions
	IF(@OrderQuery<>'') SET @Query+=@OrderQuery
	IF(@Pagination<>'') SET @Query+=@Pagination

	EXEC(@Query)
END
GO
-------------

/****** Object:  StoredProcedure [dbo].[GetRoleListWithUserCount]    Script Date: 08/12/2024 10:21:23 ******/ 
GO
CREATE OR ALTER PROCEDURE [dbo].[GetRoleListWithUserCount]
@RoleName AS VARCHAR(100)='',
@SortColumnName AS VARCHAR(50)='',
@SortColumnDirection AS VARCHAR(50)='',
@PageNumber AS INT=1,
@PageSize AS INT=10
AS
BEGIN
	DECLARE @Query AS VARCHAR(MAX)='',@OrderQuery AS VARCHAR(MAX)='',@Conditions AS VARCHAR(MAX)='',
	@Pagination AS VARCHAR(MAX)='', @StartIndex AS INT

	SELECT @StartIndex = (@PageNumber-1)*@PageSize  
	
	SET @Query='SELECT R.Id AS RoleId, R.Name AS RoleName, COALESCE(COUNT(URM.EmployeeId), 0) AS UserCount
FROM [Role] AS R
LEFT JOIN [UserRoleMapping] AS URM ON R.Id = URM.RoleId
WHERE (R.IsActive = 1 OR URM.EmployeeId IS NULL) '

	-- SEARCH OPERATION
	BEGIN
	SET @Conditions=''
	END
	IF(ISNULL(@RoleName,'')<>'')
	BEGIN
		SET @Conditions +=' and R.Name LIKE ''%'+@RoleName+'%'''
	END
	
	IF(ISNULL(@SortColumnName,'')<>'' AND ISNULL(@SortColumnDirection,'')<>'')
	BEGIN
		SET @OrderQuery=' ORDER BY '+@SortColumnName+' '+@SortColumnDirection
	END
	ELSE SET @OrderQuery=' ORDER BY  R.Id DESC'
	
	-- PAGINATION OPERATION
	IF(@PageSize>0)
	BEGIN
		SET @Pagination=' OFFSET '+(CAST(@StartIndex AS varchar(10)))+' ROWS
		FETCH NEXT '+(CAST(@PageSize AS varchar(10)))+' ROWS ONLY'
	END
	SET @Conditions += ' GROUP BY R.Id, R.Name ';
	IF(@Conditions<>'') SET @Query+=@Conditions
	IF(@OrderQuery<>'') SET @Query+=@OrderQuery
	IF(@Pagination<>'') SET @Query+=@Pagination

	EXEC(@Query)
END
GO


/****** Object:  StoredProcedure [dbo].[SaveRolePermissions]    Script Date: 08/12/2024 10:21:23 ******/ 

IF NOT EXISTS (SELECT * FROM sys.types WHERE is_table_type = 1 AND name = 'PermissionIdTableType')
BEGIN
	CREATE TYPE dbo.PermissionIdTableType AS TABLE
	(
		PermissionId INT
	);
END
GO

CREATE OR ALTER PROCEDURE SaveRolePermissions
    @RoleId INT
	,@PermissionIds dbo.PermissionIdTableType READONLY
AS
BEGIN
    BEGIN TRY
        BEGIN TRANSACTION;

        DELETE FROM RolePermission WHERE RoleId = @RoleId;

        INSERT INTO RolePermission (RoleId, PermissionId, CreatedBy, CreatedOn, IsActive)
        SELECT @RoleId, PermissionId, 'admin', GETUTCDATE(),1 FROM @PermissionIds;

        COMMIT;
    END TRY
    BEGIN CATCH
        -- Rollback the transaction in case of an error
        ROLLBACK;
        THROW;
    END CATCH
END;
GO

CREATE
	OR

ALTER PROCEDURE SaveEmployeeGroup 
     @Id BIGINT= 0
	,@GroupName VARCHAR(100)
	,@Description TEXT
	,@Status BIT
	,@CreatedBy NVARCHAR(100)
	,@employeeIds NVARCHAR(MAX) 
AS
BEGIN
	BEGIN TRY		
	BEGIN TRANSACTION;   
	IF EXISTS(
		   SELECT VALUE AS EmployeeId
		   FROM OPENJSON(@employeeIds)
		   WHERE value NOT IN(SELECT ID FROM [dbo].[EmployeeData])
		   )
		   BEGIN
		   ;THROW 50001, 'Invalid EmployeeId found.',1;
		   END;		
    
	IF @Id > 0
		BEGIN		

			UPDATE [dbo].[Group]
			SET GroupName = @GroupName
				,Description = @Description
				,STATUS = @Status
				,ModifiedOn = GETUTCDATE()
				,ModifiedBy = @CreatedBy
			WHERE ID = @Id

			DELETE [dbo].[UserGroupMapping]
			WHERE GroupId = @Id

			INSERT INTO [dbo].[UserGroupMapping] (
				EmployeeId
				,GroupId
				,CreatedBy
				,CreatedOn
				,IsDeleted
				)
			SELECT ID
				,@Id
				,@CreatedBy
				,GETUTCDATE()
				,0
			FROM EmployeeData
			WHERE ID IN (
					SELECT CAST(value AS BIGINT) FROM OPENJSON(@employeeIds) WITH (VALUE BIGINT '$')
					)
		END
		ELSE
		BEGIN
		
			INSERT INTO [dbo].[Group] (
				GroupName
				,Description
				,CreatedBy
				,CreatedOn
				,STATUS
				,IsDeleted
				)
			VALUES (
				@GroupName
				,@Description
				,@CreatedBy
				,GETUTCDATE()
				,@Status
				,0
				)
				Declare @GroupId BIGINT
				SET @GroupId=SCOPE_IDENTITY();

			INSERT INTO [dbo].[UserGroupMapping] (
				EmployeeId
				,GroupId
				,CreatedBy
				,CreatedOn
				,IsDeleted
				)
			SELECT ID
				,@GroupId
				,@CreatedBy
				,GETUTCDATE()
				,0
			FROM EmployeeData
			WHERE ID IN (
					SELECT CAST(value AS BIGINT) FROM OPENJSON(@employeeIds) WITH (VALUE BIGINT '$')
					)
		END
		
	COMMIT TRANSACTION;
	END TRY
	BEGIN CATCH		
	 IF @@TRANCOUNT >0
		ROLLBACK;

		THROW;
	END CATCH;
END;
GO
CREATE
	OR
ALTER PROCEDURE GetEmployeeGroupList 
   @GroupName NVARCHAR(100)=NULL,
   @Status bit =NULL,
   @SortColumnName NVARCHAR(50)=NULL,
   @SortDirection NVARCHAR(4)='ASC',
   @PageNumber int=1 ,
   @PageSize int=10
AS
BEGIN
	BEGIN TRY		
	SET NOCOUNT ON;
    DECLARE  @SQL NVARCHAR(MAX),
             @EffectiveSortColumnName NVARCHAR(50) = COALESCE(NULLIF(@SortColumnName,''),'ID'),
             @EffectiveSortColumnDirection NVARCHAR(4) = COALESCE(NULLIF(@SortDirection,''),'ASC'),
		     @StartIndex INT;

  SET @StartIndex=(@PageNumber - 1) * @PageSize;

  SET @SQL = N' 
   SELECT ID,
          GroupName,
          Description,
          CASE WHEN Status = 1 THEN ''Active'' ELSE ''InActive'' END AS Status,
          ModifiedBy ,
          ModifiedOn
   FROM [Group]
   WHERE (@GroupName IS NULL OR GroupName LIKE ''%''+ @GroupName +''%'')
         AND (@Status IS NULL OR Status = @Status) AND IsDeleted=0
   ORDER BY ' + QUOTENAME(@EffectiveSortColumnName) +' '+ @EffectiveSortColumnDirection +'
   OFFSET @StartIndex ROWS
   FETCH NEXT @PageSize ROWS ONLY;';


EXEC sp_executesql @SQL,
 N'@GroupName NVARCHAR(100),
   @Status bit ,
   @SortColumnName NVARCHAR(50),
   @SortDirection NVARCHAR(4),
   @StartIndex int ,
   @PageSize int',  
   @GroupName, @Status,@SortColumnName,@SortDirection,@StartIndex,@PageSize;
   
	END TRY
	BEGIN CATCH		
		THROW;
	END CATCH;
END;
GO
---
GO 
CREATE OR ALTER PROCEDURE [dbo].[GetHistoryListByPolicyId]  
@PolicyId AS BIGINT ,
@SortColumnName AS VARCHAR(50)='',
@SortColumnDirection AS VARCHAR(50)='',
@PageNumber AS INT=1,
@PageSize AS INT=10

AS
BEGIN
	DECLARE @Query AS VARCHAR(MAX)='',@OrderQuery AS VARCHAR(MAX)='',@Conditions AS VARCHAR(MAX)='',
	@Pagination AS VARCHAR(MAX)='', @StartIndex AS INT

	SELECT @StartIndex = (@PageNumber-1)*@PageSize  
	
	SET @Query='SELECT [PolicyId],[Name], [VersionNo], [ModifiedOn],[ModifiedBy] ,[Description],[CreatedOn],[FileName],[FileOriginalName] FROM CompanyPolicyHistory WHERE IsDeleted =0  '

	-- SEARCH OPERATION

	BEGIN
	SET @Conditions=''
	END
	IF(ISNULL(@PolicyId,'')<>'')
	BEGIN
		SET @Conditions +=' And PolicyId = '+CONVERT(VARCHAR(12), @PolicyId)  
	END
	
	IF(ISNULL(@SortColumnName,'')<>'' AND ISNULL(@SortColumnDirection,'')<>'')
	BEGIN
		SET @OrderQuery=' ORDER BY '+@SortColumnName+' '+@SortColumnDirection
	END

	ELSE SET @OrderQuery=' ORDER BY VersionNo DESC'
	
	-- PAGINATION OPERATION
	IF(@PageSize>0)
	BEGIN
		SET @Pagination=' OFFSET '+(CAST(@StartIndex AS varchar(10)))+' ROWS
		FETCH NEXT '+(CAST(@PageSize AS varchar(10)))+' ROWS ONLY'
	END 
	IF(@Conditions<>'') SET @Query+=@Conditions
	IF(@OrderQuery<>'') SET @Query+=@OrderQuery
	IF(@Pagination<>'') SET @Query+=@Pagination

	EXEC(@Query)
END

------------------------------------------------------------------------------------------------------------------------------------------------
GO
CREATE OR ALTER  PROCEDURE [dbo].[GetNomineeList]
@EmployeeId BIGINT,
@NomineeName  VARCHAR(150)=NULL,
@RelationshipId As INT,
@Others VARCHAR(100)=NULL,
@SortColumnName AS VARCHAR(50)=NULL,
@SortDirection AS VARCHAR(50)=NULL,
@PageNumber AS INT=1,
@PageSize AS INT=10
AS
BEGIN
BEGIN TRY		
	SET NOCOUNT ON;

	DECLARE  @Query NVARCHAR(MAX), @StartIndex AS INT,
	  @EffectiveSortColumnName NVARCHAR(50) = COALESCE(NULLIF(@SortColumnName,''),'Id'),
      @EffectiveSortColumnDirection NVARCHAR(4) = COALESCE(NULLIF(@SortDirection,''),'ASC'),
	  @WhereQuery NVARCHAR(250)

	BEGIN
	SET @WhereQuery=''
	END
	IF(@RelationshipId = 6)
	BEGIN
		SET @WhereQuery =' and n.Others LIKE ''%'+@Others+'%'''
	END
	ELSE IF(@RelationshipId < 6 and @RelationshipId > 0)
		SET @WhereQuery =' and n.Relationship='+ CONVERT(VARCHAR(12), @RelationshipId)
	
	SELECT @StartIndex = (@PageNumber-1)*@PageSize  
	
	SET @Query='SELECT n.Id,
	                   NomineeName,
					   DOB,
					   Age,
					   CareOf,
					   r.Name RelationshipName, 
					   r.Id RelationshipId,
					   Others, 
					   Percentage,
					   IsNomineeMinor,
					   n.CreatedBy,
					   n.CreatedOn,
					   n.ModifiedBy,
					   n.ModifiedOn,
					   n.FileName,
					   n.IdProofDocType,
					   n.FileOriginalName,
					   d.Name
					   FROM [UserNomineeInfo] n
                       INNER JOIN [dbo].[Relationship] r ON n.Relationship=r.Id and r.IsDeleted=0
					   INNER JOIN [dbo].[DocumentType] d ON n.IdProofDocType =d.Id and d.IsDeleted=0
                       WHERE EmployeeId= @EmployeeId AND (@NomineeName IS NULL OR NomineeName LIKE ''%''+ @NomineeName +''%'')                              
                             '+ @WhereQuery +'
                             AND n.IsDeleted=0
							 ORDER BY ' + QUOTENAME(@EffectiveSortColumnName) +' '+ @EffectiveSortColumnDirection +'
                             OFFSET @StartIndex ROWS
                             FETCH NEXT @PageSize ROWS ONLY;';
	
    EXEC sp_executesql @Query,
 N'@EmployeeId BIGINT,
   @NomineeName  VARCHAR(150),   
   @RelationshipId As INT,  
   @Others VARCHAR(100),
   @SortColumnName NVARCHAR(50),
   @SortDirection NVARCHAR(4),
   @StartIndex int ,
   @PageSize int',  
   @EmployeeId,@NomineeName,@RelationshipId,@Others,@SortColumnName,@SortDirection,@StartIndex,@PageSize;

END TRY
	BEGIN CATCH		
		THROW;
	END CATCH;
END;
GO
------------------------------------------------------------------------------------------------------------------------------------------------
CREATE OR ALTER   PROCEDURE [dbo].[GetEducationDocuments]
@EmployeeId AS bigint,
@SortColumnName AS VARCHAR(50)='',
@SortColumnDirection AS VARCHAR(50)='',
@PageNumber AS INT=1,
@PageSize AS INT=10
AS
BEGIN
	DECLARE @Query AS VARCHAR(MAX)='',@OrderQuery AS VARCHAR(MAX)='',
	@Pagination AS VARCHAR(MAX)='', @StartIndex AS INT

	SELECT @StartIndex = (@PageNumber-1)*@PageSize  
	
	SET @Query='select uq.Id,uq.CollegeUniversity,uq.AggregatePercentage, uq.EndYear, uq.StartYear, uq.FileName, uq.FileOriginalName,
				uq.QualificationId, q.ShortName as QualificationName, uq.DegreeName
				from UserQualificationInfo uq
				inner join Qualification q on uq.QualificationId = q.Id
				where ISNULL(uq.IsDeleted,0) = 0 and uq.EmployeeId = ' + CONVERT(VARCHAR(100), @EmployeeId)
	
		-- SORT OPERATION
	IF(ISNULL(@SortColumnName,'')<>'' AND ISNULL(@SortColumnDirection,'')<>'')
	BEGIN
		SET @OrderQuery=' ORDER BY '+@SortColumnName+' '+@SortColumnDirection
	END
	ELSE SET @OrderQuery=' ORDER BY uq.Id DESC' 
	-- PAGINATION OPERATION
	
	IF(@PageSize>0)
	BEGIN
		SET @Pagination=' OFFSET '+(CAST(@StartIndex AS varchar(10)))+' ROWS
		FETCH NEXT '+(CAST(@PageSize AS varchar(10)))+' ROWS ONLY'
	END
	
	IF(@OrderQuery<>'') SET @Query+=@OrderQuery
	IF(@Pagination<>'') SET @Query+=@Pagination

	EXEC(@Query)
END
-----------------------------------------------------------------------------------------------------------------------

GO
CREATE OR ALTER PROCEDURE [dbo].[GetPreviousEmployerList]
@EmployerName AS VARCHAR(100) = NULL,
@DocumentName AS VARCHAR(100) = NULL,
@EmployeeId AS BIGINT,
@SortColumnName AS VARCHAR(50) = 'ID',
@SortColumnDirection AS VARCHAR(50) = 'ASC',
@PageNumber AS INT = 1,
@PageSize AS INT = 10
AS
BEGIN
	SET NOCOUNT ON;

	DECLARE @StartIndex AS INT, @Query AS NVARCHAR(MAX) = '', @OrderQuery AS VARCHAR(MAX) = '', @Pagination AS VARCHAR(MAX)='';
	SET @SortColumnName = COALESCE(NULLIF(@SortColumnName,''),'Id');
	SET @SortColumnDirection = COALESCE(NULLIF(@SortColumnDirection,''),'ASC');
	SET @StartIndex = (@PageNumber - 1) * @PageSize;

	SET @Query = 'SELECT pe.ID, pe.EmployerName, pe.StartDate, pe.EndDate, pe.Designation,
				 (
					SELECT ped.Id, edt.DocumentName, ped.FileName, ped.FileOriginalName
					FROM PreviousEmployerDocument ped
					INNER JOIN EmployerDocumentType edt ON ped.EmployerDocumentTypeId = edt.Id AND edt.IsDeleted = 0
					WHERE ped.PreviousEmployerId = pe.Id AND ped.IsDeleted = 0
					FOR JSON PATH
				 ) As DocumentsJson,
				 (
					SELECT pr.Id, pr.FullName, pr.Designation, pr.Email, pr.ContactNumber
					FROM ProfessionalReference pr
					WHERE pr.PreviousEmployerId = pe.Id AND pr.IsDeleted = 0
					FOR JSON PATH
				 ) As ProfessionalReferencesJson
				 FROM [PreviousEmployer] pe
				 LEFT JOIN PreviousEmployerDocument ped ON pe.Id = ped.PreviousEmployerId
				 LEFT JOIN EmployerDocumentType edt ON ped.EmployerDocumentTypeId = edt.Id
				 WHERE EmployeeId = @EmployeeId
				 AND (@EmployerName IS NULL OR pe.EmployerName LIKE ''%''+ @EmployerName +''%'')
		  		 AND (@DocumentName IS NULL OR edt.DocumentName LIKE ''%''+ @DocumentName +''%'')
				 AND pe.IsDeleted = 0
				 Group BY pe.EmployerName, pe.StartDate, pe.EndDate, pe.Id, pe.Designation';

		IF(ISNULL(@SortColumnName,'') <> '' AND ISNULL(@SortColumnDirection,'') <> '')
		BEGIN
			SET @OrderQuery = ' ORDER BY ' + @SortColumnName + ' ' + @SortColumnDirection
		END
		ELSE SET @OrderQuery = ' ORDER BY pe.Id DESC'

		-- PAGINATION OPERATION
		IF(@PageSize > 0)
		BEGIN
			SET @Pagination = ' OFFSET ' + (CAST(@StartIndex AS VARCHAR(10))) + ' ROWS
			FETCH NEXT ' + (CAST(@PageSize AS varchar(10))) + ' ROWS ONLY'
		END
	
		IF(@OrderQuery <> '')
			SET @Query += @OrderQuery;

		IF(@Pagination <> '')
			SET @Query += @Pagination;

		--SELECT @Query

		EXEC sp_executesql @Query,
		N'@EmployerName AS VARCHAR(100)=NULL,
          @DocumentName AS VARCHAR(100),
          @EmployeeId AS BIGINT,
          @SortColumnName NVARCHAR(50),
          @SortColumnDirection NVARCHAR(4),
          @StartIndex INT,
          @PageSize INT', 
		  @EmployerName, @DocumentName, @EmployeeId, @SortColumnName, @SortColumnDirection, @StartIndex, @PageSize;
END
GO
--------------------GetEmployees-------------------
--Exec [GetEmployees] '',0,146,0,0,'','','',1,10
CREATE OR ALTER   PROCEDURE [dbo].[GetEmployees]

    @EmployeeName AS VARCHAR(100) = '',

    @EmployeeCode AS VARCHAR(MAX) = '',

    @EmploymentStatus AS INT,

    @DepartmentId AS BIGINT,

    @DesignationId AS BIGINT,

    @RoleId AS BIGINT,

    @Status AS INT,

    @SortColumnName AS VARCHAR(50) = '',

    @SortColumnDirection AS VARCHAR(50) = '',

    @EmployeeEmail NVARCHAR(340) = NULL,

    @BranchId INT = NULL,

    @CountryId INT = NULL,

    @DOJRangeFrom DATE = NULL,

    @DOJRangeTo DATE = NULL,

    @PageNumber INT = 1,

    @PageSize INT = 10,
 
    

    @TotalRecords INT OUTPUT

AS

BEGIN

    SET NOCOUNT ON;
 
    DECLARE 

        @Query NVARCHAR(MAX) = '',

        @CountQuery NVARCHAR(MAX) = '',

        @JoinQuery NVARCHAR(MAX) = '',

        @OrderQuery NVARCHAR(MAX) = '',

        @Pagination NVARCHAR(MAX) = '',

        @StartIndex INT,

        @WhereConditions NVARCHAR(MAX),

        @WhereJoin NVARCHAR(1000) = ' WHERE ',

        @AndJoin NVARCHAR(1000) = ' AND '
 
    SET @StartIndex = (@PageNumber - 1) * @PageSize
 
    SET @CountQuery = 'SELECT @TotalRecords = COUNT(e1.Id)'

    SET @Query = '

        SELECT e1.Id, e1.EmployeeCode,

            (e1.FirstName + '' '' + ISNULL(e1.MiddleName, '''') + '' '' + e1.LastName) AS EmployeeName,

            e1.FatherName, e1.Gender, e1.DOB, e2.Email,

            (e6.Line1 + '' '' + ISNULL(e6.Line2, '''')) AS Address,

            e11.CityName, e12.StateName, e10.Pincode, e15.CountryName AS Country,

            (e10.Line1 + '' '' + ISNULL(e10.Line2, '''') + '' '' + e11.CityName + '' '' + e12.StateName + '' '' + e10.Pincode) AS PermanentAddress,

            e1.EmergencyContactNo, e2.ConfirmationDate, e2.JobType,

            e1.PFNumber, e1.PFDate, e9.BankName, e9.AccountNo, e1.PANNumber,

            e1.ESINo, e2.ReportingManagerName, e1.PassportNo, e1.PassportExpiry, e1.AlternatePhone,

            e1.PersonalEmail, e1.BloodGroup, e1.MaritalStatus, e1.UANNo, e1.HasPF, e1.HasESI, e1.AdharNumber,

            e1.Phone, e2.JoiningDate, e2.BranchId AS Branch,

            CASE

                WHEN e2.EmployeeStatus = 1 THEN ''Active''

                WHEN e2.EmployeeStatus = 2 THEN ''F&F Pending''

                WHEN e2.EmployeeStatus = 3 THEN ''On Notice''

                WHEN e2.EmployeeStatus = 4 THEN ''Ex Employee''

                ELSE ''''

            END AS Status,

            e13.Department AS DepartmentName, e14.Designation AS Designation'
 
    SET @JoinQuery = '

        FROM EmployeeData e1

        INNER JOIN EmploymentDetail e2 ON e1.Id = e2.EmployeeId

        LEFT JOIN UserRoleMapping e3 ON e1.Id = e3.EmployeeId

        LEFT JOIN Role e4 ON e4.Id = e3.RoleId

        LEFT JOIN Address e6 ON e6.EmployeeId = e1.Id

        LEFT JOIN City e7 ON e7.Id = e6.CityId

        LEFT JOIN State e8 ON e8.Id = e6.StateId

        LEFT JOIN BankDetails e9 ON e1.Id = e9.EmployeeId

        LEFT JOIN PermanentAddress e10 ON e10.EmployeeId = e1.Id

        LEFT JOIN City e11 ON e11.Id = e10.CityId

        LEFT JOIN State e12 ON e12.Id = e10.StateId

        LEFT JOIN Department e13 ON e13.Id = e2.DepartmentId

        LEFT JOIN Designation e14 ON e14.Id = e2.DesignationId

        LEFT JOIN Country e15 ON e15.Id = e10.CountryId'
 
    SET @WhereConditions = ' ' + @WhereJoin + '1 = 1'
 
    -- Filters

    IF (@DOJRangeFrom IS NOT NULL AND @DOJRangeTo IS NOT NULL)

        SET @WhereConditions += @AndJoin + ' e2.JoiningDate BETWEEN ''' + CONVERT(NVARCHAR(10), @DOJRangeFrom, 120) + ''' AND ''' + CONVERT(NVARCHAR(10), @DOJRangeTo, 120) + ''''
 
    IF (NULLIF(@EmployeeEmail, '') IS NOT NULL)

        SET @WhereConditions += @AndJoin + ' e2.Email LIKE ''%' + CONVERT(VARCHAR(340), @EmployeeEmail) + '%'''
 
    IF (NULLIF(@CountryId, 0) IS NOT NULL)

        SET @WhereConditions += @AndJoin + ' e10.CountryId = ' + CONVERT(VARCHAR, @CountryId)
 
    IF (NULLIF(@BranchId, 0) IS NOT NULL)

        SET @WhereConditions += @AndJoin + ' e2.BranchId = ' + CONVERT(VARCHAR, @BranchId)
 
    IF (ISNULL(@EmployeeName, '') <> '')

        SET @WhereConditions += @AndJoin + ' (e1.FirstName LIKE ''%' + @EmployeeName + '%'' OR e1.MiddleName LIKE ''%' + @EmployeeName + '%'' OR e1.LastName LIKE ''%' + @EmployeeName + '%'' OR (e1.FirstName + '' '' + ISNULL(e1.MiddleName, '''') + '' '' + e1.LastName) LIKE ''%' + REPLACE(@EmployeeName, ' ', '%') + '%'')'
 
    IF (ISNULL(@DepartmentId, 0) <> 0)

        SET @WhereConditions += @AndJoin + ' e2.DepartmentId = ' + CONVERT(VARCHAR, @DepartmentId)
 
    IF (ISNULL(@RoleId, 0) <> 0)

        SET @WhereConditions += @AndJoin + ' e3.RoleId = ' + CONVERT(VARCHAR, @RoleId)
 
    IF (@Status <> 0)

        SET @WhereConditions += @AndJoin + ' e2.EmployeeStatus = ' + CONVERT(VARCHAR, @Status)
 
    IF (ISNULL(@DesignationId, 0) <> 0)

        SET @WhereConditions += @AndJoin + ' e2.DesignationId = ' + CONVERT(VARCHAR, @DesignationId)
 
    IF (ISNULL(@EmployeeCode, '') <> '')

        SET @WhereConditions += @AndJoin + ' e1.EmployeeCode IN (SELECT TRIM(value) FROM string_split(''' + @EmployeeCode + ''', '',''))'
 
    IF (ISNULL(@EmploymentStatus, 0) <> 0)

        SET @WhereConditions += @AndJoin + ' e2.EmploymentStatus = ' + CONVERT(VARCHAR, @EmploymentStatus)
 
    -- Sorting

    IF (ISNULL(@SortColumnName, '') <> '' AND ISNULL(@SortColumnDirection, '') <> '')

        SET @OrderQuery = ' ORDER BY ' + QUOTENAME(@SortColumnName) + ' ' + @SortColumnDirection

    ELSE

        SET @OrderQuery = ' ORDER BY e1.Id ASC'
 
    -- Pagination

   -- SET @Pagination = ' OFFSET ' + CAST(@StartIndex AS NVARCHAR) + ' ROWS FETCH NEXT ' + CAST(@PageSize AS NVARCHAR) + ' ROWS ONLY'
 
    -- Final Query Assembly

    SET @Query += @JoinQuery

    SET @CountQuery += @JoinQuery
 
    IF (@WhereConditions <> '') BEGIN

        SET @Query += @WhereConditions

        SET @CountQuery += @WhereConditions

    END
 
    SET @Query += @OrderQuery

    --SET @Query += @Pagination
 
    

    EXEC sp_executesql @CountQuery, N'@TotalRecords INT OUTPUT', @TotalRecords = @TotalRecords OUTPUT
 
    

    EXEC(@Query)

END
GO

--GetEvents
CREATE OR ALTER   PROCEDURE [dbo].[GetEvents]
@EventName AS VARCHAR(100)='',
@StatusId AS int,
@SortColumnName AS VARCHAR(50)='',
@SortColumnDirection AS VARCHAR(50)='',
@PageNumber AS INT=1,
@PageSize AS INT=10
AS
BEGIN
	DECLARE @Query AS VARCHAR(MAX)='',@OrderQuery AS VARCHAR(MAX)='',@Conditions AS VARCHAR(MAX)='',
	@Pagination AS VARCHAR(MAX)='', @StartIndex AS INT

	SELECT @StartIndex = (@PageNumber-1)*@PageSize  
	
	SET @Query='SELECT E.Id,Title as EventName,StartDate
				,EndDate,G.GroupName AS EmployeeGroup,S.StatusValue AS Status,E.Venue,E.BannerFileName
				FROM DBO.Events E
				INNER JOIN dbo.[Group] G ON E.EmpGroupId = G.Id
				INNER JOIN [dbo].[Status] S ON E.StatusId = S.Id
				WHERE E.IsDeleted = 0'
	
	-- SEARCH OPERATION
	BEGIN
	SET @Conditions=''
	END
	IF(ISNULL(@EventName,'')<>'')
	BEGIN
		SET @Conditions +=' and E.Title LIKE ''%'+@EventName+'%'''
	END
	IF(@StatusId <> 0)
	BEGIN
		SET @Conditions +=' and E.StatusId='+ CONVERT(VARCHAR(12), @StatusId)
	END
	-- SORT OPERATION
	IF(ISNULL(@SortColumnName,'')<>'' AND ISNULL(@SortColumnDirection,'')<>'')
	BEGIN
		SET @OrderQuery=' ORDER BY '+@SortColumnName+' '+@SortColumnDirection
	END
	ELSE SET @OrderQuery=' ORDER BY Id DESC' 
	-- PAGINATION OPERATION
	IF(@PageSize>0)
	BEGIN
		SET @Pagination=' OFFSET '+(CAST(@StartIndex AS varchar(10)))+' ROWS
		FETCH NEXT '+(CAST(@PageSize AS varchar(10)))+' ROWS ONLY'
	END
	IF(@Conditions<>'') SET @Query+= @Conditions
	IF(@OrderQuery<>'') SET @Query+=@OrderQuery
	IF(@Pagination<>'') SET @Query+=@Pagination

	EXEC(@Query)
END
GO
-----------------------------------------------------------------------------------------------
CREATE OR ALTER PROCEDURE [dbo].[GetEmployeeCertificatesList]
@EmployeeId AS bigint,
@SortColumnName AS VARCHAR(50)='',
@SortColumnDirection AS VARCHAR(50)='',
@PageNumber AS INT=1,
@PageSize AS INT=10
AS
BEGIN
	DECLARE @Query AS VARCHAR(MAX)='',@OrderQuery AS VARCHAR(MAX)='',
	@Pagination AS VARCHAR(MAX)='', @StartIndex AS INT

	SELECT @StartIndex = (@PageNumber-1)*@PageSize  
	
	SET @Query='select uc.Id,uc.EmployeeId,uc.CertificateName,uc.FileName, uc.OriginalFileName,uc.CertificateExpiry
				from UserCertificate uc
				where ISNULL(uc.IsDeleted,0) = 0 and uc.EmployeeId = ' + CONVERT(VARCHAR(100), @EmployeeId)
	
		-- SORT OPERATION
	IF(ISNULL(@SortColumnName,'')<>'' AND ISNULL(@SortColumnDirection,'')<>'')
	BEGIN
		SET @OrderQuery=' ORDER BY '+@SortColumnName+' '+@SortColumnDirection
	END
	ELSE SET @OrderQuery=' ORDER BY uc.Id DESC' 
	-- PAGINATION OPERATION
	
	IF(@PageSize>0)
	BEGIN
		SET @Pagination=' OFFSET '+(CAST(@StartIndex AS varchar(10)))+' ROWS
		FETCH NEXT '+(CAST(@PageSize AS varchar(10)))+' ROWS ONLY'
	END
	
	IF(@OrderQuery<>'') SET @Query+=@OrderQuery
	IF(@Pagination<>'') SET @Query+=@Pagination

	EXEC(@Query)
END
GO

CREATE OR ALTER  PROCEDURE [dbo].[GetUserCompanyPolicyTrackList]
@CompanyPolicyId AS bigint,
@EmployeeName AS VARCHAR(50),
@SortColumnName AS VARCHAR(50)='',
@SortColumnDirection AS VARCHAR(50)='',
@PageNumber AS INT=1,
@PageSize AS INT=10
AS
BEGIN
	DECLARE @Query AS VARCHAR(MAX)='',@OrderQuery AS VARCHAR(MAX)='',@Conditions AS VARCHAR(MAX)='',
	@Pagination AS VARCHAR(MAX)='', @StartIndex AS INT

	SELECT @StartIndex = (@PageNumber-1)*@PageSize  
	
	SET @Query='SELECT uc.Id,
					FirstName,
					MiddleName,
					LastName,
					cp.[Name] as CompanyPolicyName,
					uc.ViewedOn,
					uc.ModifiedOn 
				FROM dbo.UserCompanyPolicyTrack uc WITH (NOLOCK)
				INNER JOIN dbo.EmployeeData ed WITH (NOLOCK) ON uc.EmployeeId = ed.id
				INNER JOIN dbo.CompanyPolicy cp WITH (NOLOCK) ON uc.CompanyPolicyId = cp.Id
				WHERE 1=1'
	
	BEGIN
	SET @Conditions=''
	END

	IF(ISNULL(@EmployeeName,'')<>'')
	BEGIN
		SET @Conditions +=' and (ed.FirstName LIKE ''%'+@EmployeeName+'%'' 
			OR ed.MiddleName LIKE ''%'+@EmployeeName+'%'' 
			OR ed.LastName LIKE ''%'+@EmployeeName+'%'') '
	END
	IF(@CompanyPolicyId <> 0)
	BEGIN
		SET @Conditions +=' and cp.Id='+ CONVERT(VARCHAR(12), @CompanyPolicyId)
	END
		-- SORT OPERATION
	IF(ISNULL(@SortColumnName,'')<>'' AND ISNULL(@SortColumnDirection,'')<>'')
	BEGIN
		SET @OrderQuery=' ORDER BY '+@SortColumnName+' '+@SortColumnDirection
	END
	ELSE SET @OrderQuery=' ORDER BY uc.Id DESC ' 
	-- PAGINATION OPERATION
	
	IF(@PageSize>0)
	BEGIN
		SET @Pagination=' OFFSET '+(CAST(@StartIndex AS varchar(10)))+' ROWS
		FETCH NEXT '+(CAST(@PageSize AS varchar(10)))+' ROWS ONLY'
	END

	IF(@Conditions<>'') SET @Query+= @Conditions
	IF(@OrderQuery<>'') SET @Query+=@OrderQuery
	IF(@Pagination<>'') SET @Query+=@Pagination

	EXEC(@Query)
END

GO

-------Get My Survey List----------
CREATE OR ALTER PROCEDURE [dbo].[GetSurveyList]
@Title AS VARCHAR(250)= '',
@StatusId AS bigint,
@EmpGroupId AS bigint,
@SortColumnName AS VARCHAR(50)='',
@SortColumnDirection AS VARCHAR(50)='',
@PageNumber AS INT=1,
@PageSize AS INT=10
AS
BEGIN
	DECLARE @Query AS VARCHAR(MAX)='',@OrderQuery AS VARCHAR(MAX)='',@Conditions AS VARCHAR(MAX)='',
	@Pagination AS VARCHAR(MAX)='', @StartIndex AS INT

	SELECT @StartIndex = (@PageNumber-1)*@PageSize  
	
	SET @Query='SELECT sm.SurveyId,sm.EmpGroupId,s.PublishDate,s.DeadLine,s.StatusId,eg.GroupName,sm.EmpGroupId,s.Title,st.StatusValue
		         FROM SurveyEmpGroupMapping sm
		INNER JOIN [dbo].[Surveys] s ON s.Id= sm.SurveyId 
		INNER JOIN [dbo].[Group] eg ON eg.Id= sm.EmpGroupId
		INNER JOIN [dbo].[Status] st ON st.Id= s.StatusId WHERE s.IsDeleted =0'
	
	BEGIN
	SET @Conditions=''
	END
	IF(ISNULL(@Title,'')<>'')
	BEGIN
		SET @Conditions +=' and (s.Title LIKE ''%'+@Title+'%'') '
	END	
	IF(@StatusId <> 0)
	BEGIN
		SET @Conditions +=' and s.StatusId='+ CONVERT(VARCHAR(12), @StatusId)
	END	
	IF(@EmpGroupId <> 0)
	BEGIN
		SET @Conditions +=' and sm.EmpGroupId='+ CONVERT(VARCHAR(12), @EmpGroupId)
	END	
		-- SORT OPERATION
	IF(ISNULL(@SortColumnName,'')<>'' AND ISNULL(@SortColumnDirection,'')<>'')
	BEGIN
		SET @OrderQuery=' ORDER BY '+@SortColumnName+' '+@SortColumnDirection
	END
	ELSE SET @OrderQuery=' ORDER BY sm.SurveyId DESC ' 
	-- PAGINATION OPERATION
	
	IF(@PageSize>0)
	BEGIN
		SET @Pagination=' OFFSET '+(CAST(@StartIndex AS varchar(10)))+' ROWS
		FETCH NEXT '+(CAST(@PageSize AS varchar(10)))+' ROWS ONLY'
	END

	IF(@Conditions<>'') SET @Query+= @Conditions
	IF(@OrderQuery<>'') SET @Query+=@OrderQuery
	IF(@Pagination<>'') SET @Query+=@Pagination

	EXEC(@Query)
END
Go
--------GetTeams----------------------
Create OR Alter PROCEDURE [dbo].[GetTeams]
@TeamName AS VARCHAR(100)='',
@SortColumnName AS VARCHAR(50)='',
@SortColumnDirection AS VARCHAR(50)='',
@PageNumber AS INT=1,
@PageSize AS INT=10
AS
BEGIN
	DECLARE @Query AS VARCHAR(MAX)='',@OrderQuery AS VARCHAR(MAX)='',@Conditions AS VARCHAR(MAX)='',
	@Pagination AS VARCHAR(MAX)='', @StartIndex AS INT

	SELECT @StartIndex = (@PageNumber-1)*@PageSize  
	
	SET @Query='SELECT Id,TeamName As Name
				FROM DBO.Team WHERE IsDeleted = 0'
	
	-- SEARCH OPERATION
	BEGIN
	SET @Conditions=''
	END
	IF(ISNULL(@TeamName,'')<>'')
	BEGIN
		SET @Conditions +=' and TeamName LIKE ''%'+@TeamName+'%'''
	END
	-- SORT OPERATION
	IF(ISNULL(@SortColumnName,'')<>'' AND ISNULL(@SortColumnDirection,'')<>'')
	BEGIN
		SET @OrderQuery=' ORDER BY '+@SortColumnName+' '+@SortColumnDirection
	END
	ELSE SET @OrderQuery=' ORDER BY Id DESC' 
	-- PAGINATION OPERATION
	IF(@PageSize>0)
	BEGIN
		SET @Pagination=' OFFSET '+(CAST(@StartIndex AS varchar(10)))+' ROWS
		FETCH NEXT '+(CAST(@PageSize AS varchar(10)))+' ROWS ONLY'
	END
	IF(@Conditions<>'') SET @Query+= @Conditions
	IF(@OrderQuery<>'') SET @Query+=@OrderQuery
	IF(@Pagination<>'') SET @Query+=@Pagination

	EXEC(@Query)
END
GO
-----------------GetDepartments-----------------------
 Create or Alter PROCEDURE [dbo].[GetDepartments]
@Department AS VARCHAR(100)='',
@SortColumnName AS VARCHAR(50)='',
@SortColumnDirection AS VARCHAR(50)='',
@PageNumber AS INT=1,
@PageSize AS INT=10
AS
BEGIN
	DECLARE @Query AS VARCHAR(MAX)='',@OrderQuery AS VARCHAR(MAX)='',@Conditions AS VARCHAR(MAX)='',
	@Pagination AS VARCHAR(MAX)='', @StartIndex AS INT

	SELECT @StartIndex = (@PageNumber-1)*@PageSize  
	
	SET @Query='SELECT Id,Department As Name
				FROM DBO.Department WHERE IsDeleted = 0'
	
	-- SEARCH OPERATION
	BEGIN
	SET @Conditions=''
	END
	IF(ISNULL(@Department,'')<>'')
	BEGIN
		SET @Conditions +=' and Department LIKE ''%'+@Department+'%'''
	END
	-- SORT OPERATION
	IF(ISNULL(@SortColumnName,'')<>'' AND ISNULL(@SortColumnDirection,'')<>'')
	BEGIN
		SET @OrderQuery=' ORDER BY '+@SortColumnName+' '+@SortColumnDirection
	END
	ELSE SET @OrderQuery=' ORDER BY Id DESC' 
	-- PAGINATION OPERATION
	IF(@PageSize>0)
	BEGIN
		SET @Pagination=' OFFSET '+(CAST(@StartIndex AS varchar(10)))+' ROWS
		FETCH NEXT '+(CAST(@PageSize AS varchar(10)))+' ROWS ONLY'
	END
	IF(@Conditions<>'') SET @Query+= @Conditions
	IF(@OrderQuery<>'') SET @Query+=@OrderQuery
	IF(@Pagination<>'') SET @Query+=@Pagination

	EXEC(@Query)
END
GO
Create OR ALTER   PROCEDURE [dbo].[GetTeams]
@TeamName AS VARCHAR(100)='',
@Status AS int,
@SortColumnName AS VARCHAR(50)='',
@SortColumnDirection AS VARCHAR(50)='',
@PageNumber AS INT=1,
@PageSize AS INT=10
AS
BEGIN
	DECLARE @Query AS VARCHAR(MAX)='',@OrderQuery AS VARCHAR(MAX)='',@Conditions AS VARCHAR(MAX)='',
	@Pagination AS VARCHAR(MAX)='', @StartIndex AS INT

	SELECT @StartIndex = (@PageNumber-1)*@PageSize  
	
	SET @Query='SELECT Id,TeamName As Name, IsDeleted As Status
				FROM DBO.Team  WHERE 1=1'
	
	-- SEARCH OPERATION
	BEGIN
	SET @Conditions=''
	END
	IF(ISNULL(@TeamName,'')<>'')
	BEGIN
		SET @Conditions +=' and TeamName LIKE ''%'+@TeamName+'%'''
	END
		IF(@Status IS NULL)
	BEGIN
		SET @Conditions += ' AND (IsDeleted = 0 OR IsDeleted = 1)' -- Include all records
	END
	ELSE
	BEGIN
		SET @Conditions += ' AND IsDeleted = ' + CAST(@Status AS VARCHAR(10))
	END
	-- SORT OPERATION
	IF(ISNULL(@SortColumnName,'')<>'' AND ISNULL(@SortColumnDirection,'')<>'')
	BEGIN
		SET @OrderQuery=' ORDER BY '+@SortColumnName+' '+@SortColumnDirection
	END
	ELSE SET @OrderQuery=' ORDER BY Id DESC' 
	-- PAGINATION OPERATION
	IF(@PageSize>0)
	BEGIN
		SET @Pagination=' OFFSET '+(CAST(@StartIndex AS varchar(10)))+' ROWS
		FETCH NEXT '+(CAST(@PageSize AS varchar(10)))+' ROWS ONLY'
	END
	IF(@Conditions<>'') SET @Query+= @Conditions
	IF(@OrderQuery<>'') SET @Query+=@OrderQuery
	IF(@Pagination<>'') SET @Query+=@Pagination

	EXEC(@Query)
END
GO
--exec [dbo].[GetTeams] '',0,'','',1,100

-------------GetDepartments--------------

Create OR ALTER   PROCEDURE [dbo].[GetDepartments]
@Department AS VARCHAR(100)='',
@Status AS int,
@SortColumnName AS VARCHAR(50)='',
@SortColumnDirection AS VARCHAR(50)='',
@PageNumber AS INT=1,
@PageSize AS INT=100
AS
BEGIN
	DECLARE @Query AS VARCHAR(MAX)='',@OrderQuery AS VARCHAR(MAX)='',@Conditions AS VARCHAR(MAX)='',
	@Pagination AS VARCHAR(MAX)='', @StartIndex AS INT

	SELECT @StartIndex = (@PageNumber-1)*@PageSize  
	
	SET @Query='SELECT Id,Department As Name, IsDeleted As Status
				FROM DBO.Department WHERE 1=1'
	
	-- SEARCH OPERATION
	BEGIN
	SET @Conditions=''
	END
	IF(ISNULL(@Department,'')<>'')
	BEGIN
		SET @Conditions +=' and Department LIKE ''%'+@Department+'%'''
	END
		IF(@Status IS NULL)
	BEGIN
		SET @Conditions += ' AND (IsDeleted = 0 OR IsDeleted = 1)' -- Include all records
	END
	ELSE
	BEGIN
		SET @Conditions += ' AND IsDeleted = ' + CAST(@Status AS VARCHAR(10))
	END
	-- SORT OPERATION
	IF(ISNULL(@SortColumnName,'')<>'' AND ISNULL(@SortColumnDirection,'')<>'')
	BEGIN
		SET @OrderQuery=' ORDER BY '+@SortColumnName+' '+@SortColumnDirection
	END
	ELSE SET @OrderQuery=' ORDER BY Id DESC' 
	-- PAGINATION OPERATION
	IF(@PageSize>0)
	BEGIN
		SET @Pagination=' OFFSET '+(CAST(@StartIndex AS varchar(10)))+' ROWS
		FETCH NEXT '+(CAST(@PageSize AS varchar(10)))+' ROWS ONLY'
	END
	IF(@Conditions<>'') SET @Query+= @Conditions
	IF(@OrderQuery<>'') SET @Query+=@OrderQuery
	IF(@Pagination<>'') SET @Query+=@Pagination

	EXEC(@Query)
END

GO
---exec [GetDepartments] '',null,'','',1,100
  --GetDesignation--------------
Create or ALTER   PROCEDURE [dbo].[GetDesignation]
@Designation AS VARCHAR(100)='',
@Status AS int,
@SortColumnName AS VARCHAR(50)='',
@SortColumnDirection AS VARCHAR(50)='',
@PageNumber AS INT=1,
@PageSize AS INT=100
AS
BEGIN
	DECLARE @Query AS VARCHAR(MAX)='',@OrderQuery AS VARCHAR(MAX)='',@Conditions AS VARCHAR(MAX)='',
	@Pagination AS VARCHAR(MAX)='', @StartIndex AS INT

	SELECT @StartIndex = (@PageNumber-1)*@PageSize  
	
	SET @Query='SELECT Id,Designation As Name, IsDeleted As Status
				FROM DBO.Designation WHERE 1=1'
	
	-- SEARCH OPERATION
	BEGIN
	SET @Conditions=''
	END
	IF(ISNULL(@Designation,'')<>'')
	BEGIN
		SET @Conditions +=' and Designation LIKE ''%'+@Designation+'%'''
	END
		IF(@Status IS NULL)
	BEGIN
		SET @Conditions += ' AND (IsDeleted = 0 OR IsDeleted = 1)' -- Include all records
	END
	ELSE
	BEGIN
		SET @Conditions += ' AND IsDeleted = ' + CAST(@Status AS VARCHAR(10))
	END
	-- SORT OPERATION
	IF(ISNULL(@SortColumnName,'')<>'' AND ISNULL(@SortColumnDirection,'')<>'')
	BEGIN
		SET @OrderQuery=' ORDER BY '+@SortColumnName+' '+@SortColumnDirection
	END
	ELSE SET @OrderQuery=' ORDER BY Id DESC' 
	-- PAGINATION OPERATION
	IF(@PageSize>0)
	BEGIN
		SET @Pagination=' OFFSET '+(CAST(@StartIndex AS varchar(10)))+' ROWS
		FETCH NEXT '+(CAST(@PageSize AS varchar(10)))+' ROWS ONLY'
	END
	IF(@Conditions<>'') SET @Query+= @Conditions
	IF(@OrderQuery<>'') SET @Query+=@OrderQuery
	IF(@Pagination<>'') SET @Query+=@Pagination

	EXEC(@Query)
END
GO
--exec [GetDesignation] '',null,'','',1,100
/****** Object:  StoredProcedure [dbo].[GetAttendanceConfiguration]    Script Date: 5/30/2025 3:49:04 PM ******/
CREATE OR ALTER   PROCEDURE [dbo].[GetAttendanceConfiguration] --'','',1,100
    @EmployeeName AS VARCHAR(100) = NULL,
	@EmployeeCode AS VARCHAR(MAX)=Null,
    @PageNumber AS INT = 1,
    @PageSize AS INT = 10
AS
BEGIN
    DECLARE @Query AS VARCHAR(MAX) = '',
            @Pagination AS VARCHAR(MAX) = '',
            @StartIndex AS INT
 
    SELECT @StartIndex = (@PageNumber -1) * @PageSize  
 
    SET @Query = 'SELECT  ed.EmployeeId, ed.TimeDoctorUserId,
							emp.EmployeeCode,
                         CONCAT(emp.FirstName, 
                                CASE 
                                    WHEN emp.MiddleName IS NOT NULL AND emp.MiddleName <> '' '' 
                                    THEN CONCAT('' '', emp.MiddleName) 
                                    ELSE '''' 
                                END,
                                '' '', 
                                emp.LastName) AS EmployeeName,
                          ds.Designation,
                         d.Department AS Department,
                         c.CountryName AS Country, 
                         IsManualAttendance
                  FROM EmployeeData emp
                  INNER JOIN EmploymentDetail ed ON ed.EmployeeId = emp.Id  
                  LEFT JOIN Department d ON ed.DepartmentId = d.Id
                  LEFT JOIN Address a ON ed.EmployeeId = a.EmployeeId  
                  LEFT JOIN Country c ON a.CountryId = c.Id
				  LEFT JOIN Designation ds ON ds.Id = ed.DesignationId
                  WHERE 1=1'  -- This allows for easy appending of conditions
 
    IF @EmployeeName IS NOT NULL AND @EmployeeName <> ''
    BEGIN
        SET @Query += ' AND (CONCAT(emp.FirstName, '' '', 
                                ISNULL(emp.MiddleName, ''''), '' '', 
                                emp.LastName) LIKE ''%' + @EmployeeName + '%'')'
    END
	IF @EmployeeCode IS NOT NULL 
	BEGIN
		SET @Query += ' AND emp.EmployeeCode = ''' + @EmployeeCode + ''''
	END
 
 
    SET @Query += ' ORDER BY ed.EmployeeId '
 
    IF (@PageSize > 0)
    BEGIN
        SET @Pagination = ' OFFSET ' + CAST(@StartIndex AS VARCHAR(10)) + ' ROWS
                           FETCH NEXT ' + CAST(@PageSize AS VARCHAR(10)) + ' ROWS ONLY'
    END
 
    IF (@Pagination <> '') SET @Query += @Pagination
	--Print(@Query)
    EXEC(@Query)
END
GO
CREATE OR ALTER PROCEDURE [dbo].[CreditMonthlyLeaveBalance] 
    @LeaveTypeId AS INT, 
    @CreditAmount AS DECIMAL (18, 2),
    @CarryOverLimit AS DECIMAL(5,2),
    @SelectedDate AS DATE,
    @CarryOverMonth AS INT,
    @Description VARCHAR(50) NULL = NULL,
    @CreatedBy NVARCHAR(120) = 'admin'
    
AS 
BEGIN
    DECLARE @updatedRows INT = 0
    DECLARE @id INT
    DECLARE @EmpId BIGINT
    DECLARE @balance DECIMAL (18, 2)
    DECLARE @cappedBalance DECIMAL(18,2)

DECLARE id_cursor CURSOR FOR
SELECT 
    ISNULL(EL.Id, 0) AS EmployeeLeaveId, 
    ED.Id AS EmployeeId, 
    COALESCE(
        (SELECT TOP 1 AUL.ClosingBalance 
         FROM [dbo].[AccrualUtilizedLeave] AUL 
         WHERE AUL.EmployeeId = ED.Id 
           AND AUL.LeaveId = @LeaveTypeId 
         ORDER BY AUL.Id DESC), 
        CAST(ISNULL(EL.OpeningBalance, 0) AS DECIMAL(18, 2))
    ) AS OpeningBalance
FROM EmployeeData ED
JOIN EmploymentDetail EMP ON EMP.EmployeeId = ED.Id
INNER JOIN EmployeeLeave EL 
    ON EL.EmployeeId = ED.Id AND EL.LeaveId = @LeaveTypeId
WHERE ED.IsDeleted = 0
  AND EMP.EmployeeStatus != 4;

    OPEN id_cursor
    FETCH NEXT FROM id_cursor INTO @id, @EmpId, @balance

    WHILE @@FETCH_STATUS = 0
    BEGIN
        IF NOT EXISTS (
            SELECT Id 
            FROM AccrualUtilizedLeave 
            WHERE EmployeeId = @EmpId 
              AND LeaveId = @LeaveTypeId 
              AND MONTH([Date]) = MONTH(@SelectedDate)
              AND YEAR([Date]) = YEAR(@SelectedDate)
        ) 
        BEGIN
            -- Carryover logic: limit the balance
            IF (MONTH(@SelectedDate) = @CarryOverMonth)
            BEGIN
                SET @cappedBalance = 
                    CASE 
                        WHEN @CarryOverLimit < @balance THEN @CarryOverLimit 
                        ELSE @balance 
                    END

                -- Persist the capped balance (Fix)
                UPDATE EmployeeLeave 
                SET OpeningBalance = @cappedBalance
                WHERE Id = @id

                SET @balance = @cappedBalance -- Update for next calculation
            END

            

			INSERT INTO [dbo].[AccrualUtilizedLeave]
				([EmployeeId],[LeaveId],[Date],[Description],[Accrued],[UtilizedOrRejected],[ClosingBalance],[CreatedOn],[CreatedBy]) VALUES 
				(@EmpId, @LeaveTypeId, @SelectedDate, @Description, @CreditAmount, 0, @balance + @CreditAmount, GETUTCDATE(), @CreatedBy)

			SET @updatedRows = @updatedRows + 1
		END

		FETCH NEXT FROM id_cursor INTO @id, @EmpId, @balance
	END

	CLOSE id_cursor
	DEALLOCATE id_cursor

	SELECT @updatedRows
END
GO
CREATE OR ALTER PROCEDURE [dbo].[GetNotificationTemplates]
@TemplateName AS VARCHAR(250)='',
@SenderName AS VARCHAR(250)='',
@SenderEmail AS VARCHAR(250)='',
@TemplateType AS INT=null,
@SortColumnName AS VARCHAR(50)='',
@SortColumnDirection AS VARCHAR(50)='',
@PageNumber AS INT=1,
@PageSize AS INT=10
AS
BEGIN
 DECLARE @Query AS VARCHAR(MAX)='',@TotalQuery AS VARCHAR(MAX)='',@OrderQuery AS VARCHAR(MAX)='',@Conditions AS VARCHAR(MAX)='',
 @Pagination AS VARCHAR(MAX)='', @StartIndex AS INT

 SELECT @StartIndex = (@PageNumber-1)*@PageSize  
 IF (@StartIndex < 0) BEGIN SET @StartIndex = 0 END
 SET @TotalQuery='SELECT COUNT(N.Id) FROM NotificationTemplate N WHERE N.IsDeleted = 0'
 
 SET @Query='SELECT N.Id, N.TemplateName, N.Subject, N.Content, N.[Type], N.[Status], N.[SenderName], N.[SenderEmail], N.[CCEmails],N.[ToEmail],N.[BCCEmails], N.[CreatedOn], N.[ModifiedOn] FROM NotificationTemplate N 
  WHERE N.IsDeleted = 0'

 IF(ISNULL(@TemplateName,'')<>'')
 BEGIN
  SET @Conditions +=' AND (N.TemplateName LIKE ''%'+@TemplateName+'%'') '
 END 

 IF(ISNULL(@SenderName,'')<>'')
 BEGIN
  SET @Conditions +=' AND (N.SenderName LIKE ''%'+@SenderName+'%'') '
 END 

 IF(ISNULL(@SenderEmail,'')<>'')
 BEGIN
  SET @Conditions +=' AND (N.SenderEmail LIKE ''%'+@SenderEmail+'%'') '
 END 

 IF(@TemplateType IS NOT NULL)
 BEGIN
  SET @Conditions += CONCAT(' AND (N.[Type] = ', @TemplateType,') ')
 END 

  -- SORT OPERATION
 IF(ISNULL(@SortColumnName,'')<>'' AND ISNULL(@SortColumnDirection,'')<>'')
 BEGIN
  SET @OrderQuery=' ORDER BY '+@SortColumnName+' '+@SortColumnDirection
 END
 ELSE SET @OrderQuery=' ORDER BY Id DESC ' 
 -- PAGINATION OPERATION
 
 IF(@PageSize>0)
 BEGIN
  SET @Pagination=' OFFSET '+(CAST(@StartIndex AS varchar(10)))+' ROWS
  FETCH NEXT '+(CAST(@PageSize AS varchar(10)))+' ROWS ONLY'
 END

 IF(@Conditions<>'') SET @Query+= @Conditions
 IF(@OrderQuery<>'') SET @Query+=@OrderQuery
 IF(@Pagination<>'') SET @Query+=@Pagination

 IF(@Conditions<>'') SET @TotalQuery+= @Conditions
 
 EXEC(@TotalQuery)
 EXEC(@Query)
END

GO   
CREATE OR ALTER   PROCEDURE [dbo].[GetEmployeesList]
@EmployeeName AS VARCHAR(100)='',
@EmployeeCode AS VARCHAR(MAX)='',
@EmploymentStatus as INT =0,
@DepartmentId as bigint =0,
@DesignationId as bigint =0,
@RoleId AS BIGINT =0,
@EmployeeStatus as INT =0,
@SortColumnName AS VARCHAR(50)='',
@SortColumnDirection AS VARCHAR(50)='',
@PageNumber AS INT=1,
@PageSize AS INT=10,

@EmployeeEmail NVARCHAR(340) = NULL,
@BranchId INT = NULL,
@CountryId INT = NULL,
@DOJRangeFrom DATE = NULL,
@DOJRangeTo DATE = NULL
AS
BEGIN
	DECLARE @StartIndex AS INT
	 
	SELECT @StartIndex = (@PageNumber-1)*@PageSize  

	SELECT Count(*) as TotalCount FROM vw_EmployeeData
 WHERE
	(@DOJRangeFrom IS NULL OR @DOJRangeTo IS NULL OR JoiningDate BETWEEN @DOJRangeFrom AND @DOJRangeTo) AND
(NULLIF(@CountryId, 0) IS NULL OR @CountryId = CountryId) AND
(NULLIF(@BranchId, 0) IS NULL OR @BranchId = BranchId) AND
 (NULLIF(@EmployeeName, '') IS NULL OR CHARINDEX(@EmployeeName, EmployeeFullName) > 0) AND 
 (NULLIF(@EmployeeCode, '') IS NULL OR EmployeeCode IN (SELECT TRIM(value) FROM string_split(@EmployeeCode, ','))) AND
 (NULLIF(@EmploymentStatus, '') IS NULL OR  @EmploymentStatus= EmploymentStatus ) AND
 (NULLIF(@EmployeeStatus, '') IS NULL OR @EmployeeStatus= EmployeeStatus ) AND
 (NULLIF(@DesignationId, 0) IS NULL OR @DesignationId = DesignationId) AND
 (NULLIF(@DepartmentId, 0) IS NULL OR @DepartmentId = DepartmentId) AND
 --(NULLIF(@CountryId, 0) IS NULL OR @CountryId = CountryId) AND 
 (NULLIF(@RoleId, 0) IS NULL OR @RoleId = RoleId)  
 		 
 SELECT ved.EmployeeId as Id, ved.EmployeeCode ,ved.EmployeeFullname AS EmployeeName , ved.JoiningDate,ved.BranchId AS Branch,
	        ved.OfficeEmail as Email, ved.JobType, ved.PersonalEmail ,ved.Department As DepartmentName, ved.Designation As Designation,
            ved.Phone, ved.EmployeeStatus,ved.EmploymentStatus,ved.RoleName, ved.RoleId,ved.Country,ved.CountryId
			 FROM   vw_EmployeeData AS ved 

				--LEFT JOIN EmployeeData AS E ON E.Id =  ved.EmployeeId 
 WHERE
	(@DOJRangeFrom IS NULL OR @DOJRangeTo IS NULL OR JoiningDate BETWEEN @DOJRangeFrom AND @DOJRangeTo) AND
	(NULLIF(@EmployeeEmail, '') IS NULL OR CHARINDEX(@EmployeeEmail, OfficeEmail) > 0) AND
	(NULLIF(@CountryId, 0) IS NULL OR @CountryId = CountryId) AND
	(NULLIF(@BranchId, 0) IS NULL OR @BranchId = BranchId) AND
 (NULLIF(@EmployeeName, '') IS NULL OR CHARINDEX(@EmployeeName, EmployeeFullName) > 0) AND 
  (NULLIF(@EmployeeCode, '') IS NULL OR EmployeeCode IN (SELECT TRIM(value) FROM string_split(@EmployeeCode, ','))) AND
 (NULLIF(@EmploymentStatus, '') IS NULL OR  @EmploymentStatus= EmploymentStatus ) AND
 (NULLIF(@EmployeeStatus, '') IS NULL OR @EmployeeStatus= EmployeeStatus ) AND
 (NULLIF(@DesignationId, 0) IS NULL OR @DesignationId = DesignationId) AND
 (NULLIF(@DepartmentId, 0) IS NULL OR @DepartmentId = DepartmentId) AND
 --(NULLIF(@CountryId, 0) IS NULL OR @CountryId = CountryId) AND 
 (NULLIF(@RoleId, 0) IS NULL OR @RoleId = RoleId)  
 		 
	-- SORT OPERATION
  ORDER BY 
  CASE WHEN @SortColumnName = 'EmployeeId' AND @SortColumnDirection = 'ASC' THEN EmployeeId END ASC,
  CASE WHEN @SortColumnName = 'EmployeeCode' AND @SortColumnDirection = 'ASC' THEN EmployeeCode END ASC,
  CASE WHEN @SortColumnName = 'EmployeeName' AND @SortColumnDirection = 'ASC' THEN EmployeeFullName END ASC,
  CASE WHEN @SortColumnName = 'Email' AND @SortColumnDirection = 'ASC' THEN OfficeEmail END ASC, 
  CASE WHEN @SortColumnName = 'Designation' AND @SortColumnDirection = 'ASC' THEN Designation END ASC,
  CASE WHEN @SortColumnName = 'DepartmentName' AND @SortColumnDirection = 'ASC' THEN Department END ASC,
  CASE WHEN @SortColumnName = 'Status' AND @SortColumnDirection = 'ASC' THEN EmployeeStatus END ASC, 
  CASE WHEN @SortColumnName = 'EmploymentStatus' AND @SortColumnDirection = 'ASC' THEN EmploymentStatus END ASC, 
  CASE WHEN @SortColumnName = 'RoleName' AND @SortColumnDirection = 'ASC' THEN RoleName END ASC, 
  CASE WHEN @SortColumnName = 'JoiningDate' AND @SortColumnDirection = 'ASC' THEN JoiningDate END ASC, 
  CASE WHEN @SortColumnName = 'Branch' AND @SortColumnDirection = 'ASC' THEN BranchId END ASC, 
  
  CASE WHEN @SortColumnName = 'Branch' AND @SortColumnDirection = 'DESC' THEN BranchId END DESC,
  CASE WHEN @SortColumnName = 'EmployeeId' AND @SortColumnDirection = 'DESC' THEN EmployeeId END DESC,
  CASE WHEN @SortColumnName = 'EmployeeCode' AND @SortColumnDirection = 'DESC' THEN EmployeeCode END DESC,
  CASE WHEN @SortColumnName = 'EmployeeName' AND @SortColumnDirection = 'DESC' THEN EmployeeFullName END DESC,
  CASE WHEN @SortColumnName = 'Email' AND @SortColumnDirection = 'DESC' THEN OfficeEmail END DESC, 
  CASE WHEN @SortColumnName = 'Designation' AND @SortColumnDirection = 'DESC' THEN Designation END DESC,
  CASE WHEN @SortColumnName = 'DepartmentName' AND @SortColumnDirection = 'DESC' THEN Department END DESC,
  CASE WHEN @SortColumnName = 'Status' AND @SortColumnDirection = 'DESC' THEN EmployeeStatus END DESC, 
  CASE WHEN @SortColumnName = 'EmploymentStatus' AND @SortColumnDirection = 'DESC' THEN EmploymentStatus END DESC, 
  CASE WHEN @SortColumnName = 'RoleName' AND @SortColumnDirection = 'DESC' THEN RoleName END DESC, 
  CASE WHEN @SortColumnName = 'JoiningDate' AND @SortColumnDirection = 'DESC' THEN JoiningDate END DESC
   
	-- PAGINATION OPERATION
  OFFSET COALESCE(NULLIF(@StartIndex, 0), 0) ROWS
 FETCH NEXT COALESCE(NULLIF(@PageSize, 0), 10) ROWS ONLY;
	  
END
GO
CREATE OR ALTER PROC [dbo].[GetAttendanceConfigList]
	@EmployeeName VARCHAR(250) = null,
	@EmployeeEmail VARCHAR(250) = null,
	@TimeDoctorUserId VARCHAR(250) = null,
	@CountryId INT = null,
	@DepartmentId INT = null,
	@BranchId INT = null,
	@DesignationId INT = null,
	@EmployeeCode VARCHAR(50) = null,
	@IsManualAttendance BIT = null,
	@SortColumn VARCHAR(50) = null,
	@SortDesc BIT = 0,
	@StartIndex INT = null,
	@PageSize INT = null,
	@DOJRangeFrom DATE = null,
	@DOJRangeTo DATE = null,
	@ReportingManagerId INT =0
AS BEGIN
	/*
	EXEC GetAttendanceConfigList @SortColumn = 'EmployeeId', @SortDesc = 1, @PageSize = 50
	*/

	DECLARE @RoleId INT = (SELECT TOP 1 RoleId FROM UserRoleMapping WHERE EmployeeId = @ReportingManagerId)
	
	SELECT COUNT(*) AS TotalCount
	FROM vw_EmployeeData
	WHERE
	(@DOJRangeFrom IS NULL OR @DOJRangeTo IS NULL OR JoiningDate BETWEEN @DOJRangeFrom AND @DOJRangeTo) AND
	(NULLIF(@EmployeeName, '') IS NULL OR CHARINDEX(@EmployeeName, EmployeeFullName) > 0) AND
	(NULLIF(@TimeDoctorUserId, '') IS NULL OR CHARINDEX(@TimeDoctorUserId, TimeDoctorUserId) > 0) AND
	(NULLIF(@EmployeeEmail, '') IS NULL OR CHARINDEX(@EmployeeEmail, OfficeEmail) > 0) AND
	(NULLIF(@EmployeeCode, '') IS NULL OR CHARINDEX(@EmployeeCode, EmployeeCode) > 0) AND
	(NULLIF(@DesignationId, 0) IS NULL OR @DesignationId = DesignationId) AND
	(NULLIF(@DepartmentId, 0) IS NULL OR @DepartmentId = DepartmentId) AND
	(NULLIF(@CountryId, 0) IS NULL OR @CountryId = CountryId) AND
	(NULLIF(@BranchId, 0) IS NULL OR @BranchId = BranchId) AND
	((NULLIF(@ReportingManagerId, 0) IS NULL OR @ReportingManagerId = ReportingManagerId) OR (NULLIF(@ReportingManagerId, 0) IS NULL OR @ReportingManagerId = ImmediateManager)  OR @RoleId=1) AND
	EmployeeStatus != 4 AND --  Exclude Ex Employees
	(NULLIF(@IsManualAttendance, NULL) IS NULL OR @IsManualAttendance = IsManualAttendance)

	SELECT
		EmployeeId, 
		TimeDoctorUserId,
		EmployeeCode,
		EmployeeFullName AS EmployeeName,
		OfficeEmail AS EmployeeEmail,
		Designation,
		Department,
		Country, 
		BranchId AS Branch,
		IsManualAttendance,
		JoiningDate
	FROM vw_EmployeeData
	WHERE
	(@DOJRangeFrom IS NULL OR @DOJRangeTo IS NULL OR JoiningDate BETWEEN @DOJRangeFrom AND @DOJRangeTo) AND
	(NULLIF(@EmployeeName, '') IS NULL OR CHARINDEX(@EmployeeName, EmployeeFullName) > 0) AND
	(NULLIF(@TimeDoctorUserId, '') IS NULL OR CHARINDEX(@TimeDoctorUserId, TimeDoctorUserId) > 0) AND
	(NULLIF(@EmployeeEmail, '') IS NULL OR CHARINDEX(@EmployeeEmail, OfficeEmail) > 0) AND
	(NULLIF(@EmployeeCode, '') IS NULL OR CHARINDEX(@EmployeeCode, EmployeeCode) > 0) AND
	(NULLIF(@DesignationId, 0) IS NULL OR @DesignationId = DesignationId) AND
	(NULLIF(@DepartmentId, 0) IS NULL OR @DepartmentId = DepartmentId) AND
	(NULLIF(@CountryId, 0) IS NULL OR @CountryId = CountryId) AND
	(NULLIF(@BranchId, 0) IS NULL OR @BranchId = BranchId) AND
	((NULLIF(@ReportingManagerId, 0) IS NULL OR @ReportingManagerId = ReportingManagerId) OR (NULLIF(@ReportingManagerId, 0) IS NULL OR @ReportingManagerId = ImmediateManager)  OR @RoleId=1)  AND
	EmployeeStatus != 4 AND --  Exclude Ex Employees
	(NULLIF(@IsManualAttendance, NULL) IS NULL OR @IsManualAttendance = IsManualAttendance)
	ORDER BY 
		CASE WHEN @SortColumn = 'EmployeeId' AND @SortDesc = 0 THEN EmployeeId END ASC,
		CASE WHEN @SortColumn = 'EmployeeCode' AND @SortDesc = 0 THEN EmployeeCode END ASC,
		CASE WHEN @SortColumn = 'EmployeeName' AND @SortDesc = 0 THEN EmployeeFullName END ASC,
		CASE WHEN @SortColumn = 'EmployeeEmail' AND @SortDesc = 0 THEN OfficeEmail END ASC,
		CASE WHEN @SortColumn = 'Designation' AND @SortDesc = 0 THEN Designation END ASC,
		CASE WHEN @SortColumn = 'Department' AND @SortDesc = 0 THEN Department END ASC,
		CASE WHEN @SortColumn = 'Country' AND @SortDesc = 0 THEN Country END ASC,
		CASE WHEN @SortColumn = 'IsManualAttendance' AND @SortDesc = 0 THEN IsManualAttendance END ASC,
		CASE WHEN @SortColumn = 'JoiningDate' AND  @SortDesc = 0 THEN JoiningDate END ASC, 

  CASE WHEN @SortColumn = 'JoiningDate' AND  @SortDesc = 1 THEN JoiningDate END DESC,
  CASE WHEN @SortColumn = 'EmployeeId' AND @SortDesc = 1 THEN EmployeeId END DESC,
  CASE WHEN @SortColumn = 'EmployeeCode' AND @SortDesc = 1 THEN EmployeeCode END DESC,
  CASE WHEN @SortColumn = 'EmployeeName' AND @SortDesc = 1 THEN EmployeeFullName END DESC,
  CASE WHEN @SortColumn = 'EmployeeEmail' AND @SortDesc = 1 THEN OfficeEmail END DESC,
  CASE WHEN @SortColumn = 'Designation' AND @SortDesc = 1 THEN Designation END DESC,
  CASE WHEN @SortColumn = 'Department' AND @SortDesc = 1 THEN Department END DESC,
  CASE WHEN @SortColumn = 'Country' AND @SortDesc = 1 THEN Country END DESC, 
  CASE WHEN @SortColumn = 'IsManualAttendance' AND @SortDesc = 1 THEN IsManualAttendance END DESC
 OFFSET COALESCE(NULLIF(@StartIndex, 0), 0) ROWS
 FETCH NEXT COALESCE(NULLIF(@PageSize, 0), 10) ROWS ONLY;
END

GO
CREATE OR ALTER PROC [dbo].[GetEmployeeAttendanceReport]
	@StartDate DATE,
	@EndDate DATE,
	@EmployeeCodes VARCHAR(MAX) = null,
	@EmployeeName VARCHAR(250) = null,
	@EmployeeEmail VARCHAR(250) = null,
	@CountryId INT = null,
	@DepartmentId INT = null,
	@BranchId INT = null,
	@DesignationId INT = null,
	@IsManualAttendance BIT = null,
	@SortColumn VARCHAR(50) = null,
	@SortDesc BIT = 0,
	@StartIndex INT = null,
	@PageSize INT = null,
	@DOJRangeFrom DATE = null,
	@DOJRangeTo DATE = null,
	@ReportingManagerId INT = null
AS BEGIN
	/* "2,3"
	EXEC GetEmployeeAttendanceReport @EmployeeCodes = null,  @StartDate='1-July-2025', @EndDate = '21-july-2025', @sortColumn = 'EmployeeName', @SortDesc = 0, @PageSize = 5, @IsManualAttendance = null, @StartIndex = 10
	*/

	DECLARE @RoleId INT = (SELECT TOP 1 RoleId FROM UserRoleMapping WHERE EmployeeId = @ReportingManagerId)
	
	SELECT COUNT(*) AS TotalCount
	FROM vw_EmployeeData
	WHERE
	(NULLIF(@EmployeeCodes, '') IS NULL OR EmployeeCode IN (
		SELECT value
		FROM STRING_SPLIT(@EmployeeCodes, ',')
	)) AND
	(@DOJRangeFrom IS NULL OR @DOJRangeTo IS NULL OR JoiningDate BETWEEN @DOJRangeFrom AND @DOJRangeTo) AND
	(NULLIF(@EmployeeName, '') IS NULL OR CHARINDEX(@EmployeeName, EmployeeFullName) > 0) AND
	(NULLIF(@EmployeeEmail, '') IS NULL OR CHARINDEX(@EmployeeEmail, OfficeEmail) > 0) AND
	(NULLIF(@DesignationId, 0) IS NULL OR @DesignationId = DesignationId) AND
	(NULLIF(@DepartmentId, 0) IS NULL OR @DepartmentId = DepartmentId) AND
	(NULLIF(@CountryId, 0) IS NULL OR @CountryId = CountryId) AND
	(NULLIF(@BranchId, 0) IS NULL OR @BranchId = BranchId) AND
	EmployeeStatus != 4 AND --  Exclude Ex Employees
	(NULLIF(@IsManualAttendance, '') IS NULL OR @IsManualAttendance = IsManualAttendance) AND
	((NULLIF(@ReportingManagerId, 0) IS NULL OR @ReportingManagerId = ReportingManagerId) OR (NULLIF(@ReportingManagerId, 0) IS NULL OR @ReportingManagerId = ImmediateManager) OR @RoleId=1 ) 
 DECLARE @SORTDIR VARCHAR(5) = CASE WHEN @SortDesc = 1 THEN 'DESC' ELSE 'ASC' END;

	SELECT 
		EmployeeId,
		EmployeeCode,
		EmployeeFullName AS EmployeeName,
		(SELECT 
			'{' + STRING_AGG(
				CONCAT('"', CONVERT(varchar(10), A.[Date], 120), '": ', '"', A.TotalHours, '"'), ', ' ) WITHIN GROUP (ORDER BY A.[Date]) + '}' 
				AS JsonDict
			FROM Attendance A WHERE A.EmployeeId = vwED.EmployeeId AND A.[Date] BETWEEN @StartDate AND @EndDate) AS WorkedHoursByDateJson,
		OfficeEmail AS EmployeeEmail,
		Designation,
		Department,
		Country, 
		BranchId AS Branch,
		IsManualAttendance,
		JoiningDate
	FROM vw_EmployeeData vwED
	WHERE
	(NULLIF(@EmployeeCodes, '') IS NULL OR EmployeeCode IN (
		SELECT value
		FROM STRING_SPLIT(@EmployeeCodes, ',')
	)) AND
	(@DOJRangeFrom IS NULL OR @DOJRangeTo IS NULL OR JoiningDate BETWEEN @DOJRangeFrom AND @DOJRangeTo) AND
	(NULLIF(@EmployeeName, '') IS NULL OR CHARINDEX(@EmployeeName, EmployeeFullName) > 0) AND
	(NULLIF(@EmployeeEmail, '') IS NULL OR CHARINDEX(@EmployeeEmail, OfficeEmail) > 0) AND
	(NULLIF(@DesignationId, 0) IS NULL OR @DesignationId = DesignationId) AND
	(NULLIF(@DepartmentId, 0) IS NULL OR @DepartmentId = DepartmentId) AND
	(NULLIF(@CountryId, 0) IS NULL OR @CountryId = CountryId) AND
	(NULLIF(@BranchId, 0) IS NULL OR @BranchId = BranchId) AND
	EmployeeStatus != 4 AND --  Exclude Ex Employees
	(NULLIF(@IsManualAttendance, '') IS NULL OR @IsManualAttendance = IsManualAttendance) AND
	((NULLIF(@ReportingManagerId, 0) IS NULL OR @ReportingManagerId = ReportingManagerId) OR (NULLIF(@ReportingManagerId, 0) IS NULL OR @ReportingManagerId = ImmediateManager) OR @RoleId=1) 
	ORDER BY 
		CASE WHEN @SortColumn = 'EmployeeId' AND @SortDesc = 0 THEN EmployeeId END ASC,
		CASE WHEN @SortColumn = 'EmployeeCode' AND @SortDesc = 0 THEN EmployeeCode END ASC,
		CASE WHEN @SortColumn = 'EmployeeName' AND @SortDesc = 0 THEN EmployeeFullName END ASC,
		CASE WHEN @SortColumn = 'EmployeeEmail' AND @SortDesc = 0 THEN OfficeEmail END ASC,
		CASE WHEN @SortColumn = 'Designation' AND @SortDesc = 0 THEN Designation END ASC,
		CASE WHEN @SortColumn = 'Department' AND @SortDesc = 0 THEN Department END ASC,
		CASE WHEN @SortColumn = 'Country' AND @SortDesc = 0 THEN Country END ASC,
		CASE WHEN @SortColumn = 'IsManualAttendance' AND @SortDesc = 0 THEN IsManualAttendance END ASC,
        CASE WHEN @SortColumn = 'BranchId' AND @SortDesc = 0 THEN BranchId END ASC,

		CASE WHEN @SortColumn = 'EmployeeId' AND @SortDesc = 1 THEN EmployeeId END DESC,
		CASE WHEN @SortColumn = 'EmployeeCode' AND @SortDesc = 1 THEN EmployeeCode END DESC,
		CASE WHEN @SortColumn = 'EmployeeName' AND @SortDesc = 1 THEN EmployeeFullName END DESC,
		CASE WHEN @SortColumn = 'EmployeeEmail' AND @SortDesc = 1 THEN OfficeEmail END DESC,
		CASE WHEN @SortColumn = 'Designation' AND @SortDesc = 1 THEN Designation END DESC,
		CASE WHEN @SortColumn = 'Department' AND @SortDesc = 1 THEN Department END DESC,
		CASE WHEN @SortColumn = 'Country' AND @SortDesc = 1 THEN Country END DESC,
		CASE WHEN @SortColumn = 'IsManualAttendance' AND @SortDesc = 1 THEN IsManualAttendance END DESC,
		CASE WHEN @SortColumn = 'BranchId' AND @SortDesc = 1 THEN BranchId END DESC
	OFFSET COALESCE(NULLIF(@StartIndex, 0), 0) ROWS
	FETCH NEXT COALESCE(NULLIF(@PageSize, 0), 10) ROWS ONLY;
END

GO

CREATE OR ALTER PROCEDURE [dbo].[GetExitEmployeesListWithDetail]
@ResignationId as INT =0,
@EmployeeName AS VARCHAR(100)='',
@ResignationStatus as int =0,
@SortColumnName AS VARCHAR(50)='',
@SortColumnDirection AS VARCHAR(50)='',
@PageNumber AS INT=1,
@PageSize AS INT=10,
@ReportingManagerName AS VARCHAR(100)='',
@EmployeeCode AS VARCHAR(MAX)='',
@AccountsNoDue as BIT =0,
@JobType as BIT =0,
@ITNoDue as BIT =0,
@EmploymentStatus as INT =0,
@DepartmentId as bigint =0, 
@RoleId AS BIGINT =0,
@KTStatus as INT =0,
@LastWorkingDay as Date = null,
@ResignationDate as Datetime = null,
@EarlyReleaseStatus as int = 0,
@LastWorkingDayFrom DATE = NULL,
@LastWorkingDayTo DATE = NULL,
@BranchId INT = NULL,
@EmployeeStatus INT = NULL
AS
BEGIN
	DECLARE @StartIndex AS INT
	 
	SELECT @StartIndex = (@PageNumber-1)*@PageSize  

	-- TOTAL COUNT
	SELECT Count(*) as TotalCount 
	FROM vw_ResignationDetail r 
        LEFT JOIN vw_EmployeeData vEd ON r.EmployeeId = vEd.EmployeeId
	WHERE
	(@LastWorkingDayFrom IS NULL OR @LastWorkingDayTo IS NULL OR LastWorkingDay BETWEEN @LastWorkingDayFrom AND @LastWorkingDayTo) AND
	(NULLIF(@ResignationId, 0) IS NULL OR @ResignationId = ResignationId) And
	(NULLIF(@EmployeeName, '') IS NULL OR CHARINDEX(@EmployeeName, EmployeeFullName) > 0) AND 
	(NULLIF(@ReportingManagerName, '') IS NULL OR CHARINDEX(@ReportingManagerName, ReportingManagerName) > 0) AND 
	(NULLIF(@EmployeeCode, '') IS NULL OR EmployeeCode IN (SELECT TRIM(value) FROM string_split(@EmployeeCode, ','))) AND
	(NULLIF(@EmploymentStatus, '') IS NULL OR  @EmploymentStatus= EmploymentStatus ) AND
	(NULLIF(@DepartmentId, 0) IS NULL OR @DepartmentId = DepartmentId) AND
	(NULLIF(@LastWorkingDay, null) IS NULL OR @LastWorkingDay = LastWorkingDay) AND 
	(NULLIF(@ResignationDate, NULL) IS NULL OR CAST(ResignationDate AS DATE) = CAST(@ResignationDate AS DATE)) AND  
	(NULLIF(@EarlyReleaseStatus, 0) IS NULL OR @EarlyReleaseStatus = EarlyReleaseStatus) AND 
	(NULLIF(@ResignationStatus, 0) IS NULL OR @ResignationStatus = ResignationStatus) AND 
	(NULLIF(@KTStatus, 0) IS NULL OR @KTStatus = KTStatus) AND 
	(NULLIF(@AccountsNoDue, 0) IS NULL OR @AccountsNoDue = AccountsNoDue) AND  
	(NULLIF(@JobType, 0) IS NULL OR @JobType = JobType) AND
	(NULLIF(@ITNoDue, 0) IS NULL OR @ITNoDue = ITNoDue)   AND
	(NULLIF(@BranchId, 0) IS NULL OR @BranchId = BranchId)  AND
	(NULLIF(@EmployeeStatus, 0) IS NULL OR @EmployeeStatus = EmployeeStatus) 
 		 
	-- PAGINATED DATA
	SELECT 
		r.ResignationId,
		r.DepartmentName,
		r.LastWorkingDay,
		r.ResignationDate,
		r.EarlyReleaseDate,
		r.EarlyReleaseStatus,
		r.ResignationStatus,
		r.KTStatus,
		r.ExitInterviewStatus,
		r.ITNoDue,
		r.AccountsNoDue,
		r.FnFStatus, 
		r.ResignationId,
		r.Reason,
		vEd.EmployeeCode, 
		vEd.EmployeeFullname AS EmployeeName,
		vEd.EmployeeStatus AS EmployeeStatus,
		vEd.EmploymentStatus AS EmploymentStatus,
		vEd.ReportingManagerName AS ReportingManagerName,
		vEd.JobType,
		vEd.BranchId
	FROM 
		vw_ResignationDetail r 
		LEFT JOIN vw_EmployeeData vEd ON r.EmployeeId = vEd.EmployeeId
	WHERE
	(@LastWorkingDayFrom IS NULL OR @LastWorkingDayTo IS NULL OR LastWorkingDay BETWEEN @LastWorkingDayFrom AND @LastWorkingDayTo) AND
	(NULLIF(@ResignationId, 0) IS NULL OR @ResignationId = ResignationId) And
	(NULLIF(@EmployeeName, '') IS NULL OR CHARINDEX(@EmployeeName, EmployeeFullName) > 0) AND 
	(NULLIF(@ReportingManagerName, '') IS NULL OR CHARINDEX(@ReportingManagerName, ReportingManagerName) > 0) AND 
	(NULLIF(@EmployeeCode, '') IS NULL OR EmployeeCode IN (SELECT TRIM(value) FROM string_split(@EmployeeCode, ','))) AND
	(NULLIF(@EmploymentStatus, '') IS NULL OR  @EmploymentStatus= EmploymentStatus ) AND
	(NULLIF(@DepartmentId, 0) IS NULL OR @DepartmentId = DepartmentId) AND
	(NULLIF(@LastWorkingDay, null) IS NULL OR @LastWorkingDay = LastWorkingDay) AND 
	(NULLIF(@ResignationDate, NULL) IS NULL OR CAST(ResignationDate AS DATE) = CAST(@ResignationDate AS DATE)) AND 
	(NULLIF(@EarlyReleaseStatus, 0) IS NULL OR @EarlyReleaseStatus = EarlyReleaseStatus) AND 
	(NULLIF(@ResignationStatus, 0) IS NULL OR @ResignationStatus = ResignationStatus) AND 
	(NULLIF(@KTStatus, 0) IS NULL OR @KTStatus = KTStatus) AND 
	(NULLIF(@AccountsNoDue, 0) IS NULL OR @AccountsNoDue = AccountsNoDue) AND  
	(NULLIF(@JobType, 0) IS NULL OR @JobType = JobType) AND
	(NULLIF(@ITNoDue, 0) IS NULL OR @ITNoDue = ITNoDue)    AND
	(NULLIF(@BranchId, 0) IS NULL OR @BranchId = BranchId)  AND
	(NULLIF(@EmployeeStatus, 0) IS NULL OR @EmployeeStatus = EmployeeStatus) 
 		 
	-- SORT OPERATION
	ORDER BY  
	CASE WHEN @SortColumnName = 'LastWorkingDay' AND @SortColumnDirection = 'ASC' THEN LastWorkingDay END ASC,
	CASE WHEN @SortColumnName = 'ResignationId' AND @SortColumnDirection = 'ASC' THEN r.ResignationId END ASC,
	CASE WHEN @SortColumnName = 'EmployeeCode' AND @SortColumnDirection = 'ASC' THEN EmployeeCode END ASC,
	CASE WHEN @SortColumnName = 'EmployeeName' AND @SortColumnDirection = 'ASC' THEN EmployeeFullName END ASC,
	CASE WHEN @SortColumnName = 'ReportingManagerName' AND @SortColumnDirection = 'ASC' THEN ReportingManagerName END ASC, 
	CASE WHEN @SortColumnName = 'Designation' AND @SortColumnDirection = 'ASC' THEN Designation END ASC,
	CASE WHEN @SortColumnName = 'DepartmentName' AND @SortColumnDirection = 'ASC' THEN DepartmentName END ASC, 
	CASE WHEN @SortColumnName = 'ResignationDate' AND @SortColumnDirection = 'ASC' THEN ResignationDate END ASC, 
	CASE WHEN @SortColumnName = 'KTStatus' AND @SortColumnDirection = 'ASC' THEN KTStatus END ASC,  
	CASE WHEN @SortColumnName = 'AccountsNoDue' AND @SortColumnDirection = 'ASC' THEN AccountsNoDue END ASC, 
	CASE WHEN @SortColumnName = 'JobType' AND @SortColumnDirection = 'ASC' THEN JobType END ASC,
	CASE WHEN @SortColumnName = 'ITNoDue' AND @SortColumnDirection = 'ASC' THEN ITNoDue END ASC, 
	CASE WHEN @SortColumnName = 'ResignationStatus' AND @SortColumnDirection = 'ASC' THEN ResignationStatus END ASC, 
	CASE WHEN @SortColumnName = 'Branch' AND @SortColumnDirection = 'ASC' THEN BranchId END ASC, 
	CASE WHEN @SortColumnName = 'EmployeeStatus' AND @SortColumnDirection = 'ASC' THEN vEd.EmployeeStatus END ASC,
  
	CASE WHEN @SortColumnName = 'Branch' AND @SortColumnDirection = 'DESC' THEN BranchId END DESC,
	CASE WHEN @SortColumnName = 'LastWorkingDay' AND @SortColumnDirection = 'DESC' THEN LastWorkingDay END DESC,
	CASE WHEN @SortColumnName = 'ResignationId' AND @SortColumnDirection = 'DESC' THEN r.ResignationId END DESC,
	CASE WHEN @SortColumnName = 'EmployeeCode' AND @SortColumnDirection = 'DESC' THEN EmployeeCode END DESC,
	CASE WHEN @SortColumnName = 'EmployeeName' AND @SortColumnDirection = 'DESC' THEN EmployeeFullName END DESC,
	CASE WHEN @SortColumnName = 'ReportingManagerName' AND @SortColumnDirection = 'DESC' THEN ReportingManagerName END DESC, 
	CASE WHEN @SortColumnName = 'Designation' AND @SortColumnDirection = 'DESC' THEN Designation END DESC,
	CASE WHEN @SortColumnName = 'DepartmentName' AND @SortColumnDirection = 'DESC' THEN DepartmentName END DESC, 
	CASE WHEN @SortColumnName = 'ResignationDate' AND @SortColumnDirection = 'DESC' THEN ResignationDate END DESC, 
	CASE WHEN @SortColumnName = 'KTStatus' AND @SortColumnDirection = 'DESC' THEN KTStatus END DESC,  
	CASE WHEN @SortColumnName = 'AccountsNoDue' AND @SortColumnDirection = 'DESC' THEN AccountsNoDue END DESC, 
	CASE WHEN @SortColumnName = 'JobType' AND @SortColumnDirection = 'DESC' THEN JobType END DESC,
	CASE WHEN @SortColumnName = 'ITNoDue' AND @SortColumnDirection = 'DESC' THEN ITNoDue END DESC, 
	CASE WHEN @SortColumnName = 'ResignationStatus' AND @SortColumnDirection = 'DESC' THEN ResignationStatus END DESC,
	CASE WHEN @SortColumnName = 'EmployeeStatus' AND @SortColumnDirection = 'DESC' THEN vEd.EmployeeStatus END DESC
   
	-- PAGINATION OPERATION
  OFFSET COALESCE(NULLIF(@StartIndex, 0), 0) ROWS
 FETCH NEXT COALESCE(NULLIF(@PageSize, 0), 10) ROWS ONLY; 
END
GO


------------------GetKpiGoalsList--------------------
GO
CREATE OR ALTER PROCEDURE [dbo].[GetKpiGoalsList]
    @Title VARCHAR(250) = NULL,
    @DepartmentId BIGINT = NULL,
    @CreatedBy VARCHAR(250) = NULL,
    @CreatedOnFrom DATE = NULL,
    @CreatedOnTo DATE = NULL,
    @SortColumn VARCHAR(50) = NULL,
    @SortDesc BIT = 0,
    @StartIndex INT = NULL,
    @PageSize INT = NULL
AS
BEGIN
    /*
    EXEC GetKpiGoalsList @SortColumn = 'Title', @SortDesc = 1, @PageSize = 50
    */

    -- Count query
    SELECT COUNT(*) AS TotalCount
    FROM KPIGoals KG
    LEFT JOIN Department D ON KG.DepartmentId = D.Id
    WHERE
        KG.IsDeleted = 0 AND
        (@Title IS NULL OR CHARINDEX(@Title, KG.Title) > 0) AND
        (@DepartmentId IS NULL OR KG.DepartmentId = @DepartmentId) AND
        (@CreatedBy IS NULL OR CHARINDEX(@CreatedBy, KG.CreatedBy) > 0) AND
      	(@CreatedOnFrom IS NULL OR @CreatedOnTo IS NULL OR CAST(KG.CreatedOn AS DATE) BETWEEN @CreatedOnFrom AND @CreatedOnTo)

    -- Data query
    SELECT
		KG.Id,
        KG.Title,
        KG.Description,
        KG.DepartmentId,
        D.Department,
        KG.CreatedBy,
        KG.CreatedOn
    FROM KPIGoals KG
    LEFT JOIN Department D ON KG.DepartmentId = D.Id
    WHERE
        KG.IsDeleted = 0 AND
        (@Title IS NULL OR CHARINDEX(@Title, KG.Title) > 0) AND
        (@DepartmentId IS NULL OR KG.DepartmentId = @DepartmentId) AND
        (@CreatedBy IS NULL OR CHARINDEX(@CreatedBy, KG.CreatedBy) > 0) AND
        (@CreatedOnFrom IS NULL OR @CreatedOnTo IS NULL OR CAST(KG.CreatedOn AS DATE) BETWEEN @CreatedOnFrom AND @CreatedOnTo)
    ORDER BY 
        CASE WHEN @SortColumn = 'Title' AND @SortDesc = 0 THEN KG.Title END ASC,
        CASE WHEN @SortColumn = 'Department' AND @SortDesc = 0 THEN D.Department END ASC,
        CASE WHEN @SortColumn = 'CreatedBy' AND @SortDesc = 0 THEN KG.CreatedBy END ASC,
        CASE WHEN @SortColumn = 'CreatedOn' AND @SortDesc = 0 THEN KG.CreatedOn END ASC,
        CASE WHEN @SortColumn = 'Title' AND @SortDesc = 1 THEN KG.Title END DESC,
        CASE WHEN @SortColumn = 'Department' AND @SortDesc = 1 THEN D.Department END DESC,
        CASE WHEN @SortColumn = 'CreatedBy' AND @SortDesc = 1 THEN KG.CreatedBy END DESC,
        CASE WHEN @SortColumn = 'CreatedOn' AND @SortDesc = 1 THEN KG.CreatedOn END DESC
    OFFSET COALESCE(NULLIF(@StartIndex, 0), 0) ROWS
    FETCH NEXT COALESCE(NULLIF(@PageSize, 0), 10) ROWS ONLY;
END
GO

--------------------GetEmployeesKPI-----------------------
GO
CREATE OR ALTER PROCEDURE [dbo].[GetEmployeesKPI]
    @SessionUserId BIGINT,
    @RoleId INT,
    @EmployeeName VARCHAR(100) = '',
    @EmployeeCode VARCHAR(MAX) = '',
    @AppraisalDateFrom DATE = NULL,
    @AppraisalDateTo DATE = NULL,
    @ReviewDateFrom DATE = NULL,
    @ReviewDateTo DATE = NULL,
    @SortColumnName VARCHAR(50) = '',
    @SortColumnDirection VARCHAR(50) = '',
    @PageNumber INT = 1,
    @PageSize INT = 10,
    @StatusFilter INT = NULL
AS
BEGIN
    DECLARE @StartIndex INT
    SELECT @StartIndex = (@PageNumber - 1) * @PageSize

    -- Count query for total records
    SELECT COUNT(*) AS TotalCount
    FROM EmployeeData ED
    LEFT JOIN EmploymentDetail EMP ON EMP.EmployeeId = ED.Id
    LEFT JOIN KPIPlan KP ON KP.Id = (Select MAX(KPL.Id) from KPIPlan KPL where KPL.EmployeeId = ED.Id)
    WHERE 1 = 1
        AND (@RoleId != 5 OR (EMP.ReportingMangerId = @SessionUserId OR EMP.ImmediateManager = @SessionUserId))
        AND (NULLIF(@EmployeeName, '') IS NULL OR CONCAT(ED.FirstName, ' ', ED.LastName) LIKE '%' + @EmployeeName + '%')
        AND (NULLIF(@EmployeeCode, '') IS NULL OR ED.EmployeeCode IN (SELECT TRIM(value) FROM STRING_SPLIT(@EmployeeCode, ',')))
        AND (@AppraisalDateFrom IS NULL OR KP.AppraisalDate >= @AppraisalDateFrom)
        AND (@AppraisalDateTo IS NULL OR KP.AppraisalDate <= @AppraisalDateTo)
        AND (@ReviewDateFrom IS NULL OR KP.ReviewDate >= @ReviewDateFrom)
        AND (@ReviewDateTo IS NULL OR KP.ReviewDate <= @ReviewDateTo)
        AND (
            @StatusFilter IS NULL OR @StatusFilter = 0 
            OR (@StatusFilter = 1 AND KP.Id IS NULL) -- NOT CREATED
            OR (@StatusFilter = 2 AND KP.Id IS NOT NULL AND KP.IsReviewed IS NULL) -- ASSIGNED
            OR (@StatusFilter = 3 AND KP.Id IS NOT NULL AND KP.IsReviewed = 0) -- SUBMITTED
            OR (@StatusFilter = 4 AND KP.Id IS NOT NULL AND KP.IsReviewed = 1) -- REVIEWED
        )

    -- CTE to map numeric status to text for alphabetical sorting
    ;WITH EmployeeKPI AS (
        SELECT 
            ED.Id AS EmployeeId,
            ED.EmployeeCode,
            EMP.Email,
            EMP.JoiningDate,
            CONCAT(ED.FirstName, ' ', ED.LastName) AS EmployeeName,
            KP.AppraisalDate AS NextAppraisalDate,
            (SELECT TOP 1 KPL.ReviewDate 
			 FROM KPIPlan KPL 
			 WHERE KPL.EmployeeId = ED.Id 
			 AND KPL.IsReviewed = 1 
			 ORDER BY KPL.ReviewDate DESC, KPL.Id DESC) AS LastReviewDate,
            KP.IsReviewed,
            KP.ReviewDate,
            KP.Id AS PlanId,
            CASE 
                WHEN KP.Id IS NULL THEN 1 -- NOT CREATED
                WHEN KP.Id IS NOT NULL AND KP.IsReviewed IS NULL THEN 2 -- ASSIGNED
                WHEN KP.Id IS NOT NULL AND KP.IsReviewed = 0 THEN 3 -- SUBMITTED
                WHEN KP.Id IS NOT NULL AND KP.IsReviewed = 1 THEN 4 -- REVIEWED
                ELSE 0 -- Default (no specific status)
            END AS Status,
            CASE 
                WHEN KP.Id IS NULL THEN 'NOT CREATED'
                WHEN KP.Id IS NOT NULL AND KP.IsReviewed IS NULL THEN 'ASSIGNED'
                WHEN KP.Id IS NOT NULL AND KP.IsReviewed = 0 THEN 'SUBMITTED'
                WHEN KP.Id IS NOT NULL AND KP.IsReviewed = 1 THEN 'REVIEWED'
                ELSE 'UNKNOWN'
            END AS StatusText
        FROM EmployeeData ED
        LEFT JOIN EmploymentDetail EMP ON EMP.EmployeeId = ED.Id
        LEFT JOIN KPIPlan KP ON KP.Id = (Select MAX(KPL.Id) from KPIPlan KPL where KPL.EmployeeId = ED.Id)
        WHERE 1 = 1 
            AND (@RoleId != 5 OR (EMP.ReportingMangerId = @SessionUserId OR EMP.ImmediateManager = @SessionUserId))
            AND (NULLIF(@EmployeeName, '') IS NULL OR CONCAT(ED.FirstName, ' ', ED.LastName) LIKE '%' + @EmployeeName + '%')
            AND (NULLIF(@EmployeeCode, '') IS NULL OR ED.EmployeeCode IN (SELECT TRIM(value) FROM STRING_SPLIT(@EmployeeCode, ',')))
            AND (@AppraisalDateFrom IS NULL OR KP.AppraisalDate >= @AppraisalDateFrom)
            AND (@AppraisalDateTo IS NULL OR KP.AppraisalDate <= @AppraisalDateTo)
            AND (@ReviewDateFrom IS NULL OR KP.ReviewDate >= @ReviewDateFrom)
            AND (@ReviewDateTo IS NULL OR KP.ReviewDate <= @ReviewDateTo)
            AND (
                @StatusFilter IS NULL OR @StatusFilter = 0 
                OR (@StatusFilter = 1 AND KP.Id IS NULL) -- NOT CREATED
                OR (@StatusFilter = 2 AND KP.Id IS NOT NULL AND KP.IsReviewed IS NULL) -- ASSIGNED
                OR (@StatusFilter = 3 AND KP.Id IS NOT NULL AND KP.IsReviewed = 0) -- SUBMITTED
                OR (@StatusFilter = 4 AND KP.Id IS NOT NULL AND KP.IsReviewed = 1) -- REVIEWED
            )
			
    )
    -- Data query with sorting and pagination
    SELECT 
        EmployeeId,
        EmployeeCode,
        Email,
        JoiningDate,
        EmployeeName,
        NextAppraisalDate,
        LastReviewDate,
        IsReviewed,
        ReviewDate,
        PlanId,
        Status
    FROM EmployeeKPI
    ORDER BY 
        CASE WHEN @SortColumnName = 'employeeName' AND @SortColumnDirection = 'ASC' THEN EmployeeName END ASC,
        CASE WHEN @SortColumnName = 'employeeCode' AND @SortColumnDirection = 'ASC' THEN EmployeeCode END ASC,
        CASE WHEN @SortColumnName = 'nextAppraisalDate' AND @SortColumnDirection = 'ASC' THEN NextAppraisalDate END ASC,
        CASE WHEN @SortColumnName = 'lastReviewDate' AND @SortColumnDirection = 'ASC' THEN LastReviewDate END ASC,
        CASE WHEN @SortColumnName = 'status' AND @SortColumnDirection = 'ASC' THEN StatusText END ASC,
        CASE WHEN @SortColumnName = 'employeeName' AND @SortColumnDirection = 'DESC' THEN EmployeeName END DESC,
        CASE WHEN @SortColumnName = 'employeeCode' AND @SortColumnDirection = 'DESC' THEN EmployeeCode END DESC,
        CASE WHEN @SortColumnName = 'nextAppraisalDate' AND @SortColumnDirection = 'DESC' THEN NextAppraisalDate END DESC,
        CASE WHEN @SortColumnName = 'lastReviewDate' AND @SortColumnDirection = 'DESC' THEN LastReviewDate END DESC,
        CASE WHEN @SortColumnName = 'status' AND @SortColumnDirection = 'DESC' THEN StatusText END DESC,
        CASE WHEN @SortColumnName = '' THEN EmployeeName END ASC
    OFFSET COALESCE(NULLIF(@StartIndex, 0), 0) ROWS
    FETCH NEXT COALESCE(NULLIF(@PageSize, 0), 10) ROWS ONLY;
END
GO




CREATE OR ALTER PROCEDURE [dbo].[GetLogs]
@SortColumnName AS VARCHAR(50)='',
@SortColumnDirection AS VARCHAR(50)='',
@PageNumber AS INT=1,
@PageSize AS INT=10,
@DateFrom DATETIME = NULL,
@DateTo DATETIME = NULL,

@Message VARCHAR(256) = NULL,
@Level VARCHAR(15) = NULL,
@RequestId VARCHAR(256) = NULL,
@Id BIGINT = NULL
AS
BEGIN 
		DECLARE @StartIndex AS INT
	 
		SELECT @StartIndex = (@PageNumber-1)*@PageSize  

		SELECT Count(*) as TotalCount FROM Logging
		WHERE
		(@DateFrom IS NULL OR @DateTo IS NULL OR [TimeStamp] BETWEEN @DateFrom AND @DateTo) AND
		(NULLIF(@Message, '') IS NULL OR CHARINDEX(@Message, [Message]) > 0) AND
		(NULLIF(@RequestId, '') IS NULL OR CHARINDEX(@RequestId, RequestId) > 0) AND
		(NULLIF(@Level, '') IS NULL OR @Level = [Level]) AND
		(@Id IS NULL OR @Id = Id)
 		 
		SELECT Id, [Message], MessageTemplate, [Level], [TimeStamp], Exception, RequestId, LogEvent
		FROM Logging
		WHERE
		(@DateFrom IS NULL OR @DateTo IS NULL OR [TimeStamp] BETWEEN @DateFrom AND @DateTo) AND
		(NULLIF(@Message, '') IS NULL OR CHARINDEX(@Message, [Message]) > 0) AND
		(NULLIF(@RequestId, '') IS NULL OR CHARINDEX(@RequestId, RequestId) > 0) AND
		(NULLIF(@Level, '') IS NULL OR @Level = [Level]) AND
		(@Id IS NULL OR @Id = Id)
 		 
		-- SORT OPERATION
		ORDER BY 
		CASE WHEN LOWER(@SortColumnName) = 'timestamp' AND @SortColumnDirection = 'ASC' THEN [TimeStamp] END ASC,
		CASE WHEN LOWER(@SortColumnName) = 'id' AND @SortColumnDirection = 'ASC' THEN Id END ASC,
		CASE WHEN LOWER(@SortColumnName) = 'level' AND @SortColumnDirection = 'ASC' THEN [Level] END ASC,
		
		CASE WHEN LOWER(@SortColumnName) = 'timestamp' AND @SortColumnDirection = 'DESC' THEN [TimeStamp] END DESC,
		CASE WHEN LOWER(@SortColumnName) = 'id' AND @SortColumnDirection = 'DESC' THEN Id END DESC,
		CASE WHEN LOWER(@SortColumnName) = 'level' AND @SortColumnDirection = 'DESC' THEN [Level] END DESC
   
		-- PAGINATION OPERATION
		OFFSET COALESCE(NULLIF(@StartIndex, 0), 0) ROWS
		FETCH NEXT COALESCE(NULLIF(@PageSize, 0), 10) ROWS ONLY;
	  
END
GO

CREATE OR ALTER PROCEDURE [dbo].[GetCronJobLogs]
@SortColumnName AS VARCHAR(50)='',
@SortColumnDirection AS VARCHAR(50)='',
@PageNumber AS INT=1,
@PageSize AS INT=10,
@DateFrom DATETIME = NULL,
@DateTo DATETIME = NULL,

@Id BIGINT = NULL,
@TypeId INT = NULL
AS
BEGIN 
		DECLARE @StartIndex AS INT
	 
		SELECT @StartIndex = (@PageNumber-1)*@PageSize  

		SELECT Count(*) as TotalCount FROM CronJobLog
		WHERE
		(@DateFrom IS NULL OR @DateTo IS NULL OR StartedAt BETWEEN @DateFrom AND @DateTo) AND
		(NULLIF(@TypeId, '') IS NULL OR @TypeId = TypeId) AND
		(@Id IS NULL OR @Id = Id)
 		 
		SELECT CL.Id, CL.TypeId, CL.RequestId, CL.StartedAt, CL.CompletedAt, CL.Payload, L.Id AS LogId
		FROM CronJobLog CL
		LEFT JOIN Logging L ON L.RequestId = CL.RequestId
		WHERE
		(@DateFrom IS NULL OR @DateTo IS NULL OR CL.StartedAt BETWEEN @DateFrom AND @DateTo) AND
		(NULLIF(@TypeId, '') IS NULL OR @TypeId = CL.TypeId) AND
		(@Id IS NULL OR @Id = CL.Id)
 		 
		-- SORT OPERATION
		ORDER BY 
		CASE WHEN LOWER(@SortColumnName) = 'StartedAt' AND @SortColumnDirection = 'ASC' THEN CL.StartedAt END ASC,
		CASE WHEN LOWER(@SortColumnName) = 'id' AND @SortColumnDirection = 'ASC' THEN CL.Id END ASC,
		CASE WHEN LOWER(@SortColumnName) = 'TypeId' AND @SortColumnDirection = 'ASC' THEN CL.TypeId END ASC,
		
		CASE WHEN LOWER(@SortColumnName) = 'StartedAt' AND @SortColumnDirection = 'DESC' THEN CL.StartedAt END DESC,
		CASE WHEN LOWER(@SortColumnName) = 'id' AND @SortColumnDirection = 'DESC' THEN CL.Id END DESC,
		CASE WHEN LOWER(@SortColumnName) = 'TypeId' AND @SortColumnDirection = 'DESC' THEN CL.TypeId END DESC
   
		-- PAGINATION OPERATION
		OFFSET COALESCE(NULLIF(@StartIndex, 0), 0) ROWS
		FETCH NEXT COALESCE(NULLIF(@PageSize, 0), 10) ROWS ONLY;
	  
END
GO
----------------Grievances SP--------------------
CREATE OR ALTER PROCEDURE [dbo].[GetEmployeeListGrievances]
    @SessionUserId INT = NULL,
    @RoleId INT,
    @GrievanceTypeId INT = NULL,
    @Status INT = NULL,
    @TatStatus INT = NULL,
    @CreatedOnFrom DATE = NULL,
    @CreatedOnTo DATE = NULL,
    @ResolvedDate DATE = NULL,
    @ResolvedBy INT = NULL,
    @CreatedBy NVARCHAR(MAX) = NULL,  -- comma-separated list of employee codes
    @Level INT = NULL,
    @SortColumnName VARCHAR(50) = NULL,
    @SortDirection VARCHAR(4) = 'DESC',
    @StartIndex INT = 1,
    @PageSize INT = 10
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @Offset INT = (@StartIndex - 1) * @PageSize;

    DECLARE @CreatedByCodes TABLE (Code NVARCHAR(100));

    IF (@CreatedBy IS NOT NULL AND LTRIM(RTRIM(@CreatedBy)) <> '')
    BEGIN
        INSERT INTO @CreatedByCodes(Code)
        SELECT TRIM(value) FROM STRING_SPLIT(@CreatedBy, ',');
    END

    -- Count query
    SELECT COUNT(*) AS TotalCount
    FROM EmployeeGrievance eg
    INNER JOIN GrievanceType gt ON eg.GrievanceTypeId = gt.Id
    OUTER APPLY (
        SELECT TOP 1 *
        FROM GrievanceOwner go
        WHERE go.GrievanceTypeId = eg.GrievanceTypeId
    ) go
    OUTER APPLY (
        SELECT TOP 1 *
        FROM EmploymentDetail Emp
        WHERE Emp.Email = eg.CreatedBy
    ) Emp
    LEFT JOIN EmployeeData ED ON ED.Id = Emp.EmployeeId
    WHERE 1 = 1
    AND (@RoleId = 1 OR go.OwnerID = @SessionUserId)  -- RoleId 1 = SuperAdmin
    AND (@GrievanceTypeId IS NULL OR eg.GrievanceTypeId = @GrievanceTypeId)
    AND (@Status IS NULL OR eg.Status = @Status)
    AND (@TatStatus IS NULL OR eg.TatStatus = @TatStatus)
    AND (@ResolvedDate IS NULL OR CAST(eg.ResolvedDate AS DATE) = @ResolvedDate)
    AND (@ResolvedBy IS NULL OR eg.ResolvedBy = @ResolvedBy)
    AND (
        NOT EXISTS (SELECT 1 FROM @CreatedByCodes) 
        OR ED.EmployeeCode IN (SELECT Code FROM @CreatedByCodes)
    )
    AND (@Level IS NULL OR eg.Level = @Level)
    AND (
        (@CreatedOnFrom IS NULL OR CAST(eg.CreatedOn AS DATE) >= @CreatedOnFrom)
        AND (@CreatedOnTo IS NULL OR CAST(eg.CreatedOn AS DATE) <= @CreatedOnTo)
    );

    -- Data query
    SELECT 
        eg.Id,
        eg.TicketNo,
        eg.GrievanceTypeId,
        gt.GrievanceName AS GrievanceTypeName,
        eg.Status,
        eg.CreatedOn,
        eg.CreatedBy,
        CASE
            WHEN resolver.Id IS NOT NULL THEN CONCAT(resolver.FirstName, ' ', ISNULL(NULLIF(resolver.MiddleName, '') + ' ', ''), resolver.LastName)
            ELSE NULL
        END AS ResolvedBy,
        eg.ResolvedDate,
        eg.Level,
        eg.TatStatus
    FROM EmployeeGrievance eg
    INNER JOIN GrievanceType gt ON eg.GrievanceTypeId = gt.Id
    LEFT JOIN EmployeeData resolver ON resolver.Id = eg.ResolvedBy
    OUTER APPLY (
        SELECT TOP 1 *
        FROM EmploymentDetail Emp
        WHERE Emp.Email = eg.CreatedBy
    ) Emp
    LEFT JOIN EmployeeData ED ON ED.Id = Emp.EmployeeId
    OUTER APPLY (
        SELECT TOP 1 *
        FROM GrievanceOwner go
        WHERE go.GrievanceTypeId = eg.GrievanceTypeId
    ) go
    WHERE 1 = 1
    AND (@RoleId = 1 OR go.OwnerID = @SessionUserId)
    AND (@GrievanceTypeId IS NULL OR eg.GrievanceTypeId = @GrievanceTypeId)
    AND (@Status IS NULL OR eg.Status = @Status)
    AND (@TatStatus IS NULL OR eg.TatStatus = @TatStatus)
    AND (@ResolvedDate IS NULL OR CAST(eg.ResolvedDate AS DATE) = @ResolvedDate)
    AND (@ResolvedBy IS NULL OR eg.ResolvedBy = @ResolvedBy)
    AND (
        NOT EXISTS (SELECT 1 FROM @CreatedByCodes) 
        OR ED.EmployeeCode IN (SELECT Code FROM @CreatedByCodes)
    )
    AND (@Level IS NULL OR eg.Level = @Level)
    AND (
        (@CreatedOnFrom IS NULL OR CAST(eg.CreatedOn AS DATE) >= @CreatedOnFrom)
        AND (@CreatedOnTo IS NULL OR CAST(eg.CreatedOn AS DATE) <= @CreatedOnTo)
    )
    ORDER BY
        CASE WHEN @SortColumnName = 'TicketNo' AND @SortDirection = 'ASC' THEN eg.TicketNo END ASC,
        CASE WHEN @SortColumnName = 'TicketNo' AND @SortDirection = 'DESC' THEN eg.TicketNo END DESC,
        CASE WHEN @SortColumnName = 'GrievanceTypeName' AND @SortDirection = 'ASC' THEN gt.GrievanceName END ASC,
        CASE WHEN @SortColumnName = 'GrievanceTypeName' AND @SortDirection = 'DESC' THEN gt.GrievanceName END DESC,
        CASE WHEN @SortColumnName = 'Status' AND @SortDirection = 'ASC' THEN eg.Status END ASC,
        CASE WHEN @SortColumnName = 'Status' AND @SortDirection = 'DESC' THEN eg.Status END DESC,
        CASE WHEN @SortColumnName = 'CreatedOn' AND @SortDirection = 'ASC' THEN eg.CreatedOn END ASC,
        CASE WHEN @SortColumnName = 'CreatedOn' AND @SortDirection = 'DESC' THEN eg.CreatedOn END DESC,
        CASE WHEN @SortColumnName = 'Level' AND @SortDirection = 'ASC' THEN eg.Level END ASC,
        CASE WHEN @SortColumnName = 'Level' AND @SortDirection = 'DESC' THEN eg.Level END DESC,
        CASE WHEN @SortColumnName = 'TatStatus' AND @SortDirection = 'ASC' THEN eg.TatStatus END ASC,
        CASE WHEN @SortColumnName = 'TatStatus' AND @SortDirection = 'DESC' THEN eg.TatStatus END DESC,
        CASE WHEN @SortColumnName = 'ResolvedDate' AND @SortDirection = 'ASC' THEN eg.ResolvedDate END ASC,
        CASE WHEN @SortColumnName = 'ResolvedDate' AND @SortDirection = 'DESC' THEN eg.ResolvedDate END DESC,
        CASE 
            WHEN @SortColumnName = 'ResolvedBy' AND @SortDirection = 'ASC' 
            THEN CONCAT(resolver.FirstName, ' ', ISNULL(NULLIF(resolver.MiddleName, '') + ' ', ''), resolver.LastName) 
        END ASC,
        CASE 
            WHEN @SortColumnName = 'ResolvedBy' AND @SortDirection = 'DESC' 
            THEN CONCAT(resolver.FirstName, ' ', ISNULL(NULLIF(resolver.MiddleName, '') + ' ', ''), resolver.LastName) 
        END DESC,
        CASE WHEN @SortColumnName = 'CreatedBy' AND @SortDirection = 'ASC' THEN eg.CreatedBy END ASC,
        CASE WHEN @SortColumnName = 'CreatedBy' AND @SortDirection = 'DESC' THEN eg.CreatedBy END DESC,
        eg.CreatedOn DESC -- Default fallback sort
    OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY;
END
GO

------------------
CREATE OR ALTER PROCEDURE [dbo].[GetEmployeeGrievances]
    @EmployeeId BIGINT,
    @GrievanceTypeId INT = NULL,
    @Status INT = NULL,
    @SortColumnName VARCHAR(50) = NULL,
    @SortDirection VARCHAR(4) = 'DESC',  -- 'ASC' or 'DESC'
    @StartIndex INT = 0,
    @PageSize INT = 10
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @OffsetValue INT = CASE WHEN @StartIndex > 0 THEN @StartIndex - 1 ELSE 0 END;

    -- Count query
    SELECT COUNT(1) AS TotalCount
    FROM EmployeeGrievance eg
    WHERE eg.EmployeeId = @EmployeeId
      AND (@GrievanceTypeId IS NULL OR eg.GrievanceTypeId = @GrievanceTypeId)
      AND (@Status IS NULL OR eg.Status = @Status)
      AND EXISTS (
          SELECT 1 FROM GrievanceOwner go 
          WHERE go.GrievanceTypeId = eg.GrievanceTypeId 
            AND go.Level = eg.Level 
            AND go.IsDeleted = 0
      );

    -- Data query
    SELECT 
        eg.Id,
        eg.GrievanceTypeId,
        gt.GrievanceName AS GrievanceTypeName,
        eg.Title,
        eg.Description,
        eg.CreatedOn,
        eg.TicketNo,
        eg.Level,
        eg.Status,
        eg.TatStatus,
        STRING_AGG(
            LTRIM(RTRIM(
                ISNULL(ed.FirstName, '') + ' ' +
                ISNULL(ed.MiddleName + ' ', '') +
                ISNULL(ed.LastName, '')
            )), ', ') AS ManageBy
    FROM EmployeeGrievance eg
    INNER JOIN GrievanceType gt ON eg.GrievanceTypeId = gt.Id
    LEFT JOIN GrievanceOwner go ON eg.GrievanceTypeId = go.GrievanceTypeId AND eg.Level = go.Level
    LEFT JOIN EmployeeData ed ON go.OwnerID = ed.Id
    WHERE eg.EmployeeId = @EmployeeId
      AND (@GrievanceTypeId IS NULL OR eg.GrievanceTypeId = @GrievanceTypeId)
      AND (@Status IS NULL OR eg.Status = @Status)
      AND go.IsDeleted = 0
    GROUP BY eg.Id, eg.GrievanceTypeId, gt.GrievanceName, eg.Title, eg.Description,
             eg.CreatedOn, eg.TicketNo, eg.Level, eg.Status, eg.TatStatus
    ORDER BY 
        CASE WHEN @SortColumnName = 'Id' AND @SortDirection = 'ASC' THEN eg.Id END ASC,
        CASE WHEN @SortColumnName = 'Id' AND @SortDirection = 'DESC' THEN eg.Id END DESC,
        CASE WHEN @SortColumnName = 'GrievanceTypeName' AND @SortDirection = 'ASC' THEN gt.GrievanceName END ASC,
        CASE WHEN @SortColumnName = 'GrievanceTypeName' AND @SortDirection = 'DESC' THEN gt.GrievanceName END DESC,
        CASE WHEN @SortColumnName = 'Title' AND @SortDirection = 'ASC' THEN eg.Title END ASC,
        CASE WHEN @SortColumnName = 'Title' AND @SortDirection = 'DESC' THEN eg.Title END DESC,
        CASE WHEN @SortColumnName = 'CreatedOn' AND @SortDirection = 'ASC' THEN eg.CreatedOn END ASC,
        CASE WHEN @SortColumnName = 'CreatedOn' AND @SortDirection = 'DESC' THEN eg.CreatedOn END DESC,
        -- Default order
        eg.CreatedOn DESC
    OFFSET @OffsetValue ROWS FETCH NEXT @PageSize ROWS ONLY;
END
GO


GO
CREATE OR ALTER PROCEDURE [dbo].[GetCompOffAndSwapHolidayDetails]
    @SessionUserId BIGINT = NULL,
    @RoleId INT = NULL,
    @EmployeeCode VARCHAR(50) = NULL,
    @WorkingDate DATE = NULL,
    @StatusFilter INT = NULL,
    @TypeFilter INT = NULL,
    @SortColumn VARCHAR(50) = NULL,
    @SortDesc BIT = 0,
    @StartIndex INT = 1,
    @PageSize INT = 10
AS
BEGIN
    -- Count query for total records
    SELECT COUNT(*) AS TotalCount
    FROM CompOffAndSwapHolidayDetail CSH
    LEFT JOIN EmployeeData ED ON ED.Id = CSH.EmployeeId
    LEFT JOIN EmploymentDetail EMP ON EMP.EmployeeId = CSH.EmployeeId
    WHERE CSH.IsDeleted = 0
        AND (@RoleId != 5 OR (EMP.ReportingMangerId = @SessionUserId OR EMP.ImmediateManager = @SessionUserId))
        AND (NULLIF(@EmployeeCode, '') IS NULL OR EXISTS (SELECT 1 FROM STRING_SPLIT(@EmployeeCode, ',') AS codes WHERE LTRIM(RTRIM(codes.value)) = ED.EmployeeCode))
        AND (@WorkingDate IS NULL OR CSH.WorkingDate = @WorkingDate)
        AND (@StatusFilter IS NULL OR CSH.Status = @StatusFilter)
        AND (@TypeFilter IS NULL OR CSH.RequestType = @TypeFilter)

    -- Data query with sorting and pagination
    SELECT 
        CSH.Id,
        ED.Id AS EmployeeId,
        ED.EmployeeCode,
        CONCAT(ED.FirstName, ' ', ED.LastName) AS EmployeeName,
        CSH.WorkingDate,
        CSH.LeaveDate,
        CSH.LeaveDateLabel,
        CSH.WorkingDateLabel,
        CSH.Reason,
        CSH.Status,
        CSH.RejectReason,
		CSH.NumberOfDays,
        CSH.RequestType,
        CSH.CreatedOn,
        CSH.CreatedBy
    FROM CompOffAndSwapHolidayDetail CSH
    LEFT JOIN EmployeeData ED ON ED.Id = CSH.EmployeeId
    LEFT JOIN EmploymentDetail EMP ON EMP.EmployeeId = CSH.EmployeeId
    WHERE CSH.IsDeleted = 0
        AND (@RoleId != 5 OR (EMP.ReportingMangerId = @SessionUserId OR EMP.ImmediateManager = @SessionUserId))
        AND (NULLIF(@EmployeeCode, '') IS NULL OR EXISTS (SELECT 1 FROM STRING_SPLIT(@EmployeeCode, ',') AS codes WHERE LTRIM(RTRIM(codes.value)) = ED.EmployeeCode))
        AND (@WorkingDate IS NULL OR CSH.WorkingDate = @WorkingDate)
        AND (@StatusFilter IS NULL OR CSH.Status = @StatusFilter)
        AND (@TypeFilter IS NULL OR CSH.RequestType = @TypeFilter)

    ORDER BY      
        CASE WHEN @SortColumn = 'EmployeeId' AND @SortDesc = 0 THEN ED.Id END ASC,
        CASE WHEN @SortColumn = 'EmployeeCode' AND @SortDesc = 0 THEN ED.EmployeeCode END ASC,
        CASE WHEN @SortColumn = 'EmployeeName' AND @SortDesc = 0 THEN CONCAT(ED.FirstName, ' ', ED.LastName) END ASC,
        CASE WHEN @SortColumn = 'WorkingDate' AND @SortDesc = 0 THEN CSH.WorkingDate END ASC,
        CASE WHEN @SortColumn = 'LeaveDate' AND @SortDesc = 0 THEN CSH.LeaveDate END ASC,
        CASE WHEN @SortColumn = 'Reason' AND @SortDesc = 0 THEN CSH.Reason END ASC,
        CASE WHEN @SortColumn = 'Status' AND @SortDesc = 0 THEN CSH.Status END ASC,
        CASE WHEN @SortColumn = 'RequestType' AND @SortDesc = 0 THEN CSH.RequestType END ASC,
        CASE WHEN @SortColumn = 'CreatedOn' AND @SortDesc = 0 THEN CSH.CreatedOn END ASC,
        CASE WHEN @SortColumn = 'EmployeeId' AND @SortDesc = 1 THEN ED.Id END DESC,
        CASE WHEN @SortColumn = 'EmployeeCode' AND @SortDesc = 1 THEN ED.EmployeeCode END DESC,
        CASE WHEN @SortColumn = 'EmployeeName' AND @SortDesc = 1 THEN CONCAT(ED.FirstName, ' ', ED.LastName) END DESC,
        CASE WHEN @SortColumn = 'WorkingDate' AND @SortDesc = 1 THEN CSH.WorkingDate END DESC,
        CASE WHEN @SortColumn = 'LeaveDate' AND @SortDesc = 1 THEN CSH.LeaveDate END DESC,
        CASE WHEN @SortColumn = 'Reason' AND @SortDesc = 1 THEN CSH.Reason END DESC,
        CASE WHEN @SortColumn = 'Status' AND @SortDesc = 1 THEN CSH.Status END DESC,
        CASE WHEN @SortColumn = 'RequestType' AND @SortDesc = 1 THEN CSH.RequestType END DESC,
        CASE WHEN @SortColumn = 'CreatedOn' AND @SortDesc = 1 THEN CSH.CreatedOn END DESC,
        CASE WHEN @SortColumn = '' THEN CSH.CreatedOn END DESC
   OFFSET COALESCE(NULLIF(@StartIndex, 0), 0) ROWS
   FETCH NEXT COALESCE(NULLIF(@PageSize, 0), 10) ROWS ONLY;
END

 ------------------------GetAllITAsset---------------
 GO
 CREATE OR ALTER PROC [dbo].[GetAllITAsset]
    @DeviceName VARCHAR(250) = NULL,
    @DeviceCode VARCHAR(50) = NULL,
    @Manufacturer VARCHAR(250) = NULL,
    @Model VARCHAR(250) = NULL,
    @AssetType INT = NULL,
    @Status INT = NULL,
    @Branch INT = NULL,
    @EmployeeCodes VARCHAR(MAX) = NULL,
    @SortColumn VARCHAR(50) = NULL,
    @SortDesc BIT = 0,
    @StartIndex INT = 0,
    @PageSize INT = 10
AS
BEGIN
    SET NOCOUNT ON;

    -- Default sorting
    DECLARE @SortColumnWithDefault VARCHAR(50) = COALESCE(@SortColumn, 'ModifiedOn');
    DECLARE @SortDescWithDefault BIT = COALESCE(@SortDesc, 1); -- Default to DESC

    -- Calculating total count (ensure single row)
    SELECT COUNT(*) AS TotalCount
    FROM ITAsset IT
    LEFT JOIN EmployeeAsset EA ON IT.Id = EA.AssetId AND EA.IsActive = 1
    LEFT JOIN EmploymentDetail ED ON EA.EmployeeId = ED.EmployeeId
    LEFT JOIN EmployeeData E ON E.Id = ED.EmployeeId
    WHERE 
        (@DeviceName IS NULL OR IT.DeviceName LIKE '%' + @DeviceName + '%') AND
        (@DeviceCode IS NULL OR IT.DeviceCode LIKE '%' + @DeviceCode + '%') AND
        (@Manufacturer IS NULL OR IT.Manufacturer LIKE '%' + @Manufacturer + '%') AND
        (@Model IS NULL OR IT.Model LIKE '%' + @Model + '%') AND
        (@AssetType IS NULL OR IT.AssetType = @AssetType) AND
        (@Branch IS NULL OR IT.Branch = @Branch) AND
        (@Status IS NULL OR IT.Status = @Status) AND
        (NULLIF(@EmployeeCodes, '') IS NULL OR E.EmployeeCode IN (
            SELECT value FROM STRING_SPLIT(@EmployeeCodes, ',')
        ));

    -- Fetching paginated data
    SELECT 
        IT.Id,
        IT.DeviceName,
        IT.DeviceCode,
        IT.SerialNumber,
        IT.Manufacturer,
        IT.Model,
        IT.AssetType,
        IT.Status AS AssetStatus,
        IT.Branch,
        CAST(IT.PurchaseDate AS DATE) AS PurchaseDate,
        CAST(IT.WarrantyExpires AS DATE) AS WarrantyExpires,
        IT.Comments,
        IT.ModifiedOn,
        IT.ModifiedBy AS AllocatedBy,
        ED.Email AS Custodian,
        CONCAT(E.FirstName, ' ', E.MiddleName, ' ', E.LastName) AS CustodianFullName
    FROM ITAsset IT
    LEFT JOIN EmployeeAsset EA ON IT.Id = EA.AssetId AND EA.IsActive = 1
    LEFT JOIN EmploymentDetail ED ON EA.EmployeeId = ED.EmployeeId
    LEFT JOIN EmployeeData E ON E.Id = ED.EmployeeId
    WHERE 
        (@DeviceName IS NULL OR IT.DeviceName LIKE '%' + @DeviceName + '%') AND
        (@DeviceCode IS NULL OR IT.DeviceCode LIKE '%' + @DeviceCode + '%') AND
        (@Manufacturer IS NULL OR IT.Manufacturer LIKE '%' + @Manufacturer + '%') AND
        (@Model IS NULL OR IT.Model LIKE '%' + @Model + '%') AND
        (@AssetType IS NULL OR IT.AssetType = @AssetType) AND
        (@Branch IS NULL OR IT.Branch = @Branch) AND
        (@Status IS NULL OR IT.Status = @Status) AND
        (NULLIF(@EmployeeCodes, '') IS NULL OR E.EmployeeCode IN (
            SELECT value FROM STRING_SPLIT(@EmployeeCodes, ',')
        ))
    ORDER BY 

        CASE WHEN @SortColumnWithDefault = 'Id' AND @SortDescWithDefault = 0 THEN IT.Id END ASC,
        CASE WHEN @SortColumnWithDefault = 'Id' AND @SortDescWithDefault = 1 THEN IT.Id END DESC,
        CASE WHEN @SortColumnWithDefault = 'DeviceName' AND @SortDescWithDefault = 0 THEN IT.DeviceName END ASC,
        CASE WHEN @SortColumnWithDefault = 'DeviceName' AND @SortDescWithDefault = 1 THEN IT.DeviceName END DESC,
        CASE WHEN @SortColumnWithDefault = 'DeviceCode' AND @SortDescWithDefault = 0 THEN IT.DeviceCode END ASC,
        CASE WHEN @SortColumnWithDefault = 'DeviceCode' AND @SortDescWithDefault = 1 THEN IT.DeviceCode END DESC,
        CASE WHEN @SortColumnWithDefault = 'SerialNumber' AND @SortDescWithDefault = 0 THEN IT.SerialNumber END ASC,
        CASE WHEN @SortColumnWithDefault = 'SerialNumber' AND @SortDescWithDefault = 1 THEN IT.SerialNumber END DESC,
        CASE WHEN @SortColumnWithDefault = 'Manufacturer' AND @SortDescWithDefault = 0 THEN IT.Manufacturer END ASC,
        CASE WHEN @SortColumnWithDefault = 'Manufacturer' AND @SortDescWithDefault = 1 THEN IT.Manufacturer END DESC,
        CASE WHEN @SortColumnWithDefault = 'Model' AND @SortDescWithDefault = 0 THEN IT.Model END ASC,
        CASE WHEN @SortColumnWithDefault = 'Model' AND @SortDescWithDefault = 1 THEN IT.Model END DESC,
        CASE WHEN @SortColumnWithDefault = 'AssetType' AND @SortDescWithDefault = 0 THEN IT.AssetType END ASC,
        CASE WHEN @SortColumnWithDefault = 'AssetType' AND @SortDescWithDefault = 1 THEN IT.AssetType END DESC,
        CASE WHEN @SortColumnWithDefault = 'Status' AND @SortDescWithDefault = 0 THEN IT.Status END ASC,
        CASE WHEN @SortColumnWithDefault = 'Status' AND @SortDescWithDefault = 1 THEN IT.Status END DESC,
        CASE WHEN @SortColumnWithDefault = 'Branch' AND @SortDescWithDefault = 0 THEN IT.Branch END ASC,
        CASE WHEN @SortColumnWithDefault = 'Branch' AND @SortDescWithDefault = 1 THEN IT.Branch END DESC,
        CASE WHEN @SortColumnWithDefault = 'PurchaseDate' AND @SortDescWithDefault = 0 THEN IT.PurchaseDate END ASC,
        CASE WHEN @SortColumnWithDefault = 'PurchaseDate' AND @SortDescWithDefault = 1 THEN IT.PurchaseDate END DESC,
        CASE WHEN @SortColumnWithDefault = 'WarrantyExpires' AND @SortDescWithDefault = 0 THEN IT.WarrantyExpires END ASC,
        CASE WHEN @SortColumnWithDefault = 'WarrantyExpires' AND @SortDescWithDefault = 1 THEN IT.WarrantyExpires END DESC,
        CASE WHEN @SortColumnWithDefault = 'ModifiedOn' AND @SortDescWithDefault = 0 THEN IT.ModifiedOn END ASC,
        CASE WHEN @SortColumnWithDefault = 'ModifiedOn' AND @SortDescWithDefault = 1 THEN IT.ModifiedOn END DESC
    OFFSET COALESCE(@StartIndex, 0) ROWS
    FETCH NEXT COALESCE(@PageSize, 10) ROWS ONLY;
END
GO
-------------------ExpireCompOffLeave-----------------
GO
CREATE OR ALTER PROCEDURE [dbo].[ExpireCompOffLeave]
AS
BEGIN
DECLARE @oldCLosing decimal(10,2)
DECLARE @newClosing decimal(10,2)
DECLARE @EmpId BIGINT
DECLARE @Difference decimal(10,2)
DECLARE @LastExpiredId BIGINT

DECLARE id_cursor CURSOR FOR  
SELECT EmployeeId FROM EmployeeLeave WHERE LeaveId = 10
  
    OPEN id_cursor
    FETCH NEXT FROM id_cursor INTO  @EmpId 

    WHILE @@FETCH_STATUS = 0
    BEGIN
        
				SELECT top 1 @LastExpiredId = id FROM AccrualUtilizedLeave WHERE Description = 'CompOff Expired' AND EmployeeId=@EmpId order by CreatedOn desc
				SELECT top 1 @oldCLosing = ClosingBalance  FROM AccrualUtilizedLeave WHERE Id>COALESCE(@LastExpiredId,0)  AND EmployeeId = @EmpId AND LeaveId = 10 AND CAST([Date] as date) <  DATEADD(MONTH, -3, CAST(GETUTCDATE() as date)) order by date desc

				SELECT top 1 @newClosing = ClosingBalance FROM AccrualUtilizedLeave WHERE  Id>COALESCE(@LastExpiredId,0) AND EmployeeId = @EmpId AND LeaveId = 10   order by date desc
				 
				SELECT @oldCLosing,@newClosing

				SET @Difference = COALESCE(@newClosing,0) - COALESCE(@oldCLosing,0)
                IF  @oldCLosing > 0 AND @newClosing > 0
                BEGIN	
				SELECT @Difference
	 
                    INSERT INTO AccrualUtilizedLeave
                    (EmployeeId, LeaveId, [Date], Description, Accrued, UtilizedOrRejected, ClosingBalance, CreatedOn, CreatedBy)
                    VALUES
                    (@EmpId, 10, GETUTCDATE(), 'CompOff Expired', 0, @oldCLosing, @Difference, GETUTCDATE(), 'Admin')
                END;

		FETCH NEXT FROM id_cursor INTO  @EmpId 
	END

	CLOSE id_cursor
	DEALLOCATE id_cursor
END
GO
-------------------ExpireCompOffLeave-----------------
GO
CREATE OR ALTER PROCEDURE [dbo].[ExpireCompOffLeave]
AS
BEGIN
DECLARE @oldCLosing decimal(10,2)
DECLARE @newClosing decimal(10,2)
DECLARE @EmpId BIGINT
DECLARE @Difference decimal(10,2)
DECLARE @LastExpiredId BIGINT

DECLARE id_cursor CURSOR FOR  
SELECT EmployeeId FROM EmployeeLeave WHERE LeaveId = 10
  
    OPEN id_cursor
    FETCH NEXT FROM id_cursor INTO  @EmpId 

    WHILE @@FETCH_STATUS = 0
    BEGIN
        
				SELECT top 1 @LastExpiredId = id FROM AccrualUtilizedLeave WHERE Description = 'CompOff Expired' AND EmployeeId=@EmpId order by CreatedOn desc
				SELECT top 1 @oldCLosing = ClosingBalance  FROM AccrualUtilizedLeave WHERE Id>COALESCE(@LastExpiredId,0)  AND EmployeeId = @EmpId AND LeaveId = 10 AND CAST([Date] as date) <  DATEADD(MONTH, -3, CAST(GETUTCDATE() as date)) order by date desc

				SELECT top 1 @newClosing = ClosingBalance FROM AccrualUtilizedLeave WHERE  Id>COALESCE(@LastExpiredId,0) AND EmployeeId = @EmpId AND LeaveId = 10   order by date desc
				 
				SELECT @oldCLosing,@newClosing

				SET @Difference = COALESCE(@newClosing,0) - COALESCE(@oldCLosing,0)
                IF  @oldCLosing > 0 AND @newClosing > 0
                BEGIN	
				SELECT @Difference
	 
                    INSERT INTO AccrualUtilizedLeave
                    (EmployeeId, LeaveId, [Date], Description, Accrued, UtilizedOrRejected, ClosingBalance, CreatedOn, CreatedBy)
                    VALUES
                    (@EmpId, 10, GETUTCDATE(), 'CompOff Expired', 0, @oldCLosing, @Difference, GETUTCDATE(), 'Admin')
                END;

		FETCH NEXT FROM id_cursor INTO  @EmpId 
	END

	CLOSE id_cursor
	DEALLOCATE id_cursor
END
GO

------------------------Support Sp-----------------------
GO
CREATE OR ALTER PROC [dbo].[GetAllFeedback]
    @EmployeeCodes VARCHAR(500) = null,
    @CreatedOnFrom DATE = null,
    @CreatedOnTo DATE = null,
    @FeedbackType INT = null,
    @TicketStatus INT = null,
    @SearchQuery VARCHAR(250) = null,
    @SortColumn VARCHAR(50) = null,
    @SortDesc BIT = 0,
    @StartIndex INT = null,
    @PageSize INT = null
AS BEGIN
    /*
    EXEC GetAllFeedback @SortColumn = 'Id', @SortDesc = 1, @PageSize = 50
    */

    SELECT COUNT(*) AS TotalCount
    FROM [dbo].[Feedback] f
    LEFT JOIN [dbo].[EmployeeData] e ON f.[EmployeeId] = e.[Id]
    WHERE
    (@CreatedOnFrom IS NULL OR @CreatedOnTo IS NULL OR f.CreatedOn BETWEEN @CreatedOnFrom AND @CreatedOnTo) AND
    (NULLIF(@EmployeeCodes, '') IS NULL OR e.EmployeeCode IN (SELECT TRIM(value) FROM string_split(@EmployeeCodes, ','))) AND
    (NULLIF(@FeedbackType, 0) IS NULL OR f.FeedbackType = @FeedbackType) AND
    (NULLIF(@TicketStatus, 0) IS NULL OR f.TicketStatus = @TicketStatus) AND
    (NULLIF(@SearchQuery, '') IS NULL OR CHARINDEX(@SearchQuery, f.Subject) > 0 OR CHARINDEX(@SearchQuery, f.Description) > 0);

    SELECT 
        f.[Id],
        f.[EmployeeId],
        CONCAT(e.[FirstName], ' ', 
               CASE WHEN e.[MiddleName] IS NOT NULL THEN e.[MiddleName] + ' ' ELSE '' END, 
               e.[LastName]) AS EmployeeName,
        f.[CreatedBy] AS EmployeeEmail,
        f.[TicketStatus],
        f.[FeedbackType],
        f.[Subject],
        f.[Description],
        f.[AdminComment],
        f.[CreatedOn],
		f.[ModifiedOn]
    FROM [dbo].[Feedback] f
    LEFT JOIN [dbo].[EmployeeData] e ON f.[EmployeeId] = e.[Id]
    WHERE
    (@CreatedOnFrom IS NULL OR @CreatedOnTo IS NULL OR f.CreatedOn BETWEEN @CreatedOnFrom AND @CreatedOnTo) AND
    (NULLIF(@EmployeeCodes, '') IS NULL OR e.EmployeeCode IN (SELECT TRIM(value) FROM string_split(@EmployeeCodes, ','))) AND
    (NULLIF(@FeedbackType, 0) IS NULL OR f.FeedbackType = @FeedbackType) AND
    (NULLIF(@TicketStatus, 0) IS NULL OR f.TicketStatus = @TicketStatus) AND
    (NULLIF(@SearchQuery, '') IS NULL OR CHARINDEX(@SearchQuery, f.Subject) > 0 OR CHARINDEX(@SearchQuery, f.Description) > 0)
    ORDER BY 
        CASE WHEN @SortColumn = 'Id' AND @SortDesc = 0 THEN f.[Id] END ASC,
        CASE WHEN @SortColumn = 'EmployeeId' AND @SortDesc = 0 THEN f.[EmployeeId] END ASC,
		CASE WHEN @SortColumn = 'EmployeeName' AND @SortDesc = 0 THEN CONCAT(e.[FirstName], ' ', ISNULL(e.[MiddleName] + ' ', ''), e.[LastName]) END ASC,
        CASE WHEN @SortColumn = 'EmployeeEmail' AND @SortDesc = 0 THEN f.[CreatedBy] END ASC,
        CASE WHEN @SortColumn = 'TicketStatus' AND @SortDesc = 0 THEN f.[TicketStatus] END ASC,
        CASE WHEN @SortColumn = 'FeedbackType' AND @SortDesc = 0 THEN f.[FeedbackType] END ASC,
        CASE WHEN @SortColumn = 'Subject' AND @SortDesc = 0 THEN f.[Subject] END ASC,
        CASE WHEN @SortColumn = 'Description' AND @SortDesc = 0 THEN f.[Description] END ASC,
        CASE WHEN @SortColumn = 'AdminComment' AND @SortDesc = 0 THEN f.[AdminComment] END ASC,
        CASE WHEN @SortColumn = 'CreatedOn' AND @SortDesc = 0 THEN f.[CreatedOn] END ASC,

        CASE WHEN @SortColumn = 'Id' AND @SortDesc = 1 THEN f.[Id] END DESC,
        CASE WHEN @SortColumn = 'EmployeeId' AND @SortDesc = 1 THEN f.[EmployeeId] END DESC,
        CASE WHEN @SortColumn = 'EmployeeName' AND @SortDesc = 1 THEN CONCAT(e.[FirstName], ' ', ISNULL(e.[MiddleName] + ' ', ''), e.[LastName]) END DESC,
        CASE WHEN @SortColumn = 'EmployeeEmail' AND @SortDesc = 1 THEN f.[CreatedBy] END DESC,
        CASE WHEN @SortColumn = 'TicketStatus' AND @SortDesc = 1 THEN f.[TicketStatus] END DESC,
        CASE WHEN @SortColumn = 'FeedbackType' AND @SortDesc = 1 THEN f.[FeedbackType] END DESC,
        CASE WHEN @SortColumn = 'Subject' AND @SortDesc = 1 THEN f.[Subject] END DESC,
        CASE WHEN @SortColumn = 'Description' AND @SortDesc = 1 THEN f.[Description] END DESC,
        CASE WHEN @SortColumn = 'AdminComment' AND @SortDesc = 1 THEN f.[AdminComment] END DESC,
        CASE WHEN @SortColumn = 'CreatedOn' AND @SortDesc = 1 THEN f.[CreatedOn] END DESC,
		CASE WHEN NULLIF(@SortColumn, '') IS NULL THEN f.[CreatedOn] END DESC
    OFFSET COALESCE(NULLIF(@StartIndex, 0), 0) ROWS
    FETCH NEXT COALESCE(NULLIF(@PageSize, 0), 10) ROWS ONLY;
END
GO

---------------------------------GetFeedbackByEmployee-------------------------------------
GO
CREATE OR ALTER   PROC [dbo].[GetFeedbackByEmployee]
    @UserSessionId INT,
    @EmployeeCodes VARCHAR(500) = NULL,
    @CreatedOnFrom DATE = NULL,
    @CreatedOnTo DATE = NULL,
    @FeedbackType INT = NULL,
    @TicketStatus INT = NULL,
    @SearchQuery VARCHAR(250) = NULL,
    @EmployeeName VARCHAR(250) = NULL,
    @SortColumn VARCHAR(50) = NULL,
    @SortDesc BIT = 0,
    @StartIndex INT = NULL,
    @PageSize INT = NULL
AS BEGIN
    /*
    EXEC GetFeedbackByEmployee @UserSessionId = 101, @SortColumn = 'Id', @SortDesc = 1, @PageSize = 50
    */

    -- Count total records
    SELECT COUNT(*) AS TotalCount
    FROM [dbo].[Feedback] f
    LEFT JOIN [dbo].[EmployeeData] e ON f.[EmployeeId] = e.[Id]
    WHERE
        f.[EmployeeId] = @UserSessionId AND
        (@CreatedOnFrom IS NULL OR @CreatedOnTo IS NULL OR f.CreatedOn BETWEEN @CreatedOnFrom AND @CreatedOnTo) AND
        (NULLIF(@EmployeeCodes, '') IS NULL OR e.EmployeeCode IN (SELECT TRIM(value) FROM string_split(@EmployeeCodes, ','))) AND
        (NULLIF(@FeedbackType, 0) IS NULL OR f.FeedbackType = @FeedbackType) AND
        (NULLIF(@TicketStatus, 0) IS NULL OR f.TicketStatus = @TicketStatus) AND
        (NULLIF(@SearchQuery, '') IS NULL OR CHARINDEX(@SearchQuery, f.Subject) > 0 OR CHARINDEX(@SearchQuery, f.Description) > 0) AND
        (NULLIF(@EmployeeName, '') IS NULL OR CHARINDEX(@EmployeeName, CONCAT(e.[FirstName], ' ', 
            CASE WHEN e.[MiddleName] IS NOT NULL THEN e.[MiddleName] + ' ' ELSE '' END, 
            e.[LastName])) > 0);

    -- Select feedback records
    SELECT 
        f.[Id],
        f.[EmployeeId],
        f.[TicketStatus],
        f.[FeedbackType],
        f.[Subject],
        f.[Description],
        f.[AdminComment],
        f.[CreatedOn],
		f.[ModifiedOn]
    FROM [dbo].[Feedback] f
    LEFT JOIN [dbo].[EmployeeData] e ON f.[EmployeeId] = e.[Id]
    WHERE
        f.[EmployeeId] = @UserSessionId AND
        (@CreatedOnFrom IS NULL OR @CreatedOnTo IS NULL OR f.CreatedOn BETWEEN @CreatedOnFrom AND @CreatedOnTo) AND
        (NULLIF(@EmployeeCodes, '') IS NULL OR e.EmployeeCode IN (SELECT TRIM(value) FROM string_split(@EmployeeCodes, ','))) AND
        (NULLIF(@FeedbackType, 0) IS NULL OR f.FeedbackType = @FeedbackType) AND
        (NULLIF(@TicketStatus, 0) IS NULL OR f.TicketStatus = @TicketStatus) AND
        (NULLIF(@SearchQuery, '') IS NULL OR CHARINDEX(@SearchQuery, f.Subject) > 0 OR CHARINDEX(@SearchQuery, f.Description) > 0) AND
        (NULLIF(@EmployeeName, '') IS NULL OR CHARINDEX(@EmployeeName, CONCAT(e.[FirstName], ' ', 
            CASE WHEN e.[MiddleName] IS NOT NULL THEN e.[MiddleName] + ' ' ELSE '' END, 
            e.[LastName])) > 0)
    ORDER BY 
        CASE WHEN @SortColumn = 'Id' AND @SortDesc = 0 THEN f.[Id] END ASC,
        CASE WHEN @SortColumn = 'EmployeeId' AND @SortDesc = 0 THEN f.[EmployeeId] END ASC,
        CASE WHEN @SortColumn = 'TicketStatus' AND @SortDesc = 0 THEN f.[TicketStatus] END ASC,
        CASE WHEN @SortColumn = 'FeedbackType' AND @SortDesc = 0 THEN f.[FeedbackType] END ASC,
        CASE WHEN @SortColumn = 'Subject' AND @SortDesc = 0 THEN f.[Subject] END ASC,
        CASE WHEN @SortColumn = 'Description' AND @SortDesc = 0 THEN f.[Description] END ASC,
        CASE WHEN @SortColumn = 'AdminComment' AND @SortDesc = 0 THEN f.[AdminComment] END ASC,
        CASE WHEN @SortColumn = 'CreatedOn' AND @SortDesc = 0 THEN f.[CreatedOn] END ASC,
        CASE WHEN @SortColumn = 'Id' AND @SortDesc = 1 THEN f.[Id] END DESC,
        CASE WHEN @SortColumn = 'EmployeeId' AND @SortDesc = 1 THEN f.[EmployeeId] END DESC,
        CASE WHEN @SortColumn = 'TicketStatus' AND @SortDesc = 1 THEN f.[TicketStatus] END DESC,
        CASE WHEN @SortColumn = 'FeedbackType' AND @SortDesc = 1 THEN f.[FeedbackType] END DESC,
        CASE WHEN @SortColumn = 'Subject' AND @SortDesc = 1 THEN f.[Subject] END DESC,
        CASE WHEN @SortColumn = 'Description' AND @SortDesc = 1 THEN f.[Description] END DESC,
        CASE WHEN @SortColumn = 'AdminComment' AND @SortDesc = 1 THEN f.[AdminComment] END DESC,
        CASE WHEN @SortColumn = 'CreatedOn' AND @SortDesc = 1 THEN f.[CreatedOn] END DESC,
		CASE WHEN NULLIF(@SortColumn, '') IS NULL THEN f.[CreatedOn] END DESC
    OFFSET COALESCE(NULLIF(@StartIndex, 0), 0) ROWS
    FETCH NEXT COALESCE(NULLIF(@PageSize, 0), 10) ROWS ONLY;
END