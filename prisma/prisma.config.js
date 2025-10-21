export default defineConfig({
  // required when using unstable features
  experimental: {
    externalTables: true,
  },
  // declare auth schema tables and enums as external
  tables: {
    external: [
      "auth.audit_log_entries",
      "auth.flow_state",
      "auth.identities",
      "auth.instances",
      "auth.mfa_amr_claims",
      "auth.mfa_challenges",
      "auth.mfa_factors",
      "auth.oauth_clients",
      "auth.one_time_tokens",
      "auth.refresh_tokens",
      "auth.saml_providers",
      "auth.saml_relay_states",
      "auth.schema_migrations",
      "auth.sessions",
      "auth.sso_domains",
      "auth.sso_providers",
      "auth.users",
    ],
  },
})w