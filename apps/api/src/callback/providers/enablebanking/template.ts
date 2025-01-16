type TemplateOptions = {
  status: "success" | "error";
  title?: string;
  message?: string;
};

export function getTemplate({
  status,
  title = status === "success" ? "Connection Successful!" : "Connection Failed",
  message = status === "success"
    ? "You can close this window now."
    : "There was an error connecting to your bank. Please try again.",
}: TemplateOptions) {
  return `
<!DOCTYPE html>
<html>
<head>
    <title>${title}</title>
    <style>
        body {
            font-family: system-ui, -apple-system, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background-color: #f9fafb;
        }
        .message {
            text-align: center;
            padding: 2rem;
            background-color: white;
            border-radius: 0.5rem;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .success {
            color: #059669;
        }
        .error {
            color: #dc2626;
        }
    </style>
</head>
<body>
    <div class="message">
        <h2 class="${status}">${title}</h2>
        <p>${message}</p>
    </div>
    <script>
        window.onload = function() {
            // Send message to parent window
            window.parent.postMessage({
                stage: "${status}"
            }, "*");
        }
    </script>
</body>
</html>
`;
}

// Response helper functions
export const htmlResponse = (status: "success" | "error", message: string) =>
  new Response(getTemplate({ status, message }), {
    headers: { "Content-Type": "text/html" },
  });

export const errorResponse = (message: string) =>
  htmlResponse("error", message);
export const successResponse = (message: string) =>
  htmlResponse("success", message);
