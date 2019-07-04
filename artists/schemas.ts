export const artistSchema = {
   params: {
      type: 'object',
      required: ['artistId'],
      properties: {
         artistId: {
            type: 'string',
            pattern: '^[0-9A-z]+$',
         },
      },
   },
};
