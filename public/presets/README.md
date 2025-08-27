# Default Presets

This directory contains the default presets that are loaded when the application starts.

## File Structure

- `default-presets.json` - The main default presets file loaded by the application

## JSON Format

Each preset must have the following structure:

```json
{
  "name": "Preset Name",
  "input_text": "Text to tokenize...",
  "Tokenizer_1": "tokenizer-id-1", 
  "Tokenizer_2": "tokenizer-id-2",
  "Tokenizer_3": "tokenizer-id-3"
}
```

## Available Tokenizer IDs

### OpenAI Encodings
- `r50k_base` - GPT-2/3
- `p50k_base` - Codex/Davinci  
- `p50k_edit` - Edit models
- `cl100k_base` - GPT-3.5/4
- `o200k_base` - GPT-4o
- `o200k_harmony` - GPT-4o Harmony

### Meta Models
- `llama3` - Llama-3
- `meta-llama/Meta-Llama-3-8B` - Meta Llama 3 8B

### Other AI Models
- `google/gemma-7b` - Google Gemma 7B
- `microsoft/phi-2` - Microsoft Phi-2
- `deepseek-ai/DeepSeek-R1` - DeepSeek R1
- `Qwen/Qwen2.5-72B` - Qwen 2.5 72B
- `tiiuae/falcon-7b` - Falcon 7B
- `openai/gpt-oss-20b` - GPT-OSS 20B

### Custom Models
- `custom:Hviezdo 512` - Slovak-focused SentencePiece
- `custom:Hviezdo LLaMA CulturaX` - Enhanced Slovak model
- `custom:Hviezdo LLaMA All HV 32k` - Large vocabulary model

## Loading Behavior

1. **Application Start**: Fetches `/presets/default-presets.json`
2. **Success**: Loads all presets from JSON file
3. **Failure**: Falls back to minimal hardcoded preset
4. **User Presets**: Stored in browser localStorage, take precedence over defaults
5. **Caching**: Default presets are cached after first load

## Editing Presets

To modify default presets:

1. Edit `default-presets.json` directly
2. Ensure valid JSON format
3. Validate all tokenizer IDs exist
4. Test locally before deployment

## Validation

Each preset is validated for:
- Required fields: `name`, `input_text`, `Tokenizer_1`, `Tokenizer_2`, `Tokenizer_3`
- Field types: All must be strings
- No additional validation on tokenizer IDs (handled gracefully by adapters)

## Examples

See `default-presets.json` for complete examples including:
- Multi-language text samples
- Code examples  
- Slovak language tests
- Model comparisons
- Various tokenizer combinations