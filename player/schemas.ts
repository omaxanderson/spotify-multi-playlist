export const playBodySchema = {
   type: 'body',
   required: ['uris'],
   properties: {
      uris: {
         type: 'array',
         items: {
            type: 'string',
         }
      }
   },
}
