export const metadata = {
    vct: "urn:credential:diploma",
    name: "Diploma Credential",
    description: "This is a Bachelor Diploma verifiable credential",
    display: [
        {
            lang: "en-US",
            name: "Diploma Credential",
            rendering: ["Object"],
        },
    ],
    claims: [
        {
            path: ["Array"],
            display: ["Array"],
            svg_id: "given_name",
        },
        {
            path: ["Array"],
            display: ["Array"],
            svg_id: "family_name",
        },
        {
            path: ["Array"],
            display: ["Array"],
            svg_id: "title",
        },
        {
            path: ["Array"],
            display: ["Array"],
        },
        {
            path: ["Array"],
            display: ["Array"],
        },
        {
            path: ["Array"],
            display: ["Array"],
            svg_id: "graduation_date",
        },
        {
            path: ["Array"],
            display: ["Array"],
            svg_id: "expiry_date",
        },
    ],
};
