/*
    Even though the presentation definition outlines necessary crit-
    eria for the credential, the schema URL complements it by ensur-
    ing that only credentials following a recognized and trusted st-
    ructure are considered.
*/
export const presentationDefinition = {
    id: "demoPresentationDefinition",
    input_descriptors: [
        {
            id: "diploma_credential",
            schema: "https://example.com/schema",
            constraints: {
                fields: [
                    {
                        path: ["$.credentialSubject.family_name"],
                        name: "family_name",
                    },
                    {
                        path: ["$.credentialSubject.given_name"],
                        name: "given_name",
                    },
                    { path: ["$.credentialSubject.title"], name: "title" },
                    { path: ["$.credentialSubject.grade"], name: "grade" },
                    {
                        path: ["$.credentialSubject.eqf_level"],
                        name: "eqf_level",
                    },
                    {
                        path: ["$.credentialSubject.graduation_date"],
                        name: "graduation_date",
                    },
                    {
                        path: ["$.credentialSubject.expiry_date"],
                        name: "expiry_date",
                    },
                ],
            },
        },
    ],
};
