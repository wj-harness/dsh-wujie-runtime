/** Return the one credential DSH child tools may receive from Wujie. */
export function wujieTerminalEnvironment(
  environment: NodeJS.ProcessEnv,
): Record<string, string> {
  const token = environment.WUJIE_TOKEN
  return token?.startsWith('mat_') === true && token.length > 4
    ? { WUJIE_TOKEN: token }
    : {}
}
