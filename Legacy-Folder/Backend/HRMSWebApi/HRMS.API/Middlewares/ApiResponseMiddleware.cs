using System.Text;

namespace HRMS.API.Middlewares
{
    public class ApiResponseMiddleware(RequestDelegate next)
    {
        private readonly RequestDelegate _next = next;

        public async Task Invoke(HttpContext context)
        {
            var requestId = context.TraceIdentifier;


            // Remove server information
            context.Response.Headers.Remove("Server");
            context.Response.Headers.Remove("X-Powered-By");
            context.Response.Headers.Remove("X-AspNet-Version");

            // Add security headers
            var headers = context.Response.Headers;

            // Prevent clickjacking
            headers.Append("X-Frame-Options", "DENY");

            // Prevent MIME type sniffing
            headers.Append("X-Content-Type-Options", "nosniff");

            // XSS Protection
            headers.Append("X-XSS-Protection", "1; mode=block");

            // Referrer Policy
            headers.Append("Referrer-Policy", "strict-origin-when-cross-origin");

            // Content Security Policy
            var cspBuilder = new StringBuilder();
            cspBuilder.Append("default-src 'self'; ");
            cspBuilder.Append("script-src 'self' 'unsafe-inline' 'unsafe-eval'; ");
            cspBuilder.Append("style-src 'self' 'unsafe-inline'; ");
            cspBuilder.Append("img-src 'self' data: https:; ");
            cspBuilder.Append("font-src 'self'; ");
            cspBuilder.Append("connect-src 'self'; ");
            cspBuilder.Append("media-src 'self'; ");
            cspBuilder.Append("object-src 'none'; ");
            cspBuilder.Append("child-src 'none'; ");
            cspBuilder.Append("frame-ancestors 'none'; ");
            cspBuilder.Append("form-action 'self'; ");
            cspBuilder.Append("base-uri 'self'");

            headers.Append("Content-Security-Policy", cspBuilder.ToString());

            // HSTS (only for HTTPS)
            if (context.Request.IsHttps)
            {
                headers.Append("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
            }

            // Permissions Policy (Feature Policy replacement)
            headers.Append("Permissions-Policy",
                "camera=(), " +
                "microphone=(), " +
                "geolocation=(), " +
                "payment=(), " +
                "usb=(), " +
                "magnetometer=(), " +
                "gyroscope=(), " +
                "speaker=()");

            // Cross-Origin policies
            headers.Append("Cross-Origin-Embedder-Policy", "require-corp");
            headers.Append("Cross-Origin-Opener-Policy", "same-origin");
            headers.Append("Cross-Origin-Resource-Policy", "same-origin");

            context.Response.OnStarting(() =>
            {
                context.Response.Headers.RequestId = requestId;
                return Task.CompletedTask;
            });

            await _next(context);
        }
    }
}
