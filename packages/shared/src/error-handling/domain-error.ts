type Code =
  | 'BAD_REQUEST'
  | 'UNPROCESSABLE_CONTENT'
  | 'NOT_FOUND'
  | 'UNAUTHORISED'
  | 'INTERNAL_ERROR'
  | 'HTTP_ERROR';
type AdditionalContext = Record<string, string | number | boolean | string[]>;
export class DomainError extends Error {
  private readonly _code: Code;
  private readonly _clientSafeMessage?: string;
  private readonly _additionalContext?: AdditionalContext;

  protected constructor(
    message: string,
    opts: {
      code: Code;
      clientSafeMessage?: string;
      additionalContext?: AdditionalContext;
    },
  ) {
    super(message);
    const { code, clientSafeMessage, additionalContext } = opts;

    this._code = code;
    this._clientSafeMessage = clientSafeMessage;
    this._additionalContext = additionalContext;
    Object.setPrototypeOf(this, DomainError.prototype);
  }

  public get code(): Code {
    return this._code;
  }

  public get clientSafeMessage(): string | undefined {
    return this._clientSafeMessage;
  }

  public get additionalContext(): AdditionalContext | undefined {
    return this._additionalContext;
  }

  static makeError({
    message,
    code,
    clientSafeMessage,
    additionalContext,
  }: {
    message: string;
    code: Code;
    clientSafeMessage?: string;
    additionalContext?: AdditionalContext;
  }) {
    return new DomainError(message, { code, clientSafeMessage, additionalContext });
  }
}
