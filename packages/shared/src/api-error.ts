export type ApiErrorCode =
  | 'invalid_body'
  | 'product_id_required'
  | 'not_found'
  | 'flash_sale_not_found'
  | 'flash_sale_not_started'
  | 'flash_sale_ended'
  | 'queue_busy'
  | 'auth_required'
  | 'invalid_token'
  | 'token_expired'
  | 'rate_limited'
  | 'internal_error'
  | 'bad_request'
  | 'unauthorised';

export type ApiErrorBody = {
  error: ApiErrorCode;
  message?: string;
  traceId?: string;
  [k: string]: unknown;
};

