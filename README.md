# Tokenizer Comparator

A web application for comparing how different Large Language Model tokenizers split text. Visualize and analyze tokenization patterns across GPT-2, GPT-3/4, and Llama-3 models.

🔗 **Live Demo**: [Deploy on Vercel](https://vercel.com/new/clone?repository-url=https://github.com/ceo-whyd-it/tokenizer)

## Features

### 🔍 Multi-Tokenizer Comparison
- Compare three tokenizers simultaneously side-by-side
- Support for:
  - **GPT-2** (r50k_base)
  - **GPT-3/4** (cl100k_base)  
  - **Llama-3** (SentencePiece)

### 🎨 Interactive Visualization
- **Colored Token View**: Each token gets a unique color based on its index
- **Hover Highlighting**: Hover over tokens to see details and highlight across views
- **Whitespace Visualization**: Toggle to show spaces, tabs, and newlines
- **Token Details**: View token ID, piece, byte count, and character positions

### 📊 Token Analysis
- **Token Count**: Real-time token counting for each tokenizer
- **Processing Time**: Latency measurements for tokenization
- **Detailed Table View**: Sortable table with all token properties
- **Export Options**: 
  - Copy token IDs (space-separated)
  - Copy token pieces (JSON array)
  - Export as JSON (full token objects)
  - Export as CSV

### ⚡ Performance & UX
- **Real-time Updates**: Debounced tokenization (250ms) as you type
- **Web Workers**: Non-blocking tokenization using background workers
- **Responsive Design**: Mobile-friendly layout with stacking panels
- **State Persistence**: Saves your input and settings to localStorage
- **URL Sharing**: Share tokenization results via URL parameters

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Tokenizers**:
  - [@dqbd/tiktoken](https://github.com/dqbd/tiktoken) - GPT tokenization (WASM)
  - [@xenova/transformers](https://github.com/xenova/transformers.js) - Llama tokenization
- **Deployment**: Optimized for [Vercel](https://vercel.com/)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/ceo-whyd-it/tokenizer.git
cd tokenizer
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
npm run start
```

## Deployment

### Deploy to Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/ceo-whyd-it/tokenizer)

1. Click the button above or import your fork on [Vercel](https://vercel.com)
2. Follow the deployment steps
3. Your app will be live in minutes!

### Manual Deployment

The app can be deployed to any platform that supports Next.js:

```bash
npm run build
# Upload the .next folder to your hosting service
```

## Usage

### Basic Usage

1. **Enter Text**: Type or paste text in the input area
2. **View Tokenization**: See real-time tokenization across three panels
3. **Switch Tokenizers**: Use the dropdown in each panel to change tokenizers
4. **Explore Tokens**: Hover over colored tokens to see details

### Advanced Features

- **Sync Panels**: Toggle "Sync panels" to change all tokenizers at once
- **Show Whitespace**: Toggle to visualize spaces, tabs, and newlines
- **Export Data**: Use the copy buttons to export token data in various formats
- **Share Results**: Click "Share" to copy a URL with your current state

### Keyboard Shortcuts

- `Tab` - Switch between panels
- `Ctrl/Cmd + A` - Select all text in input
- `Ctrl/Cmd + C` - Copy selected text

## URL Parameters

Share tokenization results using URL parameters:

- `?t=<text>` - Input text
- `&p1=<tokenizer>` - Panel 1 tokenizer
- `&p2=<tokenizer>` - Panel 2 tokenizer  
- `&p3=<tokenizer>` - Panel 3 tokenizer
- `&ws=1` - Show whitespace

Example:
```
https://yourapp.vercel.app?t=Hello%20World&p1=cl100k_base&p2=r50k_base&p3=llama3&ws=0
```

## Architecture

### Project Structure

```
tokenizer/
├── app/                    # Next.js app directory
│   ├── page.tsx           # Main application page
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── InputArea.tsx      # Text input component
│   ├── Panel.tsx          # Tokenizer panel component
│   ├── TokenText.tsx      # Colored token visualization
│   ├── TokenTable.tsx     # Token details table
│   └── ui/                # shadcn/ui components
├── lib/                   # Utility functions
│   ├── tokenize/          # Tokenization adapters
│   │   ├── tiktoken.ts    # GPT tokenizer adapter
│   │   ├── llama3.ts      # Llama tokenizer adapter
│   │   └── worker-client.ts # Web Worker client
│   ├── types.ts           # TypeScript types
│   ├── color.ts           # Token coloring utilities
│   └── format.ts          # Export formatting utilities
└── public/
    └── tokenizer.worker.js # Web Worker for tokenization
```

### Key Design Decisions

1. **Client-Side Only**: All tokenization happens in the browser for privacy
2. **Web Workers**: Prevents UI blocking during tokenization
3. **Lazy Loading**: Tokenizer libraries load on-demand
4. **Debouncing**: Reduces unnecessary re-tokenization
5. **Local Storage**: Preserves state between sessions

## Performance

- Initial bundle: <250KB gzipped
- Tokenizer libraries: 1-2MB each (lazy loaded)
- First interactive: <1s on modern devices
- Tokenization latency: <150ms for 5K tokens

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Future Enhancements

- [ ] Add more tokenizers (o200k_base, Claude, etc.)
- [ ] Implement diff view to highlight tokenization differences
- [ ] Add token cost calculator for various APIs
- [ ] Support file upload and drag-and-drop
- [ ] Add byte-level visualization
- [ ] Implement tokenization statistics and analysis
- [ ] Add dark mode toggle
- [ ] Support for custom tokenizers

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- [Anthropic](https://www.anthropic.com/) for Claude
- [OpenAI](https://openai.com/) for tiktoken
- [Hugging Face](https://huggingface.co/) for transformers.js
- [shadcn](https://ui.shadcn.com/) for the UI components
- [Vercel](https://vercel.com/) for hosting

## Support

For issues, questions, or suggestions, please [open an issue](https://github.com/ceo-whyd-it/tokenizer/issues) on GitHub.

---

Built with ❤️ using Next.js and shadcn/ui