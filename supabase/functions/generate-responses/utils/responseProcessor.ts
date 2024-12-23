export const processOpenAIResponse = (aiData: any) => {
  try {
    const content = aiData.choices[0].message.content;
    console.log('Processing OpenAI response content');
    
    const generatedContent = JSON.parse(content);

    if (!generatedContent?.responses || !Array.isArray(generatedContent.responses)) {
      console.error('Invalid response structure:', generatedContent);
      throw new Error('Invalid response structure from OpenAI');
    }

    return generatedContent.responses.map((response: any, index: number) => {
      if (!response.text || !response.translation || !response.transliteration || !response.hint) {
        console.error(`Invalid response at index ${index}:`, response);
        throw new Error(`Response at index ${index} is missing required fields`);
      }

      return {
        id: crypto.randomUUID(),
        text: response.text.trim(),
        translation: response.translation.trim(),
        transliteration: response.transliteration.trim(),
        hint: response.hint.trim(),
        characterGender: 'unspecified'
      };
    });
  } catch (error) {
    console.error('Error processing OpenAI response:', error);
    throw new Error(`Failed to process OpenAI response: ${error.message}`);
  }
};