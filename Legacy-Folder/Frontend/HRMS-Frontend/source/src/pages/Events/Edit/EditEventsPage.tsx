import {
  Box,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  Grid,
  Link,
  Paper,
} from "@mui/material";
import moment, { Moment } from "moment";
import * as Yup from "yup";
import PageHeader from "@/components/PageHeader/PageHeader";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import FormTextField from "@/components/FormTextField";
import EventDateTimePicker from "@/components/EventDateTime";
import EmployeeGroupSelect from "@/pages/Events/Edit/components/EmployeeGroupSelect";
import EventCategorySelect from "@/pages/Events/Edit/components/EventCategorySelect";
import InsertLinkIcon from "@mui/icons-material/InsertLink";
import ImageInput from "@/pages/Events/Edit/components/ImageInput";
import FileUpload from "@/pages/CompanyPolicy/components/FileUpload";
import SubmitButton from "@/components/SubmitButton/SubmitButton";
import ResetButton from "@/components/ResetButton/ResetButton";
import {
  createEvent,
  CreateEventResponse,
  EventType,
  getEvent,
  GetEventResponse,
  getEventStatusList,
  GetEventStatusListResponse,
  updateEvent,
} from "@/services/Events";
import useAsync from "@/hooks/useAsync";
import { toast } from "react-toastify";
import methods from "@/utils";
import { objectToFormData } from "@/utils/formData";
import FormTextEditor from "@/pages/Events/components/FormTextEditor/FormTextEditor";
import { useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { hasPermission } from "@/utils/hasPermission";
import { eventStatusToId, permissionValue } from "@/utils/constants";
import NotFoundPage from "@/pages/NotFoundPage";
import EventDocuments from "@/pages/Events/Edit/components/EventDocuments";
import FormSelectField from "@/components/FormSelectField";
import BreadCrumbs from "@/components/@extended/Router";
import { regex } from "@/utils/regexPattern";
import GlobalLoader from "@/components/GlobalLoader/GlobalLoader";
import { fileValidation } from "@/utils/fileSchema";

interface FormValues {
  eventUrl1: string;
  eventUrl2: string;
  eventUrl3: string;
  eventFeedbackSurveyLink: string;
}

const {
  notOnlyNumbers,
  nameMaxLength_100,
  nameMaxLength_250,
  minCharactersExist,
} = regex;

const getValidationSchema = (isFileRequired: boolean) =>
  Yup.object().shape({
    title: Yup.string()
      .trim()
      .test(notOnlyNumbers.key, notOnlyNumbers.message, (value) => {
        if (!value) return true;
        return notOnlyNumbers.pattern.test(value);
      })
      .test(minCharactersExist.key, minCharactersExist.message, (value) => {
        if (!value) return true;
        return (value.match(minCharactersExist.pattern) || []).length >= 2;
      })
      .max(nameMaxLength_100.number, nameMaxLength_100.message)
      .required("Title is required"),
    description: Yup.string().trim().required("Description is required"),
    startDate: Yup.mixed<Moment>()
      .test({
        name: "is-valid",
        message: "Invalid Date",
        test: (startDate) => moment.isMoment(startDate),
      })
      .test({
        name: "no-past-dates",
        message: "Start date cannot be in the past",
        test: (startDate) =>
          moment.isMoment(startDate)
            ? startDate.isSameOrAfter(moment(), "minute")
            : false,
      })
      .required("Start date is required"),
    endDate: Yup.mixed<Moment>()
      .test({
        name: "is-valid",
        message: "Invalid Date",
        test: (endDate) => moment.isMoment(endDate),
      })
      .test({
        name: "no-past-dates",
        message: "End date cannot be in the past",
        test: (endDate) =>
          moment.isMoment(endDate)
            ? endDate.isSameOrAfter(moment(), "minute")
            : false,
      })
      .test({
        name: "end-after-start",
        message: "End date must be after start date",
        test: (endDate, context) => {
          const startDate = context.parent.startDate as Moment | undefined;
          return moment.isMoment(endDate) && moment.isMoment(startDate)
            ? endDate.isAfter(startDate, "minute")
            : false;
        },
      })
      .required("End date is required"),
    venue: Yup.string()
      .trim()
      .test(notOnlyNumbers.key, notOnlyNumbers.message, (value) => {
        if (!value) return true;
        return notOnlyNumbers.pattern.test(value);
      })
      .test(minCharactersExist.key, minCharactersExist.message, (value) => {
        if (!value) return true;
        return (value.match(minCharactersExist.pattern) || []).length >= 2;
      })
      .max(nameMaxLength_100.number, nameMaxLength_100.message)
      .required("Venue is required"),
    empGroupId: Yup.string().required("Employee Group is required"),
    eventCategoryId: Yup.string().required("Event Category is required"),
    eventUrl1: Yup.string()
      .url("Enter a valid URL")
      .max(nameMaxLength_250.number, nameMaxLength_250.message)
      .optional(),
    eventUrl2: Yup.string()
      .url("Enter a valid URL")
      .max(nameMaxLength_250.number, nameMaxLength_250.message)
      .optional(),
    eventUrl3: Yup.string()
      .url("Enter a valid URL")
      .max(nameMaxLength_250.number, nameMaxLength_250.message)
      .optional(),
    eventFeedbackSurveyLink: Yup.string()
      .url("Enter a valid URL")
      .max(nameMaxLength_250.number, nameMaxLength_250.message)
      .optional(),
    statusId: Yup.string().required("Status is required"),
    bannerFileContent: isFileRequired
      ? Yup.mixed<File>()
          .required("Banner image is required")
          .test(
            "fileType",
            "Unsupported file format. Only .jpg, .jpeg, .png formats are supported",
            (value: File) => {
              return value && ["image/png", "image/jpeg"].includes(value.type);
            }
          )
          .test(
            "fileSize",
            "File size must be less than 15MB",
            (value: File) => {
              return value && value.size < 15 * 1024 * 1024;
            }
          )
      : Yup.mixed<File>()
          .nullable()
          .test(
            "fileType",
            "Unsupported file format. Only .jpg, .jpeg, .png formats are supported",
            (value: File | null | undefined) => {
              if (!value) return true;
              return ["image/png", "image/jpeg"].includes(value.type);
            }
          )
          .test(
            "fileSize",
            "File size must be less than 15MB",
            (value: File | null | undefined) => {
              if (!value) return true;
              return value && value.size < 15 * 1024 * 1024;
            }
          ),
    fileContent: Yup.mixed<File>()
      .nullable()
      .test("fileValidation", fileValidation),
  });

type FormDataType = Yup.InferType<ReturnType<typeof getValidationSchema>>;

const EditEventsPage = () => {
  const [eventData, setEventData] = useState<EventType>();
  const [isDisabled, setDisabled] = useState(false);
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    if (!id) {
      setDisabled(true);
    } else {
      setDisabled(false);
    }
  }, [id]);

  const validationSchema = getValidationSchema(
    id && eventData?.bannerFileName ? false : true
  );
  const { READ } = permissionValue.EVENTS;
  const method = useForm<FormDataType>({
    resolver: yupResolver(validationSchema),
    mode: "all",
    defaultValues: {
      title: "",
      description: "",
      startDate: undefined,
      endDate: undefined,
      venue: "",
      empGroupId: "",
      eventCategoryId: "",
      eventUrl1: "",
      eventUrl2: "",
      eventUrl3: "",
      eventFeedbackSurveyLink: "",
      statusId: "1",
      bannerFileContent: null,
      fileContent: null,
    },
  });
  const {
    handleSubmit,
    reset,
    watch,
    setValue,
    control,
    formState: { errors },
  } = method;

  const { execute: create, isLoading: isSaving } = useAsync<
    CreateEventResponse,
    FormData
  >({
    requestFn: async (args: FormData): Promise<CreateEventResponse> => {
      return await createEvent(args);
    },
    onSuccess: ({ data }) => {
      toast.success(data.message);
      reset();
    },
    onError: (err) => {
      methods.throwApiError(err);
    },
  });

  const { execute: fetchEventById, isLoading } = useAsync<
    GetEventResponse,
    number
  >({
    requestFn: async (id: number): Promise<GetEventResponse> => {
      return await getEvent(id);
    },
    onSuccess: (response) => {
      const {
        eventName,
        venue,
        startDate,
        endDate,
        empGroupId,
        eventCategoryId,
        link1,
        link2,
        link3,
        eventFeedbackSurveyLink,
        statusId,
        content,
      } = response?.data?.result as EventType;
      setEventData(response?.data?.result);
      setValue("title", eventName);
      setValue("venue", venue);
      setValue("startDate", moment(startDate));
      setValue("endDate", moment(endDate));
      setValue("empGroupId", empGroupId || "");
      setValue("eventCategoryId", eventCategoryId || "");
      setValue("eventUrl1", link1);
      setValue("eventUrl2", link2);
      setValue("eventUrl3", link3);
      setValue("eventFeedbackSurveyLink", eventFeedbackSurveyLink);
      setValue("statusId", statusId || "");
      setValue("description", content);
      setValue("fileContent", null);
    },
    onError: (err) => {
      methods.throwApiError(err);
    },
    defaultParams: id as number | undefined,
    autoExecute: id && hasPermission(READ) ? true : false,
  });

  const { execute: update, isLoading: isUpdating } = useAsync<
    CreateEventResponse,
    FormData
  >({
    requestFn: async (args: FormData): Promise<CreateEventResponse> => {
      return await updateEvent(args);
    },
    onSuccess: (response) => {
      toast.success(response.data.message);
      fetchEventById(id as number | undefined);
    },
    onError: (err) => {
      methods.throwApiError(err);
    },
  });

  const currentStatus = useMemo(() => {
    if (id && eventData) {
      return eventData.status;
    }
  }, [id, eventData]);

  const isEventCompleted = currentStatus === "Completed";

  const { data } = useAsync<GetEventStatusListResponse>({
    requestFn: async (): Promise<GetEventStatusListResponse> => {
      return await getEventStatusList();
    },
    onError: (err) => {
      methods.throwApiError(err);
    },
    autoExecute: true,
  });

  const options: { id: number; statusValue: string }[] = useMemo(
    () => data?.result || [],
    [data]
  );

  const onSubmit = (data: FormDataType) => {
    const formData = objectToFormData(
      {
        ...data,
        fileContent: data.fileContent || "",
        bannerFileContent: data.bannerFileContent || "",
      },
      "YYYY-MM-DD[T]HH:mm"
    );
    if (id) {
      formData.append("id", id);
      update(formData);
    } else {
      create(formData);
    }
  };

  const handleResetForm = () => {
    if (id) {
      const {
        eventName,
        venue,
        startDate,
        endDate,
        empGroupId,
        eventCategoryId,
        link1,
        link2,
        link3,
        eventFeedbackSurveyLink,
        statusId,
        content,
        eventDocument,
      } = eventData as EventType;
      setValue("title", eventName);
      setValue("venue", venue);
      setValue("startDate", moment(startDate));
      setValue("endDate", moment(endDate));
      setValue("empGroupId", empGroupId || "");
      setValue("eventCategoryId", eventCategoryId || "");
      setValue("eventUrl1", link1);
      setValue("eventUrl2", link2);
      setValue("eventUrl3", link3);
      setValue("eventFeedbackSurveyLink", eventFeedbackSurveyLink);
      setValue("statusId", statusId || "");
      setValue("description", content);
      setValue(
        "fileContent",
        eventDocument && eventDocument.length > 0
          ? new File(
              [""],
              eventDocument ? eventDocument[0]?.originalFileName : ""
            )
          : null
      );
    } else {
      reset();
    }
  };

  function removeFromDocumentList(documentId: number) {
    if (eventData) {
      setEventData({
        ...eventData,
        eventDocument: eventData.eventDocument.filter(
          (document) => document.id !== documentId
        ),
      });
    }
  }

  if (!hasPermission(READ)) {
    return <NotFoundPage />;
  }

  const handleChange =
    (name: keyof FormValues) => (e: { target: { value: string } }) => {
      setValue(name, e.target.value, { shouldValidate: true });
    };

  const handleChangeStartDate = (date: Moment | null) => {
    setValue("endDate", null!, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });

    setValue("startDate", date!, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });

    if (date) {
      setDisabled(false);
    } else {
      setDisabled(true);
    }
  };

  const handleChangeEndDate = (date: Moment | null) => {
    setValue("endDate", date!, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  };

  return (
    <>
      <BreadCrumbs />
      <Paper>
        <PageHeader
          variant="h3"
          title={`${id ? "Edit" : "Create"} Event`}
          goBack={true}
        />
        {!isLoading ? (
          <>
            <FormProvider<FormDataType> {...method}>
              <Box
                component="form"
                autoComplete="off"
                padding="30px"
                gap="30px"
                display="flex"
                flexDirection="column"
                onSubmit={handleSubmit(onSubmit)}
              >
                <Grid container spacing={"20px"}>
                  <Grid item xs={12} container spacing={"20px"}>
                    <Grid
                      item
                      xs={12}
                      sm={6}
                      container
                      order={{ xs: 2, sm: 1 }}
                      spacing={"20px"}
                    >
                      <Grid item xs={12}>
                        <FormTextField
                          name="title"
                          label="Title"
                          disabled={isEventCompleted}
                          required
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <FormTextField
                          name="venue"
                          label="Venue"
                          disabled={isEventCompleted}
                          required
                        />
                      </Grid>
                    </Grid>
                    <Grid
                      item
                      xs={12}
                      sm={6}
                      container
                      order={{ xs: 1, sm: 2 }}
                    >
                      <ImageInput
                        imagePath={eventData?.bannerFileName}
                        disabled={isEventCompleted}
                      />
                    </Grid>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <EventDateTimePicker
                      label="Start Date"
                      name="startDate"
                      format="MMM Do, YYYY, hh:mm A"
                      minDateTime={moment()}
                      disabled={isEventCompleted}
                      handleChange={(date) => handleChangeStartDate(date)}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <EventDateTimePicker
                      label="End Date"
                      name="endDate"
                      format="MMM Do, YYYY, hh:mm A"
                      minDateTime={moment(watch("startDate"))}
                      disabled={isEventCompleted || isDisabled}
                      handleChange={(date) => handleChangeEndDate(date)}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <EmployeeGroupSelect disabled={isEventCompleted} required />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <EventCategorySelect disabled={isEventCompleted} required />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormTextField
                      name="eventUrl1"
                      label="Meeting Link"
                      disabled={isEventCompleted}
                      onChange={(e) => {
                        handleChange("eventUrl1" as keyof FormValues)(e);
                      }}
                      InputProps={{
                        endAdornment: (
                          <>
                            {watch("eventUrl1") && !errors.eventUrl1 ? (
                              <Link
                                target="_blank"
                                rel="noopener"
                                href={watch("eventUrl1")}
                                sx={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  marginRight: "-4px",
                                }}
                              >
                                <InsertLinkIcon />
                              </Link>
                            ) : null}
                          </>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormTextField
                      name="eventUrl2"
                      label="Video Link"
                      disabled={isEventCompleted}
                      onChange={(e) => {
                        handleChange("eventUrl2" as keyof FormValues)(e);
                      }}
                      InputProps={{
                        sx: {
                          "&.MuiInputBase-root-MuiOutlinedInput-root": {
                            padding: "1px",
                          },
                        },
                        endAdornment: (
                          <>
                            {watch("eventUrl2") && !errors.eventUrl2 ? (
                              <Link
                                target="_blank"
                                rel="noopener"
                                href={watch("eventUrl2")}
                                sx={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  marginRight: "-4px",
                                }}
                              >
                                <InsertLinkIcon />
                              </Link>
                            ) : null}
                          </>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormTextField
                      name="eventUrl3"
                      label="Reference Link"
                      disabled={isEventCompleted}
                      onChange={(e) => {
                        handleChange("eventUrl3" as keyof FormValues)(e);
                      }}
                      InputProps={{
                        endAdornment: (
                          <>
                            {watch("eventUrl3") && !errors.eventUrl3 ? (
                              <Link
                                target="_blank"
                                rel="noopener"
                                href={watch("eventUrl3")}
                                sx={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  marginRight: "-4px",
                                }}
                              >
                                <InsertLinkIcon />
                              </Link>
                            ) : null}
                          </>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormTextField
                      name="eventFeedbackSurveyLink"
                      label="Feedback Survey Link"
                      disabled={isEventCompleted}
                      onChange={(e) => {
                        handleChange(
                          "eventFeedbackSurveyLink" as keyof FormValues
                        )(e);
                      }}
                      InputProps={{
                        endAdornment: (
                          <>
                            {watch("eventFeedbackSurveyLink") &&
                            !errors.eventFeedbackSurveyLink ? (
                              <Link
                                target="_blank"
                                rel="noopener"
                                href={watch("eventFeedbackSurveyLink")}
                                sx={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  marginRight: "-4px",
                                }}
                              >
                                <InsertLinkIcon />
                              </Link>
                            ) : null}
                          </>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    {!currentStatus ||
                    currentStatus === "WIP / Pending Approval" ? (
                      <FormSelectField
                        name={"statusId"}
                        label="Status"
                        options={options.filter(
                          (option) => option.statusValue !== "Completed"
                        )}
                        labelKey="statusValue"
                        valueKey="id"
                        required
                      />
                    ) : (
                      <Controller
                        name={"statusId"}
                        control={control}
                        render={({ field: { value, onChange } }) => (
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={
                                  value.toString() ===
                                  eventStatusToId["Completed"].toString()
                                }
                                disabled={isEventCompleted}
                                onChange={(e) => {
                                  onChange(
                                    e.target.checked
                                      ? eventStatusToId["Completed"]
                                      : eventStatusToId["Upcoming"]
                                  );
                                }}
                              />
                            }
                            label="Mark as completed"
                          />
                        )}
                      />
                    )}
                  </Grid>
                  <Grid item xs={12}>
                    <FormTextEditor
                      name="description"
                      isReadOnly={isEventCompleted}
                    />
                  </Grid>
                  {!isEventCompleted && (
                    <Grid item xs={12} sm={6}>
                      <FileUpload />
                    </Grid>
                  )}
                  {id && eventData && (
                    <Grid container item xs={12}>
                      <Grid item xs={12} sm={6}>
                        <EventDocuments
                          eventDocuments={eventData.eventDocument}
                          removeFromDocumentList={removeFromDocumentList}
                          disabled={isEventCompleted}
                        />
                      </Grid>
                    </Grid>
                  )}
                  {!isEventCompleted && (
                    <Grid item xs={12}>
                      <Box
                        sx={{
                          display: "flex",
                          paddingBottom: "20px",
                          gap: "10px",
                          justifyContent: "center",
                        }}
                      >
                        <SubmitButton loading={isSaving || isUpdating}>
                          {isSaving
                            ? "Saving"
                            : isUpdating
                              ? "Updating"
                              : id
                                ? "Update"
                                : "Save"}
                        </SubmitButton>
                        <ResetButton onClick={handleResetForm} />
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </Box>
            </FormProvider>
          </>
        ) : (
          <Box
            height={"calc(100vh - 80px)"}
            justifyContent="center"
            alignItems="center"
            display="flex"
          >
            <CircularProgress />
          </Box>
        )}
      </Paper>
      <GlobalLoader loading={isSaving || isUpdating} />
    </>
  );
};

export default EditEventsPage;
