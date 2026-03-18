export const toolDef = {
    name: "get_current_visitors",
    description: "Get the number of people currently on the site (active in the last 5 minutes)",
    schema: {},
    handler: async (client, _params) => {
        const count = await client.getCurrentVisitors();
        return {
            content: [{ type: "text", text: `Current visitors: ${count}` }],
        };
    },
};
