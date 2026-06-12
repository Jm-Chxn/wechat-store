export function ok<T>(data: T, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export function noContent(): Response {
  return new Response(null, { status: 204 });
}

export function okCached<T>(data: T, maxAge: number, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": `public, s-maxage=${maxAge}, stale-while-revalidate=${maxAge * 2}`,
    },
  });
}

export function apiError(
  status: number,
  message: string,
  fields?: Record<string, string>,
): Response {
  return new Response(
    JSON.stringify({
      status,
      error: statusText(status),
      message,
      timestamp: new Date().toISOString(),
      ...(fields ? { fields } : {}),
    }),
    { status, headers: { "Content-Type": "application/json" } },
  );
}

function statusText(status: number) {
  const map: Record<number, string> = {
    400: "Bad Request",
    401: "Unauthorized",
    403: "Forbidden",
    404: "Not Found",
    500: "Internal Server Error",
  };
  return map[status] ?? "Error";
}
