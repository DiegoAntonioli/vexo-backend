import type { FromSchema } from 'json-schema-to-ts';
import * as schemas from './schemas';

export type PostOauth2TokenFormDataParam = FromSchema<typeof schemas.PostOauth2Token.formData>;
export type PostOauth2TokenResponse201 = FromSchema<typeof schemas.PostOauth2Token.response['201']>;
