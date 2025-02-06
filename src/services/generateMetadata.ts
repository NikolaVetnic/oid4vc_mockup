interface Claim {
    path: string[];
    display: string[];
    svg_id?: string;
}

interface ClaimTemplateItem {
    key: string;
    svg_id?: string;
}

const claimTemplate: ClaimTemplateItem[] = [
    { key: "family_name", svg_id: "family_name" },
    { key: "given_name", svg_id: "given_name" },
    { key: "title", svg_id: "title" },
    { key: "grade" },
    { key: "eqf_level" },
    { key: "graduation_date", svg_id: "graduation_date" },
    { key: "expiry_date", svg_id: "expiry_date" },
];

export function generateMetadata(credential: Record<string, any>) {
    const claims: Claim[] = claimTemplate
        .filter((item) =>
            Object.prototype.hasOwnProperty.call(credential, item.key)
        )
        .map((item) => {
            const claim: Claim = {
                path: ["Array"],
                display: ["Array"],
            };

            if (item.svg_id) claim.svg_id = item.svg_id;

            return claim;
        });

    return {
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
        claims: claims,
    };
}
