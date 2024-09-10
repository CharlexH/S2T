export default {
    async fetch(request, env) {
      if (request.method === 'POST') {
        const formData = await request.formData();
        const file = formData.get('file');
        const blob = await file.arrayBuffer();
  
        const inputs = {
          audio: [...new Uint8Array(blob)]
        };
  
        const response = await env.AI.run('@cf/openai/whisper', inputs);
  
        return Response.json({ inputs, response });
      }
  
      return new Response('Please upload an audio file.', { status: 400 });
    }
  };