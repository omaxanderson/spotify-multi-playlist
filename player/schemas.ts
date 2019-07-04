export const playSchema = {
   body: {
      type: 'array',
      items: {
         type: 'object',
         required: ['type', 'id', 'uri'],
         properties: {
            type: {
               type: 'string',
               enum: ['playlist', 'artist', 'track', 'album'],
            },
            id: { type: 'string' },
            name: { type: 'string' },
            uri: { type: 'string' },
         }
      },
   },
}
