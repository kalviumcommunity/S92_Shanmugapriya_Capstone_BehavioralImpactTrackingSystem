# Bruno API Collection

Import the `bruno` folder into Bruno and select the `local` environment.

## Run order

1. Run `Auth / Register` once, or use an existing account.
2. Run `Auth / Login`. Its post-response script stores `token` and `userId`.
3. Run `Behaviors / Create Behavior` to create a record. Its script stores `behaviorId`.
4. Run the remaining protected requests with the saved environment values.
5. For upload testing, set the `attachment` path in `Behaviors / Create Behavior With Attachment`.
6. For Google authentication, paste a valid Google Identity Services ID token into `googleCredential`.

All protected requests send `Authorization: Bearer {{token}}`.
