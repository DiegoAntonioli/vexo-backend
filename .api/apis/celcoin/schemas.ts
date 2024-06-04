const PostOauth2Token = {"formData":{"title":"AuthenticationRequest","type":"object","properties":{"grant_type":{"type":"string","enum":["client_credentials"],"default":"client_credentials","description":"Default: client_credentials"}},"$schema":"http://json-schema.org/draft-04/schema#"},"response":{"201":{"title":"AuthenticationToken","type":"object","properties":{"token":{"type":"string"}},"$schema":"http://json-schema.org/draft-04/schema#"}}} as const
;
export { PostOauth2Token }
