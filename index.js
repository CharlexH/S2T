export default {
  async fetch(request, env) {
    if (request.method === 'POST') {
      const formData = await request.formData();
      const file = formData.get('file');
      const arrayBuffer = await file.arrayBuffer();

      const inputs = {
        audio: [...new Uint8Array(arrayBuffer)]
      };
      const response = await env.AI.run('@cf/openai/whisper', inputs);

      return Response.json({ transcript: response.transcript });
    }

    return new Response('Method Not Allowed', { status: 405 });
  }
};