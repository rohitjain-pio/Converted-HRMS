using HRMS.Domain.Contants;
using HRMS.Domain.Enums;
using HRMS.Domain.Exceptions;
using Microsoft.AspNetCore.Diagnostics;
using Serilog;
using System.Net;

namespace HRMS.API.Extensions
{
    public static class ExceptionMiddlewareExtensions
    {
        public static void ConfigureExceptionHandler(this IApplicationBuilder app, Serilog.ILogger logger, IWebHostEnvironment env)
        {
            app.UseExceptionHandler(new ExceptionHandlerOptions
            {
                AllowStatusCode404Response = true,
                ExceptionHandler = async context =>
                {
                    context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
                    context.Response.ContentType = "application/json";

                    var errorId = context.TraceIdentifier ?? Guid.NewGuid().ToString();

                    var contextFeature = context.Features.Get<IExceptionHandlerFeature>();
                    if (contextFeature != null)
                    {
                        string errorMessage = string.Empty;
                        string errorCode = string.Empty;

                        if (contextFeature.Error is UserFriendlyException userFriendlyException)
                        {
                            switch (userFriendlyException.ErrorCode)
                            {
                                case ErrorCode.NotFound:
                                    context.Response.StatusCode = (int)HttpStatusCode.NotFound;
                                    errorMessage = userFriendlyException.UserFriendlyMessage;
                                    errorCode = $"{ApplicationConstants.Name}.{ErrorRespondCode.NOT_FOUND}";
                                    break;
                                case ErrorCode.VersionConflict:
                                    context.Response.StatusCode = (int)HttpStatusCode.Conflict;
                                    errorMessage = userFriendlyException.UserFriendlyMessage;
                                    errorCode = $"{ApplicationConstants.Name}.{ErrorRespondCode.VERSION_CONFLICT}";
                                    break;
                                case ErrorCode.ItemAlreadyExists:
                                    context.Response.StatusCode = (int)HttpStatusCode.Conflict;
                                    errorMessage = userFriendlyException.UserFriendlyMessage;

                                    errorCode = $"{ApplicationConstants.Name}.{ErrorRespondCode.ITEM_ALREADY_EXISTS}";
                                    break;
                                case ErrorCode.Conflict:
                                    context.Response.StatusCode = (int)HttpStatusCode.Conflict;
                                    errorMessage = userFriendlyException.UserFriendlyMessage;

                                    errorCode = $"{ApplicationConstants.Name}.{ErrorRespondCode.CONFLICT}";
                                    break;
                                case ErrorCode.BadRequest:
                                    context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
                                    errorMessage = userFriendlyException.UserFriendlyMessage;
                                    errorCode = $"{ApplicationConstants.Name}.{ErrorRespondCode.BAD_REQUEST}";
                                    break;
                                case ErrorCode.Unauthorized:
                                    context.Response.StatusCode = (int)HttpStatusCode.Unauthorized;
                                    errorMessage = userFriendlyException.UserFriendlyMessage;
                                    errorCode = $"{ApplicationConstants.Name}.{ErrorRespondCode.UNAUTHORIZED}";
                                    break;
                                case ErrorCode.Internal:
                                    context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
                                    errorMessage = userFriendlyException.UserFriendlyMessage;
                                    errorCode = $"{ApplicationConstants.Name}.{ErrorRespondCode.INTERNAL_ERROR}";
                                    break;
                                case ErrorCode.UnprocessableEntity:
                                    context.Response.StatusCode = (int)HttpStatusCode.UnprocessableEntity;
                                    errorMessage = userFriendlyException.UserFriendlyMessage;
                                    errorCode = $"{ApplicationConstants.Name}.{ErrorRespondCode.UNPROCESSABLE_ENTITY}";
                                    break;
                                default:
                                    context.Response.StatusCode = 500;
                                    errorMessage = userFriendlyException.UserFriendlyMessage;
                                    errorCode = $"{ApplicationConstants.Name}.{ErrorRespondCode.GENERAL_ERROR}";
                                    break;
                            }
                        }
                        else
                        {
                            context.Response.StatusCode = 500;
                            errorCode = $"{ApplicationConstants.Name}.{ErrorRespondCode.GENERAL_ERROR}";
                            errorMessage = env.IsStaging() || env.IsDevelopment() ? contextFeature.Error.Message : ErrorMessage.ErrorInProcessingRequest;
                        }
                        await context.Response.WriteAsync($@"
                                {{
                                    ""statusCode"":""{(int)HttpStatusCode.InternalServerError}"",
                                    ""message"":""{errorMessage}, ErrorId:{errorId}"",
                                    ""result"":""{null}"",
                                    ""errorCode"":""{errorCode}""
                                }}");

                        logger.ForContext("RequestId", errorId).Error(contextFeature.Error, "{0}", contextFeature.Error.Message);
                    }
                }
            });
        }
    }
}
