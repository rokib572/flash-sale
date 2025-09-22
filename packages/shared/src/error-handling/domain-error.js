export class DomainError extends Error {
    _code;
    _clientSafeMessage;
    _additionalContext;
    constructor(message, opts) {
        super(message);
        const { code, clientSafeMessage, additionalContext } = opts;
        this._code = code;
        this._clientSafeMessage = clientSafeMessage;
        this._additionalContext = additionalContext;
        Object.setPrototypeOf(this, DomainError.prototype);
    }
    get code() {
        return this._code;
    }
    get clientSafeMessage() {
        return this._clientSafeMessage;
    }
    get additionalContext() {
        return this._additionalContext;
    }
    static makeError({ message, code, clientSafeMessage, additionalContext, }) {
        return new DomainError(message, { code, clientSafeMessage, additionalContext });
    }
}
