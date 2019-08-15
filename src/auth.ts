export function withAuthorizationPrefix(authorization: string) {
  if (/^(bearer|token) /i.test(authorization)) {
    const [prefix, token] = authorization.split(/\s+/);
    return [prefix.toLowerCase(), token].join(" ");
  }

  if (authorization.split(/\./).length === 3) {
    return `bearer ${authorization}`;
  }

  return `token ${authorization}`;
}
