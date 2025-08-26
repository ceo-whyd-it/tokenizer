# Tokenizer Models

This directory contains tokenizer model files for the application.

## Supported Formats

- **SentencePiece Models**: `.model` or `.spm` files
- **Custom Trained Models**: Any SentencePiece-compatible model

## Usage

Models placed in this directory can be:

1. **Pre-loaded**: Automatically available in the tokenizer selector
2. **Referenced by URL**: Accessible at `/models/your-model-name.model`
3. **Uploaded via UI**: Users can still upload their own models dynamically

## File Naming Convention

- Use descriptive names: `my-custom-model.model`
- Avoid spaces: Use hyphens or underscores
- Include model info in filename if helpful: `my-domain-specific-v2.model`

## Adding Your Model

1. Copy your `.model` or `.spm` file to this directory
2. The model will be available at: `https://your-app.vercel.app/models/filename.model`
3. You can reference it in the code or make it available as a preset option

## Security Note

- Models in the `public/` directory are publicly accessible
- Only include models you're comfortable sharing publicly
- For private models, use the file upload feature in the UI instead